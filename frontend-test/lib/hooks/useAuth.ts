"use client";
import { useState, useEffect } from "react";
import { getToken, clearToken, isLoggedIn } from "../auth";
import { apiGetMe } from "../api";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      setLoading(false);
      return;
    }
    apiGetMe()
      .then((res) => setUser(res.data))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    clearToken();
    setUser(null);
    window.location.href = "/login";
  };

  return { user, loading, logout, isLoggedIn: isLoggedIn() };
}
