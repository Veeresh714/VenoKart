import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Similar to PrivateRoute, but additionally checks role === "admin".
const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Logged in, but not an admin - send them home instead of showing
    // an admin page they have no business seeing.
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
