import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id  = Column(String, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id   = Column(Integer, ForeignKey("users.id"), nullable=False)

    diagnosis   = Column(String, nullable=False)
    symptoms    = Column(JSON, nullable=True)       # ["fever", "cough", ...]
    medications = Column(JSON, nullable=True)       # [{"name": "...", "dosage": "..."}]
    notes       = Column(Text, nullable=True)
    severity    = Column(String, default="moderate") # "mild" | "moderate" | "severe" | "critical"

    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="medical_records")
    doctor  = relationship("User", back_populates="medical_records")
