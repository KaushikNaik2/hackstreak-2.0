from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String, unique=True, index=True, nullable=False)
    full_name     = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)   # Null for Google users
    google_id     = Column(String, unique=True, nullable=True)
    avatar_url    = Column(String, nullable=True)
    is_active     = Column(Boolean, default=True)
    is_verified   = Column(Boolean, default=False)
    role          = Column(String, default="doctor")   # "doctor" | "admin" | "superuser"
    auth_provider = Column(String, default="local")   # "local" | "google"
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    patients        = relationship("Patient", back_populates="registered_by_user", lazy="select")
    medical_records = relationship("MedicalRecord", back_populates="doctor", lazy="select")
