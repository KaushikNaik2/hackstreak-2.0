from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.medical_record import MedicalRecord
from app.models.surveillance import SurveillanceAlert
from app.schemas.surveillance import (
    AlertResponse,
    DashboardStats,
    OutbreakPrediction,
    OutbreakPredictionRequest,
)
from app.services import ml_service, alert_service
from app.utils.dependencies import require_role

router = APIRouter(prefix="/surveillance", tags=["Surveillance"])


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "superuser")),
):
    """Aggregate dashboard stats for the surveillance panel."""
    total_patients = db.query(func.count(Patient.id)).scalar()
    total_records = db.query(func.count(MedicalRecord.id)).scalar()
    active_alerts_count = (
        db.query(func.count(SurveillanceAlert.id))
        .filter(SurveillanceAlert.is_resolved == False)
        .scalar()
    )

    # Disease breakdown from records
    disease_rows = (
        db.query(MedicalRecord.diagnosis, func.count(MedicalRecord.id))
        .group_by(MedicalRecord.diagnosis)
        .all()
    )
    disease_breakdown = {row[0]: row[1] for row in disease_rows}

    # Severity breakdown
    severity_rows = (
        db.query(MedicalRecord.severity, func.count(MedicalRecord.id))
        .group_by(MedicalRecord.severity)
        .all()
    )
    severity_breakdown = {row[0]: row[1] for row in severity_rows}

    recent = alert_service.get_active_alerts(db)[:5]

    return DashboardStats(
        total_patients=total_patients,
        total_records=total_records,
        active_alerts=active_alerts_count,
        disease_breakdown=disease_breakdown,
        severity_breakdown=severity_breakdown,
        recent_alerts=recent,
    )


@router.get("/alerts", response_model=List[AlertResponse])
def list_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "superuser")),
):
    """List active (unresolved) surveillance alerts."""
    return alert_service.get_active_alerts(db)


@router.post("/predict", response_model=List[OutbreakPrediction])
def predict_outbreak(
    body: OutbreakPredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "superuser")),
):
    """Run outbreak prediction engine."""
    return ml_service.predict_outbreak(
        db,
        region=body.region,
        disease=body.disease,
        window_days=body.window_days,
    )


@router.patch("/alerts/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "superuser")),
):
    """Mark an alert as resolved."""
    return alert_service.resolve_alert(alert_id, db)


@router.post("/check-thresholds", response_model=List[AlertResponse])
def trigger_threshold_check(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "superuser")),
):
    """Manually trigger alert threshold scanning (also callable via cron)."""
    return alert_service.check_thresholds(db)
