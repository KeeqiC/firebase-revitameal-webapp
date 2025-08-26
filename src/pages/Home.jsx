import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="bg-[#cd5c2f] min-h-screen text-white flex items-center justify-center p-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
        {/* Bagian Kiri - Teks dan Ikon Chibo */}
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
            REVITAMEAL
          </h1>
          <p className="text-xl font-light mb-8">Healthy Catering</p>

          {/* Tombol Call-to-Action */}
          <div className="flex justify-center md:justify-start">
            <Link
              to="/menu"
              className="bg-[#e99a2c] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-orange-700 transition-colors"
            >
              Pesan Sekarang
            </Link>
          </div>

          {/* Ikon Chibo - desktop */}
          <div className="hidden md:block absolute bottom-8 left-8">
            <img
              src="/chibo-icon.png"
              alt="Chibo AI Assistant"
              className="w-16 h-16 rounded-full cursor-pointer transition-transform transform hover:scale-110"
            />
          </div>
        </div>

        {/* Bagian Kanan - Gambar */}
        <div className="flex-1 max-w-sm md:max-w-md">
          <img
            src="/hero-tumpeng.png"
            alt="Delicious Tumpeng Dish"
            className="w-full h-auto rounded-xl shadow-2xl"
          />
        </div>
      </div>

      {/* Ikon Chibo - mobile */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <img
          src="/chibo-icon.png"
          alt="Chibo AI Assistant"
          className="w-12 h-12 rounded-full cursor-pointer transition-transform transform hover:scale-110"
        />
      </div>
    </div>
  );
}

export default Home;
