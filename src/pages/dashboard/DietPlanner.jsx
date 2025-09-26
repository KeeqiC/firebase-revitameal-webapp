import { useState, useEffect } from "react";
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
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import {
  Plus,
  Target,
  UtensilsCrossed,
  Clock,
  ClipboardList,
  Sun,
  Sunrise,
  Sunset,
  Sparkles,
  Activity,
  Calendar,
  ChefHat,
  Apple,
  Coffee,
  Moon,
  AlertCircle,
  CheckCircle,
  X,
  Zap,
  TrendingUp,
  Users,
  Heart,
  Flame,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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

function DietPlanner() {
  const { currentUser } = useAuth();
  const [dietGoal, setDietGoal] = useState("Menurunkan Berat Badan");
  const [dietPlan, setDietPlan] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState(null);

  const today = format(new Date(), "yyyy-MM-dd");

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setProfile(userData);
          setDietGoal(userData.dietGoal || "Menurunkan Berat Badan");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    const menuCollectionRef = collection(db, "revitameal_menu_templates");
    const unsubMenu = onSnapshot(menuCollectionRef, (snapshot) => {
      const menu = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuData(menu);
    });

    const planDocRef = doc(db, "users", currentUser.uid, "dietPlans", today);
    const unsubPlan = onSnapshot(planDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setDietPlan(docSnap.data());
      } else {
        setDietPlan(null);
      }
      setLoading(false);
    });

    fetchUserProfile();

    return () => {
      unsubMenu();
      unsubPlan();
    };
  }, [currentUser, today]);

  const generateAndSavePlan = async () => {
    const validMenus = menuData.filter((m) => m.name && m.calories);

    if (validMenus.length < 3) {
      showMessage("Menu tidak cukup untuk membuat rencana lengkap.", "error");
      return;
    }

    let menuPool = [...validMenus];
    let attemptedFilter = false;

    let filteredMenus = [...validMenus];
    switch (dietGoal) {
      case "Menurunkan Berat Badan":
        filteredMenus = validMenus.filter((menu) => menu.calories < 450);
        attemptedFilter = true;
        break;
      case "Menambah Massa Otot":
        filteredMenus = validMenus.filter(
          (menu) => menu.protein && menu.protein > 25
        );
        attemptedFilter = true;
        break;
      case "Mempertahankan Berat Badan":
        filteredMenus = validMenus.filter(
          (menu) => menu.calories >= 400 && menu.calories <= 600
        );
        attemptedFilter = true;
        break;
      case "Gaya Hidup Sehat":
      default:
        break;
    }

    if (attemptedFilter && filteredMenus.length < 3) {
      showMessage(
        `Menu untuk "${dietGoal}" terbatas. Rencana dibuat dari menu umum.`,
        "info"
      );
    } else {
      menuPool = filteredMenus;
    }

    const shuffledMenus = menuPool.sort(() => 0.5 - Math.random());

    const plan = {
      breakfast: { ...shuffledMenus[0], mealType: "breakfast", time: "07:00" },
      lunch: { ...shuffledMenus[1], mealType: "lunch", time: "12:00" },
      dinner: { ...shuffledMenus[2], mealType: "dinner", time: "18:00" },
      createdAt: new Date(),
      goal: dietGoal,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
    };

    plan.totalCalories =
      (plan.breakfast.calories || 0) +
      (plan.lunch.calories || 0) +
      (plan.dinner.calories || 0);

    plan.totalProtein =
      (plan.breakfast.protein || 0) +
      (plan.lunch.protein || 0) +
      (plan.dinner.protein || 0);

    plan.totalCarbs =
      (plan.breakfast.carbs || 0) +
      (plan.lunch.carbs || 0) +
      (plan.dinner.carbs || 0);

    plan.totalFats =
      (plan.breakfast.fats || 0) +
      (plan.lunch.fats || 0) +
      (plan.dinner.fats || 0);

    try {
      const planDocRef = doc(db, "users", currentUser.uid, "dietPlans", today);
      await setDoc(planDocRef, plan);
      showMessage("Rencana diet berhasil dibuat!", "success");
    } catch (error) {
      console.error("Error saving diet plan:", error);
      showMessage("Gagal menyimpan rencana diet.", "error");
    }
  };

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case "breakfast":
        return (
          <Coffee className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-500" />
        );
      case "lunch":
        return (
          <Sun className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-500" />
        );
      case "dinner":
        return (
          <Moon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-500" />
        );
      default:
        return (
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-500" />
        );
    }
  };

  const getMealTime = (mealType) => {
    switch (mealType) {
      case "breakfast":
        return "Sarapan";
      case "lunch":
        return "Makan Siang";
      case "dinner":
        return "Makan Malam";
      default:
        return mealType;
    }
  };

  const getMealGradient = (mealType) => {
    switch (mealType) {
      case "breakfast":
        return "from-orange-500 to-amber-500";
      case "lunch":
        return "from-yellow-500 to-orange-500";
      case "dinner":
        return "from-purple-500 to-pink-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const dietGoalIcons = {
    "Menurunkan Berat Badan": TrendingUp,
    "Menambah Massa Otot": Zap,
    "Mempertahankan Berat Badan": Target,
    "Gaya Hidup Sehat": Heart,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex justify-center items-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#F27F34] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg sm:text-xl text-gray-600 font-medium">
            Memuat rencana diet...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 relative overflow-hidden">
      {/* Notification Component */}
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
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      )}

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F27F34]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#B23501]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FFD580]/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
              Diet Planning
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-800 mb-2">
            <span className="bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
              Rencana
            </span>{" "}
            Diet
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
            Susun rencana makan sehat untuk mencapai tujuan diet Anda
          </p>
        </header>

        {/* Diet Goal Section */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 sm:p-6 lg:p-8 rounded-3xl shadow-xl mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
                  Tujuan Diet Anda
                </h2>
                <p className="text-sm sm:text-lg text-gray-600">{dietGoal}</p>
              </div>
            </div>
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[#B23501] self-center sm:self-auto" />
          </div>

          <div className="bg-gradient-to-br from-[#F27F34]/5 to-[#B23501]/10 p-4 sm:p-6 rounded-2xl border border-white/20 mb-6">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-[#B23501]" />
              <p className="text-gray-700 font-medium text-sm sm:text-base">
                Rencana Personal Anda
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
              Sistem akan membuat rencana makan harian yang disesuaikan dengan
              tujuan diet Anda. Menu dipilih secara acak dari koleksi makanan
              sehat yang tersedia.
            </p>
            {profile && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-500">
                <span>Target: {profile.dailyCalories || 2000} kcal/hari</span>
                <span className="hidden sm:inline">•</span>
                <span>Berat: {profile.currentWeight || "-"} kg</span>
              </div>
            )}
          </div>

          <button
            onClick={generateAndSavePlan}
            disabled={!!dietPlan}
            className="group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 sm:space-x-3 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
            <span className="relative z-10">
              {dietPlan
                ? "Rencana Hari Ini Sudah Dibuat"
                : "Buat Rencana Harian"}
            </span>
            <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
          </button>
        </section>

        {/* Diet Plan Display */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 sm:p-6 lg:p-8 rounded-3xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-[#B23501]" />
              Rencana Diet Hari Ini
            </h2>
            <span className="text-xs sm:text-sm text-gray-500 bg-white/50 px-2 sm:px-3 py-1 rounded-full">
              {format(new Date(), "d MMM yyyy", { locale: id })}
            </span>
          </div>

          {dietPlan ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Total Calories Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-2xl border border-green-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Apple className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-600">
                        Total Nutrisi Rencana
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <span>{dietPlan.totalCalories || 0} kcal</span>
                        <span className="text-base font-medium text-gray-600">
                          {parseFloat(dietPlan.totalProtein || 0).toFixed(1)}g P
                        </span>
                        <span className="text-base font-medium text-gray-600">
                          {parseFloat(dietPlan.totalCarbs || 0).toFixed(1)}g K
                        </span>
                        <span className="text-base font-medium text-gray-600">
                          {parseFloat(dietPlan.totalFats || 0).toFixed(1)}g L
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-500">Target Harian</p>
                    <p className="text-sm font-bold text-gray-700">
                      {profile?.dailyCalories || 2000} kcal
                    </p>
                  </div>
                </div>
              </div>

              {/* Meal Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {Object.entries(dietPlan)
                  .filter(([key]) =>
                    ["breakfast", "lunch", "dinner"].includes(key)
                  )
                  .map(([mealKey, meal]) => (
                    <div
                      key={mealKey}
                      className="group relative overflow-hidden bg-gradient-to-br from-white/50 to-white/30 p-4 sm:p-6 rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="relative">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${getMealGradient(
                              mealKey
                            )} rounded-2xl flex items-center justify-center shadow-lg`}
                          >
                            {getMealIcon(mealKey)}
                          </div>
                          <span className="text-xs text-gray-500 bg-white/70 px-2 py-1 rounded-full">
                            {meal.time || "Waktu fleksibel"}
                          </span>
                        </div>

                        <div className="mb-3 sm:mb-4">
                          <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-1 capitalize">
                            {getMealTime(mealKey)}
                          </p>
                          <h3 className="font-bold text-gray-800 text-sm sm:text-lg leading-tight">
                            {meal.name || "Menu Tidak Tersedia"}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <div className="flex items-center space-x-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span className="text-xs sm:text-sm font-bold text-gray-700">
                              {meal.calories || 0} kcal
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Activity className="h-3 w-3 text-blue-500" />
                            <span className="text-xs sm:text-sm font-bold text-gray-700">
                              {parseFloat(meal.protein || 0).toFixed(1)}g
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <UtensilsCrossed className="h-3 w-3 text-red-500" />
                            <span className="text-xs sm:text-sm font-bold text-gray-700">
                              {parseFloat(meal.carbs || 0).toFixed(1)}g
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Tag className="h-3 w-3 text-green-500" />
                            <span className="text-xs sm:text-sm font-bold text-gray-700">
                              {parseFloat(meal.fats || 0).toFixed(1)}g
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Tips Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-2xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                    Tips Hari Ini
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  Konsumsi makanan sesuai jadwal untuk hasil optimal. Jangan
                  lupa minum air putih minimal 8 gelas per hari dan lakukan
                  aktivitas fisik ringan seperti jalan kaki 30 menit.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50/50 to-gray-100/50 rounded-2xl border border-gray-200/50">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">
                Belum Ada Rencana
              </h3>
              <p className="text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
                Buat rencana diet harian Anda dengan mengklik tombol "Buat
                Rencana Harian" di atas.
              </p>
              <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-400">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Rencana akan disesuaikan dengan tujuan diet Anda</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default DietPlanner;
