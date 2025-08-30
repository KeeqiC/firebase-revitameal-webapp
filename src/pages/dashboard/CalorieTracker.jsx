// src/pages/dashboard/CalorieTracker.jsx
import { useState, useEffect } from "react";
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
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { Plus, Utensils, Flame, Leaf, Fish, Heart } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

function CalorieTracker() {
  const { currentUser } = useAuth();
  const [targetCalories, setTargetCalories] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFats, setTotalFats] = useState(0);
  const [consumedMeals, setConsumedMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), "yyyy-MM-dd", { locale: id });

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const logDocRef = doc(db, "users", currentUser.uid, "dailyLogs", today);
    const mealsCollectionRef = collection(logDocRef, "meals");

    // Ambil target kalori dari profil pengguna
    const fetchTargetCalories = async () => {
      const userDocRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setTargetCalories(docSnap.data().dailyCalories || 0);
      }
    };

    // Ambil data menu dari koleksi lunchBoostMen
    const unsubMenu = onSnapshot(
      query(collection(db, "lunchBoostMen"), orderBy("name")),
      (snapshot) => {
        const menu = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setMenuData(menu);
        setLoading(false);
      }
    );

    // Ambil data total kalori dan makro dari dailyLogs
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

    // Ambil daftar makanan yang sudah dicatat
    const unsubMeals = onSnapshot(query(mealsCollectionRef), (snapshot) => {
      const meals = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setConsumedMeals(meals);
    });

    fetchTargetCalories();

    return () => {
      unsubDailyLogs();
      unsubMeals();
      unsubMenu();
    };
  }, [currentUser, today]);

  const addMeal = async (e) => {
    e.preventDefault();
    if (!selectedMeal) return;

    const meal = menuData.find((m) => m.name === selectedMeal);
    if (!meal) return;

    try {
      // Menambahkan total kalori dan makro ke dokumen dailyLogs
      await setDoc(
        doc(db, "users", currentUser.uid, "dailyLogs", today),
        {
          totalCalories: totalCalories + meal.calories,
          totalProtein: totalProtein + (meal.protein || 0),
          totalCarbs: totalCarbs + (meal.carbs || 0),
          totalFats: totalFats + (meal.fats || 0),
        },
        { merge: true }
      );

      // Menambahkan makanan ke sub-koleksi 'meals'
      await addDoc(
        collection(
          doc(db, "users", currentUser.uid, "dailyLogs", today),
          "meals"
        ),
        {
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fats: meal.fats || 0,
          timestamp: serverTimestamp(),
        }
      );

      setSelectedMeal("");
    } catch (error) {
      console.error("Error adding meal:", error);
      alert("Gagal menambahkan makanan.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-xl text-gray-500">Memuat data kalori...</p>
      </div>
    );
  }

  const remainingCalories = targetCalories - totalCalories;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Kalori Tracker</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-md flex flex-col items-center justify-center text-center">
          <p className="text-gray-500 font-medium">Kalori Terkonsumsi</p>
          <p className="text-4xl font-bold text-orange-500 mt-2">
            {totalCalories} kcal
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md flex flex-col items-center justify-center text-center">
          <p className="text-gray-500 font-medium">Target Kalori</p>
          <p className="text-4xl font-bold text-gray-800 mt-2">
            {targetCalories} kcal
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md flex flex-col items-center justify-center text-center">
          <p
            className={`text-gray-500 font-medium ${
              remainingCalories >= 0 ? "" : "text-red-500"
            }`}
          >
            Sisa Kalori
          </p>
          <p
            className={`text-4xl font-bold mt-2 ${
              remainingCalories >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {remainingCalories} kcal
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Catat Makanan Hari Ini</h3>
        <form onSubmit={addMeal} className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedMeal}
            onChange={(e) => setSelectedMeal(e.target.value)}
            className="flex-1 border border-gray-300 p-2 rounded-md"
          >
            <option value="" disabled>
              Pilih Makanan
            </option>
            {menuData.map((meal) => (
              <option key={meal.id} value={meal.name}>
                {meal.name} - {meal.calories} kcal
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-orange-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center"
          >
            <Plus className="mr-2" />
            Tambah
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">
          Riwayat Makanan ({today})
        </h3>
        {consumedMeals.length > 0 ? (
          <ul className="space-y-4">
            {consumedMeals.map((meal) => (
              <li
                key={meal.id}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-md"
              >
                <div>
                  <p className="font-medium">{meal.name}</p>
                  <p className="text-sm text-gray-500">{meal.calories} kcal</p>
                </div>
                <div className="text-xs text-gray-400">
                  {meal.timestamp?.toDate().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">
            Belum ada makanan yang dicatat hari ini.
          </p>
        )}
      </div>
    </div>
  );
}

export default CalorieTracker;
