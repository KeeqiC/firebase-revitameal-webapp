// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"; // Akan kita buat nanti

function MainLayout() {
  return (
    <div className="min-h-screen bg-[#B23501] text-white flex flex-col">
      <Navbar />

      {/* Konten Halaman akan ditampilkan di sini */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
