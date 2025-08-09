import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/useAuth";

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // create a loading spinner later
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
