import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// This component doesn't render any UI of its own most of the time.
// It's a "gatekeeper": if the user is logged in, it renders <Outlet />
// (which is React Router's placeholder for whatever nested route matched).
// If not, it redirects to /login instead.
const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // "state={{ from: location }}" remembers where the user was TRYING
    // to go, so after logging in we can send them back there instead
    // of always dumping them on the homepage.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
