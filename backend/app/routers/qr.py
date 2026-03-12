from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.qr import QRGenerateResponse, QRScanRequest, QRScanResponse
from app.services import qr_service
from app.utils.dependencies import require_role

router = APIRouter(prefix="/qr", tags=["QR Codes"])


@router.post("/generate/{patient_id}", response_model=QRGenerateResponse)
def generate_qr(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor", "superuser")),
):
    """Generate an HMAC-signed QR token for a patient."""
    token = qr_service.generate_qr_token(patient_id, db)
    return QRGenerateResponse(patient_id=patient_id, qr_token=token)


@router.post("/scan", response_model=QRScanResponse)
def scan_qr(
    body: QRScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("doctor", "superuser")),
):
    """Decode a QR token and return the associated patient."""
    patient = qr_service.decode_qr_token(body.qr_token, db)
    return QRScanResponse(
        patient_id=patient.id,
        first_name=patient.first_name,
        last_name=patient.last_name,
        date_of_birth=patient.date_of_birth,
        gender=patient.gender,
        blood_group=patient.blood_group,
    )
