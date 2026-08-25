import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageSpinner } from "@/components/ui/spinner";

/**
 * Wraps routes that require a logged-in user (and optionally an admin).
 * - While we're still checking the stored token, show a spinner.
 * - If not logged in, redirect to /login (remembering where they were going).
 * - If adminOnly and the user isn't an admin, bounce them to the shop.
 */
export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageSpinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
