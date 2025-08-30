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
  addDoc,
} from "firebase/firestore";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Contoh data makanan (ganti dengan data Anda yang sebenarnya)
const menuData = [
  {
    name: "Salad Ayam Panggang",
    calories: 250,
    goal: "Weight Loss",
    time: "Breakfast",
  },
  {
    name: "Oatmeal Buah",
    calories: 300,
    goal: "Weight Gain",
    time: "Breakfast",
  },
  {
    name: "Nasi Merah Salmon",
    calories: 450,
    goal: "Weight Loss",
    time: "Lunch",
  },
  {
    name: "Spaghetti Bolognese",
    calories: 600,
    goal: "Weight Gain",
    time: "Lunch",
  },
  {
    name: "Dada Ayam Panggang",
    calories: 350,
    goal: "Weight Loss",
    time: "Dinner",
  },
  {
    name: "Steak Daging Sapi",
    calories: 700,
    goal: "Weight Gain",
    time: "Dinner",
  },
  { name: "Telur Rebus", calories: 80, goal: "Weight Loss", time: "Snack" },
  {
    name: "Smoothie Protein",
    calories: 250,
    goal: "Weight Gain",
    time: "Snack",
  },
];

function DietPlanner() {
  const { currentUser } = useAuth();
  const [dietGoal, setDietGoal] = useState("Unset");
  const [loading, setLoading] = useState(true);
  const [dietPlan, setDietPlan] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
    snack: null,
  });
  const [selectedMeal, setSelectedMeal] = useState({
    name: "",
    time: "",
  });

  const today = format(new Date(), "yyyy-MM-dd", { locale: id });
  const planDocRef = doc(db, "users", currentUser.uid, "dietPlans", today);
  const mealsCollectionRef = collection(planDocRef, "meals");

  useEffect(() => {
    const fetchDietGoal = async () => {
      const userDocRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists() && docSnap.data().dietGoal) {
        setDietGoal(docSnap.data().dietGoal);
      }
    };
    fetchDietGoal();

    const unsub = onSnapshot(mealsCollectionRef, (snapshot) => {
      const meals = {};
      snapshot.forEach((doc) => {
        const mealData = doc.data();
        meals[mealData.time.toLowerCase()] = { id: doc.id, ...mealData };
      });
      setDietPlan(meals);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser, mealsCollectionRef]);

  const addMealToPlan = async (e) => {
    e.preventDefault();
    if (!selectedMeal.name || !selectedMeal.time) return;

    const meal = menuData.find((m) => m.name === selectedMeal.name);
    if (!meal) return;

    try {
      // Menambahkan makanan ke sub-koleksi
      await addDoc(mealsCollectionRef, {
        name: meal.name,
        calories: meal.calories,
        time: selectedMeal.time,
      });

      setSelectedMeal({ name: "", time: "" });
    } catch (error) {
      console.error("Error adding meal to plan:", error);
      alert("Gagal menambahkan makanan ke rencana diet.");
    }
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
      case "Breakfast":
        return <Sunrise className="h-6 w-6 text-orange-500" />;
      case "Lunch":
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case "Dinner":
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
        <form onSubmit={addMealToPlan} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="mealTime"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Waktu Makan
              </label>
              <select
                id="mealTime"
                value={selectedMeal.time}
                onChange={(e) =>
                  setSelectedMeal({ ...selectedMeal, time: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
                required
              >
                <option value="" disabled>
                  Pilih Waktu
                </option>
                {["Breakfast", "Lunch", "Dinner", "Snack"].map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="mealName"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Pilih Makanan
              </label>
              <select
                id="mealName"
                value={selectedMeal.name}
                onChange={(e) =>
                  setSelectedMeal({ ...selectedMeal, name: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
                required
              >
                <option value="" disabled>
                  Pilih Makanan
                </option>
                {menuData.map((meal) => (
                  <option key={meal.name} value={meal.name}>
                    {meal.name} - {meal.calories} kcal
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[#B23501] text-white py-2.5 rounded-lg font-semibold hover:bg-[#F9A03F] transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Tambah ke Rencana</span>
          </button>
        </form>
      </section>

      {/* Rencana Diet Harian */}
      <section className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Rencana Diet Harian ({today})
        </h2>
        <div className="space-y-4">
          {Object.keys(dietPlan).length > 0 ? (
            Object.entries(dietPlan).map(([time, meal]) => (
              <div
                key={time}
                className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div className="flex-shrink-0">{getMealIcon(meal?.time)}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-semibold">
                    {meal?.time}
                  </p>
                  <h3 className="font-semibold text-gray-800">{meal?.name}</h3>
                  <p className="text-sm text-gray-500">{meal?.calories} kcal</p>
                </div>
                <ClipboardList className="h-6 w-6 text-[#B23501] flex-shrink-0" />
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
