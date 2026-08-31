from datetime import datetime, timedelta
import os

from fastapi import HTTPException
from jose import jwt
from passlib.context import CryptContext
from models.users import User
from database import SessionLocal

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def register(name, email, password):
    # NEVER store plain text – hash the password
    db = SessionLocal()
    try:
        user = User(
            username=name,
            email=email,
            password=hash_password(password)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()

def login(email, password):
    db = SessionLocal()
    try:
        user = db.query(User).filter(
            User.email == email
        ).first()

        if user is None:
            raise HTTPException(401, "Invalid email or password")

        # Verify password against stored hash
        if not pwd_context.verify(
            password, user.password
        ):
            raise HTTPException(401, "Invalid email or password")

        # Generate JWT
        token = jwt.encode(
            {
                "sub": str(user.id),
                "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
            },
            SECRET_KEY,
            algorithm=ALGORITHM,
        )
        return {"access_token": token}
    finally:
        db.close()
