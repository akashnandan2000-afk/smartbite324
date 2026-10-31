import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AccessDenied } from "./AccessDenied";

/**
 * Ensures user is authenticated. If not, redirects to /login.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
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

  return children;
};

/**
 * Ensures user is authenticated AND has staff/admin role.
 * Students are strictly forbidden and see AccessDenied.
 */
export const StaffRoute = ({ children }) => {
  const { isAuthenticated, isStaffOrAdmin, loading } = useAuth();
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

  if (!isStaffOrAdmin) {
    return <AccessDenied />;
  }

  return children;
};

