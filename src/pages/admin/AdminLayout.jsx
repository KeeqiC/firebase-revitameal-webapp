// src/layouts/AdminLayout.jsx (atau di mana pun Anda menyimpannya)

import { NavLink, Outlet, useNavigate } from "react-router-dom";
// Pastikan path ke AuthContext Anda sudah benar
import { useAuth } from "../../context/AuthContext.jsx";
import { LayoutDashboard, Video, LogOut } from "lucide-react";

function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      // Mengarahkan ke halaman utama setelah logout
      navigate("/");
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-8 text-center">Admin Panel</h1>
        <nav className="flex flex-col space-y-2 flex-grow">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive ? "bg-orange-600" : "hover:bg-gray-700"
              }`
            }
          >
            <LayoutDashboard />
            <span>Database Menu</span>
          </NavLink>
          <NavLink
            to="/admin/guide"
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive ? "bg-orange-600" : "hover:bg-gray-700"
              }`
            }
          >
            <Video />
            <span>Fitness Guide</span>
          </NavLink>
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-red-700 w-full mt-4"
        >
          <LogOut />
          <span>Logout</span>
        </button>
      </aside>
      <main className="flex-1 bg-gray-100">
        {" "}
        {/* Menambahkan warna background pada main */}
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
