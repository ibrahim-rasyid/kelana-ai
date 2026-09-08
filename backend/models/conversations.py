from sqlalchemy import Column, BigInteger, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Conversation(Base):
    __tablename__   = "conversations"
    id              = Column(BigInteger,               primary_key=True)
    user_id         = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    title           = Column(String(256),               nullable=True)
    created_at      = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    user     = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation")
