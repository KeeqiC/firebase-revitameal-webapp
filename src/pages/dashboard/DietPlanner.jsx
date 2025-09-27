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
  addDoc,
  serverTimestamp,
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
  Brain,
  Shield,
  Lightbulb,
  Award,
  Info,
  Star,
  Filter,
  Calculator,
  Utensils,
  Check,
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
  const [recommendations, setRecommendations] = useState([]);
  const [alternativeAdvice, setAlternativeAdvice] = useState(null);
  const [consumedMeals, setConsumedMeals] = useState([]);
  const [dailyTotals, setDailyTotals] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  });

  const today = format(new Date(), "yyyy-MM-dd");

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // Smart filtering logic based on diet goals
  const getSmartRecommendations = (menus, goal) => {
    let filtered = [];
    let advice = null;

    switch (goal) {
      case "Menurunkan Berat Badan":
        filtered = menus.filter((menu) => menu.calories && menu.calories < 400);
        if (filtered.length < 3) {
          advice = {
            title: "Tips Menurunkan Berat Badan",
            content:
              "Menu rendah kalori terbatas dalam database. Fokus pada makanan tinggi serat seperti sayuran hijau, buah-buahan, protein tanpa lemak seperti ayam tanpa kulit, ikan, dan biji-bijian utuh. Hindari makanan olahan dan minuman manis.",
            tips: [
              "Makan dalam porsi kecil tapi sering (5-6x sehari)",
              "Perbanyak konsumsi air putih minimal 2-3 liter/hari",
              "Kombinasikan dengan olahraga kardio 150 menit/minggu",
              "Tidur cukup 7-8 jam untuk mengatur hormon lapar",
            ],
          };
        }
        break;

      case "Menambah Massa Otot":
        filtered = menus.filter((menu) => menu.protein && menu.protein > 20);
        if (filtered.length < 3) {
          advice = {
            title: "Tips Menambah Massa Otot",
            content:
              "Menu tinggi protein terbatas. Prioritaskan makanan kaya protein seperti telur, daging tanpa lemak, ikan salmon, tuna, susu, yogurt Greek, kacang-kacangan, dan quinoa. Kombinasikan dengan latihan beban yang teratur.",
            tips: [
              "Konsumsi 1.6-2.2g protein per kg berat badan",
              "Makan protein dalam 30 menit setelah latihan",
              "Gabungkan protein hewani dan nabati",
              "Latihan beban 3-4x seminggu untuk stimulus otot",
            ],
          };
        }
        break;

      case "Mempertahankan Berat Badan":
        filtered = menus.filter(
          (menu) => menu.calories >= 350 && menu.calories <= 500
        );
        if (filtered.length < 3) {
          advice = {
            title: "Tips Mempertahankan Berat Badan",
            content:
              "Menu seimbang terbatas. Fokus pada kombinasi yang tepat antara karbohidrat kompleks, protein berkualitas, dan lemak sehat. Pastikan asupan kalori sesuai dengan kebutuhan harian Anda.",
            tips: [
              "Konsumsi makanan seimbang dengan porsi 1/2 piring sayur, 1/4 protein, 1/4 karbo",
              "Makan teratur 3 kali sehari dengan 2 snack sehat",
              "Monitor berat badan mingguan, bukan harian",
              "Tetap aktif dengan olahraga ringan seperti jalan kaki",
            ],
          };
        }
        break;

      case "Gaya Hidup Sehat":
      default:
        filtered = menus.filter(
          (menu) =>
            menu.calories &&
            menu.calories >= 300 &&
            menu.calories <= 600 &&
            menu.protein &&
            menu.protein >= 10
        );
        if (filtered.length < 3) {
          advice = {
            title: "Tips Gaya Hidup Sehat",
            content:
              "Menu sehat seimbang terbatas. Fokus pada variasi makanan alami, warna-warni dalam piring, dan hindari makanan ultra-proses. Prioritaskan makanan segar dan lokal.",
            tips: [
              "Terapkan pola makan 'Rainbow Plate' - beragam warna sayur dan buah",
              "Batasi gula tambahan maksimal 6 sendok teh/hari",
              "Pilih whole grains daripada refined grains",
              "Masak sendiri minimal 5x seminggu untuk kontrol kualitas",
            ],
          };
        }
        break;
    }

    return { filtered, advice };
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

    // Listen to menu data
    const menuCollectionRef = collection(db, "revitameal_menu_templates");
    const unsubMenu = onSnapshot(menuCollectionRef, (snapshot) => {
      const menu = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuData(menu);

      // Generate smart recommendations when menu data changes
      if (menu.length > 0) {
        const { filtered, advice } = getSmartRecommendations(menu, dietGoal);
        setRecommendations(filtered);
        setAlternativeAdvice(advice);
      }
    });

    // Listen to diet plan
    const planDocRef = doc(db, "users", currentUser.uid, "dietPlans", today);
    const unsubPlan = onSnapshot(planDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setDietPlan(docSnap.data());
      } else {
        setDietPlan(null);
      }
      setLoading(false);
    });

    // Listen to consumed meals from calorie tracker
    const logDocRef = doc(db, "users", currentUser.uid, "dailyLogs", today);
    const mealsCollectionRef = collection(logDocRef, "meals");

    const unsubConsumedMeals = onSnapshot(mealsCollectionRef, (snapshot) => {
      const meals = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConsumedMeals(meals);
    });

    // Listen to daily totals
    const unsubDailyTotals = onSnapshot(logDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDailyTotals({
          totalCalories: data.totalCalories || 0,
          totalProtein: data.totalProtein || 0,
          totalCarbs: data.totalCarbs || 0,
          totalFats: data.totalFats || 0,
        });
      } else {
        setDailyTotals({
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFats: 0,
        });
      }
    });

    fetchUserProfile();

    return () => {
      unsubMenu();
      unsubPlan();
      unsubConsumedMeals();
      unsubDailyTotals();
    };
  }, [currentUser, today]);

  // Function to consume meal from diet plan
  const consumeMealFromPlan = async (meal, mealType) => {
    if (!currentUser) return;

    try {
      // Add meal to calorie tracker
      const logDocRef = doc(db, "users", currentUser.uid, "dailyLogs", today);
      const mealsCollectionRef = collection(logDocRef, "meals");

      const mealData = {
        name: meal.name,
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fats: meal.fats || 0,
        fromDietPlan: true,
        mealType: mealType,
        timestamp: serverTimestamp(),
      };

      // Add to meals collection
      await addDoc(mealsCollectionRef, mealData);

      // Update daily totals
      await setDoc(
        logDocRef,
        {
          totalCalories: dailyTotals.totalCalories + mealData.calories,
          totalProtein: dailyTotals.totalProtein + mealData.protein,
          totalCarbs: dailyTotals.totalCarbs + mealData.carbs,
          totalFats: dailyTotals.totalFats + mealData.fats,
        },
        { merge: true }
      );

      showMessage(
        `${meal.name} telah ditambahkan ke tracker kalori!`,
        "success"
      );
    } catch (error) {
      console.error("Error consuming meal:", error);
      showMessage("Gagal menambahkan makanan ke tracker.", "error");
    }
  };

  // Check if meal from plan is already consumed
  const isMealConsumed = (planMeal, mealType) => {
    return consumedMeals.some(
      (consumed) =>
        consumed.fromDietPlan &&
        consumed.mealType === mealType &&
        consumed.name === planMeal.name
    );
  };

  // Update recommendations when diet goal changes
  useEffect(() => {
    if (menuData.length > 0) {
      const { filtered, advice } = getSmartRecommendations(menuData, dietGoal);
      setRecommendations(filtered);
      setAlternativeAdvice(advice);
    }
  }, [dietGoal, menuData]);

  const generateSmartPlan = async () => {
    const validMenus = menuData.filter((m) => m.name && m.calories);

    if (validMenus.length < 3) {
      showMessage(
        "Database menu belum mencukupi untuk membuat rencana.",
        "error"
      );
      return;
    }

    // Use smart recommendations if available, otherwise use all valid menus
    const menuPool = recommendations.length >= 3 ? recommendations : validMenus;
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
      isSmartGenerated: recommendations.length >= 3,
    };

    // Calculate totals
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

      const successMessage = plan.isSmartGenerated
        ? "Rencana diet cerdas berhasil dibuat sesuai tujuan Anda!"
        : "Rencana diet umum berhasil dibuat!";

      showMessage(successMessage, "success");
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

  const getDietGoalIcon = (goal) => {
    switch (goal) {
      case "Menurunkan Berat Badan":
        return TrendingUp;
      case "Menambah Massa Otot":
        return Zap;
      case "Mempertahankan Berat Badan":
        return Target;
      case "Gaya Hidup Sehat":
        return Heart;
      default:
        return Target;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex justify-center items-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#F27F34] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg sm:text-xl text-gray-600 font-medium">
            Menganalisis profil diet Anda...
          </p>
        </div>
      </div>
    );
  }

  const GoalIcon = getDietGoalIcon(dietGoal);

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
              Smart Diet Assistant
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-800 mb-2">
            <span className="bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
              Diet
            </span>{" "}
            Planner
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
            Rekomendasi menu personal berdasarkan tujuan diet dan profil
            kesehatan Anda
          </p>
        </header>

        {/* Smart Analysis Section */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 sm:p-6 lg:p-8 rounded-3xl shadow-xl mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
                  Analisis Cerdas
                </h2>
                <p className="text-sm sm:text-lg text-gray-600 flex items-center">
                  <GoalIcon className="h-4 w-4 mr-2" />
                  {dietGoal}
                </p>
              </div>
            </div>
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[#B23501]" />
          </div>

          {/* Smart Recommendations Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Menu Analysis */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <Filter className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">Analisis Menu</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Total menu dalam database:
                  </span>
                  <span className="font-bold text-gray-800">
                    {menuData.length} menu
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Menu yang sesuai tujuan:
                  </span>
                  <span className="font-bold text-blue-600">
                    {recommendations.length} menu
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Tingkat kesesuaian:
                  </span>
                  <span
                    className={`font-bold ${
                      recommendations.length >= 3
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {recommendations.length >= 3 ? "Optimal" : "Terbatas"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Summary */}
            {profile && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-2xl border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Calculator className="h-5 w-5 text-green-600" />
                  <h3 className="font-bold text-gray-800">Profil Nutrisi</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Target kalori harian:
                    </span>
                    <span className="font-bold text-gray-800">
                      {profile.dailyCalories || 2000} kcal
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Berat badan saat ini:
                    </span>
                    <span className="font-bold text-gray-800">
                      {profile.currentWeight || "-"} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Target berat badan:
                    </span>
                    <span className="font-bold text-green-600">
                      {profile.targetWeight || "-"} kg
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={generateSmartPlan}
              disabled={!!dietPlan}
              className="group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 sm:space-x-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
              <span className="relative z-10">
                {dietPlan
                  ? "Rencana Hari Ini Sudah Dibuat"
                  : recommendations.length >= 3
                  ? "Generate Rencana Cerdas"
                  : "Generate Rencana Umum"}
              </span>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
            </button>
          </div>
        </section>

        {/* Alternative Advice Section */}
        {alternativeAdvice && recommendations.length < 3 && (
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4 sm:p-6 lg:p-8 rounded-3xl shadow-xl mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                {alternativeAdvice.title}
              </h3>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
              {alternativeAdvice.content}
            </p>

            <div className="bg-white/50 p-4 rounded-2xl">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Award className="h-4 w-4 mr-2 text-orange-600" />
                Rekomendasi Praktis:
              </h4>
              <ul className="space-y-2">
                {alternativeAdvice.tips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-2 text-sm sm:text-base"
                  >
                    <Star className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Diet Plan Display */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 sm:p-6 lg:p-8 rounded-3xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-[#B23501]" />
              Rencana Diet Hari Ini
            </h2>
            <div className="flex items-center space-x-2">
              {dietPlan?.isSmartGenerated && (
                <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  <Brain className="h-3 w-3" />
                  <span>Cerdas</span>
                </div>
              )}
              <span className="text-xs sm:text-sm text-gray-500 bg-white/50 px-2 sm:px-3 py-1 rounded-full">
                {format(new Date(), "d MMM yyyy", { locale: id })}
              </span>
            </div>
          </div>

          {dietPlan ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Total Calories Card - Integrated with CalorieTracker */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-2xl border border-green-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Apple className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 flex items-center">
                        Status Nutrisi Hari Ini
                        {dietPlan.isSmartGenerated && (
                          <Shield className="h-3 w-3 ml-2 text-green-600" />
                        )}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-lg sm:text-xl font-bold text-gray-800">
                              {dailyTotals.totalCalories}
                            </p>
                            <p className="text-xs text-gray-500">Dikonsumsi</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg sm:text-xl font-bold text-blue-600">
                              {dietPlan.totalCalories || 0}
                            </p>
                            <p className="text-xs text-gray-500">Rencana</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 flex-wrap">
                          <span>
                            P:{" "}
                            {parseFloat(dailyTotals.totalProtein || 0).toFixed(
                              1
                            )}
                            g
                          </span>
                          <span>
                            K:{" "}
                            {parseFloat(dailyTotals.totalCarbs || 0).toFixed(1)}
                            g
                          </span>
                          <span>
                            L:{" "}
                            {parseFloat(dailyTotals.totalFats || 0).toFixed(1)}g
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-500">Target Harian</p>
                    <p className="text-sm font-bold text-gray-700">
                      {profile?.dailyCalories || 2000} kcal
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {dailyTotals.totalCalories && profile?.dailyCalories
                        ? `${(
                            (dailyTotals.totalCalories /
                              profile.dailyCalories) *
                            100
                          ).toFixed(0)}% tercapai`
                        : ""}
                    </p>
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-2">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (dailyTotals.totalCalories /
                              (profile?.dailyCalories || 2000)) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meal Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {Object.entries(dietPlan)
                  .filter(([key]) =>
                    ["breakfast", "lunch", "dinner"].includes(key)
                  )
                  .map(([mealKey, meal]) => {
                    const isConsumed = isMealConsumed(meal, mealKey);

                    return (
                      <div
                        key={mealKey}
                        className={`group relative overflow-hidden bg-gradient-to-br ${
                          isConsumed
                            ? "from-green-50 to-emerald-50 border-green-200"
                            : "from-white/50 to-white/30 border-white/20"
                        } p-4 sm:p-6 rounded-2xl border hover:shadow-lg transition-all duration-300 hover:scale-105`}
                      >
                        {isConsumed && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}

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

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
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

                          {/* Consume Button */}
                          <button
                            onClick={() => consumeMealFromPlan(meal, mealKey)}
                            disabled={isConsumed}
                            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                              isConsumed
                                ? "bg-green-100 text-green-700 cursor-not-allowed"
                                : "bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white hover:shadow-lg hover:scale-105"
                            }`}
                          >
                            {isConsumed ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                <span>Sudah Dikonsumsi</span>
                              </>
                            ) : (
                              <>
                                <Utensils className="h-4 w-4" />
                                <span>Tandai Sudah Dimakan</span>
                              </>
                            )}
                          </button>

                          {/* Smart recommendation indicator */}
                          {dietPlan.isSmartGenerated && (
                            <div className="mt-3 flex items-center space-x-1 text-xs text-green-600">
                              <Brain className="h-3 w-3" />
                              <span>Dipilih sesuai tujuan diet</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Analysis & Tips Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-2xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Info className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                    Analisis Rencana & Tips
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700 text-sm">
                      Kesesuaian dengan Target:
                    </h4>
                    {profile?.dailyCalories && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Kalori:</span>
                          <span
                            className={`font-semibold ${
                              Math.abs(
                                dietPlan.totalCalories - profile.dailyCalories
                              ) <= 100
                                ? "text-green-600"
                                : "text-orange-600"
                            }`}
                          >
                            {dietPlan.totalCalories} / {profile.dailyCalories}{" "}
                            kcal
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                (dietPlan.totalCalories /
                                  profile.dailyCalories) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700 text-sm">
                      Tips Hari Ini:
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      {dietPlan.isSmartGenerated
                        ? `Rencana ini dipilih khusus untuk ${dietGoal.toLowerCase()}. Ikuti jadwal makan dan jangan lewatkan sesi olahraga.`
                        : "Rencana umum telah dibuat. Sesuaikan porsi sesuai kebutuhan kalori harian Anda."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50/50 to-gray-100/50 rounded-2xl border border-gray-200/50">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">
                Siap Membuat Rencana Cerdas
              </h3>
              <p className="text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
                Asisten diet akan menganalisis profil Anda dan memberikan
                rekomendasi menu yang paling sesuai dengan tujuan diet.
              </p>
              <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-400 mb-6">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>
                  {recommendations.length >= 3
                    ? `${recommendations.length} menu cocok ditemukan untuk ${dietGoal}`
                    : `Menu terbatas - akan memberikan saran alternatif`}
                </span>
              </div>

              {/* Preview of what will be generated */}
              <div className="bg-white/50 p-4 rounded-xl max-w-sm mx-auto">
                <h4 className="font-semibold text-gray-700 mb-2 text-sm">
                  Yang akan Anda dapatkan:
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>3 menu sesuai tujuan diet</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Kalkulasi nutrisi lengkap</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Jadwal makan yang optimal</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Tips personal sesuai profil</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default DietPlanner;
