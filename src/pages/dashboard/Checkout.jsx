import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  X,
  ShoppingBag,
  Lock,
  MapPin,
  Phone,
  User,
  Mail,
  CreditCard,
  Truck,
  Clock,
  Flame,
  Activity,
  Shield,
  AlertCircle,
} from "lucide-react";

// --- Firebase Setup ---
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- Auth Hook ---
const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName || "Nama Customer",
          email: user.email || "customer@revitameal.com",
          phone: user.phoneNumber || "081234567890",
          address: "Jl. Pahlawan No. 123, Kel. Mugassari, Kota Semarang",
        });
      } else {
        setCurrentUser({
          uid: "anon-user-123",
          displayName: "Guest User",
          email: "guest@revitameal.com",
          phone: "081111111111",
          address: "Alamat Guest",
        });
      }
    });
    return unsubscribe;
  }, []);
  return { currentUser };
};

const calculateTotalNutrition = (
  menu,
  selectedVegetableId = null,
  ingredients = []
) => {
  let totalCalories = menu.calories || 0;
  let totalProtein = menu.protein || 0;
  let totalCarbs = menu.carbs || 0;
  let totalFats = menu.fats || 0;

  if (selectedVegetableId && menu.type === "paket-campuran") {
    const selectedVegetable = ingredients.find(
      (ing) => ing.id === selectedVegetableId
    );
    if (selectedVegetable) {
      totalCalories += selectedVegetable.calories || 0;
      totalProtein += selectedVegetable.protein || 0;
      totalCarbs += selectedVegetable.carbs || 0;
      totalFats += selectedVegetable.fats || 0;
    }
  }

  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFats: Math.round(totalFats * 10) / 10,
  };
};

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [cartItems, setCartItems] = useState(location.state?.items || []);
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    phoneNumber: "",
    shippingAddress: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [shippingCost] = useState(0);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        customerName: currentUser.displayName || "",
        customerEmail: currentUser.email || "",
        phoneNumber: currentUser.phone || "",
        shippingAddress: currentUser.address || "",
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate("/dashboard/lunch-boost");
    }
  }, [cartItems, navigate]);

  useEffect(() => {
    const ingredientsQuery = collection(db, "revitameal_ingredients");
    const unsubscribe = onSnapshot(ingredientsQuery, (snapshot) => {
      const ingredientsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIngredients(ingredientsData);
    });
    return () => unsubscribe();
  }, []);

  const getIngredientNameById = (id) => {
    const ingredient = ingredients.find((ing) => ing.id === id);
    return ingredient ? ingredient.name : "Pilihan";
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim())
      newErrors.customerName = "Nama wajib diisi";
    if (!formData.customerEmail.trim())
      newErrors.customerEmail = "Email wajib diisi";
    else if (!/\S+@\S+\.\S+/.test(formData.customerEmail))
      newErrors.customerEmail = "Format email tidak valid";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Nomor telepon wajib diisi";
    else if (!/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Format nomor telepon tidak valid";
    if (!formData.shippingAddress.trim())
      newErrors.shippingAddress = "Alamat pengiriman wajib diisi";
    else if (formData.shippingAddress.trim().length < 20)
      newErrors.shippingAddress = "Alamat terlalu singkat, minimal 20 karakter";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.basePrice || 0) * item.quantity,
    0
  );
  const total = subtotal + shippingCost;

  const sanitizeForDoku = (text) => {
    if (!text) return "";
    return text
      .toString()
      .replace(/[^a-zA-Z0-9.\-\/+,=_:'@ %]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 255);
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      setMessage({
        text: "Harap lengkapi semua field yang wajib diisi dengan benar.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    let orderRef;

    try {
      // 1️⃣ SIMPAN ORDER KE FIREBASE
      const orderDetails = {
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          selectedVegetable: item.selectedVegetable
            ? {
                id: item.selectedVegetable,
                name: getIngredientNameById(item.selectedVegetable),
              }
            : null,
          quantity: item.quantity,
          price: item.basePrice,
          subtotal: item.basePrice * item.quantity,
        })),
        pricing: { subtotal, shippingCost, total },
        status: "pending",
        paymentGateway: "doku",
        createdAt: serverTimestamp(),
        userId: currentUser?.uid || "anon",
        customerDetails: {
          name: formData.customerName.trim(),
          email: formData.customerEmail.trim(),
          phone: formData.phoneNumber.trim(),
          address: formData.shippingAddress.trim(),
          notes: formData.notes.trim(),
        },
      };

      orderRef = await addDoc(collection(db, "orders"), orderDetails);
      console.log("✅ Order created in Firebase:", orderRef.id);

      // ✅ GENERATE DOKU ORDER ID DULU
      const dokuOrderId = `RM-${Date.now()}-${orderRef.id.substring(0, 8)}`;

      // ✅ SIMPAN dokuOrderId KE FIREBASE SEBELUM PANGGIL API
      await updateDoc(doc(db, "orders", orderRef.id), {
        dokuOrderId: dokuOrderId,
        status: "pending_payment",
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Order updated with dokuOrderId:", dokuOrderId);

      // 2️⃣ PREPARE PAYLOAD UNTUK DOKU API
      const dokuPayload = {
        gross_amount: Math.round(total),
        // TIDAK PERLU order_id di payload, backend yang generate
        item_details: [
          ...cartItems.map((item) => {
            const itemName = item.selectedVegetable
              ? `${item.name} + ${getIngredientNameById(
                  item.selectedVegetable
                )}`
              : item.name;

            return {
              id: sanitizeForDoku(item.id),
              price: Math.round(item.basePrice),
              quantity: item.quantity,
              name: sanitizeForDoku(itemName),
              category: "food-and-beverage", // ✅ Valid DOKU category
              sku: sanitizeForDoku(item.id),
            };
          }),
          ...(shippingCost > 0
            ? [
                {
                  id: "SHIPPING",
                  price: Math.round(shippingCost),
                  quantity: 1,
                  name: "Biaya Pengiriman",
                  category: "logistics", // ✅ Valid DOKU category
                  sku: "SHIP-001",
                },
              ]
            : []),
        ],
        customer_details: {
          customer_id: currentUser?.uid || `GUEST-${Date.now()}`, // ✅ REQUIRED
          name: sanitizeForDoku(formData.customerName.trim()), // ✅ 'name' bukan 'first_name'
          email: formData.customerEmail.trim().toLowerCase(),
          phone: formData.phoneNumber.trim().replace(/\D/g, ""),
          address: sanitizeForDoku(formData.shippingAddress.trim()),
        },
      };

      console.log("📤 Sending payment request to DOKU:", dokuPayload);

      // 3️⃣ PANGGIL DOKU API
      const response = await fetch(
        "https://revitameal-api2.vercel.app/api/doku-create-payment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dokuPayload),
        }
      );

      const data = await response.json();
      console.log("📥 Response from DOKU API:", data);

      // 4️⃣ VALIDASI RESPONSE
      if (!response.ok || !data.success) {
        throw new Error(
          data.message || data.error || `API Error: ${response.status}`
        );
      }

      const { checkoutUrl, tokenId, expiredDate } = data;

      if (!checkoutUrl) {
        throw new Error("Tidak mendapat checkout URL dari DOKU");
      }

      // 5️⃣ UPDATE ORDER DI FIREBASE DENGAN DETAIL DARI DOKU
      await updateDoc(doc(db, "orders", orderRef.id), {
        dokuTokenId: tokenId,
        dokuExpiredDate: expiredDate,
        checkoutUrl: checkoutUrl,
        status: "awaiting_payment",
        updatedAt: serverTimestamp(),
      });

      console.log("✅ Order updated with DOKU details");

      // 6️⃣ REDIRECT KE DOKU CHECKOUT PAGE
      setMessage({
        text: "Mengalihkan ke halaman pembayaran DOKU...",
        type: "success",
      });

      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 1500);
    } catch (error) {
      console.error("❌ Payment error:", error);

      if (orderRef) {
        await updateDoc(doc(db, "orders", orderRef.id), {
          status: "failed",
          errorMessage: error.message,
          updatedAt: serverTimestamp(),
        });
      }

      setMessage({
        text: `Gagal memproses pembayaran: ${error.message}`,
        type: "error",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 relative overflow-hidden p-4 sm:p-6 md:p-8">
      {message && (
        <div
          className={`fixed top-4 sm:top-6 right-4 sm:right-6 z-50 p-3 sm:p-4 rounded-2xl shadow-xl text-white font-semibold flex items-center space-x-2 sm:space-x-3 transition-all duration-300 max-w-xs sm:max-w-sm ${
            message.type === "success"
              ? "bg-gradient-to-r from-green-500 to-emerald-600"
              : message.type === "error"
              ? "bg-gradient-to-r from-red-500 to-pink-600"
              : "bg-gradient-to-r from-blue-500 to-cyan-600"
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

      <div className="max-w-6xl mx-auto">
        <header className="flex items-center space-x-4 mb-6 sm:mb-8">
          <Link
            to="/dashboard/lunch-boost"
            className="text-gray-600 hover:text-gray-900 p-2 bg-white/50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800">
              <span className="bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
                Checkout
              </span>{" "}
              Pesanan
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Lengkapi detail untuk menyelesaikan pesanan
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="h-5 w-5 sm:h-6 sm:w-6 mr-3 text-[#B23501]" />
                Informasi Pelanggan
              </h2>

              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) =>
                          handleInputChange("customerName", e.target.value)
                        }
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 ${
                          errors.customerName
                            ? "border-red-300 bg-red-50"
                            : "bg-white/50 border-white/30"
                        }`}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    {errors.customerName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.customerName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) =>
                          handleInputChange("customerEmail", e.target.value)
                        }
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 ${
                          errors.customerEmail
                            ? "border-red-300 bg-red-50"
                            : "bg-white/50 border-white/30"
                        }`}
                        placeholder="email@example.com"
                      />
                    </div>
                    {errors.customerEmail && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.customerEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nomor Telepon (WhatsApp) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 ${
                        errors.phoneNumber
                          ? "border-red-300 bg-red-50"
                          : "bg-white/50 border-white/30"
                      }`}
                      placeholder="081234567890"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alamat Pengiriman Lengkap *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <textarea
                      value={formData.shippingAddress}
                      onChange={(e) =>
                        handleInputChange("shippingAddress", e.target.value)
                      }
                      rows="3"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 resize-none ${
                        errors.shippingAddress
                          ? "border-red-300 bg-red-50"
                          : "bg-white/50 border-white/30"
                      }`}
                      placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos"
                    />
                  </div>
                  {errors.shippingAddress && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.shippingAddress}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Catatan Tambahan (Opsional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows="2"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 resize-none"
                    placeholder="Instruksi khusus untuk pengiriman atau lainnya..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 mr-3 text-[#B23501]" />
                Ringkasan Pesanan
              </h2>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div
                    key={item.cartId}
                    className="flex items-center justify-between border-b border-gray-200/50 pb-4"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                      <img
                        src={
                          item.image_url ||
                          "https://placehold.co/64/orange/white?text=Menu"
                        }
                        alt={item.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm sm:text-lg text-gray-800 truncate">
                          {item.name}
                        </p>
                        {item.selectedVegetable && (
                          <p className="text-xs sm:text-sm text-green-600 font-medium">
                            + Sayur:{" "}
                            {getIngredientNameById(item.selectedVegetable)}
                          </p>
                        )}
                        {item.selectedVegetable && (
                          <div className="text-xs text-gray-600 mt-1">
                            {(() => {
                              const nutrition = calculateTotalNutrition(
                                item,
                                item.selectedVegetable,
                                ingredients
                              );
                              return (
                                <div className="flex items-center space-x-3">
                                  <span className="flex items-center space-x-1">
                                    <Flame className="h-3 w-3 text-orange-500" />
                                    <span>{nutrition.totalCalories} kcal</span>
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
                        <p className="text-xs sm:text-sm text-gray-500">
                          {item.quantity} × Rp
                          {item.basePrice.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm sm:text-lg text-gray-800">
                        Rp
                        {(item.quantity * item.basePrice).toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-6 sm:p-8 sticky top-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 mr-3 text-[#B23501]" />
                Detail Pembayaran
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-gray-600">
                  <span>
                    Subtotal (
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    item)
                  </span>
                  <span>Rp{subtotal.toLocaleString("id-ID")}</span>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4" />
                    <span>Biaya Pengiriman</span>
                  </div>
                  <span>Rp{shippingCost.toLocaleString("id-ID")}</span>
                </div>

                <div className="border-t border-dashed pt-4">
                  <div className="flex justify-between items-center text-xl sm:text-2xl font-bold text-gray-800">
                    <span>Total Pembayaran</span>
                    <span className="text-[#B23501]">
                      Rp{total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2 text-blue-700 mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-semibold text-sm">
                    Pembayaran Aman via DOKU
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-blue-600 text-xs">
                    <CheckCircle className="h-3 w-3" />
                    <span>QRIS, VA, E-Wallet, Credit Card</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-600 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>Link pembayaran expire dalam 60 menit</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isLoading || cartItems.length === 0}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <Lock className="h-5 w-5 relative z-10" />
                <span className="relative z-10">
                  {isLoading ? "Memproses..." : "Bayar dengan DOKU"}
                </span>
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
