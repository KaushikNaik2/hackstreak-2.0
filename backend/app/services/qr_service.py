import hmac
import hashlib

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.patient import Patient
from app.config import settings


def generate_qr_token(patient_id: str, db: Session) -> str:
    """Generate an HMAC-signed QR token for a patient and persist it."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    token = hmac.new(
        settings.QR_SECRET.encode(),
        patient_id.encode(),
        hashlib.sha256,
    ).hexdigest()

    patient.qr_token = token
    db.commit()
    db.refresh(patient)
    return token


def decode_qr_token(token: str, db: Session) -> Patient:
    """Look up a patient by their QR token. Validates HMAC integrity."""
    patient = db.query(Patient).filter(Patient.qr_token == token).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired QR token",
        )

    # Verify HMAC to ensure token hasn't been tampered with
    expected = hmac.new(
        settings.QR_SECRET.encode(),
        patient.id.encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(token, expected):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="QR token integrity check failed",
        )

    return patient
