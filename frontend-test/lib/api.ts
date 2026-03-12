import axios from "axios";
import { getToken } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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

// ── Auth ──────────────────────────────────────────────────────────────────────

export const apiSignup = (data: {
  email: string;
  full_name: string;
  password: string;
}) => api.post("/auth/signup", data);

export const apiLogin = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

// Redirect browser to backend Google OAuth route
export const triggerGoogleLogin = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
};

// ── Protected ─────────────────────────────────────────────────────────────────

export const apiGetMe = () => api.get("/api/me");

export const apiPing = () => api.get("/api/ping");

export const apiProtected = () => api.get("/api/protected");
