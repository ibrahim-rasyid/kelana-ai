from services.trip_services import calculate_daily_budget, get_trip_category, get_transportation, get_travel_season
from fastapi import FastAPI
from pydantic import BaseModel

class TripRequest(BaseModel):
    destination     : str
    days            : int
    budget          : float
    travel_style    : str

app = FastAPI()

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

    return {
        "destination"           : request.destination,
        "days"                  : request.days,
        "budget"                : request.budget,
        "daily_budget"          : daily_budget,
        "category"              : category,
        "recommended_transport" : rec_transport,
    }

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