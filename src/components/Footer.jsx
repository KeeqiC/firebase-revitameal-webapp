// src/components/Footer.jsx

import { Instagram, Facebook, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import TikTokIcon from "./Icons/TikTokIcon";
import logoRevitameal from "../assets/logoRevitameal.png";

// Data untuk tautan navigasi, mudah diubah di sini
const footerNavLinks = [
  { href: "/dashboard/lunch-boost", label: "Menu Kami" },
  { href: "/about", label: "Tentang Kami" },
  { href: "/dashboard", label: "Dashboard" },
];

// Data untuk ikon sosial media
const socialLinks = [
  {
    href: "https://instagram.com/revitameal",
    label: "Instagram",
    Icon: Instagram,
  },
  {
    href: "https://facebook.com/Revitameal",
    label: "Facebook",
    Icon: Facebook,
  },
  {
    href: "https://tiktok.com/@revitameal",
    label: "TikTok",
    Icon: TikTokIcon,
  },
];

function Footer() {
  return (
    <footer
      id="footer-section"
      className="relative bg-gradient-to-br from-[#B23501] via-[#A03301] to-[#8B2200] text-white pt-16 pb-8 mt-auto overflow-hidden"
    >
      {/* Efek Latar Belakang */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-1/2 -right-20 w-60 h-60 bg-[#FFD580]/10 rounded-full blur-2xl opacity-60"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 lg:px-8">
        {/* Konten Utama Footer */}
        <div className="flex flex-wrap justify-center items-start gap-8 lg:gap-20 mb-12">
          {/* Kolom 1: Branding & Logo */}
          <div className="w-full md:w-auto space-y-4 text-center md:text-left">
            <Link
              to="/"
              className="flex items-center space-x-3 mb-4 justify-center md:justify-start"
            >
              <img
                src={logoRevitameal}
                alt="Logo Revitameal"
                className="w-10 h-10"
              />
              <span className="text-2xl font-bold">Revitameal</span>
            </Link>
            <p className="text-white/80 leading-relaxed max-w-sm">
              Platform makanan sehat untuk mendukung gaya hidup seimbang dengan
              menu bergizi, praktis, dan lezat.
            </p>
            <div className="flex space-x-3 pt-2 justify-center md:justify-start">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  title={label}
                >
                  <Icon className="w-5 h-5 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Kolom 2: Hubungi Kami */}
          <div className="w-full md:w-auto">
            <h3 className="font-bold text-lg text-[#FFD580] mb-4">
              Hubungi Kami
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 group">
                <Phone size={18} className="text-[#FFD580]" />
                <a
                  href="tel:0895123223141"
                  className="text-white/80 group-hover:text-white transition-colors"
                >
                  0895123223141
                </a>
              </li>
              <li className="flex items-center space-x-3 group">
                <Mail size={18} className="text-[#FFD580]" />
                <a
                  href="mailto:revitameal@gmail.com"
                  className="text-white/80 group-hover:text-white transition-colors"
                >
                  revitameal@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin
                  size={18}
                  className="text-[#FFD580] mt-1 flex-shrink-0"
                />
                <span className="text-white/80">
                  Dukuh Pande Sari, Desa Banjar Sari RT 02/RW 01, Demak, 59563
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Garis Pemisah & Copyright */}
        <div className="border-t border-white/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0">
            <p className="text-sm text-white/70">
              &copy; {new Date().getFullYear()} Revitameal. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link
                to="/privacy-policy"
                className="text-white/70 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="text-white/70 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
