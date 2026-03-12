import axios from "axios";
import { getToken } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ─────────────────────────────────────────────────────────────────────
export const apiSignup = (data: {
  email: string;
  full_name: string;
  password: string;
  role?: string;
}) => api.post("/auth/signup", data);

export const apiLogin = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

export const triggerGoogleLogin = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/google`;
};

// ── User ─────────────────────────────────────────────────────────────────────
export const apiGetMe = () => api.get("/api/me");
export const apiPing = () => api.get("/api/ping");
export const apiProtected = () => api.get("/api/protected");

// ── Surveillance ─────────────────────────────────────────────────────────────
export const apiGetSurveillanceTrends = () =>
  api.get("/api/v1/surveillance/trends");

export const apiGetSurveillancePredictions = () =>
  api.get("/api/v1/surveillance/predictions");

export const apiGetAlerts = () => api.get("/api/v1/surveillance/alerts");

// ── Patients ─────────────────────────────────────────────────────────────────
export const apiGetPatients = (params?: { search?: string; page?: number }) =>
  api.get("/api/v1/patients", { params });

export const apiGetPatient = (id: string) =>
  api.get(`/api/v1/patients/${id}`);

export const apiRegisterPatient = (data: {
  full_name: string;
  date_of_birth: string;
  gender: string;
  contact: string;
  address?: string;
  emergency_contact?: string;
}) => api.post("/api/v1/patients", data);

export const apiGetPatientRecords = (patientId: string) =>
  api.get(`/api/v1/patients/${patientId}/records`);

// ── QR Code ──────────────────────────────────────────────────────────────────
export const apiGenerateQR = (patientId: string) =>
  api.get(`/api/v1/patients/${patientId}/qr`);

export default api;
