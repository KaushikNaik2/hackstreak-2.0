from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from urllib.parse import urlencode

from app.database import get_db
from app.schemas.user import SignUpRequest, LoginRequest, TokenResponse
from app.services.auth_service import signup_user, login_user
from app.services.google_service import exchange_code_for_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"

# ── Normal Signup ──────────────────────────────────────────────────────────────
@router.post("/signup", response_model=TokenResponse)
def signup(data: SignUpRequest, db: Session = Depends(get_db)):
    return signup_user(data, db)

# ── Normal Login ───────────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return login_user(data, db)

# ── Google OAuth — Redirect to Google ─────────────────────────────────────────
@router.get("/google")
def google_login():
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
    }
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{urlencode(params)}")

# ── Google OAuth — Callback ────────────────────────────────────────────────────
@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    result = await exchange_code_for_user(code, db)
    return RedirectResponse(f"{settings.FRONTEND_URL}/callback?token={result['access_token']}")

