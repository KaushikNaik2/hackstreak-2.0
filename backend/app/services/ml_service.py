"""
Outbreak prediction engine — rule-based heuristics for hackathon demo.
Aggregates recent medical records and produces a risk score.
"""

from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.medical_record import MedicalRecord
from app.models.patient import Patient
from app.schemas.surveillance import OutbreakPrediction


def predict_outbreak(
    db: Session,
    region: Optional[str] = None,
    disease: Optional[str] = None,
    window_days: int = 30,
) -> list[OutbreakPrediction]:
    """
    Aggregate records from the last `window_days`, group by diagnosis + region,
    and produce a risk score.
    """
    cutoff = datetime.utcnow() - timedelta(days=window_days)

    query = (
        db.query(
            MedicalRecord.diagnosis,
            Patient.address.label("region"),
            func.count(MedicalRecord.id).label("case_count"),
        )
        .join(Patient, MedicalRecord.patient_id == Patient.id)
        .filter(MedicalRecord.created_at >= cutoff)
    )

    if disease:
        query = query.filter(MedicalRecord.diagnosis.ilike(f"%{disease}%"))
    if region:
        query = query.filter(Patient.address.ilike(f"%{region}%"))

    query = query.group_by(MedicalRecord.diagnosis, Patient.address)
    rows = query.all()

    predictions = []
    for row in rows:
        case_count = row.case_count
        risk_score = min(case_count / 50.0, 1.0)  # simple linear scaling

        if risk_score >= 0.75:
            risk_level = "critical"
            recommendation = "Immediate intervention required. Deploy medical teams."
        elif risk_score >= 0.5:
            risk_level = "high"
            recommendation = "Increase surveillance and prepare containment measures."
        elif risk_score >= 0.25:
            risk_level = "medium"
            recommendation = "Monitor closely. Increase testing capacity."
        else:
            risk_level = "low"
            recommendation = "Standard monitoring. No immediate action needed."

        predictions.append(
            OutbreakPrediction(
                region=row.region or "Unknown",
                disease=row.diagnosis,
                predicted_cases=int(case_count * 1.2),  # naive 20% growth projection
                risk_score=round(risk_score, 3),
                risk_level=risk_level,
                recommendation=recommendation,
            )
        )

    return predictions
