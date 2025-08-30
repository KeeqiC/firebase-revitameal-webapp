// src/pages/dashboard/FitnessGuide.jsx
import { Dumbbell, Youtube, PlayCircle, Clock, Flame } from "lucide-react";
import { Link } from "react-router-dom";

function FitnessGuide() {
  const fitnessVideos = [
    {
      id: 1,
      title: "Full Body Workout untuk Pemula",
      description:
        "Latihan yang sempurna untuk membangun kekuatan dan daya tahan di seluruh tubuh.",
      duration: "30 Menit",
      calories: "150-200 kcal",
      youtubeId: "JHmTr6tOW2w",
    },
    {
      id: 2,
      title: "Latihan Kardio Intensitas Tinggi (HIIT)",
      description:
        "Bakar lemak dengan cepat dan tingkatkan metabolisme Anda dengan sesi HIIT ini.",
      duration: "15 Menit",
      calories: "180-250 kcal",
      youtubeId: "Fc85U3UgC0E",
    },
    {
      id: 3,
      title: "Yoga untuk Relaksasi & Fleksibilitas",
      description:
        "Sesi yoga lembut untuk mengurangi stres dan meningkatkan kelenturan tubuh.",
      duration: "10 Menit",
      calories: "80-120 kcal",
      youtubeId: "ZgNhZgz_SVA",
    },
    {
      id: 4,
      title: "Latihan Otot Perut (Abs) Cepat",
      description:
        "Kuatkan inti tubuh Anda dengan latihan perut yang efektif ini.",
      duration: "10 Menit",
      calories: "100-150 kcal",
      youtubeId: "rwfUOrhODY4",
    },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Panduan Fitness
        </h1>
        <p className="text-gray-600">
          Temukan panduan latihan dan video untuk mendukung perjalanan kebugaran
          Anda.
        </p>
      </div>

      {/* Daftar Panduan Video */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Video Panduan Latihan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fitnessVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="relative aspect-video">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-lg mb-2">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {video.description}
                </p>
                <div className="flex items-center space-x-4 text-gray-500 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{video.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Flame className="h-4 w-4 mr-1" />
                    <span>{video.calories}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default FitnessGuide;
