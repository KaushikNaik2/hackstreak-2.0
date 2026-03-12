"""
Alert service — threshold monitoring and alert lifecycle management.
"""

from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.medical_record import MedicalRecord
from app.models.patient import Patient
from app.models.surveillance import SurveillanceAlert
from app.config import settings


def check_thresholds(db: Session) -> List[SurveillanceAlert]:
    """
    Scan records from the last 7 days, group by diagnosis + region.
    Create alerts where case count exceeds the configured threshold.
    """
    cutoff = datetime.utcnow() - timedelta(days=7)
    threshold = settings.ALERT_CASE_THRESHOLD

    rows = (
        db.query(
            MedicalRecord.diagnosis,
            Patient.address.label("region"),
            func.count(MedicalRecord.id).label("case_count"),
        )
        .join(Patient, MedicalRecord.patient_id == Patient.id)
        .filter(MedicalRecord.created_at >= cutoff)
        .group_by(MedicalRecord.diagnosis, Patient.address)
        .having(func.count(MedicalRecord.id) >= threshold)
        .all()
    )

    new_alerts = []
    for row in rows:
        # Skip if an active (unresolved) alert already exists for this combo
        existing = (
            db.query(SurveillanceAlert)
            .filter(
                SurveillanceAlert.disease_name == row.diagnosis,
                SurveillanceAlert.region == (row.region or "Unknown"),
                SurveillanceAlert.is_resolved == False,
            )
            .first()
        )
        if existing:
            # Update case count
            existing.case_count = row.case_count
            db.commit()
            continue

        case_count = row.case_count
        if case_count >= threshold * 3:
            risk = "critical"
        elif case_count >= threshold * 2:
            risk = "high"
        elif case_count >= threshold:
            risk = "medium"
        else:
            risk = "low"

        alert = SurveillanceAlert(
            disease_name=row.diagnosis,
            region=row.region or "Unknown",
            case_count=case_count,
            risk_level=risk,
        )
        db.add(alert)
        new_alerts.append(alert)

    if new_alerts:
        db.commit()
        for a in new_alerts:
            db.refresh(a)

    return new_alerts


def get_active_alerts(db: Session) -> List[SurveillanceAlert]:
    return (
        db.query(SurveillanceAlert)
        .filter(SurveillanceAlert.is_resolved == False)
        .order_by(SurveillanceAlert.triggered_at.desc())
        .all()
    )


def resolve_alert(alert_id: str, db: Session) -> SurveillanceAlert:
    alert = db.query(SurveillanceAlert).filter(SurveillanceAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    if alert.is_resolved:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Alert already resolved")

    alert.is_resolved = True
    alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert
