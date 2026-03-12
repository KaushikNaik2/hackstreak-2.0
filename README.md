# 🏥 HackStreak 2.0 — Smart Healthcare History & Disease Surveillance System

A full-stack healthcare platform that unifies **patient medical records** with **real-time disease surveillance** and **ML-powered outbreak prediction**. Built for hackathons, designed for production.

**Stack:** FastAPI · SQLAlchemy · SQLite · Next.js 14 · Tailwind CSS · shadcn/ui

---

## 🧩 What It Does

| Problem | Solution |
|---|---|
| **Fragmented medical records** — doctors can't access full patient history on the spot | Unified patient timeline with QR-code-based instant access |
| **Reactive disease management** — health authorities lack real-time outbreak data | Live surveillance dashboard with ML-powered outbreak prediction |

### Key Features

- 🔐 **Role-based access control** — `doctor`, `admin`, `superuser` roles with per-endpoint guards
- 📋 **Patient management** — full CRUD with search, demographics, and medical history
- 📄 **Medical records** — append-only records with diagnosis, symptoms, medications, severity
- 📱 **QR code system** — HMAC-signed tokens for instant patient ID at point of care
- 📊 **Surveillance dashboard** — real-time aggregate stats on disease trends
- 🤖 **ML outbreak prediction** — rule-based engine analyzing case velocity, geographic spread, and severity
- 🚨 **Automated alerting** — threshold-based alerts when case counts spike

---

## 📋 Prerequisites

1. **Python 3.9+**: [Download Python](https://www.python.org/downloads/)
2. **Node.js 18+ & npm**: [Download Node.js](https://nodejs.org/)
3. **Git**: [Download Git](https://git-scm.com/)

> SQLite is default — **no database setup needed**.

---

## 🚀 Getting Started

### Backend Setup

```bash
cd backend

# 1. Create & activate virtual environment
python -m venv venv

# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Edit .env — fill in SECRET_KEY, Google OAuth creds, etc.

# 4. Start the server (tables auto-create on startup)
uvicorn app.main:app --reload --port 8000
```

Backend live at **http://localhost:8000**

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Frontend live at **http://localhost:3000**

> **Tip:** Run both servers simultaneously in separate terminals.

---

## 📖 API Documentation

FastAPI auto-generates interactive docs:

- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### All 21 Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | — | Health check |
| `POST` | `/auth/signup` | — | Register new user |
| `POST` | `/auth/login` | — | Login (returns JWT) |
| `GET` | `/auth/google` | — | Google OAuth redirect |
| `GET` | `/auth/google/callback` | — | OAuth callback |
| `GET` | `/api/ping` | — | Public ping |
| `GET` | `/api/public` | — | Public endpoint |
| `GET` | `/api/protected` | 🔐 | Auth test |
| `GET` | `/api/me` | 🔐 | Current user info |
| `POST` | `/patients` | 👨‍⚕️ doctor+ | Register patient |
| `GET` | `/patients` | 👨‍⚕️ doctor+ | List/search patients |
| `GET` | `/patients/{id}` | 👨‍⚕️ doctor+ | Get patient details |
| `POST` | `/patients/{id}/records` | 👨‍⚕️ doctor+ | Add medical record |
| `GET` | `/patients/{id}/timeline` | 👨‍⚕️ doctor+ | Full patient timeline |
| `GET` | `/records/{id}` | 👨‍⚕️ doctor+ | Get single record |
| `GET` | `/qr/generate/{patient_id}` | 👨‍⚕️ doctor+ | Generate QR token |
| `POST` | `/qr/scan` | 🔐 | Scan/decode QR code |
| `GET` | `/surveillance/dashboard` | 🛡️ admin+ | Outbreak dashboard |
| `POST` | `/surveillance/check-thresholds` | 👑 superuser | Trigger alert check |
| `GET` | `/surveillance/alerts` | 🛡️ admin+ | List active alerts |
| `POST` | `/surveillance/alerts/{id}/resolve` | 🛡️ admin+ | Resolve an alert |
| `POST` | `/surveillance/predict` | 🛡️ admin+ | ML outbreak prediction |

---

## 📁 Project Structure

```
hackstreak/
├── backend/
│   ├── app/
│   │   ├── main.py                    # App entry, router registration
│   │   ├── config.py                  # Settings (loads from .env)
│   │   ├── database.py                # SQLAlchemy engine & session
│   │   ├── models/
│   │   │   ├── user.py                # User model (JWT + roles)
│   │   │   ├── patient.py             # Patient (UUID PK, demographics)
│   │   │   ├── medical_record.py      # MedicalRecord (diagnosis, meds, severity)
│   │   │   └── surveillance.py        # SurveillanceAlert (outbreak tracking)
│   │   ├── schemas/
│   │   │   ├── user.py                # Auth request/response schemas
│   │   │   ├── patient.py             # Patient CRUD schemas
│   │   │   ├── medical_record.py      # Record schemas + timeline
│   │   │   ├── surveillance.py        # Dashboard, alerts, predictions
│   │   │   └── qr.py                  # QR generate/scan schemas
│   │   ├── routers/
│   │   │   ├── auth.py                # /auth/* endpoints
│   │   │   ├── health.py              # /api/* public/protected endpoints
│   │   │   ├── patients.py            # /patients/* CRUD
│   │   │   ├── records.py             # /records/* medical records
│   │   │   ├── surveillance.py        # /surveillance/* dashboard + alerts
│   │   │   └── qr.py                  # /qr/* QR code operations
│   │   ├── services/
│   │   │   ├── patient_service.py     # Patient CRUD logic
│   │   │   ├── qr_service.py          # HMAC-signed QR tokens
│   │   │   ├── ml_service.py          # Outbreak prediction engine
│   │   │   └── alert_service.py       # Threshold monitoring & alerts
│   │   └── utils/
│   │       ├── dependencies.py        # Role-based auth guards
│   │       ├── hashing.py             # Password hashing
│   │       ├── jwt.py                 # JWT creation/verification
│   │       └── compression.py         # Payload compression
│   ├── alembic/                       # Database migrations
│   ├── .env.example                   # Environment template
│   └── requirements.txt               # Python dependencies
│
├── frontend/                          # Next.js 14 Frontend
│   ├── app/
│   │   ├── (auth)/                    # Login, signup, OAuth callback
│   │   └── dashboard/                 # Protected dashboard
│   ├── components/                    # Reusable UI components
│   └── lib/                           # API client, auth helpers
│
├── .gitignore
└── README.md
```

---

## 🔐 Environment Variables

All secrets live in `backend/.env` (gitignored). Copy the template to get started:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Required |
|----------|-------------|----------|
| `SECRET_KEY` | JWT signing key | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | Optional |
| `DATABASE_URL` | Database connection string | Default: SQLite |
| `QR_SECRET` | HMAC key for QR tokens | ✅ |

---

## 🔌 Frontend ↔ Backend Flow

| Action | Flow |
|---|---|
| **Sign up** | `POST /auth/signup` → JWT → cookie → `/dashboard` |
| **Sign in** | `POST /auth/login` → JWT → cookie → `/dashboard` |
| **Google Sign in** | Browser → `/auth/google` → Google → callback → cookie → `/dashboard` |
| **Dashboard load** | `GET /api/me` with JWT → hydrate user |
| **View patient** | `GET /patients/{id}` → patient card |
| **Scan QR** | `POST /qr/scan` → compressed patient data → render |
| **Check outbreaks** | `GET /surveillance/dashboard` → stats + alerts |

---

## ⚙️ Configuration Tips

- **PostgreSQL:** Change `DATABASE_URL` in `.env` to `postgresql://user:pass@localhost:5432/dbname` and run `alembic upgrade head`
- **Google OAuth:** Create credentials in [Google Cloud Console](https://console.cloud.google.com/), update `.env`
- **CORS:** Wide open in dev (`allow_origins=["*"]`). Tighten before deploying.
- **JWT Expiry:** Default 60 min. Change `ACCESS_TOKEN_EXPIRE_MINUTES` in `.env`

---

## 🧪 Quick Smoke Test

```bash
# Health check
curl http://localhost:8000/
# → {"message": "HackathonApp is live 🚀"}

# Sign up a doctor
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"doc1","email":"doc@test.com","password":"Test1234!"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doc@test.com","password":"Test1234!"}'
# → {"access_token": "eyJ...", "token_type": "bearer"}
```

---

## 🛣️ Roadmap

- [ ] Frontend dashboard for patient management
- [ ] QR code scanner UI with camera integration
- [ ] Real-time surveillance map visualization
- [ ] Background scheduled threshold checks (APScheduler)
- [ ] Swap rule-based ML for trained model (scikit-learn)
- [ ] Export patient timeline as PDF
- [ ] Docker Compose for one-command dev setup

---

## 📝 License

MIT — fork it, hack it, ship it. 🏆

---

> **HackStreak 2.0** — Built for [Hackathon Name]. Good luck! ⚡
