// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { User, UserPlus, Menu, X } from "lucide-react";
import { useState } from "react";
import logoRevitameal from "../assets/logoRevitameal.png";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="relative">
      {/* Background with glassmorphism effect */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#B23501]/95 via-[#A03301]/90 to-[#B23501]/95 backdrop-blur-xl border-b border-white/20 shadow-lg">
        {/* Subtle animated background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>

        <nav className="relative container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 group">
              <Link
                to="/"
                className="flex items-center space-x-3 transition-transform duration-300 hover:scale-105"
              >
                {/* Logo Icon */}
                <img
                  src={logoRevitameal} // <-- Gunakan variabel hasil import di sini
                  alt="Logo Revitameal" // <-- Teks alternatif, penting untuk aksesibilitas!
                  className="w-10 h-10 rounded-xl object-cover shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                />

                {/* Brand Name */}
                <div>
                  <div className="text-2xl font-bold text-white tracking-wide">
                    REVITAMEAL
                  </div>
                  <div className="text-xs text-white/70 hidden sm:block font-medium tracking-wider">
                    Good Food Good Mood No Plastic
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {[
                { to: "/", label: "Home" },
                { to: "/#about-section", label: "About Us" },
                { to: "/#footer-section", label: "Contact" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative px-4 py-2 text-white font-medium text-lg transition-all duration-300 hover:text-[#FFD580] group"
                >
                  <span className="relative z-10">{link.label}</span>

                  {/* Hover background effect */}
                  <div className="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>

                  {/* Underline animation */}
                  <div className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-[#F9A03F] to-[#FFD580] transition-all duration-300 group-hover:w-full group-hover:left-0"></div>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Cart Button (commented out but styled for future use) */}
              {/* <Link 
                to="/cart" 
                className="relative p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 group"
              >
                <ShoppingCart className="h-5 w-5 text-white group-hover:text-[#FFD580]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </Link> */}

              {/* Auth Buttons - Desktop */}
              <div className="hidden sm:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="group relative overflow-hidden bg-gradient-to-r from-[#F9A03F] via-[#F6B049] to-[#FFD580] px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  <div className="relative flex items-center space-x-2 text-[#B23501] font-semibold">
                    <User className="h-4 w-4" />
                    <span>Login</span>
                  </div>
                </Link>

                <Link
                  to="/register"
                  className="group relative overflow-hidden bg-white/10 hover:bg-white/20 border border-white/30 px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-2 text-white font-semibold">
                    <UserPlus className="h-4 w-4" />
                    <span>Daftar</span>
                  </div>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-white hover:text-[#FFD580] transition-colors duration-300"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden absolute top-full left-0 right-0 bg-[#B23501]/98 backdrop-blur-xl border-b border-white/20 transition-all duration-300 ${
              isMobileMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
          >
            <div className="container mx-auto px-4 py-6">
              {/* Mobile Navigation Links */}
              <div className="space-y-4 mb-6">
                {[
                  { to: "/", label: "Home" },
                  { to: "/about", label: "About Us" },
                  { to: "/contact", label: "Contact" },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-white font-medium text-lg hover:text-[#FFD580] hover:bg-white/10 rounded-lg transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col space-y-3 sm:hidden">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-gradient-to-r from-[#F9A03F] to-[#FFD580] px-6 py-3 rounded-full shadow-lg text-[#B23501] font-semibold text-center flex items-center justify-center space-x-2 hover:scale-105 transition-transform duration-300"
                >
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-white/10 border border-white/30 px-6 py-3 rounded-full text-white font-semibold text-center flex items-center justify-center space-x-2 hover:bg-white/20 transition-all duration-300"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Daftar</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-20"></div>
    </header>
  );
}

export default Navbar;
