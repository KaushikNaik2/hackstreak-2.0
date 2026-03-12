from fastapi import APIRouter, Depends
from app.models.user import User
from app.utils.dependencies import get_current_user
from app.schemas.user import UserPublic

router = APIRouter(prefix="/api", tags=["Health & Test"])

# ── Public ping ────────────────────────────────────────────────────────────────
@router.get("/ping")
def ping():
    return {"status": "ok", "message": "pong 🏓"}

# ── Auth-protected: returns current user ───────────────────────────────────────
@router.get("/me", response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ── Protected example endpoint ─────────────────────────────────────────────────
@router.get("/protected")
def protected_route(current_user: User = Depends(get_current_user)):
    return {
        "message": f"Hello, {current_user.full_name}! You're authenticated ✅",
        "user_id": current_user.id,
        "email": current_user.email,
    }

# ── Public example endpoint ────────────────────────────────────────────────────
@router.get("/public")
def public_route():
    return {"message": "This endpoint needs no auth 🔓"}
