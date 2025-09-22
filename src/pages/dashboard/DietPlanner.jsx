// src/pages/dashboard/DietPlanner.jsx
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import {
  doc,
  setDoc,
  collection,
  query,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { format } from "date-fns";
import { id } from "date-fns/locale";

function DietPlanner() {
  const { currentUser } = useAuth();
  const [dietGoal, setDietGoal] = useState("Menurunkan Berat Badan");
  const [dietPlan, setDietPlan] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const today = format(new Date(), "yyyy-MM-dd", { locale: id });

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

    const menuCollectionRef = collection(db, "lunchBoostMen");
    const unsubMenu = onSnapshot(menuCollectionRef, (snapshot) => {
      if (!snapshot.empty) {
        const menu = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenuData(menu);
      } else {
        setMenuData([]);
      }
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
    if (menuData.length === 0) {
      alert("Tidak ada menu yang tersedia untuk membuat rencana.");
      return;
    }

    // Create a more intelligent meal plan
    const availableMenus = menuData.filter(
      (menu) => menu.calories && menu.name
    );

    if (availableMenus.length < 3) {
      alert("Menu tidak cukup untuk membuat rencana lengkap.");
      return;
    }

    // Sort by calories for better distribution
    const sortedMenus = [...availableMenus].sort(
      (a, b) => (a.calories || 0) - (b.calories || 0)
    );

    const plan = {
      breakfast: {
        ...sortedMenus[
          Math.floor(Math.random() * Math.min(3, sortedMenus.length))
        ],
        mealType: "breakfast",
        time: "07:00",
      },
      lunch: {
        ...sortedMenus[
          Math.floor(sortedMenus.length / 2) + Math.floor(Math.random() * 2)
        ],
        mealType: "lunch",
        time: "12:00",
      },
      dinner: {
        ...sortedMenus[
          sortedMenus.length -
            1 -
            Math.floor(Math.random() * Math.min(3, sortedMenus.length))
        ],
        mealType: "dinner",
        time: "18:00",
      },
      totalCalories: 0,
    };

    // Calculate total calories
    plan.totalCalories =
      (plan.breakfast.calories || 0) +
      (plan.lunch.calories || 0) +
      (plan.dinner.calories || 0);

    try {
      const planDocRef = doc(db, "users", currentUser.uid, "dietPlans", today);
      await setDoc(planDocRef, plan, { merge: true });
      alert("Rencana diet berhasil dibuat!");
    } catch (error) {
      console.error("Error saving diet plan:", error);
      alert("Gagal menyimpan rencana diet.");
    }
  };

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case "breakfast":
        return <Coffee className="h-6 w-6 text-orange-500" />;
      case "lunch":
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case "dinner":
        return <Moon className="h-6 w-6 text-purple-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F27F34] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">
            Memuat rencana diet...
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

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Diet Planning
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">
            <span className="bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
              Rencana
            </span>{" "}
            Diet
          </h1>
          <p className="text-xl text-gray-600">
            Susun rencana makan sehat untuk mencapai tujuan diet Anda
          </p>
        </header>

        {/* Goal Summary Card */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Tujuan Diet Anda
                </h2>
                <p className="text-gray-600 text-lg">{dietGoal}</p>
              </div>
            </div>
            <Sparkles className="h-6 w-6 text-[#B23501]" />
          </div>

          <div className="bg-gradient-to-br from-[#F27F34]/5 to-[#B23501]/10 p-6 rounded-2xl border border-white/20 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="h-5 w-5 text-[#B23501]" />
              <p className="text-gray-700 font-medium">Rencana Personal Anda</p>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Sistem akan membuat rencana makan harian yang disesuaikan dengan
              tujuan diet Anda. Menu dipilih secara acak dari koleksi makanan
              sehat yang tersedia.
            </p>
            {profile && (
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>Target: {profile.dailyCalories || 2000} kcal/hari</span>
                <span>•</span>
                <span>Berat: {profile.currentWeight || "-"} kg</span>
              </div>
            )}
          </div>

          <button
            onClick={generateAndSavePlan}
            className="group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-3 w-full justify-center"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            <ClipboardList className="h-5 w-5 relative z-10" />
            <span className="relative z-10">Buat Rencana Harian</span>
            <ChefHat className="h-5 w-5 relative z-10" />
          </button>
        </section>

        {/* Daily Diet Plan */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Calendar className="h-6 w-6 mr-3 text-[#B23501]" />
              Rencana Diet Hari Ini
            </h2>
            <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">
              {format(new Date(), "d MMM yyyy", { locale: id })}
            </span>
          </div>

          {dietPlan ? (
            <div className="space-y-6">
              {/* Total Calories Summary */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Apple className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">
                        Total Kalori Rencana
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {dietPlan.totalCalories || 0} kcal
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Target Harian</p>
                    <p className="text-sm font-bold text-gray-700">
                      {profile?.dailyCalories || 2000} kcal
                    </p>
                  </div>
                </div>
              </div>

              {/* Meal Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(dietPlan)
                  .filter(([key]) =>
                    ["breakfast", "lunch", "dinner"].includes(key)
                  )
                  .map(([mealKey, meal]) => (
                    <div
                      key={mealKey}
                      className="group relative overflow-hidden bg-gradient-to-br from-white/50 to-white/30 p-6 rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`w-12 h-12 bg-gradient-to-r ${getMealGradient(
                              mealKey
                            )} rounded-2xl flex items-center justify-center shadow-lg`}
                          >
                            {getMealIcon(mealKey)}
                          </div>
                          <span className="text-xs text-gray-500 bg-white/70 px-2 py-1 rounded-full">
                            {meal.time || "Waktu fleksibel"}
                          </span>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-500 mb-1 capitalize">
                            {getMealTime(mealKey)}
                          </p>
                          <h3 className="font-bold text-gray-800 text-lg leading-tight">
                            {meal.name || "Menu Tidak Tersedia"}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
                            <span className="text-sm font-bold text-gray-700">
                              {meal.calories || 0} kcal
                            </span>
                          </div>

                          {meal.description && (
                            <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                              Detail
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Tips Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800">Tips Hari Ini</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Konsumsi makanan sesuai jadwal untuk hasil optimal. Jangan
                  lupa minum air putih minimal 8 gelas per hari dan lakukan
                  aktivitas fisik ringan seperti jalan kaki 30 menit.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50/50 to-gray-100/50 rounded-2xl border border-gray-200/50">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Belum Ada Rencana
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Buat rencana diet harian Anda dengan mengklik tombol "Buat
                Rencana Harian" di atas.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
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
