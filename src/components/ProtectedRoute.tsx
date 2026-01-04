import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const location = useLocation();
  console.log("ProtectedRoute - isLoggedIn:", isLoggedIn);
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
