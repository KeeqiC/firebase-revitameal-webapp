import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Utensils,
  Dumbbell,
  ClipboardList,
  Flame,
  Target,
  Clock,
  User,
  TrendingUp,
  Award,
  Calendar,
  ArrowRight,
  Sparkles,
  Activity,
} from "lucide-react";
import { doc, onSnapshot, collection } from "firebase/firestore";
import { format } from "date-fns";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

// Mock Auth Context
const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // For demonstration, we'll mock a user if none is logged in.
      // In a real app, you might handle this differently.
      if (user) {
        setCurrentUser(user);
      } else {
        // Mock user for development purposes
        setCurrentUser({ uid: "x1QFpZjvvBfGLNugPfaXI3eF0zf1", isMock: true });
      }
    });
    return unsubscribe;
  }, []);
  return { currentUser };
};

function Dashboard() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [totalCalories, setTotalCalories] = useState(0);
  const [recommendedMenu, setRecommendedMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const today = format(new Date(), "yyyy-MM-dd");

    const profileDocRef = doc(db, "users", currentUser.uid);
    const dailyLogDocRef = doc(
      db,
      "users",
      currentUser.uid,
      "dailyLogs",
      today
    );
    const menuCollectionRef = collection(db, "revitameal_menu_templates");

    let unsubProfile, unsubDailyLog, unsubMenu;

    // Set a timeout to ensure onSnapshot doesn't run before loading is potentially complete
    const timer = setTimeout(() => {
      unsubProfile = onSnapshot(
        profileDocRef,
        (docSnap) => {
          setProfile(docSnap.exists() ? docSnap.data() : null);
        },
        () => setLoading(false)
      );

      unsubDailyLog = onSnapshot(dailyLogDocRef, (docSnap) => {
        setTotalCalories(
          docSnap.exists() ? docSnap.data().totalCalories || 0 : 0
        );
      });

      unsubMenu = onSnapshot(
        menuCollectionRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const menu = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            const randomIndex = Math.floor(Math.random() * menu.length);
            setRecommendedMenu(menu[randomIndex]);
          } else {
            setRecommendedMenu(null);
          }
          setLoading(false);
        },
        () => setLoading(false)
      );
    }, 100);

    return () => {
      clearTimeout(timer);
      if (unsubProfile) unsubProfile();
      if (unsubDailyLog) unsubDailyLog();
      if (unsubMenu) unsubMenu();
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/10 via-[#E06B2A]/10 to-[#B23501]/10 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F27F34] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">
            Memuat dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/10 via-[#E06B2A]/10 to-[#B23501]/10 flex items-center justify-center p-6">
        <div className="text-center bg-white/80 backdrop-blur-xl border border-white/30 p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full">
          <div className="w-16 h-16 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Profil Belum Lengkap
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Lengkapi data profil Anda untuk mendapatkan pengalaman dashboard
            yang optimal dan rekomendasi yang personal.
          </p>
          <Link
            to="/dashboard/profile"
            className="group inline-flex items-center space-x-2 bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white py-4 px-8 rounded-full font-bold hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <User className="h-5 w-5" />
            <span>Lengkapi Profil</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    );
  }

  const targetCalories = parseInt(profile.dailyCalories) || 2000;
  const caloriesRemaining = Math.max(targetCalories - totalCalories, 0);
  const caloriesProgress = (totalCalories / targetCalories) * 100;

  const quickAccessItems = [
    {
      title: "Pesan Makanan",
      description: "Lihat menu sehat kami",
      icon: Utensils,
      link: "/dashboard/lunch-boost",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rencana Diet",
      description: "Buat rencana makan",
      icon: ClipboardList,
      link: "/dashboard/diet-planner",
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Panduan Fitness",
      description: "Video latihan",
      icon: Dumbbell,
      link: "/dashboard/fitness-guide",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
    },
  ];

  const getCurrentTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Pagi";
    if (hour < 15) return "Siang";
    if (hour < 18) return "Sore";
    return "Malam";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F27F34]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#B23501]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FFD580]/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Enhanced Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Selamat {getCurrentTime()}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">
            Hai,{" "}
            <span className="bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
              {profile.name || "Pengguna"}
            </span>
            !
          </h1>
          <p className="text-xl text-gray-600">
            Mari lihat progres kesehatan Anda hari ini
          </p>
        </header>

        {/* Enhanced Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Kalori Tersisa */}
          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD580]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <Sparkles className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-sm font-semibold text-gray-500 mb-2">
                Kalori Tersisa
              </p>
              <h2 className="text-4xl font-black text-gray-800 mb-1">
                {caloriesRemaining}
              </h2>
              <span className="text-sm text-gray-500">kcal</span>
            </div>
          </div>

          {/* Kalori Dikonsumsi */}
          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(caloriesProgress, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {Math.round(caloriesProgress)}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-500 mb-2">
                Kalori Dikonsumsi
              </p>
              <h2 className="text-4xl font-black text-gray-800 mb-1">
                {totalCalories}
              </h2>
              <span className="text-sm text-gray-500">kcal</span>
            </div>
          </div>

          {/* Target Kalori */}
          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-[#B23501]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
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
        </section>

        {/* Enhanced Content Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progress Chart */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Progres Berat Badan
              </h2>
              <TrendingUp className="h-6 w-6 text-[#B23501]" />
            </div>
            <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-[#F27F34]/5 to-[#B23501]/10 rounded-2xl border border-white/20">
              <div className="w-24 h-24 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-full flex items-center justify-center mb-4 shadow-xl">
                <span className="text-2xl font-black text-white">
                  {profile.currentWeight || "?"}
                </span>
              </div>
              <p className="text-xl font-bold text-gray-700 mb-1">
                Berat Badan Saat Ini
              </p>
              <p className="text-3xl font-black text-gray-800">
                {profile.currentWeight || "-"}{" "}
                <span className="text-lg text-gray-500">kg</span>
              </p>
            </div>
          </div>

          {/* Menu Recommendation */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Rekomendasi Menu
              </h2>
              <Award className="h-6 w-6 text-[#B23501]" />
            </div>
            {recommendedMenu ? (
              <div className="group relative overflow-hidden bg-gradient-to-br from-[#F27F34]/5 to-[#B23501]/10 p-6 rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={recommendedMenu.image_url}
                      alt={recommendedMenu.name}
                      className="w-20 h-20 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {recommendedMenu.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {recommendedMenu.description || "Menu lezat dan sehat."}
                    </p>
                    <div className="flex items-center space-x-4 mt-3">
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        {recommendedMenu.calories} kcal
                      </span>
                      <span className="text-xs text-gray-500">
                        Rekomendasi untuk Anda
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  Tidak ada rekomendasi menu saat ini
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Enhanced Quick Access */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Akses Cepat</h2>
            <Calendar className="h-6 w-6 text-[#B23501]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickAccessItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={index}
                  to={item.link}
                  className="group relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-14 h-14 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="h-7 w-7 text-white" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
