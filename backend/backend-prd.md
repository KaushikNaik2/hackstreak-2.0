# Product Requirements Document
## Smart Healthcare History & Disease Surveillance System
### Backend Engineering Specification

> **Stack:** FastAPI · SQLAlchemy · Alembic · PostgreSQL · Python ML
> **Version:** v1.0 — Initial Release
> **Target:** Antigravity Code Generation

| Document Type | Backend PRD (Hackathon) | Version | v1.0 — Initial Release |
|---|---|---|---|
| Stack | FastAPI + Next.js + Three.js | Target | Antigravity Code Generation |

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Delta from Boilerplate](#2-architecture-delta-from-boilerplate)
3. [Role-Based Access Control](#3-role-based-access-control)
4. [Database Models (SQLAlchemy ORM)](#4-database-models-sqlalchemy-orm)
5. [API Endpoint Specification](#5-api-endpoint-specification)
6. [Pydantic Request & Response Schemas](#6-pydantic-request--response-schemas)
7. [Backend Services](#7-backend-services)
8. [Configuration & Environment Variables](#8-configuration--environment-variables)
9. [main.py Modifications](#9-mainpy-modifications)
10. [Python Dependency Additions](#10-python-dependency-additions)
11. [Alembic Migration Plan](#11-alembic-migration-plan)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Execution Checklist for Antigravity](#13-execution-checklist-for-antigravity)

---

## 1. Project Overview

This document is the backend engineering specification for the **Smart Healthcare History & Disease Surveillance System**, intended for direct input to Antigravity for automated codebase generation. It describes every modification, addition, and extension required on top of the existing hackathon boilerplate skeleton.

The system solves two distinct problems:

- **Fragmented medical records** — doctors cannot access a patient's full history on the spot.
- **Reactive disease management** — health authorities lack real-time, aggregated outbreak data.

> **Boilerplate Baseline**
>
> The project starts from the existing hackathon fullstack skeleton: FastAPI + SQLAlchemy + Alembic + Next.js 14 + Tailwind + shadcn/ui.
> The skeleton already provides: JWT auth, Google OAuth2, a User ORM model, `/auth/signup`, `/auth/login`, `/auth/google` routes, and Alembic migration tooling.
> **This PRD documents ONLY the delta** — new models, new routes, new services, and new configs layered on top.

---

## 2. Architecture Delta from Boilerplate

The directory structure below highlights new files/folders to be added. Existing boilerplate files are marked with comments where modification is required.

```
app/
  main.py               # MODIFY: register new routers
  config.py             # MODIFY: add QR secret, ML model path env vars
  database.py           # NO CHANGE
  models/
    user.py             # MODIFY: add role enum field
    patient.py          # NEW
    medical_record.py   # NEW
    surveillance.py     # NEW  (aggregated view / materialized data)
  schemas/
    patient.py          # NEW
    medical_record.py   # NEW
    surveillance.py     # NEW
    qr.py               # NEW
  routers/
    auth.py             # NO CHANGE (JWT + Google OAuth already present)
    patients.py         # NEW
    records.py          # NEW
    surveillance.py     # NEW
    qr.py               # NEW
  services/
    auth.py             # NO CHANGE
    patient_service.py  # NEW
    qr_service.py       # NEW  (QR encode / decode logic)
    ml_service.py       # NEW  (outbreak prediction engine)
    alert_service.py    # NEW  (threshold monitoring)
  utils/
    jwt.py              # NO CHANGE
    dependencies.py     # MODIFY: add role-guard decorators
    compression.py      # NEW  (msgpack / zlib helpers)
alembic/
  versions/             # NEW migrations will be generated here
```

---

## 3. Role-Based Access Control

The existing boilerplate `User` model must be extended with a `role` field. Three roles govern all endpoint access:

| Role | Enum Value | Permissions |
|---|---|---|
| Doctor | `doctor` | Register patients, scan QR, read full patient history, append medical records. |
| Admin | `admin` | Read-only access to all patient data, access surveillance dashboard, view predictions and active alerts. |
| Superuser | `superuser` | All doctor + admin capabilities plus user management (promote/demote roles). |

> **Modification required in `app/models/user.py`**
>
> ```python
> from enum import Enum as PyEnum
>
> class UserRole(str, PyEnum):
>     doctor = 'doctor'
>     admin = 'admin'
>     superuser = 'superuser'
>
> # Add on User model:
> role = Column(Enum(UserRole), default=UserRole.doctor, nullable=False)
> ```

> **Modification required in `app/utils/dependencies.py`**
>
> Add `require_role(*roles)` dependency factory that extracts `current_user` via existing `get_current_user` and raises `403` if `user.role` not in roles.
> Example usage in a route: `Depends(require_role('admin', 'superuser'))`

---

## 4. Database Models (SQLAlchemy ORM)

Three new ORM models must be created. Each model maps to a PostgreSQL table and requires a corresponding Alembic migration.

### 4.1 Patient

**File:** `app/models/patient.py`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | UUID (PK) | Yes | Auto-generated primary key |
| `full_name` | String | Yes | Patient full legal name |
| `date_of_birth` | Date | Yes | Used to compute age at query time |
| `gender` | Enum | Yes | `male` \| `female` \| `other` |
| `blood_type` | Enum | Yes | `A+` `A-` `B+` `B-` `O+` `O-` `AB+` `AB-` |
| `allergies` | Text[] | No | Array of allergy strings |
| `location_state` | String | Yes | State / province for geo-aggregation |
| `location_city` | String | Yes | City for fine-grained surveillance |
| `phone` | String | No | Optional contact number |
| `registered_by` | UUID (FK) | Yes | FK to `users.id` (the doctor who registered) |
| `created_at` | DateTime | Yes | Server-side timestamp, auto-set |
| `updated_at` | DateTime | Yes | Auto-updated on every write |

### 4.2 MedicalRecord

**File:** `app/models/medical_record.py`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | UUID (PK) | Yes | Auto-generated primary key |
| `patient_id` | UUID (FK) | Yes | FK to `patients.id` |
| `doctor_id` | UUID (FK) | Yes | FK to `users.id` (author of this record) |
| `diagnosis` | String | Yes | Primary diagnosis text |
| `icd_code` | String | No | Optional ICD-10 code for structured analysis |
| `prescription` | Text | No | Free-text prescription details |
| `notes` | Text | No | Additional clinical notes |
| `severity` | Enum | Yes | `low` \| `medium` \| `high` \| `critical` |
| `visit_date` | Date | Yes | Date of the clinical encounter |
| `created_at` | DateTime | Yes | Server-side timestamp, auto-set |

### 4.3 SurveillanceCache

**File:** `app/models/surveillance.py`

A pre-aggregated table refreshed by a background task to avoid expensive real-time `GROUP BY` queries on the dashboard.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | UUID (PK) | Yes | Auto-generated primary key |
| `disease_name` | String | Yes | Normalized disease/diagnosis label |
| `location_state` | String | Yes | Aggregation scope — state level |
| `location_city` | String | No | Aggregation scope — city level (nullable) |
| `case_count` | Integer | Yes | Total confirmed cases in scope |
| `severity_dist` | JSONB | No | `{low, medium, high, critical}` counts |
| `week_start` | Date | Yes | ISO week start date for time-series charting |
| `last_refreshed` | DateTime | Yes | Timestamp of last aggregation run |

---

## 5. API Endpoint Specification

All new routes are prefixed under `/api/v1`. The boilerplate authentication routes (`/auth/signup`, `/auth/login`, `/auth/google`) remain unchanged. Bearer JWT is required on every route listed below.

### 5.1 Patient Routes — `router: patients.py`

| Method | Endpoint | Auth Role | Tag | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/patients/register` | doctor / superuser | patients | Register a new patient and return `patient_id` + QR payload. |
| `GET` | `/api/v1/patients/{patient_id}` | doctor / admin / superuser | patients | Fetch complete patient profile and full record timeline. |
| `GET` | `/api/v1/patients/` | doctor / admin / superuser | patients | Paginated list of all patients (query: state, city, disease). |
| `PUT` | `/api/v1/patients/{patient_id}` | doctor / superuser | patients | Update patient demographic info (not medical records). |

### 5.2 Medical Record Routes — `router: records.py`

| Method | Endpoint | Auth Role | Tag | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/patients/{patient_id}/records` | doctor / superuser | records | Append a new medical record entry to the patient timeline. |
| `GET` | `/api/v1/patients/{patient_id}/records` | doctor / admin / superuser | records | Retrieve full medical history for a patient. |
| `GET` | `/api/v1/patients/{patient_id}/records/{record_id}` | doctor / admin / superuser | records | Fetch a single medical record by ID. |

### 5.3 QR Code Routes — `router: qr.py`

| Method | Endpoint | Auth Role | Tag | Description |
|---|---|---|---|---|
| `GET` | `/api/v1/qr/{patient_id}/generate` | doctor / superuser | qr | Generate and return a QR PNG (base64) encoding offline-capable JSON payload. |
| `POST` | `/api/v1/qr/decode` | doctor / superuser | qr | Accept raw QR payload string and return decoded patient snapshot object. |

### 5.4 Surveillance Routes — `router: surveillance.py`

| Method | Endpoint | Auth Role | Tag | Description |
|---|---|---|---|---|
| `GET` | `/api/v1/surveillance/trends` | admin / superuser | surveillance | Returns aggregated case counts grouped by disease + location for 3D map. |
| `GET` | `/api/v1/surveillance/predictions` | admin / superuser | surveillance | Returns ML forecast: next 4-week case projections per disease/region. |
| `GET` | `/api/v1/surveillance/alerts` | admin / superuser | surveillance | Returns active outbreak alerts where weekly delta exceeds threshold. |
| `POST` | `/api/v1/surveillance/refresh` | superuser | surveillance | Manually trigger a surveillance cache refresh (also runs on a cron schedule). |

---

## 6. Pydantic Request & Response Schemas

All schemas live in `app/schemas/`. They follow the pattern: `XCreate` (request body) | `XResponse` (API output). Schemas use `model_config = ConfigDict(from_attributes=True)` for ORM compatibility.

### 6.1 Patient Schemas — `app/schemas/patient.py`

**`PatientCreate`** — request body for `POST /patients/register`

| Field | Type | Required | Description |
|---|---|---|---|
| `full_name` | `str` | Yes | Min length 2 |
| `date_of_birth` | `date` | Yes | ISO 8601 date |
| `gender` | `str` | Yes | Enum: `male` \| `female` \| `other` |
| `blood_type` | `str` | Yes | Enum: `A+` `A-` `B+` `B-` `O+` `O-` `AB+` `AB-` |
| `allergies` | `list[str]` | No | Default empty list |
| `location_state` | `str` | Yes | |
| `location_city` | `str` | Yes | |
| `phone` | `str \| None` | No | E.164 format recommended |

**`PatientResponse`** — response body for `GET /patients/{id}`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `UUID` | Yes | |
| `full_name` | `str` | Yes | |
| `date_of_birth` | `date` | Yes | |
| `gender` | `str` | Yes | |
| `blood_type` | `str` | Yes | |
| `allergies` | `list[str]` | Yes | |
| `location_state` | `str` | Yes | |
| `location_city` | `str` | Yes | |
| `registered_by` | `UUID` | Yes | |
| `created_at` | `datetime` | Yes | |
| `records` | `list[MedicalRecordResponse]` | Yes | Nested list of all records |

### 6.2 Medical Record Schemas — `app/schemas/medical_record.py`

**`MedicalRecordCreate`** — request body for `POST /patients/{id}/records`

| Field | Type | Required | Description |
|---|---|---|---|
| `diagnosis` | `str` | Yes | Plain text diagnosis description |
| `icd_code` | `str \| None` | No | ICD-10 code e.g. `J18.9` |
| `prescription` | `str \| None` | No | |
| `notes` | `str \| None` | No | |
| `severity` | `str` | Yes | Enum: `low` \| `medium` \| `high` \| `critical` |
| `visit_date` | `date` | Yes | |

**`MedicalRecordResponse`**

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `UUID` | Yes | |
| `patient_id` | `UUID` | Yes | |
| `doctor_id` | `UUID` | Yes | |
| `diagnosis` | `str` | Yes | |
| `icd_code` | `str \| None` | Yes | |
| `severity` | `str` | Yes | |
| `visit_date` | `date` | Yes | |
| `created_at` | `datetime` | Yes | |

### 6.3 QR Schemas — `app/schemas/qr.py`

**`QRPayload`** — offline-embeddable compressed JSON structure

| Field | Type | Required | Description |
|---|---|---|---|
| `pid` | `str` | Yes | Patient UUID |
| `n` | `str` | Yes | Full name (abbreviated key for size) |
| `dob` | `str` | Yes | ISO date string |
| `bt` | `str` | Yes | Blood type |
| `al` | `list[str]` | Yes | Allergies list |
| `dx` | `str` | Yes | Last diagnosis text |
| `sev` | `str` | Yes | Last severity enum |
| `ts` | `int` | Yes | Unix timestamp of QR generation |
| `sig` | `str` | Yes | HMAC-SHA256 signature for tamper detection |

> **QR Encoding Strategy**
>
> 1. Build `QRPayload` dict from patient + latest record.
> 2. Serialize to JSON bytes, compress with `zlib` (level 9), `base64url`-encode.
> 3. Sign: `sig = HMAC-SHA256(compressed_bytes, QR_SECRET_KEY from .env)`.
> 4. Append `sig` to payload, generate QR PNG via the `qrcode` Python library.
> 5. Return PNG as base64 string so the frontend can render `<img src="data:image/png;base64,..."/>`.
>
> The decode endpoint reverses steps 5→1 and validates the HMAC before returning data.

---

## 7. Backend Services

### 7.1 Patient Service — `app/services/patient_service.py`

- `register_patient(db, data, current_user)` — Creates `Patient` row, triggers QR generation, returns `PatientResponse` + `qr_base64`.
- `get_patient(db, patient_id, current_user)` — Fetches patient with eager-loaded records; enforces role check.
- `list_patients(db, filters, pagination)` — Applies optional state/city/disease filters with OFFSET pagination.
- `append_record(db, patient_id, data, current_user)` — Creates `MedicalRecord` row; triggers `alert_service.check_threshold()` asynchronously.

### 7.2 QR Service — `app/services/qr_service.py`

- `generate_qr(patient, latest_record) -> str` — Builds, signs, compresses, and returns base64 PNG.
- `decode_qr(payload_str) -> QRPayload` — Validates HMAC, decompresses, returns structured object.
- **Dependencies:** `qrcode[pil]`, `Pillow`, `python-multipart` (for decode endpoint file upload).

### 7.3 ML Service — `app/services/ml_service.py`

Lightweight prediction engine using Prophet or scikit-learn's `LinearRegression` (prefer Prophet for time-series). Runs on server startup; model is pre-trained offline and loaded from a pickle file path set in config.

- `load_model()` — Called once at FastAPI startup via `lifespan` event.
- `predict_trends(db, weeks_ahead=4) -> list[PredictionPoint]` — Queries `surveillance_cache` for historical weekly counts per disease, feeds into model, returns forecast.
- **Fallback:** if no model file present, return a simple 7-day rolling average projection.

### 7.4 Alert Service — `app/services/alert_service.py`

- `check_threshold(db, disease, location)` — Called after every new medical record is saved. Logic: count records in last 7 days for same disease + location. If count > `ALERT_THRESHOLD` (env var, default `10`), upsert an alert record.
- `get_active_alerts(db) -> list[AlertResponse]` — Returns all alerts where `triggered_at > 24h ago` and `case_count` still above threshold.

---

## 8. Configuration & Environment Variables

Extend `app/config.py` (Pydantic `BaseSettings`) with the following new fields. All values must be added to `.env.example`.

```env
# === Existing (do not remove) ===
SECRET_KEY=your_jwt_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=postgresql://user:pass@localhost:5432/healthcare_db
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# === New additions required ===
QR_SECRET_KEY=your_qr_hmac_secret          # HMAC key for QR tamper-proofing
ALERT_THRESHOLD=10                          # cases/week before alert fires
ML_MODEL_PATH=./models/outbreak_model.pkl  # pickle path; optional
SURVEILLANCE_REFRESH_INTERVAL_MINUTES=30   # background cache refresh cadence
CORS_ORIGINS=http://localhost:3000          # tighten in prod
```

---

## 9. main.py Modifications

The boilerplate `main.py` must be updated to register the new routers and start background services via FastAPI's `lifespan` context manager.

```python
from contextlib import asynccontextmanager
from app.services.ml_service import load_model
from app.routers import patients, records, qr, surveillance

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()            # Pre-load ML model at startup
    yield                   # App runs
    # (cleanup if needed)

app = FastAPI(lifespan=lifespan)

# Include new routers
app.include_router(patients.router,     prefix='/api/v1', tags=['patients'])
app.include_router(records.router,      prefix='/api/v1', tags=['records'])
app.include_router(qr.router,           prefix='/api/v1', tags=['qr'])
app.include_router(surveillance.router, prefix='/api/v1', tags=['surveillance'])
```

---

## 10. Python Dependency Additions

Append the following packages to `requirements.txt`. All other existing dependencies remain unchanged.

```txt
# === QR Code Generation ===
qrcode[pil]==7.4.2
Pillow==10.3.0

# === ML / Forecasting ===
scikit-learn==1.4.2
prophet==1.1.5       # Optional: heavier, better time-series (can skip for MVP)
pandas==2.2.2
numpy==1.26.4

# === Data Compression for QR ===
# zlib is stdlib — no pip install needed

# === Background Tasks ===
apscheduler==3.10.4  # For surveillance cache refresh cron

# === UUID support ===
# uuid is stdlib — no pip install needed

# === Postgres JSONB support ===
psycopg2-binary==2.9.9
```

---

## 11. Alembic Migration Plan

Migrations must be created in this order to respect foreign key constraints. Run `alembic upgrade head` after generating all revisions.

| # | Migration Name | What it creates |
|---|---|---|
| 1 | `add_role_to_users` | `ALTER TABLE users ADD COLUMN role VARCHAR` with `UserRole` enum; default `'doctor'`. |
| 2 | `create_patients` | `CREATE TABLE patients` with all fields defined in Section 4.1; FK to `users`. |
| 3 | `create_medical_records` | `CREATE TABLE medical_records`; FK to `patients` and `users`. |
| 4 | `create_surveillance_cache` | `CREATE TABLE surveillance_cache`; add composite index on `(disease_name, location_state, week_start)`. |
| 5 | `create_alerts` | `CREATE TABLE alerts (id, disease, location, case_count, triggered_at, resolved_at)`; used by `alert_service`. |

---

## 12. Non-Functional Requirements

### Security

- All endpoints require Bearer JWT. Role-guard dependency must be injected at the router level, not just the service layer.
- QR payloads must be HMAC-signed. Reject decode requests where HMAC verification fails with `HTTP 400`.
- Sensitive fields (phone number) must never appear in list-view responses, only in single-patient detail.

### Performance

- `GET /api/v1/surveillance/trends` must respond in < 300ms. This is guaranteed by the `surveillance_cache` table — never run live `GROUP BY` on `medical_records` for dashboard queries.
- QR generation endpoint must return in < 500ms for a standard patient record.
- ML predictions endpoint can take up to 2s (acceptable for admin-only view).

### Observability

- All routers must use Python's `logging` module at `INFO` level for each request.
- Services must log `WARN` on threshold breach and `ERROR` on ML model load failure.
- FastAPI auto-docs (Swagger at `/docs`, ReDoc at `/redoc`) must remain enabled in development.

### Error Handling

| Code | When |
|---|---|
| `404 Not Found` | Patient or record does not exist. |
| `403 Forbidden` | Role mismatch — return generic message, do not leak role names. |
| `400 Bad Request` | Invalid QR payload or HMAC mismatch. |
| `422 Unprocessable Entity` | Pydantic validation failure (FastAPI default — no override needed). |

---

## 13. Execution Checklist for Antigravity

Generate code in this exact order to avoid import/dependency errors:

1. `app/models/user.py` — Add `UserRole` enum and `role` column.
2. `app/models/patient.py` — Full `Patient` ORM model.
3. `app/models/medical_record.py` — `MedicalRecord` ORM model.
4. `app/models/surveillance.py` — `SurveillanceCache` + `Alert` ORM models.
5. `app/schemas/*.py` — All Pydantic schemas (`patient`, `medical_record`, `qr`, `surveillance`).
6. `app/utils/dependencies.py` — Add `require_role()` factory.
7. `app/utils/compression.py` — zlib encode/decode + HMAC sign/verify helpers.
8. `app/services/patient_service.py`
9. `app/services/qr_service.py`
10. `app/services/alert_service.py`
11. `app/services/ml_service.py`
12. `app/routers/patients.py`, `records.py`, `qr.py`, `surveillance.py`
13. `app/config.py` — Extend with new env vars.
14. `app/main.py` — Register routers + lifespan startup.
15. `requirements.txt` — Append new dependencies.
16. `.env.example` — Add all new env var keys with placeholder values.
17. `alembic/versions/` — Generate 5 migration files in the order listed in Section 11.

---

*End of Backend PRD · Smart Healthcare History & Disease Surveillance System · v1.0*