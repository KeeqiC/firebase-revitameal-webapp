// src/pages/dashboard/Dashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Utensils,
  Dumbbell,
  ClipboardList,
  Flame,
  LineChart,
  Target,
  Clock,
  User,
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";

function Dashboard() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const docRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
      } else {
        // Jika dokumen tidak ada, set profil ke null
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Data dummy (sementara)
  const caloriesConsumed = 950;
  const recommendedMenu = {
    name: "Salad Ayam Panggang",
    calories: 250,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-xl text-gray-500">Memuat dashboard...</p>
      </div>
    );
  }

  // Tampilan jika data profil tidak ada
  if (!profile) {
    return (
      <div className="p-6 md:p-8 text-center bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Profil Belum Lengkap
        </h1>
        <p className="text-gray-600 mb-6">
          Silakan lengkapi data profil Anda untuk melihat dashboard.
        </p>
        <Link
          to="/dashboard/profile"
          className="bg-[#B23501] text-white py-2 px-6 rounded-full font-semibold hover:bg-[#F9A03F] transition-colors"
        >
          <User className="inline-block mr-2" /> Lengkapi Profil
        </Link>
      </div>
    );
  }

  const dailyCalories = parseInt(profile.dailyCalories) || 2000;
  const caloriesRemaining = dailyCalories - caloriesConsumed;

  const quickAccessItems = [
    {
      title: "Pesan Makanan",
      description: "Lihat menu sehat kami",
      icon: <Utensils className="h-8 w-8 text-[#F27F34]" />,
      link: "/dashboard/lunch-boost",
    },
    {
      title: "Rencana Diet",
      description: "Buat rencana makan",
      icon: <ClipboardList className="h-8 w-8 text-[#F27F34]" />,
      link: "/dashboard/diet-planner",
    },
    {
      title: "Panduan Fitness",
      description: "Video latihan",
      icon: <Dumbbell className="h-8 w-8 text-[#F27F34]" />,
      link: "/dashboard/fitness-guide",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Selamat Datang, {profile.name || "Pengguna"}!
        </h1>
        <p className="text-gray-600 mt-2">
          Berikut ringkasan progres kesehatan Anda hari ini.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-semibold">
              Kalori Tersisa
            </p>
            <h2 className="text-4xl font-bold text-[#F27F34] mt-1">
              {caloriesRemaining}{" "}
              <span className="text-lg font-normal text-gray-400">kcal</span>
            </h2>
          </div>
          <Target className="h-12 w-12 text-[#B23501]" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-semibold">
              Kalori Dikonsumsi
            </p>
            <h2 className="text-4xl font-bold text-[#34B26A] mt-1">
              {caloriesConsumed}{" "}
              <span className="text-lg font-normal text-gray-400">kcal</span>
            </h2>
          </div>
          <Flame className="h-12 w-12 text-[#B23501]" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-semibold">Target Kalori</p>
            <h2 className="text-4xl font-bold text-[#B23501] mt-1">
              {dailyCalories}{" "}
              <span className="text-lg font-normal text-gray-400">kcal</span>
            </h2>
          </div>
          <Clock className="h-12 w-12 text-[#B23501]" />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Progres Berat Badan
          </h2>
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              Berat Badan Saat Ini: {profile.currentWeight || "-"} kg
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Rekomendasi Menu Hari Ini
          </h2>
          <div className="flex flex-col space-y-4">
            <div className="text-center py-10 text-gray-500">
              Rekomendasi menu akan muncul di sini.
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {quickAccessItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 hover:shadow-xl transition-shadow duration-200"
            >
              {item.icon}
              <div>
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
