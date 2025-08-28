// src/pages/dashboard/CalorieTracker.jsx
import { useState } from "react";
import { PlusCircle, Utensils, Flame, Leaf, Fish, Heart } from "lucide-react";

function CalorieTracker() {
  const [foodEntry, setFoodEntry] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  // Data dummy untuk ringkasan harian
  const dailySummary = {
    calories: 1250,
    protein: 60,
    carbs: 150,
    fats: 45,
    targetCalories: 2000,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFoodEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic untuk menambahkan data ke state global atau database
    console.log("Makanan Ditambahkan:", foodEntry);
    setFoodEntry({
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
    });
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header Halaman */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
        Kalori Tracker
      </h1>
      <p className="text-gray-600 mb-8">
        Catat makanan Anda dan pantau asupan kalori serta nutrisi harian.
      </p>

      {/* Formulir Input Makanan */}
      <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Tambah Makanan Hari Ini
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Nama Makanan
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={foodEntry.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
              placeholder="Contoh: Nasi Goreng"
              required
            />
          </div>
          <div>
            <label
              htmlFor="calories"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Kalori (kcal)
            </label>
            <input
              type="number"
              id="calories"
              name="calories"
              value={foodEntry.calories}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
              placeholder="Jumlah kalori"
              required
            />
          </div>
          <div>
            <label
              htmlFor="protein"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Protein (g)
            </label>
            <input
              type="number"
              id="protein"
              name="protein"
              value={foodEntry.protein}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
              placeholder="Gram protein"
            />
          </div>
          <div>
            <label
              htmlFor="carbs"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Karbohidrat (g)
            </label>
            <input
              type="number"
              id="carbs"
              name="carbs"
              value={foodEntry.carbs}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
              placeholder="Gram karbohidrat"
            />
          </div>
          <div>
            <label
              htmlFor="fats"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Lemak (g)
            </label>
            <input
              type="number"
              id="fats"
              name="fats"
              value={foodEntry.fats}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
              placeholder="Gram lemak"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-[#B23501] text-white py-2.5 rounded-lg font-semibold hover:bg-[#F9A03F] transition-colors duration-200 flex items-center justify-center space-x-2 mt-4 md:mt-0"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Tambah</span>
            </button>
          </div>
        </form>
      </section>

      {/* Ringkasan Harian */}
      <section className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Ringkasan Harian
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="bg-[#F27F34]/20 p-4 rounded-full mb-2">
              <Flame className="h-10 w-10 text-[#B23501]" />
            </div>
            <p className="text-sm font-semibold text-gray-600">Kalori</p>
            <span className="text-xl font-bold text-[#34B26A]">
              {dailySummary.calories} / {dailySummary.targetCalories} kcal
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-[#F27F34]/20 p-4 rounded-full mb-2">
              <Fish className="h-10 w-10 text-[#B23501]" />
            </div>
            <p className="text-sm font-semibold text-gray-600">Protein</p>
            <span className="text-xl font-bold">{dailySummary.protein} g</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-[#F27F34]/20 p-4 rounded-full mb-2">
              <Leaf className="h-10 w-10 text-[#B23501]" />
            </div>
            <p className="text-sm font-semibold text-gray-600">Karbohidrat</p>
            <span className="text-xl font-bold">{dailySummary.carbs} g</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-[#F27F34]/20 p-4 rounded-full mb-2">
              <Heart className="h-10 w-10 text-[#B23501]" />
            </div>
            <p className="text-sm font-semibold text-gray-600">Lemak</p>
            <span className="text-xl font-bold">{dailySummary.fats} g</span>
          </div>
        </div>
        {/* Placeholder untuk riwayat makanan atau grafik */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Riwayat Makanan
          </h3>
          <div className="text-gray-500 text-center py-10 border border-gray-200 rounded-lg">
            Riwayat makanan yang dicatat akan muncul di sini.
          </div>
        </div>
      </section>
    </div>
  );
}

export default CalorieTracker;
