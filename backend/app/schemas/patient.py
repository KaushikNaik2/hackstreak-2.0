from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import date, datetime


# ── Create / Update ─────────────────────────────────────────────────────────────

class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        allowed = {"male", "female", "other"}
        if v.lower() not in allowed:
            raise ValueError(f"Gender must be one of: {', '.join(allowed)}")
        return v.lower()

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 1 or len(v) > 100:
            raise ValueError("Name must be between 1 and 100 characters")
        return v


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    blood_group: Optional[str] = None


# ── Response ────────────────────────────────────────────────────────────────────

class PatientResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    blood_group: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    emergency_contact: Optional[str]
    qr_token: Optional[str]
    registered_by: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class PatientListResponse(BaseModel):
    patients: List[PatientResponse]
    total: int
