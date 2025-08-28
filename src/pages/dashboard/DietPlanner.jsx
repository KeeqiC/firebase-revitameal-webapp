// src/pages/dashboard/DietPlanner.jsx
import { useState } from "react";
import {
  ClipboardList,
  Target,
  Dumbbell,
  Clock,
  Utensils,
  PlusCircle,
} from "lucide-react";

function DietPlanner() {
  const [goal, setGoal] = useState("weight-loss");
  const [dietPlan, setDietPlan] = useState(null);

  const generateDietPlan = () => {
    // Logika dummy untuk menghasilkan rencana diet
    const newPlan = {
      day: "Senin",
      meals: {
        breakfast: {
          name: "Oatmeal dengan Buah Beri",
          calories: 350,
        },
        lunch: {
          name: "Ayam Panggang & Quinoa",
          calories: 450,
        },
        dinner: {
          name: "Sup Sayuran & Roti Gandum",
          calories: 400,
        },
        snack: {
          name: "Yogurt Yunani",
          calories: 150,
        },
      },
    };
    setDietPlan(newPlan);
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header Halaman */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
        Diet Planner
      </h1>
      <p className="text-gray-600 mb-8">
        Atur tujuan diet Anda dan biarkan kami membuat rencana makan yang
        dipersonalisasi.
      </p>

      {/* Formulir Tujuan Diet */}
      <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Tetapkan Tujuan Anda
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label
              htmlFor="goal"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Pilih Tujuan
            </label>
            <select
              id="goal"
              name="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
            >
              <option value="weight-loss">Menurunkan Berat Badan</option>
              <option value="muscle-gain">Menambah Massa Otot</option>
              <option value="healthy-living">Gaya Hidup Sehat</option>
            </select>
          </div>
          {/* Anda bisa menambahkan input lain seperti berat badan, tinggi, dsb. */}
        </div>
        <button
          onClick={generateDietPlan}
          className="mt-6 bg-[#B23501] text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-[#F9A03F] transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <ClipboardList className="h-5 w-5" />
          <span>Buat Rencana</span>
        </button>
      </section>

      {/* Tampilan Rencana Diet */}
      <section className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Rencana Diet Harian Anda
        </h2>
        {dietPlan ? (
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-[#F27F34]">
              Hari {dietPlan.day}
            </h3>
            <div className="space-y-4">
              {Object.keys(dietPlan.meals).map((mealKey) => (
                <div
                  key={mealKey}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <Utensils className="h-8 w-8 text-[#B23501]" />
                  <div className="flex-1">
                    <h4 className="font-semibold capitalize">
                      {mealKey === "snack" ? "Camilan" : mealKey}
                    </h4>
                    <p className="text-gray-600">
                      {dietPlan.meals[mealKey].name}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#34B26A]">
                    {dietPlan.meals[mealKey].calories} kcal
                  </span>
                </div>
              ))}
            </div>
            {/* Tombol Aksi */}
            <div className="mt-6 flex gap-4">
              <button className="bg-[#B23501] text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-[#F9A03F] transition-colors duration-200 flex items-center space-x-2">
                <PlusCircle className="h-5 w-5" />
                <span>Tambah ke Pesanan</span>
              </button>
              <button className="bg-gray-200 text-gray-700 py-2.5 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200">
                Cetak Rencana
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Pilih tujuan Anda dan klik 'Buat Rencana' untuk memulai.
          </div>
        )}
      </section>
    </div>
  );
}

export default DietPlanner;
