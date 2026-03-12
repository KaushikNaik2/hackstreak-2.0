from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app.routers import auth, health, patients, records, surveillance, qr

# Import all models so Base.metadata knows about them
from app.models import patient as _patient_model          # noqa: F401
from app.models import medical_record as _record_model    # noqa: F401
from app.models import surveillance as _surv_model        # noqa: F401

# Create all tables on startup (for sqlite dev; alembic handles prod)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Hackathon backend skeleton — plug in and go ⚡",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow everything in dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(health.router)
app.include_router(patients.router)
app.include_router(records.router)
app.include_router(surveillance.router)
app.include_router(qr.router)

@app.get("/", tags=["Root"])
def root():
    return {"message": f"{settings.APP_NAME} is live 🚀"}
