import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Import firebase dan auth.
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
  Flame,
  Activity,
  Tag,
  UtensilsCrossed,
  Utensils,
  BookA,
} from "lucide-react";

import heroImage from "../../assets/hero.jpg";
import phone1Image from "../../assets/phone1.png";
import phone2Image from "../../assets/phone2.png";

// --- Mock Firebase & Auth Setup ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  return { currentUser };
};
// --- End Mock Setup ---

function Home() {
  const [ingredientsData, setIngredientsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Kategori untuk Database Bahan
  const ingredientCategories = [
    {
      value: "nasi",
      label: "Nasi & Karbohidrat",
      color: "from-amber-500 to-orange-600",
    },
    {
      value: "protein-hewani",
      label: "Protein Hewani",
      color: "from-red-500 to-pink-600",
    },
    {
      value: "protein-nabati",
      label: "Protein Nabati",
      color: "from-lime-500 to-green-600",
    },
    {
      value: "sayuran",
      label: "Sayuran",
      color: "from-green-500 to-emerald-600",
    },
    {
      value: "buah",
      label: "Buah-buahan",
      color: "from-yellow-400 to-orange-500",
    },
    { value: "snack", label: "Snack", color: "from-purple-500 to-violet-600" },
    { value: "minuman", label: "Minuman", color: "from-blue-500 to-cyan-600" },
  ];

  const getCategoryInfo = (category) => {
    return ingredientCategories.find((c) => c.value === category) || {};
  };

  useEffect(() => {
    const ingredientsCollectionRef = collection(db, "revitameal_ingredients");
    const q = query(ingredientsCollectionRef, orderBy("category", "asc"));

    const unsubIngredients = onSnapshot(q, (snapshot) => {
      const ingredients = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIngredientsData(ingredients);
      setLoading(false);
    });

    return () => unsubIngredients();
  }, []);

  return (
    <div
      id="home-section"
      className="min-h-screen bg-gradient-to-br from-[#F27F34] via-[#E06B2A] to-[#B23501] text-white relative overflow-hidden"
    >
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

      {/* Ingredients Preview Section */}
      <section className="relative py-24 px-4 md:px-8 bg-orange-100 backdrop-blur-xl text-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pilihan Menu Kami
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Telusuri koleksi menu-menu lezat yang dirancang khusus untuk
              mendukung gaya hidup sehat Anda.
            </p>
          </div>
          {loading ? (
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Memuat menu...</p>
            </div>
          ) : ingredientsData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {ingredientsData.map((ingredient) => {
                const categoryInfo = getCategoryInfo(ingredient.category);
                return (
                  <div
                    key={ingredient.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="relative h-48 sm:h-56">
                      <img
                        src={
                          ingredient.image_url ||
                          `https://placehold.co/600x400/FFF8DC/B23501?text=REVITA+MEAL`
                        }
                        alt={ingredient.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/600x400/FFF8DC/B23501?text=REVITA+MEAL`;
                          e.target.style.objectFit = "contain";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1 leading-snug">
                          {ingredient.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm font-semibold text-white/90">
                          <BookA className="h-4 w-4 mr-1 text-gray-200" />
                          <span>{categoryInfo.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {ingredient.description ||
                          "Deskripsi komponen tidak tersedia."}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold mb-4">
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                          {parseFloat(ingredient.calories || 0).toFixed(0)} kcal
                        </span>
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                          {parseFloat(ingredient.protein || 0).toFixed(1)}g
                          Protein
                        </span>
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                          {parseFloat(ingredient.carbs || 0).toFixed(1)}g Karbo
                        </span>
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                          {parseFloat(ingredient.fats || 0).toFixed(1)}g Lemak
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#B23501]">
                          {ingredient.weight} {ingredient.unit}
                        </span>
                        <Link
                          to="/login"
                          className="group relative inline-flex items-center space-x-2 bg-gradient-to-r from-[#F9A03F] to-[#FFD580] text-[#B23501] px-4 py-2 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                          <span className="relative z-10">Lihat</span>
                          <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <UtensilsCrossed className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Tidak ada menu yang tersedia saat ini.
              </p>
            </div>
          )}
        </div>
      </section>

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
