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
  Search,
  Layers,
  ChefHat,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  Filter,
  Tag,
  Star,
  Clock,
  Flame,
  Activity,
  Package,
  Heart,
  Settings,
} from "lucide-react";
// Mock Firebase setup
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser({ uid: "x1QFpZjvvBfGLNugPfaXI3eF0zf1" });
    });
    return unsubscribe;
  }, []);
  return { currentUser };
};
// --- End Mock Setup ---

// Enhanced Vegetable Selection Modal Component
function VegetableSelectionModal({
  isOpen,
  onClose,
  menu,
  ingredients,
  onAddToCart,
  onCheckoutNow,
  calculateTotalNutrition,
}) {
  const [selectedVegetable, setSelectedVegetable] = useState(null);

  useEffect(() => {
    // Reset selection when modal opens for a new item
    setSelectedVegetable(null);
  }, [isOpen]);

  if (!isOpen || !menu) return null;

  const vegetableOptions = menu.components?.sayuran?.options || [];
  const availableVegetables = ingredients.filter((ing) =>
    vegetableOptions.includes(ing.id)
  );

  const selectedVegDetails = availableVegetables.find(
    (v) => v.id === selectedVegetable
  );

  const handleAddToCart = () => {
    if (selectedVegetable) {
      onAddToCart(menu, selectedVegetable);
      onClose();
    }
  };

  const handleCheckout = () => {
    if (selectedVegetable) {
      onCheckoutNow(menu, selectedVegetable);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-[#B23501]" />
              <span className="hidden sm:inline">Pilih Sayuran</span>
              <span className="sm:hidden">Pilih Sayur</span>
            </h2>
            <p className="text-gray-600 text-sm">
              Kustomisasi paket sesuai selera Anda
            </p>
          </div>
          <button
            className="text-gray-500 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Menu Info */}
          <div className="bg-gradient-to-r from-[#F27F34]/10 to-[#B23501]/10 p-4 sm:p-6 rounded-2xl mb-6">
            <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-2">
              {menu.name}
            </h3>
            <p className="text-gray-600 mb-3 text-sm sm:text-base">
              {menu.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-[#B23501]">
                Rp {menu.basePrice?.toLocaleString("id-ID")}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 bg-white/70 px-2 sm:px-3 py-1 rounded-full">
                Paket Campuran
              </span>
            </div>
          </div>

          {/* Vegetable Selection */}
          <div className="mb-6">
            <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-500" />
              Pilih Sayuran ({availableVegetables.length} pilihan)
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 max-h-60 sm:max-h-80 overflow-y-auto pr-2">
              {availableVegetables.map((veg) => (
                <label
                  key={veg.id}
                  className={`group cursor-pointer block p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    selectedVegetable === veg.id
                      ? "border-[#F27F34] bg-gradient-to-br from-[#F27F34]/10 to-[#B23501]/10 shadow-lg"
                      : "border-gray-200 bg-white/50 hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <input
                    type="radio"
                    name="vegetable"
                    className="hidden"
                    onChange={() => setSelectedVegetable(veg.id)}
                  />

                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-gray-800 text-sm sm:text-base">
                          {veg.name}
                        </p>
                        {selectedVegetable === veg.id && (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#F27F34]" />
                        )}
                      </div>

                      {veg.description && (
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          {veg.description}
                        </p>
                      )}

                      {/* Nutrition Info */}
                      <div className="flex items-center space-x-2 sm:space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          <span>{veg.calories || 0} kcal</span>
                        </div>
                        {veg.protein > 0 && (
                          <div className="flex items-center space-x-1">
                            <Activity className="h-3 w-3 text-blue-500" />
                            <span>{veg.protein}g protein</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Selected Vegetable Details */}
          {selectedVegDetails && (
            <div className="bg-green-50 border border-green-200 p-3 sm:p-4 rounded-2xl mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span className="font-bold text-green-800 text-sm sm:text-base">
                  Pilihan Anda:
                </span>
              </div>
              <p className="text-green-700 font-medium text-sm sm:text-base">
                {selectedVegDetails.name}
              </p>
              {(() => {
                const totalNutrition = calculateTotalNutrition(
                  menu,
                  selectedVegetable
                );
                return (
                  <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-green-600 mt-1">
                    <span>Total: {totalNutrition.totalCalories} kalori</span>
                    <span>•</span>
                    <span>
                      {totalNutrition.totalProtein.toFixed(1)}g protein
                    </span>
                    <span>•</span>
                    <span>Kaya nutrisi dan serat</span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-4 sm:p-8 bg-gradient-to-r from-gray-50/50 to-white rounded-b-3xl">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVegetable}
              className="flex-1 group relative overflow-hidden bg-white border-2 border-[#F27F34] text-[#B23501] px-4 sm:px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Masukkan ke Keranjang</span>
              <span className="sm:hidden">+ Keranjang</span>
            </button>

            <button
              onClick={handleCheckout}
              disabled={!selectedVegetable}
              className="flex-1 group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-4 sm:px-6 py-3 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              <span className="relative z-10">Checkout Langsung</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LunchBoost() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [menuData, setMenuData] = useState([]);
  const [ingredientsData, setIngredientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isVegModalOpen, setIsVegModalOpen] = useState(false);
  const [selectedMenuForModal, setSelectedMenuForModal] = useState(null);

  // Helper function to get ingredient by ID
  const getIngredientById = (ingredientId) => {
    return ingredientsData.find((ingredient) => ingredient.id === ingredientId);
  };

  // Tambahkan setelah fungsi getIngredientsByIds
  const getIngredientsByIds = (ingredientIds) => {
    if (!ingredientIds || !Array.isArray(ingredientIds)) return [];
    return ingredientIds.map((id) => getIngredientById(id)).filter(Boolean);
  };

  // TAMBAH FUNGSI BARU INI:
  const calculateTotalNutrition = (menu, selectedVegetableId = null) => {
    let totalCalories = menu.calories || 0;
    let totalProtein = menu.protein || 0;
    let totalCarbs = menu.carbs || 0;
    let totalFats = menu.fats || 0;

    // Jika ada sayuran yang dipilih, tambahkan nutrisi sayuran
    if (selectedVegetableId && menu.type === "paket-campuran") {
      const selectedVegetable = getIngredientById(selectedVegetableId);
      if (selectedVegetable) {
        totalCalories += selectedVegetable.calories || 0;
        totalProtein += selectedVegetable.protein || 0;
        totalCarbs += selectedVegetable.carbs || 0;
        totalFats += selectedVegetable.fats || 0;
      }
    }

    return {
      totalCalories: Math.round(totalCalories),
      totalProtein: parseFloat(totalProtein.toFixed(1)),
      totalCarbs: parseFloat(totalCarbs.toFixed(1)),
      totalFats: parseFloat(totalFats.toFixed(1)),
    };
  };

  // Load both menu data and ingredients
  useEffect(() => {
    setLoading(true);

    const menuQuery = query(
      collection(db, "revitameal_menu_templates"),
      orderBy("name")
    );
    const ingredientsQuery = query(collection(db, "revitameal_ingredients"));

    const unsubscribeMenu = onSnapshot(
      menuQuery,
      (snapshot) => {
        const menu = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenuData(menu);
        if (loading) setLoading(false);
      },
      (error) => {
        console.error("Error fetching menu:", error);
        setLoading(false);
        showMessage("Gagal memuat menu.", "error");
      }
    );

    const unsubscribeIngredients = onSnapshot(ingredientsQuery, (snapshot) => {
      const ingredients = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIngredientsData(ingredients);
    });

    return () => {
      unsubscribeMenu();
      unsubscribeIngredients();
    };
  }, []);

  const categoryLabels = {
    "paket-campuran": "Paket Campuran Lengkap",
    "snack-box": "Minuman & Tambahan Snack",
  };

  const categoryIcons = {
    "paket-campuran": Layers,
    "snack-box": ShoppingBag,
  };

  const getTypeColor = (type) => {
    const colors = {
      "paket-campuran": "from-purple-500 to-violet-600",
      "snack-box": "from-indigo-500 to-blue-600",
    };
    return colors[type] || "from-gray-500 to-gray-600";
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleOrderClick = (menu) => {
    if (menu.type === "paket-campuran") {
      setSelectedMenuForModal(menu);
      setIsVegModalOpen(true);
    } else {
      addToCart(menu);
    }
  };

  const addToCart = (menu, selectedComponentId = null) => {
    const cartItemId = selectedComponentId
      ? `${menu.id}-${selectedComponentId}`
      : menu.id;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.cartId === cartItemId);

      if (existingItem) {
        return prevItems.map((item) =>
          item.cartId === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            ...menu,
            quantity: 1,
            cartId: cartItemId,
            selectedVegetable: selectedComponentId,
          },
        ];
      }
    });

    showMessage("Item berhasil ditambahkan ke keranjang!", "success");
  };

  const handleCheckoutNow = (menu, selectedComponentId) => {
    const itemToCheckout = {
      ...menu,
      quantity: 1,
      cartId: `${menu.id}-${selectedComponentId}`,
      selectedVegetable: selectedComponentId,
    };
    navigate("/dashboard/checkout", { state: { items: [itemToCheckout] } });
  };

  const removeFromCart = (cartId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.cartId !== cartId)
    );
  };

  const updateQuantity = (cartId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: Math.max(0, newQuantity) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleCheckoutFromCart = () => {
    if (cartItems.length === 0) {
      showMessage("Keranjang belanja kosong.", "error");
      return;
    }
    navigate("/dashboard/checkout", { state: { items: cartItems } });
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.basePrice || 0) * item.quantity,
    0
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const filteredMenuData = menuData.filter(
    (menu) =>
      (selectedCategory === "semua" || menu.type === selectedCategory) &&
      menu.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIngredientNameById = (id) => {
    const ingredient = ingredientsData.find((ing) => ing.id === id);
    return ingredient ? ingredient.name : "Tidak diketahui";
  };

  // Enhanced function to render menu components
  // Enhanced function to render menu components - FIXED VERSION
  const renderMenuComponents = (menu) => {
    // Cek apakah ada ingredients data
    if (!ingredientsData.length && loading) {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
          <span className="text-xs text-gray-600">Memuat komponen...</span>
        </div>
      );
    }

    // PERBAIKAN: Jika ada components, render langsung tanpa fallback
    if (menu.components && Object.keys(menu.components).length > 0) {
      const componentCategories = [
        {
          key: "nasi",
          label: "Nasi",
          color: "bg-yellow-400",
          fallback: "Nasi Putih",
        },
        {
          key: "protein-hewani",
          label: "Protein",
          color: "bg-red-400",
          fallback: "Protein Hewani",
        },
        {
          key: "protein-nabati",
          label: "Protein Nabati",
          color: "bg-orange-400",
          fallback: "Protein Nabati",
        },
        {
          key: "sayuran",
          label: "Sayuran",
          color: "bg-green-400",
          fallback: "Sayuran Segar",
        },
        {
          key: "buah",
          label: "Buah",
          color: "bg-pink-400",
          fallback: "Buah Segar",
        },
        {
          key: "minuman",
          label: "Minuman",
          color: "bg-cyan-400",
          fallback: "Minuman Segar",
        },
        {
          key: "snack",
          label: "Snack",
          color: "bg-purple-400",
          fallback: "Snack Sehat",
        },
      ];

      return (
        <div className="space-y-2">
          {componentCategories.map(({ key, label, color, fallback }) => {
            const component = menu.components[key];
            if (
              !component ||
              !component.options ||
              component.options.length === 0
            ) {
              return null;
            }

            const ingredients = getIngredientsByIds(component.options);
            const displayText =
              ingredients.length > 0
                ? ingredients
                    .map((ing) => ing.name)
                    .slice(0, 2)
                    .join(", ")
                : fallback;

            const hasMore = component.options.length > 2;

            return (
              <div key={key} className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 ${color} rounded-full flex-shrink-0`}
                ></div>
                <span className="text-xs text-gray-600">
                  <span className="font-medium">{label}:</span> {displayText}
                  {hasMore && ` +${component.options.length - 2} lainnya`}
                  {key === "sayuran" && menu.type === "paket-campuran" && (
                    <span className="text-[#F27F34] font-medium">
                      {" "}
                      (dapat dipilih)
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    // FALLBACK: Hanya jika benar-benar tidak ada components
    if (menu.type === "snack-box") {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
            <span className="text-xs text-gray-600">
              <span className="font-medium">Snack:</span> Belum dikonfigurasi
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></div>
            <span className="text-xs text-gray-600">
              <span className="font-medium">Minuman:</span> Belum dikonfigurasi
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
        <span className="text-xs text-gray-600">
          Menu lengkap dengan komposisi seimbang
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex justify-center items-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#F27F34] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg sm:text-xl text-gray-600 font-medium">
            Memuat menu lezat...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <VegetableSelectionModal
        isOpen={isVegModalOpen}
        onClose={() => setIsVegModalOpen(false)}
        menu={selectedMenuForModal}
        ingredients={ingredientsData}
        onAddToCart={addToCart}
        onCheckoutNow={handleCheckoutNow}
        calculateTotalNutrition={calculateTotalNutrition}
      />

      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 relative overflow-hidden">
        {/* Success/Error Message */}
        {message && (
          <div
            className={`fixed top-4 sm:top-6 right-4 sm:right-6 z-[60] p-3 sm:p-4 rounded-2xl shadow-xl text-white font-semibold flex items-center space-x-2 sm:space-x-3 transition-all duration-300 max-w-xs sm:max-w-sm ${
              message.type === "success"
                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                : "bg-gradient-to-r from-red-500 to-pink-600"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span className="text-sm sm:text-base">{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-white/80 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <header className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Revitameal Menu
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-800 mb-2">
                  <span className="bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
                    Lunch
                  </span>{" "}
                  Boost
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
                  Pilih menu sehat dan lezat yang sesuai dengan kebutuhan Anda
                </p>
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 sm:space-x-3 min-w-[120px] sm:min-w-[140px]"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                <span className="relative z-10 text-sm sm:text-base">
                  Keranjang
                </span>
                {cartCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </div>
                )}
              </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 sm:p-6 rounded-3xl shadow-xl">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari menu favorit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                />
              </div>
            </div>
          </header>

          {/* Category Filter */}
          <section className="mb-6 sm:mb-8">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedCategory("semua")}
                className={`group relative overflow-hidden px-3 sm:px-6 py-2 sm:py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 text-sm sm:text-base ${
                  selectedCategory === "semua"
                    ? "bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white shadow-xl"
                    : "bg-white/70 backdrop-blur-xl border border-white/30 text-gray-700 hover:shadow-lg"
                }`}
              >
                <span className="relative z-10">Semua Kategori</span>
              </button>

              {Object.entries(categoryLabels).map(([category, label]) => {
                const IconComponent = categoryIcons[category];
                const isActive = selectedCategory === category;

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`group relative overflow-hidden px-3 sm:px-4 py-2 sm:py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-base ${
                      isActive
                        ? `bg-gradient-to-r ${getTypeColor(
                            category
                          )} text-white shadow-xl`
                        : "bg-white/70 backdrop-blur-xl border border-white/30 text-gray-700 hover:shadow-lg"
                    }`}
                  >
                    <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 relative z-10" />
                    <span className="relative z-10 hidden sm:inline">
                      {label}
                    </span>
                    <span className="relative z-10 sm:hidden">
                      {category === "paket-campuran" ? "Paket" : "Snack"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Menu Grid */}
          <section className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredMenuData.map((menu) => (
                <div
                  key={menu.id}
                  className="group relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden rounded-t-3xl">
                    <img
                      src={
                        menu.image_url ||
                        "https://placehold.co/600x400/orange/white?text=Revitameal"
                      }
                      alt={menu.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <span
                        className={`px-2 sm:px-3 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r ${getTypeColor(
                          menu.type
                        )}`}
                      >
                        <span className="hidden sm:inline">
                          {categoryLabels[menu.type]}
                        </span>
                        <span className="sm:hidden">
                          {menu.type === "paket-campuran" ? "Paket" : "Snack"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 flex flex-col flex-grow">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 group-hover:text-[#B23501] transition-colors duration-300 line-clamp-2">
                      {menu.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {menu.description}
                    </p>

                    {/* Menu Components/Ingredients */}
                    <div className="mb-4 flex-grow">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        Komposisi Menu:
                      </h4>
                      {renderMenuComponents(menu)}
                    </div>

                    {/* Nutrition Info */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-4 text-xs text-gray-500 bg-gray-50/50 px-3 py-2 rounded-xl">
                        <div className="flex items-center space-x-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          <span>
                            {menu.calories
                              ? parseFloat(menu.calories).toFixed(1)
                              : "0"}{" "}
                            kcal
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3 text-blue-500" />
                          <span>
                            {menu.protein
                              ? parseFloat(menu.protein).toFixed(1)
                              : "0"}
                            g Protein
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-3 w-3 text-green-500" />
                          <span>
                            {menu.fats
                              ? parseFloat(menu.fats).toFixed(1)
                              : "0"}
                            g Lemak
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg sm:text-xl text-[#B23501]">
                          Rp {menu.basePrice?.toLocaleString("id-ID")}
                        </span>
                        <span className="text-xs text-gray-500">per porsi</span>
                      </div>
                      <button
                        onClick={() => handleOrderClick(menu)}
                        className="bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-3 sm:px-4 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base flex items-center space-x-1"
                      >
                        <span>Pesan</span>
                        {menu.type === "paket-campuran" && (
                          <Settings className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredMenuData.length === 0 && (
              <div className="text-center py-12 sm:py-16">
                <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">
                  Menu tidak ditemukan.
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  Coba ubah kata kunci atau kategori pencarian
                </p>
              </div>
            )}
          </section>

          {/* Cart Modal */}
          {isCartOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white/90 backdrop-blur-xl w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col">
                <div className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                    <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-[#B23501]" />
                    <span className="hidden sm:inline">Keranjang Belanja</span>
                    <span className="sm:hidden">Keranjang</span>
                  </h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 sm:py-10">
                      <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm sm:text-base">
                        Keranjang Anda masih kosong.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {cartItems.map((item) => (
                        <div
                          key={item.cartId}
                          className="flex items-center justify-between bg-white/50 p-3 sm:p-4 rounded-2xl gap-3"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <img
                              src={
                                item.image_url ||
                                "https://placehold.co/64/orange/white?text=Menu"
                              }
                              alt={item.name}
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-800 text-sm sm:text-base truncate">
                                {item.name}
                              </h4>
                              {item.selectedVegetable && (
                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                  + Sayur:{" "}
                                  {getIngredientNameById(
                                    item.selectedVegetable
                                  )}
                                </p>
                              )}

                              {/* Show nutrition info for items with selected vegetable */}
                              {item.selectedVegetable && (
                                <div className="text-xs text-gray-600 mt-1">
                                  {(() => {
                                    const nutrition = calculateTotalNutrition(
                                      item,
                                      item.selectedVegetable
                                    );
                                    return (
                                      <div className="flex items-center space-x-3">
                                        <span className="flex items-center space-x-1">
                                          <Flame className="h-3 w-3 text-orange-500" />
                                          <span>
                                            {nutrition.totalCalories} kcal
                                          </span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                          <Activity className="h-3 w-3 text-blue-500" />
                                          <span>
                                            {nutrition.totalProtein.toFixed(1)}g
                                            protein
                                          </span>
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}

                              {/* Show item components in cart */}
                              {item.components && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {Object.entries(item.components).map(
                                    ([category, config]) => {
                                      if (
                                        !config.options ||
                                        config.options.length === 0
                                      )
                                        return null;

                                      const ingredients = getIngredientsByIds(
                                        config.options
                                      );
                                      if (ingredients.length === 0) return null;

                                      const categoryColors = {
                                        nasi: "bg-yellow-400",
                                        "protein-hewani": "bg-red-400",
                                        "protein-nabati": "bg-orange-400",
                                        sayuran: "bg-green-400",
                                        buah: "bg-pink-400",
                                        minuman: "bg-cyan-400",
                                        snack: "bg-purple-400",
                                      };

                                      const color =
                                        categoryColors[category] ||
                                        "bg-gray-400";

                                      return (
                                        <span
                                          key={category}
                                          className="inline-flex items-center space-x-1 mr-2"
                                        >
                                          <div
                                            className={`w-1.5 h-1.5 ${color} rounded-full`}
                                          ></div>
                                          <span>
                                            {ingredients
                                              .slice(0, 1)
                                              .map((ing) => ing.name)
                                              .join(", ")}
                                            {ingredients.length > 1 &&
                                              ` +${ingredients.length - 1}`}
                                          </span>
                                        </span>
                                      );
                                    }
                                  )}
                                </div>
                              )}

                              <p className="text-sm sm:text-base text-gray-600 font-semibold">
                                Rp {item.basePrice?.toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                            <div className="flex items-center space-x-1 sm:space-x-2 bg-white/70 rounded-full p-1">
                              <button
                                onClick={() =>
                                  updateQuantity(item.cartId, item.quantity - 1)
                                }
                                className="p-1 sm:p-2 hover:bg-gray-100 rounded-full"
                              >
                                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                              <span className="px-2 sm:px-3 font-medium text-sm sm:text-base min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.cartId, item.quantity + 1)
                                }
                                className="p-1 sm:p-2 hover:bg-gray-100 rounded-full"
                              >
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.cartId)}
                              className="p-1 sm:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {cartItems.length > 0 && (
                  <div className="border-t border-gray-200 p-4 sm:p-8 bg-gray-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                      <div>
                        <span className="text-sm sm:text-lg font-semibold text-gray-700 block">
                          Total Pesanan
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-[#B23501]">
                          Rp {cartTotal.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">
                          {cartItems.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}{" "}
                          item
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleCheckoutFromCart}
                      className="w-full group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                      <span className="relative z-10">Checkout</span>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default LunchBoost;
