// src/components/MenuPreviewSection.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChefHat, ArrowRight } from "lucide-react";
import { db } from "../firebase";
import { collection, query, limit, getDocs } from "firebase/firestore";

function MenuPreviewSection() {
  const [previewMenus, setPreviewMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreviewMenus = async () => {
      try {
        const menuCollectionRef = collection(db, "lunchBoostMen");
        const q = query(menuCollectionRef, limit(6));
        const querySnapshot = await getDocs(q);
        const menusData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPreviewMenus(menusData);
      } catch (error) {
        console.error("Error fetching menu preview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewMenus();
  }, []);

  return (
    <section className="relative py-24 px-4 md:px-8">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F27F34]/30 to-[#B23501]/20"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
            <ChefHat className="h-4 w-4 mr-2" />
            Preview Menu
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Preview <span className="text-[#FFD580]">Menu Sehat</span> Kami
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Berikut adalah beberapa pilihan menu lezat dan bergizi yang kami tawarkan. Temukan lebih banyak lagi di halaman menu kami.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD580] mx-auto mb-4"></div>
              <p className="text-white/80 text-lg">
                Memuat menu terbaik untuk Anda...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {previewMenus.length > 0 ? (
                previewMenus.map((item) => (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden rounded-t-2xl h-48">
                      <img
                        src={item.image_url || "/api/placeholder/300/200"}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = "/api/placeholder/300/200";
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-[#F9A03F] to-[#FFD580] rounded-full text-xs font-semibold text-[#B23501]">
                          {item.type || "Menu Sehat"}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                          {item.calories || "350"} kkal
                        </span>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FFD580] transition-colors duration-300 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-white/80 text-sm leading-relaxed mb-4 h-12 overflow-hidden line-clamp-2">
                        {item.description ||
                          "Menu sehat dengan bahan-bahan pilihan dan bergizi tinggi"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-[#FFD580]">
                          Rp{(item.price || 0).toLocaleString("id-ID")}
                        </span>
                        <button
                          onClick={() => (window.location.href = "/login")}
                          className="px-4 py-2 bg-gradient-to-r from-[#F9A03F] to-[#FFD580] rounded-full text-[#B23501] font-semibold text-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                        >
                          Pesan
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Empty State
                <div className="col-span-full text-center py-20">
                  <ChefHat className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60 text-xl mb-2">
                    Menu sedang disiapkan
                  </p>
                  <p className="text-white/40">
                    Menu terbaik kami akan segera tersedia
                  </p>
                </div>
              )}
            </div>

            {/* CTA to Menu Page */}
            <div className="text-center">
              <Link
                to="/login"
                className="group inline-flex items-center space-x-3 bg-white/10 hover:bg-white/20 border border-white/30 px-8 py-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105 text-white font-semibold text-lg"
              >
                <span>Lihat Semua Menu</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default MenuPreviewSection;
