from pydantic import BaseModel
from typing import Optional
from datetime import date


class QRGenerateResponse(BaseModel):
    patient_id: str
    qr_token: str


class QRScanRequest(BaseModel):
    qr_token: str


class QRScanResponse(BaseModel):
    patient_id: str
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    blood_group: Optional[str]
