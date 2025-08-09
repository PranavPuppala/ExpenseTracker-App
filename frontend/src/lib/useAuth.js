import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/lib/constants";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    window.location.assign("/login");
  }, [clearAuth]);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/api/profile/")
      .then(({ data }) => setUser(data))
      .catch(() => clearAuth())
      .finally(() => setLoading(false));
  }, [clearAuth]);

  return { user, loading, setUser, logout };
}
