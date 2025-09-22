// src/components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";
import { User, UserPlus, Menu, X, Home, Info, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import logoRevitameal from "../assets/logoRevitameal.png";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationLinks = [
    { to: "/#home-section", label: "Home", icon: Home },
    { to: "/#about-section", label: "About Us", icon: Info },
    { to: "/#footer-section", label: "Contact", icon: Phone },
  ];

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="relative">
      {/* Enhanced Background with scroll effect */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-gradient-to-r from-[#B23501]/98 via-[#A03301]/95 to-[#B23501]/98 backdrop-blur-xl shadow-2xl"
            : "bg-gradient-to-r from-[#B23501]/95 via-[#A03301]/90 to-[#B23501]/95 backdrop-blur-xl shadow-lg"
        } border-b border-white/20`}
      >
        {/* Enhanced animated background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#FFD580]/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <nav className="relative container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Enhanced Logo Section */}
            <div className="flex items-center space-x-3 group">
              <Link
                to="/"
                className="flex items-center space-x-3 transition-all duration-300 hover:scale-105"
              >
                {/* Logo with improved styling */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#F9A03F] to-[#FFD580] rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <img
                    src={logoRevitameal}
                    alt="Logo Revitameal"
                    className="relative w-10 h-10 rounded-xl object-cover shadow-lg group-hover:shadow-xl transition-all duration-300"
                  />
                </div>

                {/* Enhanced Brand Name */}
                <div>
                  <div className="text-2xl font-black text-white tracking-wide group-hover:text-[#FFD580] transition-colors duration-300">
                    REVITAMEAL
                  </div>
                  <div className="text-xs text-white/70 hidden sm:block font-medium tracking-wider">
                    Good Food Good Mood No Plastic
                  </div>
                </div>
              </Link>
            </div>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navigationLinks.map((link) => {
                const IconComponent = link.icon;
                const isActive = isActiveLink(link.to);

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-6 py-3 text-white font-medium text-lg transition-all duration-300 group rounded-full ${
                      isActive
                        ? "bg-white/15 text-[#FFD580] shadow-lg"
                        : "hover:text-[#FFD580] hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="relative z-10">{link.label}</span>
                    </div>

                    {/* Enhanced underline animation */}
                    <div
                      className={`absolute -bottom-1 left-1/2 h-0.5 bg-gradient-to-r from-[#F9A03F] to-[#FFD580] transition-all duration-300 ${
                        isActive
                          ? "w-full left-0"
                          : "w-0 group-hover:w-full group-hover:left-0"
                      }`}
                    ></div>
                  </Link>
                );
              })}
            </div>

            {/* Enhanced Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Enhanced Auth Buttons - Desktop */}
              <div className="hidden sm:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="group relative overflow-hidden bg-gradient-to-r from-[#F9A03F] via-[#F6B049] to-[#FFD580] px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  <div className="relative flex items-center space-x-2 text-[#B23501] font-bold">
                    <User className="h-4 w-4" />
                    <span>Login</span>
                  </div>
                </Link>

                <Link
                  to="/register"
                  className="group relative overflow-hidden bg-white/10 hover:bg-white/20 border border-white/30 px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-2 text-white font-bold">
                    <UserPlus className="h-4 w-4" />
                    <span>Daftar</span>
                  </div>
                </Link>
              </div>

              {/* Enhanced Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden relative p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 group backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#F9A03F]/20 to-[#FFD580]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-white relative z-10" />
                ) : (
                  <Menu className="h-5 w-5 text-white relative z-10" />
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Mobile Menu */}
          <div
            className={`lg:hidden absolute top-full left-0 right-0 transition-all duration-300 ${
              isMobileMenuOpen
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
          >
            <div className="bg-gradient-to-b from-[#B23501]/98 to-[#A03301]/95 backdrop-blur-xl border-b border-white/20 shadow-2xl">
              <div className="container mx-auto px-4 py-6">
                {/* Enhanced Mobile Navigation Links */}
                <div className="space-y-2 mb-6">
                  {navigationLinks.map((link) => {
                    const IconComponent = link.icon;
                    const isActive = isActiveLink(link.to);

                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 font-medium text-lg rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-white/15 text-[#FFD580] shadow-lg"
                            : "text-white hover:text-[#FFD580] hover:bg-white/10"
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Enhanced Mobile Auth Buttons */}
                <div className="flex flex-col space-y-3 sm:hidden">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group relative overflow-hidden bg-gradient-to-r from-[#F9A03F] to-[#FFD580] px-6 py-4 rounded-full shadow-lg text-[#B23501] font-bold text-center flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                    <User className="h-5 w-5 relative z-10" />
                    <span className="relative z-10">Login</span>
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-white/10 hover:bg-white/20 border border-white/30 px-6 py-4 rounded-full text-white font-bold text-center flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Daftar</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Spacer with dynamic height based on scroll */}
      <div
        className={`transition-all duration-300 ${scrolled ? "h-20" : "h-24"}`}
      ></div>
    </header>
  );
}

export default Navbar;
