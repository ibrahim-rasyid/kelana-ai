from services.trip_services import calculate_daily_budget, get_trip_category, get_transportation, get_travel_season
from services.bedrock_service import get_ai_recommendation
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models.trip import Trip
from database import SessionLocal, init_db

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



class TripRequest(BaseModel):
    destination     : str
    days            : int
    budget          : float
    travel_style    : str

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

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
def create_trip(request: TripRequest, db: Session = Depends(get_db)):
    category        = get_trip_category(request.budget)
    daily_budget    = calculate_daily_budget(request.budget, request.days)
    rec_transport   = get_transportation(category)

    trip = Trip(
        destination     = request.destination,
        days            = request.days,
        budget          = request.budget,
        category        = category,
        daily_budget    = daily_budget,
        travel_style    = request.travel_style
    )

    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip

@app.get("/api/v1/trips")
def list_trips(db: Session = Depends(get_db)):
    trips = db.query(Trip).all()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    # handling not found
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    return trip

@app.delete('/api/v1/trips/{id}')
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    db.delete(trip)
    db.commit()

    return trip

@app.put('/api/v1/trips/{id}')
def edit_trip(trip_id:int, new_budget: float, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    
    category        = get_trip_category(new_budget)
    daily_budget    = calculate_daily_budget(new_budget, trip.days)
    rec_transport   = get_transportation(category)

    trip.budget         = new_budget
    trip.category       = category
    trip.daily_budget   = daily_budget
    db.commit()
    
    return trip

@app.post('/api/v1/trips/{trip_id}/generate')
def get_recommendation(trip_id: int, db: Session = Depends(get_db)):
    import json
    
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    
    ai_recommendation = trip.ai_recommendation
    if ai_recommendation == None:
        # Get structured JSON from AI
        ai_recommendation_dict = get_ai_recommendation(trip.destination, trip.days, trip.budget, trip.travel_style)
        # Store as JSON string in database
        trip.ai_recommendation = json.dumps(ai_recommendation_dict)
        db.commit()
        ai_recommendation = trip.ai_recommendation
    
    # Parse JSON string back to dict for response
    try:
        recommendation_data = json.loads(ai_recommendation)
    except json.JSONDecodeError:
        # Fallback if stored data is not valid JSON
        recommendation_data = {"raw_text": ai_recommendation}
    
    response = {
        "trip_id"           : trip.id,
        "destination"       : trip.destination,
        "recommendation"    : recommendation_data
    }
    return response

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