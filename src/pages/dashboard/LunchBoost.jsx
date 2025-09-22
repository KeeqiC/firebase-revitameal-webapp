import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  X,
  CheckCircle,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Filter,
  Search,
  Star,
  Clock,
  Flame,
  Activity,
  Package,
  Layers,
  ChefHat,
  Heart,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { db } from "../../firebase";
import {
  collection,
  query,
  onSnapshot,
  where,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

// Definisikan nama koleksi menu secara konsisten
const MENU_COLLECTION_NAME = "lunchBoostMen";

function LunchBoost() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Effect untuk melacak pembayaran yang berhasil
  useEffect(() => {
    if (!currentUser?.uid) {
      // Pastikan currentUser dan uid ada
      console.log("No current user for order tracking.");
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Hanya tampilkan pesan jika ada perubahan status menjadi 'paid'
        const paidOrder = snapshot.docs.find(
          (doc) => doc.data().status === "paid"
        );
        if (paidOrder) {
          showMessage("Pembayaran berhasil!", "success");
          // Pertimbangkan untuk melakukan sesuatu dengan order yang sudah dibayar,
          // misalnya menghapusnya dari tampilan atau menandainya.
          // Untuk saat ini, kita hanya menampilkan pesan.
        }
      },
      (error) => {
        console.error("Error fetching user orders:", error.message);
        // Anda bisa menampilkan pesan error kepada user jika diperlukan
        // showMessage("Gagal memuat status pesanan.", "error");
      }
    );

    return () => unsubscribe();
  }, [currentUser]); // currentUser sebagai dependency

  // Effect untuk memuat data menu
  useEffect(() => {
    setLoading(true); // Set loading true setiap kali kategori berubah
    let menuQuery;

    if (selectedCategory === "semua") {
      menuQuery = query(collection(db, MENU_COLLECTION_NAME), orderBy("name"));
    } else {
      menuQuery = query(
        collection(db, MENU_COLLECTION_NAME),
        where("type", "==", selectedCategory),
        orderBy("name")
      );
    }

    const unsubscribe = onSnapshot(
      menuQuery,
      (snapshot) => {
        const menu = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenuData(menu);
        setLoading(false);
      },
      (error) => {
        console.error(
          `Error fetching menu from ${MENU_COLLECTION_NAME}:`,
          error.message
        );
        setLoading(false);
        showMessage("Gagal memuat menu. Silakan coba lagi nanti.", "error");
      }
    );

    return () => unsubscribe();
  }, [selectedCategory]); // selectedCategory sebagai dependency

  const categoryLabels = {
    "menu-nasi": "Menu Nasi",
    "lauk-utama": "Lauk Utama",
    "sayuran-sehat": "Sayuran Sehat",
    paket: "Paket Campuran Lengkap",
    "menu-spesial": "Menu Spesial & Hajatan",
    tambahan: "Minuman & Tambahan",
    "snack-box": "Snack Box Sehat",
    komponen: "Komponen Individual",
  };

  const categoryIcons = {
    "menu-nasi": ChefHat,
    "lauk-utama": Activity,
    "sayuran-sehat": Heart,
    paket: Layers,
    "menu-spesial": Star,
    tambahan: ShoppingBag,
    "snack-box": Package,
    komponen: Plus,
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const addToCart = (menu) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === menu.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...menu, quantity: 1 }];
      }
    });

    showMessage("Item berhasil ditambahkan ke keranjang!", "success");
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, newQuantity) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showMessage("Keranjang belanja kosong.", "error");
      return;
    }
    // Navigasi ke halaman checkout dengan item di keranjang
    navigate("/checkout", { state: { items: cartItems } });
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0), // Tambahkan default 0 untuk price dan quantity
    0
  );
  const cartCount = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  const filteredMenuData = menuData.filter(
    (menu) => menu.name?.toLowerCase().includes(searchTerm.toLowerCase()) // Pastikan menu.name ada
  );

  const getTypeIcon = (type) => {
    const IconComponent = categoryIcons[type] || Package;
    return IconComponent;
  };

  const getTypeColor = (type) => {
    const colors = {
      "menu-nasi": "from-amber-500 to-orange-600",
      "lauk-utama": "from-red-500 to-pink-600",
      "sayuran-sehat": "from-green-500 to-emerald-600",
      paket: "from-purple-500 to-violet-600",
      "menu-spesial": "from-yellow-500 to-amber-500",
      tambahan: "from-blue-500 to-cyan-600",
      "snack-box": "from-indigo-500 to-blue-600",
      komponen: "from-gray-500 to-gray-600",
    };
    return colors[type] || "from-gray-500 to-gray-600";
  };

  const getCurrentTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Pagi";
    if (hour < 15) return "Siang";
    if (hour < 18) return "Sore";
    return "Malam";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F27F34] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">
            Memuat menu lezat...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F27F34]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#B23501]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FFD580]/20 rounded-full blur-2xl"></div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl text-white font-semibold flex items-center space-x-3 transition-all duration-300 ${
            message.type === "success"
              ? "bg-gradient-to-r from-green-500 to-emerald-600"
              : "bg-gradient-to-r from-red-500 to-pink-600"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-white/80 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="relative z-10 p-6 md:p-8">
        {/* Enhanced Header - consistent with other pages */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Selamat {getCurrentTime()}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">
                <span className="bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
                  Lunch
                </span>{" "}
                Boost
              </h1>
              <p className="text-xl text-gray-600">
                Pilih menu sehat dan lezat yang sesuai dengan kebutuhan Anda
              </p>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-6 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-3"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              <ShoppingCart className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Keranjang ({cartCount})</span>
              {cartCount > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </div>
              )}
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 bg-white/70 backdrop-blur-xl border border-white/30 p-6 rounded-3xl shadow-xl">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari menu favorit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-500">Filter:</span>
            </div>
          </div>
        </header>

        {/* Category Filter */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory("semua")}
              className={`group relative overflow-hidden px-6 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 ${
                selectedCategory === "semua"
                  ? "bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white shadow-xl"
                  : "bg-white/70 backdrop-blur-xl border border-white/30 text-gray-700 hover:shadow-lg"
              }`}
            >
              <span className="relative z-10">Semua Kategori</span>
              {selectedCategory === "semua" && (
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              )}
            </button>

            {Object.entries(categoryLabels).map(([category, label]) => {
              const IconComponent = getTypeIcon(category);
              const isActive = selectedCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`group relative overflow-hidden px-4 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 flex items-center space-x-2 ${
                    isActive
                      ? `bg-gradient-to-r ${getTypeColor(
                          category
                        )} text-white shadow-xl`
                      : "bg-white/70 backdrop-blur-xl border border-white/30 text-gray-700 hover:shadow-lg"
                  }`}
                >
                  <IconComponent className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">{label}</span>
                  {isActive && (
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Menu Grid */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <ChefHat className="h-6 w-6 mr-3 text-[#B23501]" />
              {selectedCategory === "semua"
                ? "Semua Menu"
                : categoryLabels[selectedCategory]}
            </h2>
            <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">
              {filteredMenuData.length} menu tersedia
            </span>
          </div>

          {filteredMenuData.length === 0 ? (
            <div className="text-center py-16 bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Tidak Ada Menu Ditemukan
              </h3>
              <p className="text-gray-500">
                Coba ubah kata kunci pencarian atau pilih kategori lain
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMenuData.map((menu) => {
                const IconComponent = getTypeIcon(menu.type);

                return (
                  <div
                    key={menu.id}
                    className="group relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    {/* Image or Icon Header */}
                    <div className="relative h-48 overflow-hidden">
                      {menu.image_url ? (
                        <img
                          src={menu.image_url}
                          alt={menu.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            // Sembunyikan gambar yang error dan tampilkan fallback icon
                            e.target.style.display = "none";
                            e.target.parentNode.querySelector(
                              ".fallback-icon-container"
                            ).style.display = "flex";
                          }}
                        />
                      ) : null}
                      {/* Fallback Icon Container */}
                      <div
                        className={`fallback-icon-container w-full h-full bg-gradient-to-r ${getTypeColor(
                          menu.type
                        )} flex items-center justify-center ${
                          menu.image_url ? "hidden" : "flex" // Awalnya hidden jika ada image_url
                        }`}
                        style={{ display: menu.image_url ? "none" : "flex" }} // Pastikan initial display sesuai
                      >
                        <IconComponent className="h-16 w-16 text-white" />
                      </div>

                      {/* Overlay with category badge */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r ${getTypeColor(
                            menu.type
                          )}`}
                        >
                          {categoryLabels[menu.type] || menu.type}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#B23501] transition-colors duration-300">
                        {menu.name}
                      </h3>

                      {/* Description */}
                      {menu.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {menu.description}
                        </p>
                      )}

                      {/* Nutrition Info */}
                      <div className="flex items-center space-x-4 mb-4 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          <span>{menu.calories || 0} kcal</span>
                        </div>
                        {menu.protein && menu.protein > 0 && (
                          <div className="flex items-center space-x-1">
                            <Activity className="h-3 w-3 text-blue-500" />
                            <span>{menu.protein}g protein</span>
                          </div>
                        )}
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-[#B23501]">
                          Rp {menu.price?.toLocaleString("id-ID") || 0}
                        </span>

                        <button
                          onClick={() => addToCart(menu)}
                          className="group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-4 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                        >
                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                          <Plus className="h-4 w-4 relative z-10" />
                          <span className="relative z-10">Pesan</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Cart Modal */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-xl w-full max-w-3xl rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <ShoppingCart className="h-6 w-6 mr-3 text-[#B23501]" />
                  Keranjang Belanja
                </h2>
                <button
                  className="text-gray-500 hover:text-gray-800 transition-colors p-2"
                  onClick={() => setIsCartOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {cartItems.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      Keranjang Masih Kosong
                    </h3>
                    <p className="text-gray-500">
                      Yuk pilih menu lezat untuk melengkapi hari Anda
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-white/50 border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.image_url || "/api/placeholder/64/64"} // Placeholder jika tidak ada image_url
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/64x64?text=No+Image"; // URL placeholder yang berfungsi
                            }}
                          />
                          <div>
                            <h4 className="font-bold text-gray-800">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Rp {item.price?.toLocaleString("id-ID") || 0}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 bg-white/70 rounded-full p-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-3 py-1 font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="border-t border-gray-200 p-8 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-semibold text-gray-700">
                      Total Pesanan
                    </span>
                    <span className="text-3xl font-black text-[#B23501]">
                      Rp {cartTotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="group relative overflow-hidden w-full bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                    <ShoppingBag className="h-5 w-5 relative z-10" />
                    <span className="relative z-10">Checkout Sekarang</span>
                    <ArrowRight className="h-5 w-5 relative z-10" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tips Section */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-bold text-gray-800">Tips Sehat Revitameal</h3>
          </div>
          <ul className="text-gray-600 text-sm space-y-2">
            <li>
              • Pilih menu dengan gizi seimbang antara karbohidrat, protein, dan
              sayuran
            </li>
            <li>
              • Paket campuran memberikan variasi nutrisi yang lebih lengkap
            </li>
            <li>• Perhatikan kebutuhan kalori harian sesuai aktivitas Anda</li>
            <li>
              • Kombinasikan dengan olahraga teratur untuk hidup yang lebih
              sehat
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default LunchBoost;
