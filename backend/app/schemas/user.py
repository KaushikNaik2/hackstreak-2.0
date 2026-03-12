from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime

# ---------- Auth Schemas ----------

class SignUpRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 1 or len(v) > 100:
            raise ValueError("Full name must be between 1 and 100 characters")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v) > 64:
            raise ValueError("Password must be at most 64 characters")
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v) > 64:
            raise ValueError("Password must be at most 64 characters")
        return v

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserPublic"

# ---------- User Schemas ----------

class UserPublic(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    auth_provider: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True
