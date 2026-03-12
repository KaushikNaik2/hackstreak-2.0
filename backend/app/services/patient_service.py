from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.patient import Patient
from app.models.user import User
from app.schemas.patient import PatientCreate, PatientUpdate


def create_patient(data: PatientCreate, doctor: User, db: Session) -> Patient:
    patient = Patient(
        first_name=data.first_name,
        last_name=data.last_name,
        date_of_birth=data.date_of_birth,
        gender=data.gender,
        blood_group=data.blood_group,
        phone=data.phone,
        address=data.address,
        emergency_contact=data.emergency_contact,
        registered_by=doctor.id,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def get_patient(patient_id: str, db: Session) -> Patient:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient


def list_patients(db: Session, skip: int = 0, limit: int = 50) -> tuple[List[Patient], int]:
    query = db.query(Patient)
    total = query.count()
    patients = query.order_by(Patient.created_at.desc()).offset(skip).limit(limit).all()
    return patients, total


def search_patients(db: Session, q: str, skip: int = 0, limit: int = 50) -> tuple[List[Patient], int]:
    query = db.query(Patient).filter(
        (Patient.first_name.ilike(f"%{q}%"))
        | (Patient.last_name.ilike(f"%{q}%"))
        | (Patient.phone.ilike(f"%{q}%"))
    )
    total = query.count()
    patients = query.order_by(Patient.created_at.desc()).offset(skip).limit(limit).all()
    return patients, total


def update_patient(patient_id: str, data: PatientUpdate, db: Session) -> Patient:
    patient = get_patient(patient_id, db)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(patient, key, value)
    db.commit()
    db.refresh(patient)
    return patient
