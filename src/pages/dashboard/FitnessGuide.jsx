// src/pages/dashboard/FitnessGuide.jsx
import { useState, useEffect } from "react";
import {
  Dumbbell,
  Youtube,
  PlayCircle,
  Clock,
  Flame,
  Search,
  Filter,
  Activity,
  Heart,
  Target,
  Zap,
  ChevronRight,
  Star,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
// Firebase imports (adjust path as needed)
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
} from "firebase/firestore";

// Initialize Firebase safely
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

function FitnessGuide() {
  const [fitnessVideos, setFitnessVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  // Video categories for filtering
  const videoCategories = [
    { value: "all", label: "Semua Video", color: "from-gray-500 to-gray-600" },
    { value: "cardio", label: "Kardio", color: "from-red-500 to-pink-600" },
    {
      value: "strength",
      label: "Kekuatan",
      color: "from-blue-500 to-indigo-600",
    },
    {
      value: "flexibility",
      label: "Fleksibilitas",
      color: "from-green-500 to-emerald-600",
    },
    { value: "hiit", label: "HIIT", color: "from-orange-500 to-red-600" },
    { value: "yoga", label: "Yoga", color: "from-purple-500 to-violet-600" },
    { value: "abs", label: "Perut", color: "from-yellow-500 to-orange-500" },
  ];

  const difficultyLevels = [
    { value: "all", label: "Semua Level" },
    { value: "beginner", label: "Pemula" },
    { value: "intermediate", label: "Menengah" },
    { value: "advanced", label: "Lanjutan" },
  ];

  // Load fitness videos from Firestore
  useEffect(() => {
    setLoading(true);

    const videosQuery = query(
      collection(db, "revitameal_fitness_videos"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      videosQuery,
      (snapshot) => {
        const videos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFitnessVideos(videos);
        setFilteredVideos(videos);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading fitness videos:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter functionality
  useEffect(() => {
    let filtered = fitnessVideos;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (video) => video.category === selectedCategory
      );
    }

    // Level filter
    if (selectedLevel !== "all") {
      filtered = filtered.filter((video) => video.level === selectedLevel);
    }

    setFilteredVideos(filtered);
  }, [fitnessVideos, searchTerm, selectedCategory, selectedLevel]);

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url) => {
    if (!url) return "";
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  };

  // Get category info
  const getCategoryInfo = (category) => {
    return (
      videoCategories.find((cat) => cat.value === category) ||
      videoCategories[0]
    );
  };

  // Get level color
  const getLevelColor = (level) => {
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800",
    };
    return colors[level] || "bg-gray-100 text-gray-800";
  };

  // Get level text
  const getLevelText = (level) => {
    const levels = {
      beginner: "Pemula",
      intermediate: "Menengah",
      advanced: "Lanjutan",
    };
    return levels[level] || level;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F27F34]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#B23501]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FFD580]/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Revitameal Fitness Guide
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-800 mb-2">
            <span className="bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
              Panduan
            </span>{" "}
            Fitness
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl">
            Temukan video panduan latihan profesional untuk mendukung perjalanan
            kebugaran dan kesehatan Anda
          </p>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-500">
                  Total Video
                </p>
                <p className="text-2xl sm:text-3xl font-black text-gray-800">
                  {fitnessVideos.length}
                </p>
              </div>
              <Youtube className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-500">
                  Kategori
                </p>
                <p className="text-2xl sm:text-3xl font-black text-gray-800">
                  {videoCategories.length - 1}
                </p>
              </div>
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-500">
                  HIIT
                </p>
                <p className="text-2xl sm:text-3xl font-black text-gray-800">
                  {fitnessVideos.filter((v) => v.category === "hiit").length}
                </p>
              </div>
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-500">
                  Yoga
                </p>
                <p className="text-2xl sm:text-3xl font-black text-gray-800">
                  {fitnessVideos.filter((v) => v.category === "yoga").length}
                </p>
              </div>
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            </div>
          </div>
        </section>

        {/* Search and Filter Controls */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 sm:p-6 rounded-3xl shadow-xl mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari video latihan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
              >
                {videoCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="flex-shrink-0">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
              >
                {difficultyLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Video Grid */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 sm:p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <PlayCircle className="h-6 w-6 mr-3 text-[#B23501]" />
              Video Panduan Latihan
            </h2>
            <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">
              {filteredVideos.length} video tersedia
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-full animate-pulse flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600">Memuat video...</p>
              </div>
            </div>
          ) : filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => {
                const categoryInfo = getCategoryInfo(video.category);
                const youtubeId = extractYouTubeId(video.videoUrl);

                return (
                  <div
                    key={video.id}
                    className="group bg-gradient-to-br from-white/50 to-white/30 rounded-2xl border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video bg-gray-100">
                      {youtubeId ? (
                        <iframe
                          className="w-full h-full rounded-t-2xl"
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <Youtube className="h-12 w-12 text-gray-400" />
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-3 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r ${categoryInfo.color}`}
                        >
                          {categoryInfo.label}
                        </span>
                      </div>

                      {/* Level Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(
                            video.level
                          )}`}
                        >
                          {getLevelText(video.level)}
                        </span>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="p-5">
                      <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">
                        {video.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {video.description}
                      </p>

                      {/* Video Stats */}
                      <div className="flex items-center justify-between text-gray-500 text-sm mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{video.duration || "N/A"}</span>
                          </div>
                          <div className="flex items-center">
                            <Flame className="h-4 w-4 mr-1" />
                            <span>{video.calories || "N/A"}</span>
                          </div>
                        </div>
                        {video.rating && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            <span>{video.rating}</span>
                          </div>
                        )}
                      </div>

                      {/* Additional Info */}
                      {video.instructor && (
                        <div className="flex items-center text-gray-500 text-sm mb-3">
                          <Users className="h-4 w-4 mr-1" />
                          <span>Instruktur: {video.instructor}</span>
                        </div>
                      )}

                      {/* Watch Button */}
                      {youtubeId && (
                        <a
                          href={`https://www.youtube.com/watch?v=${youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/btn w-full bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-300 hover:scale-105"
                        >
                          <PlayCircle className="h-5 w-5" />
                          <span>Tonton di YouTube</span>
                          <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50/50 to-gray-100/50 rounded-2xl border border-gray-200/50">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Tidak Ada Video Ditemukan
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Coba ubah kata kunci pencarian atau filter kategori.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedLevel("all");
                }}
                className="bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
              >
                Reset Filter
              </button>
            </div>
          )}
        </section>

        {/* Admin Guide Link - Only show for admin users */}
        <div className="mt-8 text-center">
          <Link
            to="/admin-guide"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-[#F27F34] transition-colors text-sm"
          >
            <span>Admin Guide</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FitnessGuide;
