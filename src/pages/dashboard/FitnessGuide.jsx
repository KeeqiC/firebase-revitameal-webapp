// src/pages/dashboard/FitnessGuide.jsx
import { useState } from "react";
import { Dumbbell, Heart, StretchHorizontal, PlayCircle } from "lucide-react";

const workoutData = [
  {
    id: 1,
    name: "Latihan Kardio Intensitas Tinggi (HIIT)",
    description: "Meningkatkan detak jantung dan membakar lemak.",
    category: "cardio",
    videoUrl: "https://www.youtube.com/watch?v=zoG5Jm6x51I",
    imageUrl: "https://via.placeholder.com/400x300.png?text=Cardio",
  },
  {
    id: 2,
    name: "Latihan Kekuatan Tubuh Atas",
    description: "Membangun otot lengan, bahu, dan dada tanpa alat.",
    category: "strength",
    videoUrl: "https://www.youtube.com/watch?v=M5KxQJ9tO3s",
    imageUrl: "https://via.placeholder.com/400x300.png?text=Strength",
  },
  {
    id: 3,
    name: "Yoga untuk Fleksibilitas",
    description: "Meningkatkan kelenturan dan meredakan stres.",
    category: "flexibility",
    videoUrl: "https://www.youtube.com/watch?v=zoG5Jm6x51I",
    imageUrl: "https://via.placeholder.com/400x300.png?text=Yoga",
  },
  {
    id: 4,
    name: "Latihan Otot Perut",
    description: "Membangun otot inti dan meratakan perut.",
    category: "strength",
    videoUrl: "https://www.youtube.com/watch?v=M5KxQJ9tO3s",
    imageUrl: "https://via.placeholder.com/400x300.png?text=Abs",
  },
  {
    id: 5,
    name: "Peregangan Pagi",
    description: "Mempersiapkan tubuh untuk beraktivitas.",
    category: "flexibility",
    videoUrl: "https://www.youtube.com/watch?v=zoG5Jm6x51I",
    imageUrl: "https://via.placeholder.com/400x300.png?text=Stretching",
  },
];

function FitnessGuide() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredWorkouts = workoutData.filter((workout) =>
    selectedCategory === "all" ? true : workout.category === selectedCategory
  );

  return (
    <div className="p-6 md:p-8">
      {/* Header Halaman */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
        Panduan Fitness
      </h1>
      <p className="text-gray-600 mb-8">
        Temukan panduan latihan yang sesuai dengan tujuan kebugaran Anda.
      </p>

      {/* Filter Kategori */}
      <div className="flex flex-wrap gap-3 mb-8">
        {["all", "cardio", "strength", "flexibility"].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-semibold capitalize transition-colors duration-200 ${
              selectedCategory === category
                ? "bg-[#F27F34] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {category === "all" ? "Semua Latihan" : category}
          </button>
        ))}
      </div>

      {/* Daftar Latihan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
            >
              <div className="h-48 relative">
                <img
                  src={workout.imageUrl}
                  alt={workout.name}
                  className="w-full h-full object-cover"
                />
                <a
                  href={workout.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 hover:opacity-100 transition-opacity duration-300"
                >
                  <PlayCircle className="h-16 w-16" />
                </a>
              </div>
              <div className="p-4 flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {workout.name}
                </h3>
                <p className="text-gray-500 text-sm mb-2">
                  {workout.description}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="px-2 py-1 text-xs font-semibold text-[#B23501] bg-[#F27F34]/20 rounded-full capitalize">
                    {workout.category}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-500">
            Tidak ada latihan yang sesuai dengan filter Anda.
          </div>
        )}
      </div>
    </div>
  );
}

export default FitnessGuide;
