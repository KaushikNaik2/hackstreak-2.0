# ⚡ FastAPI Hackathon Backend — Build Spec
> **For:** Antigravity  
> **Purpose:** Reusable backend skeleton for any hackathon — plug in and go.  
> **Stack:** FastAPI · PostgreSQL · SQLAlchemy · JWT · Google OAuth2

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # App entry point
│   ├── config.py                # Env vars & settings
│   ├── database.py              # DB connection & session
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py              # User model
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── user.py              # Pydantic schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py              # Signup, login, Google OAuth
│   │   └── health.py            # Test / health endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py      # Auth business logic
│   │   └── google_service.py    # Google OAuth logic
│   └── utils/
│       ├── __init__.py
│       ├── jwt.py               # JWT create/verify
│       ├── hashing.py           # Password hash/verify
│       └── dependencies.py      # get_current_user dep
├── .env                         # Secrets (never commit)
├── .env.example                 # Template for teammates
├── requirements.txt
├── alembic.ini                  # DB migrations
└── alembic/
    └── versions/
```

---

## 📦 Dependencies (`requirements.txt`)

```txt
fastapi
uvicorn[standard]
sqlalchemy
psycopg2-binary
alembic
python-dotenv
pydantic[email]
pydantic-settings
passlib[bcrypt]
python-jose[cryptography]
python-multipart
httpx
google-auth
google-auth-oauthlib
```

---

## ⚙️ Environment Variables (`.env.example`)

```env
# App
APP_NAME=HackathonApp
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hackathon_db

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# Frontend (for redirects)
FRONTEND_URL=http://localhost:3000
```

---

## 🔧 Implementation

### `app/config.py`

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "HackathonApp"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
```

---

### `app/database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

### `app/models/user.py`

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String, unique=True, index=True, nullable=False)
    full_name     = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)   # Null for Google users
    google_id     = Column(String, unique=True, nullable=True)
    avatar_url    = Column(String, nullable=True)
    is_active     = Column(Boolean, default=True)
    is_verified   = Column(Boolean, default=False)
    auth_provider = Column(String, default="local")   # "local" | "google"
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())
```

---

### `app/schemas/user.py`

```python
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ---------- Auth Schemas ----------

class SignUpRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

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
```

---

### `app/utils/hashing.py`

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

---

### `app/utils/jwt.py`

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.config import settings

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
```

---

### `app/utils/dependencies.py`

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.jwt import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

---

### `app/services/auth_service.py`

```python
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import SignUpRequest, LoginRequest
from app.utils.hashing import hash_password, verify_password
from app.utils.jwt import create_access_token

def signup_user(data: SignUpRequest, db: Session) -> dict:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        auth_provider="local",
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}

def login_user(data: LoginRequest, db: Session) -> dict:
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}
```

---

### `app/services/google_service.py`

```python
import httpx
from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.jwt import create_access_token
from app.config import settings

GOOGLE_TOKEN_URL  = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

async def exchange_code_for_user(code: str, db: Session) -> dict:
    async with httpx.AsyncClient() as client:
        # Exchange auth code for tokens
        token_res = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        token_data = token_res.json()

        # Fetch user info from Google
        user_res = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {token_data['access_token']}"}
        )
        google_user = user_res.json()

    # Upsert user in DB
    user = db.query(User).filter(User.email == google_user["email"]).first()
    if not user:
        user = User(
            email=google_user["email"],
            full_name=google_user.get("name"),
            google_id=google_user["id"],
            avatar_url=google_user.get("picture"),
            auth_provider="google",
            is_verified=True,  # Google already verified the email
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.google_id:
        # Link Google to existing account
        user.google_id = google_user["id"]
        user.avatar_url = google_user.get("picture")
        user.auth_provider = "google"
        user.is_verified = True
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}
```

---

### `app/routers/auth.py`

```python
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
    # In a real app, redirect to frontend with the token
    # return RedirectResponse(f"{settings.FRONTEND_URL}/auth?token={result['access_token']}")
    return result
```

---

### `app/routers/health.py`

```python
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
```

---

### `app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app.routers import auth, health

# Create all tables
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

@app.get("/", tags=["Root"])
def root():
    return {"message": f"{settings.APP_NAME} is live 🚀"}
```

---

## 🗄️ Database Migrations (Alembic)

```bash
# One-time setup
alembic init alembic

# In alembic/env.py, add:
# from app.database import Base
# from app.models import user   ← import all models
# target_metadata = Base.metadata

# Generate & run migration
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

---

## 🚀 Running the Server

```bash
# Install dependencies
pip install -r requirements.txt

# Copy env and fill in values
cp .env.example .env

# Run migrations
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --port 8000
```

Swagger UI → `http://localhost:8000/docs`

---

## 🛣️ All Endpoints at a Glance

| Method | Route | Auth Required | Description |
|--------|-------|:---:|-------------|
| `GET` | `/` | ❌ | Root health check |
| `POST` | `/auth/signup` | ❌ | Register with email + password |
| `POST` | `/auth/login` | ❌ | Login with email + password |
| `GET` | `/auth/google` | ❌ | Redirect to Google OAuth |
| `GET` | `/auth/google/callback` | ❌ | Google OAuth callback |
| `GET` | `/api/ping` | ❌ | Public ping |
| `GET` | `/api/public` | ❌ | Public test endpoint |
| `GET` | `/api/me` | ✅ | Get current user info |
| `GET` | `/api/protected` | ✅ | Protected test endpoint |

---

## 🔐 Google OAuth Setup (One-time)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** (Web Application)
4. Add Authorized redirect URI: `http://localhost:8000/auth/google/callback`
5. Copy `Client ID` and `Client Secret` → paste into `.env`

---

## 🧩 Hackathon Tips

- **Swap PostgreSQL for SQLite** in early prototyping — just change `DATABASE_URL=sqlite:///./dev.db` and use `check_same_thread=False` in the engine config.
- **Add new features fast** — create a new file in `routers/`, add the logic in `services/`, register it in `main.py`. Done.
- **Protect any route** — just add `current_user: User = Depends(get_current_user)` to any endpoint signature.
- **CORS is wide open** — tighten `allow_origins` before going to production.
- **JWT expiry** is 60 min by default — bump `ACCESS_TOKEN_EXPIRE_MINUTES` if you need longer sessions during judging.

---

> Built to be forked, extended, and shipped fast. Good luck. 🏆