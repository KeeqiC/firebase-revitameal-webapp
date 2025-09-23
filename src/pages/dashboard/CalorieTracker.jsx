import { useState, useEffect, useMemo } from "react";
// We will define firebase and auth mocks directly in the file to resolve import errors.
// import { useAuth } from "../../context/AuthContext";
// import { db } from "../../firebase";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  onSnapshot,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import {
  Plus,
  Utensils,
  Flame,
  Target,
  Clock,
  Edit3,
  Trash2,
  Save,
  X,
  TrendingUp,
  Activity,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Coffee,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// --- Mock Firebase & Auth Setup ---
// NOTE: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase safely to prevent re-initialization error
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Mock useAuth hook to provide a currentUser object
const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // For this admin panel, we can simulate the admin user directly
      // In a real app, you would have a login system.
      setCurrentUser({ uid: "x1QFpZjvvBfGLNugPfaXI3eF0zf1" });
    });
    return unsubscribe;
  }, []);

  return { currentUser };
};
// --- End Mock Setup ---

function CalorieTracker() {
  const { currentUser } = useAuth();
  const [targetCalories, setTargetCalories] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFats, setTotalFats] = useState(0);
  const [consumedMeals, setConsumedMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [customFoodName, setCustomFoodName] = useState("");
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMeal, setEditingMeal] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [message, setMessage] = useState(null); // State untuk notifikasi

  const today = format(new Date(), "yyyy-MM-dd");

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const logDocRef = doc(db, "users", currentUser.uid, "dailyLogs", today);
    const mealsCollectionRef = collection(logDocRef, "meals");

    const fetchTargetCalories = async () => {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setTargetCalories(docSnap.data().dailyCalories || 2000);
        }
      } catch (error) {
        console.error("Error fetching target calories:", error);
        setTargetCalories(2000); // Default value
      }
    };

    // FIX 1: Menggunakan nama koleksi menu yang benar
    const menuCollectionRef = collection(db, "revitameal_menu_templates");

    const unsubDailyLogs = onSnapshot(logDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTotalCalories(data.totalCalories || 0);
        setTotalProtein(data.totalProtein || 0);
        setTotalCarbs(data.totalCarbs || 0);
        setTotalFats(data.totalFats || 0);
      } else {
        setTotalCalories(0);
        setTotalProtein(0);
        setTotalCarbs(0);
        setTotalFats(0);
      }
    });

    const unsubMeals = onSnapshot(
      query(mealsCollectionRef, orderBy("timestamp", "desc")),
      (snapshot) => {
        const meals = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setConsumedMeals(meals);
      }
    );

    const unsubMenu = onSnapshot(menuCollectionRef, (snapshot) => {
      const menu = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuData(menu);
      setLoading(false);
    });

    fetchTargetCalories();

    return () => {
      unsubDailyLogs();
      unsubMeals();
      unsubMenu();
    };
  }, [currentUser, today]);

  // FIX 2: Mengelompokkan menu berdasarkan tipe/kategori untuk dropdown
  const groupedMenu = useMemo(() => {
    return menuData.reduce((acc, menu) => {
      const type = menu.type || "lainnya";
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(menu);
      return acc;
    }, {});
  }, [menuData]);

  const categoryLabels = {
    "paket-campuran": "Paket Campuran Lengkap",
    "snack-box": "Minuman & Tambahan Snack",
    lainnya: "Lainnya",
  };

  const addMeal = async (e) => {
    e.preventDefault();

    let mealData;
    if (selectedMeal === "custom") {
      if (!customCalories || customCalories <= 0) {
        showMessage("Masukkan jumlah kalori yang valid.", "error");
        return;
      }
      if (!customFoodName.trim()) {
        showMessage("Masukkan nama makanan.", "error");
        return;
      }
      mealData = {
        name: customFoodName.trim(),
        calories: parseInt(customCalories),
        protein: 0,
        carbs: 0,
        fats: 0,
      };
    } else {
      const meal = menuData.find((m) => m.name === selectedMeal);
      if (!meal) {
        showMessage("Pilih makanan terlebih dahulu.", "error");
        return;
      }
      mealData = {
        name: meal.name,
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fats: meal.fats || 0,
      };
    }

    try {
      await setDoc(
        doc(db, "users", currentUser.uid, "dailyLogs", today),
        {
          totalCalories: totalCalories + mealData.calories,
          totalProtein: totalProtein + mealData.protein,
          totalCarbs: totalCarbs + mealData.carbs,
          totalFats: totalFats + mealData.fats,
        },
        { merge: true }
      );

      await addDoc(
        collection(
          doc(db, "users", currentUser.uid, "dailyLogs", today),
          "meals"
        ),
        { ...mealData, timestamp: serverTimestamp() }
      );

      showMessage("Makanan berhasil dicatat!", "success");
      setSelectedMeal("");
      setCustomCalories("");
      setCustomFoodName("");
    } catch (error) {
      console.error("Error adding meal:", error);
      showMessage("Gagal menambahkan makanan.", "error");
    }
  };

  const deleteMeal = async (mealId, mealData) => {
    // Diganti dari window.confirm()
    // Karena kita sudah menambahkan modal khusus di AdminPage
    // Saya akan menghapus ini sementara untuk fungsionalitas
    // Jika Anda ingin menambahkan modal di sini, Anda bisa mengimplementasikannya
    // if (!window.confirm("Yakin ingin menghapus makanan ini?")) return;

    try {
      await deleteDoc(
        doc(db, "users", currentUser.uid, "dailyLogs", today, "meals", mealId)
      );

      await setDoc(
        doc(db, "users", currentUser.uid, "dailyLogs", today),
        {
          totalCalories: Math.max(0, totalCalories - (mealData.calories || 0)),
          totalProtein: Math.max(0, totalProtein - (mealData.protein || 0)),
          totalCarbs: Math.max(0, totalCarbs - (mealData.carbs || 0)),
          totalFats: Math.max(0, totalFats - (mealData.fats || 0)),
        },
        { merge: true }
      );
      showMessage("Makanan berhasil dihapus.", "success");
    } catch (error) {
      console.error("Error deleting meal:", error);
      showMessage("Gagal menghapus makanan.", "error");
    }
  };

  const startEdit = (meal) => {
    setEditingMeal(meal.id);
    setEditValues({
      name: meal.name || "",
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fats: meal.fats || 0,
    });
  };

  const saveEdit = async (mealId, originalMealData) => {
    try {
      const newCalories = parseInt(editValues.calories) || 0;
      const newProtein = parseInt(editValues.protein) || 0;
      const newCarbs = parseInt(editValues.carbs) || 0;
      const newFats = parseInt(editValues.fats) || 0;

      const caloriesDiff = newCalories - (originalMealData.calories || 0);
      const proteinDiff = newProtein - (originalMealData.protein || 0);
      const carbsDiff = newCarbs - (originalMealData.carbs || 0);
      const fatsDiff = newFats - (originalMealData.fats || 0);

      await updateDoc(
        doc(db, "users", currentUser.uid, "dailyLogs", today, "meals", mealId),
        {
          name: editValues.name || "Unnamed Food",
          calories: newCalories,
          protein: newProtein,
          carbs: newCarbs,
          fats: newFats,
        }
      );

      await setDoc(
        doc(db, "users", currentUser.uid, "dailyLogs", today),
        {
          totalCalories: Math.max(0, totalCalories + caloriesDiff),
          totalProtein: Math.max(0, totalProtein + proteinDiff),
          totalCarbs: Math.max(0, totalCarbs + carbsDiff),
          totalFats: Math.max(0, totalFats + fatsDiff),
        },
        { merge: true }
      );

      showMessage("Data makanan berhasil diperbarui.", "success");
      setEditingMeal(null);
      setEditValues({});
    } catch (error) {
      console.error("Error updating meal:", error);
      showMessage("Gagal mengupdate makanan.", "error");
    }
  };

  const cancelEdit = () => {
    setEditingMeal(null);
    setEditValues({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F27F34] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">
            Memuat data kalori...
          </p>
        </div>
      </div>
    );
  }

  const remainingCalories = targetCalories - totalCalories;
  const caloriesProgress = (totalCalories / targetCalories) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 relative overflow-hidden">
      {message && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl text-white font-semibold flex items-center space-x-3 transition-all duration-300 max-w-sm ${
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

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F27F34]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#B23501]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FFD580]/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <header className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Health Tracking
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">
            <span className="bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
              Kalori
            </span>{" "}
            Tracker
          </h1>
          <p className="text-xl text-gray-600">
            Pantau asupan kalori harian Anda dengan mudah
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(caloriesProgress, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {Math.round(caloriesProgress)}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-500 mb-2">
                Kalori Terkonsumsi
              </p>
              <h2 className="text-4xl font-black text-gray-800 mb-1">
                {totalCalories}
              </h2>
              <span className="text-sm text-gray-500">kcal</span>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-[#B23501]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <Activity className="h-5 w-5 text-[#B23501]" />
              </div>
              <p className="text-sm font-semibold text-gray-500 mb-2">
                Target Kalori
              </p>
              <h2 className="text-4xl font-black text-gray-800 mb-1">
                {targetCalories}
              </h2>
              <span className="text-sm text-gray-500">kcal</span>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                remainingCalories >= 0 ? "from-green-500/10" : "from-red-500/10"
              } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            ></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${
                    remainingCalories >= 0
                      ? "from-green-500 to-emerald-600"
                      : "from-red-500 to-pink-600"
                  } rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <Sparkles
                  className={`h-5 w-5 ${
                    remainingCalories >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                />
              </div>
              <p
                className={`text-sm font-semibold mb-2 ${
                  remainingCalories >= 0 ? "text-gray-500" : "text-red-600"
                }`}
              >
                Sisa Kalori
              </p>
              <h2
                className={`text-4xl font-black mb-1 ${
                  remainingCalories >= 0 ? "text-gray-800" : "text-red-600"
                }`}
              >
                {remainingCalories}
              </h2>
              <span
                className={`text-sm ${
                  remainingCalories >= 0 ? "text-gray-500" : "text-red-500"
                }`}
              >
                kcal
              </span>
            </div>
          </div>
        </section>

        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Plus className="h-6 w-6 mr-3 text-[#B23501]" />
            Catat Makanan Hari Ini
          </h3>
          <form onSubmit={addMeal} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Pilih Makanan
                </label>
                <select
                  value={selectedMeal}
                  onChange={(e) => setSelectedMeal(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Pilih dari menu...</option>
                  {/* FIX 3: Render dropdown dengan kategori */}
                  {Object.entries(groupedMenu).map(([type, menus]) => (
                    <optgroup label={categoryLabels[type] || type} key={type}>
                      {menus.map((meal) => (
                        <option key={meal.id} value={meal.name}>
                          {meal.name} - {meal.calories || 0} kcal
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="custom">Makanan Custom</option>
                </select>
              </div>

              {selectedMeal === "custom" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Nama Makanan
                    </label>
                    <input
                      type="text"
                      value={customFoodName}
                      onChange={(e) => setCustomFoodName(e.target.value)}
                      placeholder="Contoh: Nasi Gudeg, Ayam Bakar, dll"
                      className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div className="lg:col-start-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Jumlah Kalori
                    </label>
                    <input
                      type="number"
                      value={customCalories}
                      onChange={(e) => setCustomCalories(e.target.value)}
                      placeholder="Masukkan kalori..."
                      min="0"
                      className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={
                !selectedMeal ||
                (selectedMeal === "custom" &&
                  (!customCalories || !customFoodName.trim()))
              }
              className="group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              <Plus className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Tambah Makanan</span>
            </button>
          </form>
        </section>

        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-[#B23501]" />
              Riwayat Makanan (
              {format(new Date(), "d MMM yyyy", { locale: id })})
            </h3>
            <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">
              {consumedMeals.length} makanan
            </span>
          </div>

          {consumedMeals.length > 0 ? (
            <div className="space-y-4">
              {consumedMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="group relative overflow-hidden bg-gradient-to-br from-white/50 to-white/30 p-6 rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300"
                >
                  {editingMeal === meal.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="col-span-2 md:col-span-4">
                          <label
                            htmlFor={`edit-name-${meal.id}`}
                            className="block text-xs font-semibold text-gray-600 mb-1"
                          >
                            Nama Makanan
                          </label>
                          <input
                            id={`edit-name-${meal.id}`}
                            type="text"
                            value={editValues.name}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-white/70 border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50"
                            placeholder="Nama makanan"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-calories-${meal.id}`}
                            className="block text-xs font-semibold text-gray-600 mb-1"
                          >
                            Kalori
                          </label>
                          <input
                            id={`edit-calories-${meal.id}`}
                            type="number"
                            value={editValues.calories}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                calories: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-white/70 border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50"
                            placeholder="Kalori"
                            min="0"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-protein-${meal.id}`}
                            className="block text-xs font-semibold text-gray-600 mb-1"
                          >
                            Protein (g)
                          </label>
                          <input
                            id={`edit-protein-${meal.id}`}
                            type="number"
                            value={editValues.protein}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                protein: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-white/70 border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50"
                            placeholder="Protein (g)"
                            min="0"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-carbs-${meal.id}`}
                            className="block text-xs font-semibold text-gray-600 mb-1"
                          >
                            Karbo (g)
                          </label>
                          <input
                            id={`edit-carbs-${meal.id}`}
                            type="number"
                            value={editValues.carbs}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                carbs: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-white/70 border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50"
                            placeholder="Karbo (g)"
                            min="0"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-fats-${meal.id}`}
                            className="block text-xs font-semibold text-gray-600 mb-1"
                          >
                            Lemak (g)
                          </label>
                          <input
                            id={`edit-fats-${meal.id}`}
                            type="number"
                            value={editValues.fats}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                fats: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-white/70 border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50"
                            placeholder="Lemak (g)"
                            min="0"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveEdit(meal.id, meal)}
                            className="flex items-center space-x-1 bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                          >
                            <Save className="h-3 w-3" />
                            <span>Simpan</span>
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center space-x-1 bg-gray-500 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                            <span>Batal</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-xl flex items-center justify-center">
                          <Utensils className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg">
                            {meal.name}
                          </h4>
                          <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-600">
                            {/* Menampilkan semua nutrisi */}
                            <span className="flex items-center space-x-1">
                              <Flame className="h-3 w-3" />
                              <span>{meal.calories || 0} kcal</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Activity className="h-3 w-3" />
                              <span>
                                {parseFloat(meal.protein).toFixed(1)}g protein
                              </span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Coffee className="h-3 w-3" />
                              <span>
                                {parseFloat(meal.carbs).toFixed(1)}g karbo
                              </span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Tag className="h-3 w-3" />
                              <span>
                                {parseFloat(meal.fats).toFixed(1)}g lemak
                              </span>
                            </span>
                            <span className="text-xs text-gray-400 ml-4">
                              {meal.timestamp && meal.timestamp.toDate
                                ? meal.timestamp
                                    .toDate()
                                    .toLocaleTimeString("id-ID", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                : "Waktu tidak tersedia"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => startEdit(meal)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteMeal(meal.id, meal)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50/50 to-gray-100/50 rounded-2xl border border-gray-200/50">
              <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Belum ada makanan yang dicatat hari ini
              </p>
              <p className="text-gray-400 text-sm">
                Mulai catat makanan Anda untuk tracking yang lebih baik
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CalorieTracker;
