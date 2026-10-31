import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { AccessDenied } from "./AccessDenied";

/**
 * Route guard for administrator access only.
 * Students and staff members are denied.
 */
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== "admin") {
    // Not an admin – show generic access denied component
    return <AccessDenied />;
  }

  return children;
};

