"use client";

// src/layouts/RootLayout.jsx
// Komponen RootLayout untuk tata letak dan navigasi global
import { Link, Outlet } from "react-router-dom";
import { useState } from "react";
import {
  Menu,
  ShoppingCart,
  User,
  UserPlus,
  Home,
  Utensils,
  ClipboardList,
  Flame,
  FileText,
  Target,
} from "lucide-react";

function RootLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#B23501] text-white flex">
      {/* Sidebar - tersembunyi secara default */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#F27F34] shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-40 w-20`}
      >
        <nav className="flex flex-col items-center py-6 px-2 space-y-8">
          <Link
            to="/"
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="Home"
          >
            <Home className="h-8 w-8" />
          </Link>
          <Link
            to="/lunchboost"
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="Lunch Boost"
          >
            <Utensils className="h-8 w-8" />
          </Link>
          <Link
            to="/diet-planner"
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="Diet Planner"
          >
            <ClipboardList className="h-8 w-8" />
          </Link>
          <Link
            to="/calories"
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="Kalori Tracker"
          >
            <Flame className="h-8 w-8" />
          </Link>
          <Link
            to="/food-journal"
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="Food Journal"
          >
            <FileText className="h-8 w-8" />
          </Link>
          <Link
            to="/fitness-guide"
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="Fitness Guide"
          >
            <Target className="h-8 w-8" />
          </Link>
        </nav>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Konten Utama - tidak ada margin left secara default */}
      <div className="flex-1 flex flex-col">
        {/* Navbar Atas */}
        <header className="py-4 border-b border-white/20">
          <nav className="container mx-auto flex justify-between items-center px-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="focus:outline-none p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">REVITAMEAL</div>
                <div className="text-sm text-white/80">Healthy Catering</div>
              </div>
            </div>

            <ul className="hidden md:flex space-x-8 items-center">
              <li>
                <Link
                  to="/"
                  className="text-lg font-medium hover:underline transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/menu"
                  className="text-lg font-medium hover:underline transition-colors"
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-lg font-medium hover:underline transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/about-us"
                  className="text-lg font-medium hover:underline transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>

            <ul className="flex space-x-4 items-center">
              <li>
                <Link
                  to="/cart"
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <ShoppingCart className="h-6 w-6" />
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="bg-[#F9A03F] px-6 py-3 rounded-lg hover:bg-[#F6B049] transition-colors flex items-center space-x-2 text-lg font-medium"
                >
                  <User className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="bg-[#F9A03F] px-6 py-3 rounded-lg hover:bg-[#F6B049] transition-colors flex items-center space-x-2 text-lg font-medium"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Sign Up</span>
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        {/* Konten Halaman akan muncul di sini */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default RootLayout;
