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

  const today = format(new Date(), "yyyy-MM-dd", { locale: id });

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Ambil tujuan diet dari profil pengguna
    const fetchDietGoal = async () => {
      const userDocRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists() && docSnap.data().dietGoal) {
        setDietGoal(docSnap.data().dietGoal);
      }
    };
    fetchDietGoal();

    // Ambil data menu dari koleksi lunchBoostMen
    const unsubMenu = onSnapshot(
      collection(db, "lunchBoostMen"),
      (snapshot) => {
        const menu = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenuData(menu);
      }
    );

    // Ambil rencana diet harian
    const planDocRef = doc(db, "users", currentUser.uid, "dietPlans", today);
    const unsubPlan = onSnapshot(planDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setDietPlan(docSnap.data());
      } else {
        setDietPlan(null);
      }
      setLoading(false);
    });

    return () => {
      unsubMenu();
      unsubPlan();
    };
  }, [currentUser]);

  const generateAndSavePlan = async () => {
    if (menuData.length === 0) {
      alert("Tidak ada menu yang tersedia untuk membuat rencana.");
      return;
    }

    const plan = {
      breakfast: menuData.find((m) => m.type === "menu-andalan"),
      lunch: menuData.find((m) => m.type === "menu-andalan"),
      dinner: menuData.find((m) => m.type === "sayuran-sehat"),
    };

    // Simpan rencana ke Firestore
    const planDocRef = doc(db, "users", currentUser.uid, "dietPlans", today);
    await setDoc(planDocRef, plan, { merge: true });
    alert("Rencana diet berhasil dibuat!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-xl text-gray-500">Memuat rencana diet...</p>
      </div>
    );
  }

  const getMealIcon = (time) => {
    switch (time) {
      case "breakfast":
        return <Sunrise className="h-6 w-6 text-orange-500" />;
      case "lunch":
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case "dinner":
        return <Sunset className="h-6 w-6 text-purple-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Rencana Diet
        </h1>
        <p className="text-gray-600">Susun rencana makan Anda hari ini.</p>
      </div>

      {/* Ringkasan & Tambah Makanan */}
      <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Target className="h-8 w-8 text-[#B23501]" />
          <h2 className="text-xl font-bold text-gray-800">
            Tujuan Diet Anda: {dietGoal}
          </h2>
        </div>
        <div className="space-y-4">
          <p className="text-gray-600">
            Klik tombol di bawah ini untuk membuat rencana makan harian
            berdasarkan tujuan diet Anda.
          </p>
          <button
            onClick={generateAndSavePlan}
            className="w-full bg-[#B23501] text-white py-2.5 rounded-lg font-semibold hover:bg-[#F9A03F] transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <ClipboardList className="h-5 w-5" />
            <span>Buat Rencana Harian</span>
          </button>
        </div>
      </section>

      {/* Rencana Diet Harian */}
      <section className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Rencana Diet Harian ({today})
        </h2>
        <div className="space-y-4">
          {dietPlan ? (
            Object.entries(dietPlan).map(([mealKey, meal]) => (
              <div
                key={mealKey}
                className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div className="flex-shrink-0">{getMealIcon(mealKey)}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-semibold capitalize">
                    {mealKey}
                  </p>
                  <h3 className="font-semibold text-gray-800">{meal.name}</h3>
                  <p className="text-sm text-gray-500">{meal.calories} kcal</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              Belum ada rencana diet yang dibuat.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default DietPlanner;
