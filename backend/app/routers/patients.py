from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PatientListResponse,
)
from app.schemas.medical_record import PatientTimeline, RecordResponse
from app.services import patient_service
from app.utils.dependencies import require_role

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.post("", response_model=PatientResponse, status_code=201)
def register_patient(
    data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor", "superuser")),
):
    """Register a new patient (doctor / superuser only)."""
    patient = patient_service.create_patient(data, current_user, db)
    return patient


@router.get("", response_model=PatientListResponse)
def list_patients(
    q: Optional[str] = Query(None, description="Search by name or phone"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor", "admin", "superuser")),
):
    """List / search patients."""
    if q:
        patients, total = patient_service.search_patients(db, q, skip, limit)
    else:
        patients, total = patient_service.list_patients(db, skip, limit)
    return PatientListResponse(patients=patients, total=total)


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor", "admin", "superuser")),
):
    """Get a single patient by ID."""
    return patient_service.get_patient(patient_id, db)


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: str,
    data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor", "superuser")),
):
    """Update patient details."""
    return patient_service.update_patient(patient_id, data, db)


@router.get("/{patient_id}/timeline", response_model=PatientTimeline)
def get_patient_timeline(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor", "admin", "superuser")),
):
    """Get full medical history (timeline) for a patient."""
    patient = patient_service.get_patient(patient_id, db)
    records = patient.medical_records  # ordered by desc(created_at) via relationship
    return PatientTimeline(
        patient_id=patient.id,
        patient_name=f"{patient.first_name} {patient.last_name}",
        records=records,
        total_records=len(records),
    )
