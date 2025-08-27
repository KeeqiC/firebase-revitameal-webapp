import React from "react";
import { ShoppingCartIcon, Bars3Icon } from "@heroicons/react/24/solid";

const Header = () => {
  return (
    // Bagian utama header dengan latar belakang oranye gelap
    <header className="bg-orange-800 text-white p-4 flex justify-between items-center">
      {/* Container untuk menu navigasi di sisi kiri */}
      <div className="flex items-center space-x-6">
        {/* Ikon hamburger menu untuk tampilan mobile, akan kita tangani di tahap responsivitas */}
        <Bars3Icon className="h-6 w-6 cursor-pointer lg:hidden" />

        {/* Menu navigasi utama */}
        <nav className="hidden lg:flex space-x-6">
          <a href="#" className="hover:text-orange-300 transition-colors">
            Home
          </a>
          <a href="#" className="hover:text-orange-300 transition-colors">
            Menu
          </a>
          <a href="#" className="hover:text-orange-300 transition-colors">
            Contact
          </a>
          <a href="#" className="hover:text-orange-300 transition-colors">
            About Us
          </a>
        </nav>
      </div>

      {/* Container untuk ikon dan tombol di sisi kanan */}
      <div className="flex items-center space-x-6">
        {/* Ikon keranjang belanja */}
        <ShoppingCartIcon className="h-6 w-6 cursor-pointer hover:text-orange-300 transition-colors" />

        {/* Tombol Sign In */}
        <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-full transition-colors">
          Sign In
        </button>

        {/* Tombol Sign Up */}
        <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-full transition-colors">
          Sign Up
        </button>
      </div>
    </header>
  );
};

export default Header;
