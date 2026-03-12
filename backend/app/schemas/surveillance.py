from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class AlertResponse(BaseModel):
    id: str
    disease_name: str
    region: str
    case_count: int
    risk_level: str
    is_resolved: bool
    triggered_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_patients: int
    total_records: int
    active_alerts: int
    disease_breakdown: dict          # {"malaria": 12, "dengue": 5, ...}
    severity_breakdown: dict         # {"mild": 10, "severe": 3, ...}
    recent_alerts: List[AlertResponse]


class OutbreakPredictionRequest(BaseModel):
    region: Optional[str] = None
    disease: Optional[str] = None
    window_days: int = 30


class OutbreakPrediction(BaseModel):
    region: str
    disease: str
    predicted_cases: int
    risk_score: float                # 0.0 – 1.0
    risk_level: str                  # "low" | "medium" | "high" | "critical"
    recommendation: str
