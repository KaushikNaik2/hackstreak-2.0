import uuid
from sqlalchemy import Column, String, Integer, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base


class SurveillanceAlert(Base):
    __tablename__ = "surveillance_alerts"

    id            = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    disease_name  = Column(String, nullable=False, index=True)
    region        = Column(String, nullable=False, index=True)
    case_count    = Column(Integer, nullable=False, default=0)
    risk_level    = Column(String, nullable=False, default="low")  # "low" | "medium" | "high" | "critical"
    is_resolved   = Column(Boolean, default=False)

    triggered_at  = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at   = Column(DateTime(timezone=True), nullable=True)
