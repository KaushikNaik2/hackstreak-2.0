from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.medical_record import MedicalRecord
from app.schemas.medical_record import RecordCreate, RecordResponse
from app.utils.dependencies import require_role

router = APIRouter(tags=["Medical Records"])


@router.post("/patients/{patient_id}/records", response_model=RecordResponse, status_code=201)
def create_record(
    patient_id: str,
    data: RecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor", "superuser")),
):
    """Append a medical record to a patient (doctor / superuser only)."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    record = MedicalRecord(
        patient_id=patient_id,
        doctor_id=current_user.id,
        diagnosis=data.diagnosis,
        symptoms=data.symptoms,
        medications=data.medications,
        notes=data.notes,
        severity=data.severity,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/records/{record_id}", response_model=RecordResponse)
def get_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor", "admin", "superuser")),
):
    """Get a single medical record by ID."""
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    return record
