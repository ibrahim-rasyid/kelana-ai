from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Message(Base):
    __tablename__   = "messages"
    id              = Column(BigInteger,                       primary_key=True)
    conversation_id = Column(BigInteger, ForeignKey("conversations.id"), nullable=False)
    role            = Column(String(16),                       nullable=False)
    content         = Column(Text,                             nullable=False)
    source          = Column(String,                           nullable=True)
    created_at      = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    conversation = relationship("Conversation", back_populates="messages")
