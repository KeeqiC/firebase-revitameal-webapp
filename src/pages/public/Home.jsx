// src/pages/public/Home.jsx
import { Link } from "react-router-dom";
import {
  Award,
  Star,
  Sprout,
  BadgeCheck,
  ChefHat,
  Heart,
  Package,
  Laptop,
  ArrowRight,
  Play,
  Sparkles,
} from "lucide-react";

import heroImage from "../../assets/hero.jpg";
import phone1Image from "../../assets/phone1.png";
import phone2Image from "../../assets/phone2.png";
import MenuPreviewSection from "../../components/MenuPreviewSection";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F27F34] via-[#E06B2A] to-[#B23501] text-white relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-[#FFD580]/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 md:px-8 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 text-sm font-medium">
                <Sparkles className="h-4 w-4 mr-2" />
                Makanan Sehat Terpercaya Sejak 2019
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
                <span className="block">REVITA</span>
                <span className="block bg-gradient-to-r from-[#FFD580] to-[#F9A03F] bg-clip-text text-transparent">
                  MEAL
                </span>
              </h1>

              <p className="text-xl md:text-2xl font-light text-white/90 max-w-lg">
                Good Food Good Mood No Plastic
              </p>

              <p className="text-lg text-white/80 max-w-2xl">
                Platform makanan sehat yang mendukung gaya hidup seimbang dengan
                menu bergizi, praktis, dan disesuaikan kebutuhan kesehatan
                setiap individu.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/login"
                className="group relative overflow-hidden bg-gradient-to-r from-[#F9A03F] via-[#F6B049] to-[#FFD580] px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <div className="relative flex items-center justify-center space-x-2 text-[#B23501] font-bold text-lg">
                  <span>Mulai Hidup Sehat</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>

              <Link
                to="/about"
                className="group flex items-center space-x-3 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <span className="font-semibold">Pelajari Lebih Lanjut</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>

          {/* Right Content - Hero Image with better styling */}
          <div className="relative">
            <div className="relative z-10 group">
              {/* Replace with better hero image - you can use a modern food bowl image */}
              <div className="w-full h-96 lg:h-[500px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <img
                  src={heroImage}
                  alt="Makanan Sehat"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Overlay for better contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Modern floating elements */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-[#FFD580]/60 to-[#F9A03F]/40 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/5 rounded-full blur-2xl"></div>
            <div
              className="absolute top-1/2 -right-6 w-16 h-16 bg-gradient-to-br from-[#F9A03F] to-[#FFD580] rounded-2xl opacity-80 blur-sm animate-bounce"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>
      </section>

      {/* Menu Preview Section */}
      <MenuPreviewSection />

      {/* About Section */}
      <section id="about-section" className="relative py-24 px-4 md:px-8">
        {/* Background with different gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#B23501]/95 via-[#A03301]/90 to-[#B23501]/95 backdrop-blur-sm"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
              <Heart className="h-4 w-4 mr-2" />
              Tentang Kami
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Mengapa Pilih <span className="text-[#FFD580]">Revitameal</span>?
            </h2>
            <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              REVITAMEAL adalah platform penyedia makanan sehat yang dirancang
              untuk mendukung gaya hidup seimbang dan penuh energi dengan
              berbagai pilihan menu bergizi yang lezat.
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
            <div className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={phone1Image}
                    alt="Program Korporat"
                    className="w-full lg:w-48 h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl font-bold mb-3 text-[#FFD580]">
                    Program Korporat & Komunitas
                  </h3>
                  <p className="text-white/90 leading-relaxed">
                    Solusi katering sehat untuk karyawan perusahaan dan kegiatan
                    komunitas dengan menu yang disesuaikan kebutuhan.
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={phone2Image}
                    alt="Harga Terjangkau"
                    className="w-full lg:w-48 h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl font-bold mb-3 text-[#FFD580]">
                    Custom & Terjangkau
                  </h3>
                  <p className="text-white/90 leading-relaxed">
                    Menu yang dapat disesuaikan dengan kebutuhan dan budget,
                    praktis tanpa ribet dengan kualitas terjamin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: Award,
                title: "Berdiri Sejak 2019",
                color: "from-[#FFD580] to-[#F9A03F]",
              },
              {
                icon: Star,
                title: "Dipercaya Semua Kalangan",
                color: "from-[#F9A03F] to-[#FFD580]",
              },
              {
                icon: Sprout,
                title: "Pemberdayaan UMKM Lokal",
                color: "from-[#FFD580] to-[#F6B049]",
              },
              {
                icon: BadgeCheck,
                title: "Bahan Berkualitas",
                color: "from-[#F6B049] to-[#FFD580]",
              },
              {
                icon: ChefHat,
                title: "Beragam Menu",
                color: "from-[#FFD580] to-[#F9A03F]",
              },
              {
                icon: Heart,
                title: "Custom Menu Personal",
                color: "from-[#F9A03F] to-[#FFD580]",
              },
              {
                icon: Package,
                title: "Kemasan Ramah Lingkungan",
                color: "from-[#FFD580] to-[#F6B049]",
              },
              {
                icon: Laptop,
                title: "Website Interaktif",
                color: "from-[#F6B049] to-[#FFD580]",
              },
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-semibold text-sm leading-snug text-white/95">
                    {feature.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Siap Memulai Hidup{" "}
            <span className="text-[#FFD580]">Lebih Sehat</span>?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan orang yang sudah merasakan manfaat
            makanan sehat dari Revitameal
          </p>
          <Link
            to="/login"
            className="group inline-flex items-center space-x-3 bg-gradient-to-r from-[#F9A03F] via-[#F6B049] to-[#FFD580] px-10 py-5 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 text-[#B23501] font-bold text-lg"
          >
            <span>Pesan Sekarang</span>
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
