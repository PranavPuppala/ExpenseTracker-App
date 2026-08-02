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

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      
      // Call backend logout to blacklist the refresh token
      if (refreshToken) {
        await api.post('/api/users/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      // Log the error but continue with logout anyway
      console.error('Backend logout failed:', error);
      // Don't block the logout process if backend call fails
    } finally {
      // Always clear local auth state and redirect
      clearAuth();
      window.location.assign("/login");
    }
  }, [clearAuth]);

  

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/api/users/profile/");
        setUser(data);
      } catch (error) {
        console.error("Authentication check failed:", error);
        clearAuth(); // clearAuth being used therefore it is a dependency
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [clearAuth]); // functions being used as a dependency must always be used with useCallback


  return { user, loading, setUser, logout };
}
