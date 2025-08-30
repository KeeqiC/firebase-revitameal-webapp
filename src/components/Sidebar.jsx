// src/components/Sidebar.jsx
import { Link } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  Utensils,
  ClipboardList,
  Flame,
  FileText,
  Dumbbell,
  Bot,
  User,
  History,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext"; // Impor useAuth
import { useNavigate } from "react-router-dom";

function Sidebar({ toggleSidebar }) {
  const { logout } = useAuth(); // Ambil fungsi logout dari context
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toggleSidebar(); // Tutup sidebar setelah logout
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  return (
    <div className="h-full bg-[#F27F34] shadow-lg w-64 flex flex-col py-6 space-y-8">
      {/* Header Sidebar */}
      <div className="flex justify-between items-center px-4 mb-6">
        <h2 className="text-2xl font-bold text-white">Revitameal</h2>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors md:hidden"
        >
          <X className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Link Sidebar */}
      <nav className="flex-1 px-4 space-y-2">
        <Link
          to="/dashboard"
          onClick={toggleSidebar}
          className="flex items-center gap-3 px-4 py-2 text-white hover:bg-[#B23501] rounded-lg transition-colors"
        >
          <LayoutDashboard className="h-6 w-6" /> Dashboard
        </Link>
        <Link
          to="/dashboard/lunch-boost"
          onClick={toggleSidebar}
          className="flex items-center gap-3 px-4 py-2 text-white hover:bg-[#B23501] rounded-lg transition-colors"
        >
          <Utensils className="h-6 w-6" /> Lunch Boost
        </Link>
        <Link
          to="/dashboard/diet-planner"
          onClick={toggleSidebar}
          className="flex items-center gap-3 px-4 py-2 text-white hover:bg-[#B23501] rounded-lg transition-colors"
        >
          <ClipboardList className="h-6 w-6" /> Diet Planner
        </Link>
        <Link
          to="/dashboard/calorie-tracker"
          onClick={toggleSidebar}
          className="flex items-center gap-3 px-4 py-2 text-white hover:bg-[#B23501] rounded-lg transition-colors"
        >
          <Flame className="h-6 w-6" /> Kalori Tracker
        </Link>
        <Link
          to="/dashboard/food-journal"
          onClick={toggleSidebar}
          className="flex items-center gap-3 px-4 py-2 text-white hover:bg-[#B23501] rounded-lg transition-colors"
        >
          <FileText className="h-6 w-6" /> Food Journal
        </Link>
        <Link
          to="/dashboard/fitness-guide"
          onClick={toggleSidebar}
          className="flex items-center gap-3 px-4 py-2 text-white hover:bg-[#B23501] rounded-lg transition-colors"
        >
          <Dumbbell className="h-6 w-6" /> Fitness Guide
        </Link>
        <Link
          to="/dashboard/chibo"
          onClick={toggleSidebar}
          className="flex items-center gap-3 px-4 py-2 text-white hover:bg-[#B23501] rounded-lg transition-colors"
        >
          <Bot className="h-6 w-6" /> Chibo Assistant
        </Link>
      </nav>

      {/* Bagian Bawah Sidebar (Profile & Logout) */}
      <div className="mt-auto px-4 space-y-2">
        <Link
          to="/dashboard/profile"
          onClick={toggleSidebar}
          className="flex items-center gap-3 px-4 py-2 text-white hover:bg-[#B23501] rounded-lg transition-colors"
        >
          <User className="h-6 w-6" /> Profil & Pengaturan
        </Link>
        <Link
          to="/dashboard/order-history"
          onClick={toggleSidebar}
          className="flex items-center gap-3 px-4 py-2 text-white hover:bg-[#B23501] rounded-lg transition-colors"
        >
          <History className="h-6 w-6" /> Riwayat Pesanan
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-red-300 hover:bg-red-900/50 rounded-lg transition-colors"
        >
          <LogOut className="h-6 w-6" /> Keluar
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
