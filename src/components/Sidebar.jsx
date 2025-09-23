// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
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
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logoRevitameal from "../assets/logoRevitameal.png";

function Sidebar({ toggleSidebar }) {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toggleSidebar();
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      to: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      color: "from-blue-500 to-blue-600",
    },
    {
      to: "/dashboard/lunch-boost",
      icon: Utensils,
      label: "Lunch Boost",
      color: "from-green-500 to-green-600",
    },
    {
      to: "/dashboard/diet-planner",
      icon: ClipboardList,
      label: "Diet Planner",
      color: "from-purple-500 to-purple-600",
    },
    {
      to: "/dashboard/calorie-tracker",
      icon: Flame,
      label: "Kalori Tracker",
      color: "from-red-500 to-red-600",
    },
    {
      to: "/dashboard/food-journal",
      icon: FileText,
      label: "Food Journal",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      to: "/dashboard/fitness-guide",
      icon: Dumbbell,
      label: "Fitness Guide",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      to: "/dashboard/chibo",
      icon: Bot,
      label: "Chibo Assistant",
      color: "from-cyan-500 to-cyan-600",
    },
  ];

  const profileItems = [
    { to: "/dashboard/profile", icon: User, label: "Profil & Pengaturan" },
    { to: "/dashboard/order-history", icon: History, label: "Riwayat Pesanan" },
  ];

  return (
    <div
      className="w-64 bg-gradient-to-b from-[#F27F34] via-[#E06B2A] to-[#B23501] shadow-2xl relative overflow-hidden"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-20 w-32 h-32 bg-[#FFD580]/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 left-1/2 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header - Fixed */}
      <div className="flex-shrink-0 relative z-10 flex justify-between items-center px-6 py-6 border-b border-white/20">
        <div className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FFD580] to-[#F9A03F] rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <img
              src={logoRevitameal}
              alt="Logo Revitameal"
              className="relative w-10 h-10 rounded-xl object-cover shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide">
              REVITAMEAL
            </h2>
            <p className="text-xs text-white/70 font-medium">Dashboard</p>
          </div>
        </div>

        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 backdrop-blur-sm"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* User Profile - Fixed */}
      {currentUser && (
        <div className="flex-shrink-0 relative z-10 px-6 py-4 border-b border-white/20">
          <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="w-10 h-10 bg-gradient-to-r from-[#F9A03F] to-[#FFD580] rounded-full flex items-center justify-center">
              <span className="text-[#B23501] font-bold text-sm">
                {currentUser.displayName?.charAt(0) ||
                  currentUser.email?.charAt(0) ||
                  "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {currentUser.displayName || "User"}
              </p>
              <p className="text-white/70 text-xs truncate">
                {currentUser.email}
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-[#FFD580]" />
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div
        className="flex-1 relative z-10 overflow-y-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
        }}
      >
        {/* Main Navigation */}
        <div className="px-4 py-6">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider px-3 mb-4">
            Main Menu
          </p>
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveLink(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={toggleSidebar}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {/* Icon Background */}
                  <div
                    className={`w-8 h-8 bg-gradient-to-r ${
                      item.color
                    } rounded-lg flex items-center justify-center shadow-lg ${
                      isActive ? "scale-110" : "group-hover:scale-110"
                    } transition-transform duration-300`}
                  >
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>

                  <span className="font-semibold text-sm">{item.label}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-[#FFD580] rounded-full"></div>
                  )}

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer - Fixed */}
      <div className="flex-shrink-0 relative z-10 px-4 py-4 border-t border-white/20">
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider px-3 mb-3">
          Account
        </p>

        <div className="space-y-2">
          {profileItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = isActiveLink(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={toggleSidebar}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                  <IconComponent className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">{item.label}</span>
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="group w-full flex items-center gap-3 px-4 py-3 text-red-200 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-500/50"
          >
            <div className="w-8 h-8 bg-red-500/20 group-hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors duration-300">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm">Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
