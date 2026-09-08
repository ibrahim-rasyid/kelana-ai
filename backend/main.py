from services.trip_services import calculate_daily_budget, get_trip_category, get_transportation, get_travel_season
from services.bedrock_service import get_ai_recommendation, get_chat_response, CHAT_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT_NO_CONTEXT
from services.auth_service import register, login, SECRET_KEY, ALGORITHM
from services.kb_service import retrieve_context
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from typing import Literal
from jose import jwt, JWTError
import os

from models.trip import Trip
from models.users import User
from models.conversations import Conversation
from models.messages import Message
from database import SessionLocal, init_db

load_dotenv()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    except:
        db.rollback()
        raise
    finally:
        db.close()

bearer_scheme = HTTPBearer()

# Dependency to resolve the authenticated user from the Authorization header
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user

class TripRequest(BaseModel):
    destination     : str
    days            : int
    budget          : float
    travel_style    : Literal["Family", "Solo", "Couple", "Group"]

class UserRequest(BaseModel):
    name            : str
    email           : str
    password        : str

class LoginRequest(BaseModel):
    email           : str
    password        : str

class MessageRequest(BaseModel):
    content         : str

class ConversationUpdateRequest(BaseModel):
    title           : str

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],  # Next.js default port
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
def create_trip(request: TripRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    category        = get_trip_category(request.budget)
    daily_budget    = calculate_daily_budget(request.budget, request.days)

    trip = Trip(
        destination     = request.destination,
        days            = request.days,
        budget          = request.budget,
        category        = category,
        daily_budget    = daily_budget,
        travel_style    = request.travel_style,
        user_id         = user.id
    )

    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip

@app.get("/api/v1/trips")
def list_trips(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    trips = db.query(Trip).filter(
        Trip.user_id == user.id
    ).all()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    # handling not found
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    return trip

@app.delete('/api/v1/trips/{trip_id}')
def delete_trip(trip_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    db.delete(trip)
    db.commit()

    return trip

@app.put('/api/v1/trips/{trip_id}')
def edit_trip(trip_id:int, new_budget: float, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
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
def get_recommendation(trip_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    import json

    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
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

@app.post('/api/v1/auth/register')
def register_user(user: UserRequest, db: Session = Depends(get_db)):
    registered_user = register(user.name, user.email, user.password)
    return registered_user

@app.post('/api/v1/auth/login')
def login_user(request: LoginRequest, db: Session = Depends(get_db)):
    token_data = login(request.email, request.password)
    return token_data

@app.get('/api/v1/auth/me')
def get_authenticated_user(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    total_trips = db.query(Trip).filter(Trip.user_id == user.id).count()
    return {
        "id"            : user.id,
        "username"      : user.username,
        "email"         : user.email,
        "total_trips"   : total_trips
    }

@app.post('/api/v1/conversations')
def create_conversation(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    conversation = Conversation(
        user_id = user.id,
        title   = None
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation

@app.get('/api/v1/conversations')
def list_conversations(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    conversations = db.query(Conversation).filter(
        Conversation.user_id == user.id
    ).order_by(Conversation.created_at.desc()).all()
    return conversations

@app.patch('/api/v1/conversations/{conversation_id}')
def update_conversation(conversation_id: int, request: ConversationUpdateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == user.id).first()
    if conversation is None:
        raise HTTPException(status_code=404, detail=f"Conversation with id {conversation_id} not found")

    conversation.title = request.title
    db.commit()
    db.refresh(conversation)

    return conversation

@app.get('/api/v1/conversations/{conversation_id}/messages')
def list_messages(conversation_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == user.id).first()
    if conversation is None:
        raise HTTPException(status_code=404, detail=f"Conversation with id {conversation_id} not found")

    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()
    return messages

@app.post('/api/v1/conversations/{conversation_id}/messages')
def create_message(conversation_id: int, request: MessageRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == user.id).first()
    if conversation is None:
        raise HTTPException(status_code=404, detail=f"Conversation with id {conversation_id} not found")

    user_message = Message(
        conversation_id = conversation.id,
        role            = "user",
        content         = request.content
    )
    db.add(user_message)
    if not conversation.title:
        conversation.title = request.content.strip()[:50]
    db.flush()

    # Retrieval is keyed only on the latest user message, not full history.
    # Reformulating the query using prior turns would improve multi-turn
    # coherence but is out of scope for this pass.
    retrieval = retrieve_context(request.content)
    if retrieval["context"]:
        system_context = CHAT_SYSTEM_PROMPT.format(context=retrieval["context"])
    else:
        system_context = CHAT_SYSTEM_PROMPT_NO_CONTEXT

    history = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at).all()
    prompt = [
        {
            "role": message.role,
            "content": message.content
        }
        for message in history
    ]

    answer = get_chat_response(prompt, system_context=system_context)
    assistant_message = Message(
        conversation_id = conversation.id,
        role            = "assistant",
        content         = answer,
        source          = retrieval["source"]
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(user_message)
    db.refresh(assistant_message)

    return {
        "user_message"      : user_message,
        "assistant_message" : assistant_message
    }