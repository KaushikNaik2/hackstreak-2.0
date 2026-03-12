from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "HackathonApp"
    # Set via .env — no default so it's always explicit in prod
    SECRET_KEY: str = "dev-only-change-via-env"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str = "sqlite:///./hackstreak.db"

    # Google OAuth — optional, set in .env
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:3000/api/auth/google/callback"
    FRONTEND_URL: str = "http://localhost:3000"

    # Healthcare-specific
    QR_SECRET: str = "change-me-in-prod-via-env"
    ML_MODEL_PATH: str = "models/outbreak_model.pkl"
    ALERT_CASE_THRESHOLD: int = 10  # cases before alert triggers

    class Config:
        env_file = ".env"

settings = Settings()
