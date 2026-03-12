import uuid
from sqlalchemy import Column, String, Date, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id              = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name      = Column(String, nullable=False)
    last_name       = Column(String, nullable=False)
    date_of_birth   = Column(Date, nullable=False)
    gender          = Column(String, nullable=False)          # "male" | "female" | "other"
    blood_group     = Column(String, nullable=True)           # "A+" | "B-" etc.
    phone           = Column(String, nullable=True)
    address         = Column(Text, nullable=True)
    emergency_contact = Column(String, nullable=True)

    # QR access token (HMAC-signed, reissuable)
    qr_token        = Column(String, nullable=True, unique=True)

    # Who registered this patient
    registered_by   = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    registered_by_user = relationship("User", back_populates="patients")
    medical_records    = relationship("MedicalRecord", back_populates="patient", lazy="select",
                                      order_by="desc(MedicalRecord.created_at)")
