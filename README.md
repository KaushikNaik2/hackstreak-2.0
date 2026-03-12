# ⚡ Hackathon Fullstack Boilerplate

A reusable, plug-and-play fullstack skeleton designed for hackathons. Pre-configured with authentication (JWT + Google OAuth2), a database layer, and a polished dark-mode frontend.

**Stack:** FastAPI · SQLAlchemy · Alembic · Next.js 14 · Tailwind CSS · shadcn/ui

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:

1. **Python 3.9+**: [Download Python](https://www.python.org/downloads/)
2. **Pip**: Python package installer (usually comes with Python)
3. **Node.js 18+ & npm**: [Download Node.js](https://nodejs.org/)
4. **Git**: Version control system (optional but recommended)
5. *(Optional)* **PostgreSQL**: If you plan to switch from the default SQLite database.

---

## 🚀 Getting Started

### Backend Setup

```bash
# 1. Create & activate a virtual environment
python -m venv venv

# On Mac/Linux:
source venv/bin/activate
# On Windows (Command Prompt):
venv\Scripts\activate.bat
# On Windows (PowerShell):
venv\Scripts\Activate.ps1

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Open .env and fill in SECRET_KEY, Google OAuth creds, etc.
# Default DB is SQLite (sqlite:///./dev.db) for easy testing.

# 4. Run database migrations
alembic upgrade head

# 5. Start the backend server
uvicorn app.main:app --reload --port 8000
```

Backend is now live at `http://127.0.0.1:8000`

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start the Next.js dev server
npm run dev
```

Frontend is now live at `http://localhost:3000`

> **Tip:** Run both servers simultaneously in separate terminals for end-to-end testing.

---

## 📖 API Documentation

FastAPI auto-generates interactive docs once the backend is running:

- **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 📁 Project Structure

```text
├── app/                          # FastAPI Backend
│   ├── main.py                   # App entry point
│   ├── config.py                 # Pydantic settings (.env reader)
│   ├── database.py               # SQLAlchemy engine & session
│   ├── models/                   # ORM models (e.g., user.py)
│   ├── schemas/                  # Pydantic request/response schemas
│   ├── routers/                  # API route definitions (auth, health)
│   ├── services/                 # Business logic (auth, Google OAuth)
│   └── utils/                    # Helpers (JWT, hashing, dependencies)
├── alembic/                      # Database migration scripts
├── alembic.ini                   # Alembic configuration
├── requirements.txt              # Python dependencies
├── .env / .env.example           # Backend env vars
│
└── frontend/                     # Next.js Frontend
    ├── app/
    │   ├── page.tsx              # Root → redirects to /login
    │   ├── (auth)/
    │   │   ├── login/page.tsx    # Login page
    │   │   ├── signup/page.tsx   # Signup page
    │   │   └── callback/page.tsx # Google OAuth callback handler
    │   └── dashboard/page.tsx    # Protected dashboard (post-login)
    ├── components/
    │   ├── GoogleButton.tsx      # "Continue with Google" button
    │   └── ProtectedRoute.tsx    # Auth guard wrapper
    ├── lib/
    │   ├── api.ts                # Axios instance + API calls
    │   ├── auth.ts               # Token helpers (cookie-based)
    │   └── hooks/useAuth.ts      # useAuth hook
    └── .env.local                # Frontend env vars
```

---

## 🔌 Frontend ↔ Backend Connection

| Action | Flow |
|---|---|
| **Sign up** | `POST /auth/signup` → JWT → cookie → `/dashboard` |
| **Sign in** | `POST /auth/login` → JWT → cookie → `/dashboard` |
| **Google Sign in** | Browser → `/auth/google` → Google → callback → `/callback?token=…` → cookie → `/dashboard` |
| **Dashboard load** | `GET /api/me` with JWT → hydrate user |
| **Sign out** | Clear cookie → redirect `/login` |

---

## 🔐 Configuration Tips

- **Using PostgreSQL:** Change `DATABASE_URL` in `.env` to a PostgreSQL connection string (e.g., `postgresql://user:password@localhost:5432/db_name`), then re-run `alembic upgrade head`.
- **Google OAuth:** Create OAuth 2.0 Client IDs in the [Google Cloud Console](https://console.cloud.google.com/), add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`, and set the authorized redirect URI to `http://localhost:8000/auth/google/callback`.
- **CORS:** Wide open in dev. Tighten `allow_origins` in `app/main.py` before deploying.
- **JWT Expiry:** Default is 60 min. Bump `ACCESS_TOKEN_EXPIRE_MINUTES` in `.env` for longer sessions.

---

> Built to be forked, extended, and shipped fast. Good luck! 🏆
