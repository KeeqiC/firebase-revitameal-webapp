// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { ShoppingCart, User, UserPlus } from "lucide-react";

function Navbar() {
  return (
    <header className="py-4 bg-[#B23501]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
      <nav className="container mx-auto flex justify-between items-center px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-2xl font-bold">
            REVITAMEAL
          </Link>
          <div className="text-sm text-white/80">Healthy Catering</div>
        </div>

        {/* Navigasi untuk Halaman Publik */}
        <ul className="hidden md:flex space-x-8 items-center">
          <li>
            <Link
              to="/"
              className="relative text-lg font-medium after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full hover:text-[#FFD580] transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className="relative text-lg font-medium after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full hover:text-[#FFD580] transition-colors"
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="relative text-lg font-medium after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full hover:text-[#FFD580] transition-colors"
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* Tombol Cart, Login & Register */}
        <ul className="flex space-x-4 items-center">
          <li>
            <Link to="/cart" className="hover:text-[#FFD580] transition-colors">
              <ShoppingCart className="h-6 w-6" />
            </Link>
          </li>
          <li>
            <Link
              to="/login"
              className="bg-gradient-to-r from-[#F9A03F] to-[#F6B049] px-4 py-2 rounded-full shadow-lg hover:scale-105 transform transition duration-200 flex items-center space-x-2 text-sm font-medium"
            >
              <User className="h-4 w-4" />
              <span>Login</span>
            </Link>
          </li>
          <li>
            <Link
              to="/register"
              className="bg-gradient-to-r from-[#F9A03F] to-[#F6B049] px-4 py-2 rounded-full shadow-lg hover:scale-105 transform transition duration-200 flex items-center space-x-2 text-sm font-medium"
            >
              <UserPlus className="h-4 w-4" />
              <span>Register</span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
