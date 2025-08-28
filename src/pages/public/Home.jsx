// src/pages/public/Home.jsx
import { Link } from "react-router-dom";
import {
  Utensils,
  ShoppingCart,
  User,
  UserPlus,
  Heart,
  Leaf,
  Users,
  Star,
  Award,
  CircleCheck,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Sprout,
  Package,
  Laptop,
  ChefHat,
  BadgeCheck,
} from "lucide-react";

import TikTokIcon from "../../components/Icons/TikTokIcon";
import heroImage from "../../assets/tumpeng.png";
import phoneImage from "../../assets/phone.png";

function Home() {
  return (
    <div className="min-h-screen bg-[#F27F34] text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center p-8">
        <div className="absolute inset-0 bg-[#B23501] opacity-60"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto">
          <div className="text-left mb-8 md:mb-0">
            <h1 className="text-6xl md:text-8xl font-black tracking-wide leading-none">
              REVITAMEAL
            </h1>
            <h2 className="text-xl md:text-2xl mt-2 font-light">
              Healthy Catering
            </h2>
          </div>
          <div className="md:w-1/2">
            <img
              src={heroImage}
              alt="Tumpeng Sehat"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-[#B23501]">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            About Revitameal
          </h2>
          <p className="text-center text-lg max-w-4xl mx-auto mb-16">
            REVITAMEAL adalah website penyedia makanan sehat yang dirancang
            untuk mendukung gaya hidup seimbang dan penuh energi. Kami
            menawarkan berbagai pilihan menu bergizi yang lezat, praktis, dan
            disesuaikan dengan kebutuhan kesehatan setiap individu mulai dari
            diet harian, kebutuhan penderita penyakit tertentu, hingga program
            gaya hidup aktif.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div className="bg-[#F27F34] p-8 rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-6">
              <img
                src={phoneImage}
                alt="Pelayanan Program Korporat"
                className="w-full md:w-1/2 rounded-lg"
              />
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-semibold mb-2">
                  Pelayanan Program Korporat dan Komunitas
                </h3>
                <p>
                  Penyediaan katering sehat untuk karyawan perusahaan dan
                  kegiatan Komunitas.
                </p>
              </div>
            </div>
            <div className="bg-[#F27F34] p-8 rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-6">
              <img
                src={phoneImage}
                alt="Harga Terjangkau"
                className="w-full md:w-1/2 rounded-lg"
              />
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-semibold mb-2">
                  Harga Terjangkau
                </h3>
                <p>
                  Custom Dengan harga terjangkau, langsung siap sesuai
                  kebutuhan, praktis dan tanpa ribet.
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-3xl font-bold text-center mb-12">
            Kenapa harus Revitameal?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Award className="h-10 w-10 mb-2 text-[#FFD580]" />
              <p className="font-semibold">Berdiri Sejak 2019</p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="h-10 w-10 mb-2 text-[#FFD580]" />
              <p className="font-semibold">
                Dipercaya Pelanggan di Semua Kalangan
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Sprout className="h-10 w-10 mb-2 text-[#FFD580]" />
              <p className="font-semibold">
                Pemberdayaan Petani dan UMKM Lokal
              </p>
            </div>
            <div className="flex flex-col items-center">
              <BadgeCheck className="h-10 w-10 mb-2 text-[#FFD580]" />
              <p className="font-semibold">
                Menggunakan Bahan Makanan Berkualitas
              </p>
            </div>
            <div className="flex flex-col items-center">
              <ChefHat className="h-10 w-10 mb-2 text-[#FFD580]" />
              <p className="font-semibold">Tersedia Berbagai Macam Menu</p>
            </div>
            <div className="flex flex-col items-center">
              <Heart className="h-10 w-10 mb-2 text-[#FFD580]" />
              <p className="font-semibold">
                Custom Menu Sehatmu Secara Pribadi
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Package className="h-10 w-10 mb-2 text-[#FFD580]" />
              <p className="font-semibold">Kemasan Ramah Lingkungan</p>
            </div>
            <div className="flex flex-col items-center">
              <Laptop className="h-10 w-10 mb-2 text-[#FFD580]" />
              <p className="font-semibold">Tersedia Website Interaktif</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 px-4 bg-[#B23501]/80 backdrop-blur-md"
      >
        <div className="container mx-auto max-w-2xl">
          <div className="bg-[#F27F34]/30 backdrop-blur-md p-10 rounded-xl shadow-2xl border border-white/20">
            <h3 className="text-3xl font-bold text-center mb-8">
              Hubungi Kami
            </h3>
            <div className="space-y-6 text-lg">
              <div className="flex items-center space-x-4">
                <Instagram className="h-6 w-6" />
                <span>@revitameal</span>
              </div>
              <div className="flex items-center space-x-4">
                <Facebook className="h-6 w-6" />
                <span>Revitameal</span>
              </div>
              <div className="flex items-center space-x-4">
                <TikTokIcon className="h-6 w-6" />
                <span>@revitameal</span>
              </div>
              <div className="flex items-center space-x-4">
                <Phone className="h-6 w-6" />
                <span>0895123223141</span>
              </div>
              <div className="flex items-center space-x-4">
                <Mail className="h-6 w-6" />
                <span>revitameal@gmail.com</span>
              </div>
              <div className="flex items-center space-x-4">
                <MapPin className="h-6 w-6" />
                <span>
                  Dukuh Pande Sari, Desa Banjar Sari RT 02/RW 01, Demak, 59563.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
