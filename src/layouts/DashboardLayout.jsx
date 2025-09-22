// src/layouts/DashboardLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Menu } from "lucide-react";

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar untuk Mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform md:hidden transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar toggleSidebar={toggleSidebar} />
      </div>

      {/* Overlay untuk mobile saat sidebar terbuka */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar untuk Desktop (permanen) dan tidak ikut kescroll */}
      <div className="hidden md:flex flex-shrink-0">
        <div className="fixed top-0 left-0 w-64 h-screen bg-[#F27F34] flex flex-col">
          <Sidebar toggleSidebar={() => {}} />
        </div>
      </div>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Header untuk mobile */}
        <header className="md:hidden sticky top-0 bg-white shadow-sm p-4 z-20 flex items-center">
          <button onClick={toggleSidebar} className="p-2 text-[#B23501]">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800 ml-4">Dashboard</h1>
        </header>

        {/* Konten Halaman */}
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;