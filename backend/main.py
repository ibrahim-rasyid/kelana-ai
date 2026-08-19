from services.trip_services import calculate_daily_budget, get_trip_category, get_transportation, get_travel_season
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from models.trip import Trip
from database import SessionLocal, init_db



class TripRequest(BaseModel):
    destination     : str
    days            : int
    budget          : float
    travel_style    : str

app = FastAPI()

@app.on_event("startup")
def on_startup():
    init_db()

@app.get('/')
def home():
    return {
        "message" : "Welcome to KelanaAI"
    }

@app.get('/health')
def health_check():
    return {
        "status": "OK"
    }

@app.post('/api/v1/trips')
def create_trip(request: TripRequest):
    category        = get_trip_category(request.budget)
    daily_budget    = calculate_daily_budget(request.budget, request.days)
    rec_transport   = get_transportation(category)

    trip = Trip(
        destination     = request.destination,
        days            = request.days,
        budget          = request.budget,
        category        = category,
        daily_budget    = daily_budget
    )

    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)
    db.close()
    return trip

@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()

    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()
    # handling not found
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    return trip

@app.delete('/api/v1/trips/{id}')
def delete_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    db.delete(trip)
    db.close()

    return trip

@app.put('/api/v1/trips/{id}')
def edit_trip(trip_id:int, request: TripRequest):
    category        = get_trip_category(request.budget)
    daily_budget    = calculate_daily_budget(request.budget, request.days)
    rec_transport   = get_transportation(category)

    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    trip.destination    = request.destination
    trip.days           = request.days
    trip.budget         = request.budget
    trip.category       = category
    trip.daily_budget   = daily_budget
    db.commit()
    db.close()
    
    return trip

@app.get('/api/v1/trip-categories')
def get_trip_categories():
    return [
        "Backpacker",
        "Standard",
        "Luxury",
    ]

recommended_places = [
    "Tokyo Tower",
    "Shibuya",
    "Mount Fuji",
]

@app.get('/api/v1/recommendations')
def get_recommended_places():
    return recommended_places

transportations = [
    "Bus", 
    "Train", 
    "Flight"
]

@app.get('/api/v1/transportations')
def get_transportations():
    return transportations