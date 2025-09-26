// src/components/AdminRoute.jsx -> KODE LENGKAP YANG SUDAH DIPERBAIKI ✅

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// GANTI UID INI DENGAN UID ADMIN ANDA
const ADMIN_UID = "lTxrKpb9Pnaj0npGe87mzFrJiYc2";

function AdminRoute() {
  // Ambil currentUser dan loading dari context
  const { currentUser, loading } = useAuth();

  // 1. Tampilkan spinner jika Firebase masih memeriksa status login
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Setelah loading selesai, periksa apakah ada user dan apakah dia admin
  if (currentUser && currentUser.uid === ADMIN_UID) {
    // Jika ya, tampilkan halaman yang seharusnya (AdminLayout -> AdminPage)
    return <Outlet />;
  } else {
    // Jika tidak, arahkan ke halaman login admin
    return <Navigate to="/admin/login" replace />;
  }
}

export default AdminRoute;
