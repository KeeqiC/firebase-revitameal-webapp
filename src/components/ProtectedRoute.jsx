// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  // TODO: Nanti, ganti ini dengan logika otentikasi yang sesungguhnya.
  // Contoh: const { user } = useAuth();
  const isAuthenticated = true; // Ganti ini menjadi false untuk menguji halaman login.

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
