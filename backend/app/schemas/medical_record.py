from pydantic import BaseModel, field_validator
from typing import Optional, List, Any
from datetime import datetime


# ── Create ──────────────────────────────────────────────────────────────────────

class RecordCreate(BaseModel):
    diagnosis: str
    symptoms: Optional[List[str]] = None
    medications: Optional[List[dict]] = None   # [{"name": "...", "dosage": "..."}]
    notes: Optional[str] = None
    severity: str = "moderate"

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        allowed = {"mild", "moderate", "severe", "critical"}
        if v.lower() not in allowed:
            raise ValueError(f"Severity must be one of: {', '.join(allowed)}")
        return v.lower()

    @field_validator("diagnosis")
    @classmethod
    def validate_diagnosis(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Diagnosis must be at least 2 characters")
        return v


# ── Response ────────────────────────────────────────────────────────────────────

class RecordResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: int
    diagnosis: str
    symptoms: Optional[List[str]]
    medications: Optional[List[dict]]
    notes: Optional[str]
    severity: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class PatientTimeline(BaseModel):
    patient_id: str
    patient_name: str
    records: List[RecordResponse]
    total_records: int
