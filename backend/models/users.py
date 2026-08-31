from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True)
    username      = Column(String,  nullable=False, unique=True)
    email         = Column(String,  nullable=False, unique=True)
    password      = Column(String,  nullable=False)

    trips = relationship("Trip", back_populates="user")
