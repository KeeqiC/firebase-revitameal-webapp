// src/pages/admin/AdminGuide.jsx
import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import {
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Settings,
  Youtube,
  Clock,
  Flame,
  Search,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Activity,
  Star,
  Users,
  Database,
  Video,
} from "lucide-react";

// Initialize Firebase safely
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Mock useAuth hook
const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser({ uid: "x1QFpZjvvBfGLNugPfaXI3eF0zf1" });
    });
    return unsubscribe;
  }, []);

  return { currentUser };
};

function AdminGuide() {
  const { currentUser } = useAuth();

  // State for fitness video form
  const [videoData, setVideoData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    category: "cardio",
    level: "beginner",
    duration: "",
    calories: "",
    instructor: "",
    rating: "",
  });

  const [videosData, setVideosData] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingVideo, setEditingVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const adminUid = "x1QFpZjvvBfGLNugPfaXI3eF0zf1";

  // Video categories
  const videoCategories = [
    { value: "cardio", label: "Kardio" },
    { value: "strength", label: "Kekuatan" },
    { value: "flexibility", label: "Fleksibilitas" },
    { value: "hiit", label: "HIIT" },
    { value: "yoga", label: "Yoga" },
    { value: "abs", label: "Perut" },
  ];

  // Difficulty levels
  const difficultyLevels = [
    { value: "beginner", label: "Pemula" },
    { value: "intermediate", label: "Menengah" },
    { value: "advanced", label: "Lanjutan" },
  ];

  useEffect(() => {
    if (currentUser?.uid !== adminUid) return;

    // Load fitness videos from Firestore
    const videosQuery = query(
      collection(db, "revitameal_fitness_videos"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(videosQuery, (snapshot) => {
      const videos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVideosData(videos);
      setFilteredVideos(videos);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Filter functionality
  useEffect(() => {
    let filtered = videosData;
    if (searchTerm) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredVideos(filtered);
  }, [videosData, searchTerm]);

  const handleVideoChange = (e) => {
    const { name, value } = e.target;
    setVideoData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video.id);
    setVideoData({
      title: video.title || "",
      description: video.description || "",
      videoUrl: video.videoUrl || "",
      category: video.category || "cardio",
      level: video.level || "beginner",
      duration: video.duration || "",
      calories: video.calories || "",
      instructor: video.instructor || "",
      rating: video.rating || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus video ini?")) {
      try {
        await deleteDoc(doc(db, "revitameal_fitness_videos", id));
        showMessage("Video berhasil dihapus!", "success");
      } catch (error) {
        console.error("Gagal menghapus video:", error);
        showMessage("Gagal menghapus video. Silakan coba lagi.", "error");
      }
    }
  };

  const handleReset = () => {
    setEditingVideo(null);
    setVideoData({
      title: "",
      description: "",
      videoUrl: "",
      category: "cardio",
      level: "beginner",
      duration: "",
      calories: "",
      instructor: "",
      rating: "",
    });
    setShowForm(false);
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(""), 4000);
  };

  const extractYouTubeId = (url) => {
    if (!url) return "";
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newVideo = {
        title: videoData.title.trim(),
        description: videoData.description.trim(),
        videoUrl: videoData.videoUrl.trim(),
        category: videoData.category,
        level: videoData.level,
        duration: videoData.duration.trim(),
        calories: videoData.calories.trim(),
        instructor: videoData.instructor.trim(),
        rating: videoData.rating ? parseFloat(videoData.rating) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (editingVideo) {
        await updateDoc(
          doc(db, "revitameal_fitness_videos", editingVideo),
          { ...newVideo, createdAt: undefined } // Don't update createdAt when editing
        );
        showMessage("Video berhasil diperbarui!", "success");
      } else {
        await addDoc(collection(db, "revitameal_fitness_videos"), newVideo);
        showMessage("Video berhasil ditambahkan!", "success");
      }
      handleReset();
    } catch (error) {
      console.error("Gagal menyimpan video:", error);
      showMessage("Gagal menyimpan video. Silakan coba lagi.", "error");
    }
    setLoading(false);
  };

  const getCategoryLabel = (category) => {
    const cat = videoCategories.find((c) => c.value === category);
    return cat ? cat.label : category;
  };

  const getLevelLabel = (level) => {
    const lvl = difficultyLevels.find((l) => l.value === level);
    return lvl ? lvl.label : level;
  };

  const getLevelColor = (level) => {
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800",
    };
    return colors[level] || "bg-gray-100 text-gray-800";
  };

  if (currentUser?.uid !== adminUid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500/10 via-pink-500/10 to-red-600/20 flex justify-center items-center">
        <div className="text-center bg-white/80 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-2xl max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Akses Ditolak
          </h1>
          <p className="text-gray-600">
            Hanya admin yang dapat mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

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
              Revitameal Admin - Fitness Guide Management
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-800 mb-2">
            <span className="bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
              Admin
            </span>{" "}
            Fitness Guide
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Kelola database video panduan fitness untuk pengguna Revitameal
          </p>
        </header>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl shadow-xl flex items-center space-x-3 ${
              message.type === "success"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                : "bg-gradient-to-r from-red-500 to-pink-600 text-white"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="font-medium text-sm sm:text-base">
              {message.text}
            </span>
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-500">
                  Total Video
                </p>
                <p className="text-2xl sm:text-3xl font-black text-gray-800">
                  {videosData.length}
                </p>
              </div>
              <Video className="h-6 w-6 sm:h-8 sm:w-8 text-[#B23501]" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-500">
                  HIIT
                </p>
                <p className="text-2xl sm:text-3xl font-black text-gray-800">
                  {videosData.filter((v) => v.category === "hiit").length}
                </p>
              </div>
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-500">
                  Yoga
                </p>
                <p className="text-2xl sm:text-3xl font-black text-gray-800">
                  {videosData.filter((v) => v.category === "yoga").length}
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-500">
                  Kardio
                </p>
                <p className="text-2xl sm:text-3xl font-black text-gray-800">
                  {videosData.filter((v) => v.category === "cardio").length}
                </p>
              </div>
              <PlayCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-4 sm:p-6 rounded-3xl shadow-xl mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                {showForm ? (
                  <X className="h-4 w-4 relative z-10" />
                ) : (
                  <Plus className="h-4 w-4 relative z-10" />
                )}
                <span className="relative z-10 text-sm sm:text-base">
                  {showForm ? "Tutup Form" : "Tambah Video"}
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari video fitness..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full lg:w-64 pl-10 pr-4 py-2 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        {showForm && (
          <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 sm:p-8 rounded-3xl shadow-xl mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 mr-3 text-[#B23501]" />
                {editingVideo ? "Edit Video" : "Tambah Video Baru"}
              </h2>
              <Youtube className="h-5 w-5 text-[#B23501]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Judul Video *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={videoData.title}
                    onChange={handleVideoChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                    placeholder="Contoh: Full Body Workout untuk Pemula"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Kategori *
                  </label>
                  <select
                    name="category"
                    value={videoData.category}
                    onChange={handleVideoChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                    required
                  >
                    {videoCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  URL Video YouTube *
                </label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    name="videoUrl"
                    value={videoData.videoUrl}
                    onChange={handleVideoChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
                {videoData.videoUrl && extractYouTubeId(videoData.videoUrl) && (
                  <div className="mt-3">
                    <p className="text-sm text-green-600 mb-2">Preview:</p>
                    <div className="aspect-video w-full max-w-md">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${extractYouTubeId(
                          videoData.videoUrl
                        )}`}
                        title="Video Preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Deskripsi *
                </label>
                <textarea
                  name="description"
                  value={videoData.description}
                  onChange={handleVideoChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Deskripsikan video latihan ini..."
                  required
                />
              </div>

              {/* Level and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Level Kesulitan *
                  </label>
                  <select
                    name="level"
                    value={videoData.level}
                    onChange={handleVideoChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                    required
                  >
                    {difficultyLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Durasi
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="duration"
                      value={videoData.duration}
                      onChange={handleVideoChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                      placeholder="30 Menit"
                    />
                  </div>
                </div>
              </div>

              {/* Calories and Instructor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Kalori yang Dibakar
                  </label>
                  <div className="relative">
                    <Flame className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="calories"
                      value={videoData.calories}
                      onChange={handleVideoChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                      placeholder="150-200 kcal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Instruktur
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="instructor"
                      value={videoData.instructor}
                      onChange={handleVideoChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                      placeholder="Nama Instruktur"
                    />
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Rating (1-5)
                  </label>
                  <div className="relative">
                    <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      name="rating"
                      value={videoData.rating}
                      onChange={handleVideoChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                      placeholder="4.5"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10"></div>
                  ) : (
                    <Save className="h-5 w-5 relative z-10" />
                  )}
                  <span className="relative z-10">
                    {loading
                      ? "Menyimpan..."
                      : editingVideo
                      ? "Update Video"
                      : "Simpan Video"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-8 py-3 rounded-full bg-gray-300 text-gray-800 font-bold shadow-lg hover:shadow-xl hover:bg-gray-400 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <X className="h-5 w-5" />
                  <span>Reset</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Data Display Section */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 sm:p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Database className="h-6 w-6 mr-3 text-[#B23501]" />
              Database Video Fitness
            </h2>
            <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">
              {filteredVideos.length} dari {videosData.length} video
            </span>
          </div>

          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredVideos.map((video) => {
                const youtubeId = extractYouTubeId(video.videoUrl);

                return (
                  <div
                    key={video.id}
                    className="group relative overflow-hidden bg-gradient-to-br from-white/50 to-white/30 p-6 rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col space-y-4">
                      {/* Video Preview */}
                      <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                        {youtubeId ? (
                          <iframe
                            className="w-full h-full"
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
                      </div>

                      {/* Video Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-2">
                              {video.title}
                            </h3>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="px-2 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
                                {getCategoryLabel(video.category)}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(
                                  video.level
                                )}`}
                              >
                                {getLevelLabel(video.level)}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() => handleEditVideo(video)}
                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                              title="Edit video"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(video.id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                              title="Hapus video"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {video.description}
                        </p>

                        {/* Video Stats */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          {video.duration && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{video.duration}</span>
                            </div>
                          )}
                          {video.calories && (
                            <div className="flex items-center">
                              <Flame className="h-3 w-3 mr-1" />
                              <span>{video.calories}</span>
                            </div>
                          )}
                          {video.instructor && (
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              <span>{video.instructor}</span>
                            </div>
                          )}
                          {video.rating && (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 mr-1 text-yellow-500" />
                              <span>{video.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50/50 to-gray-100/50 rounded-2xl border border-gray-200/50">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {searchTerm
                  ? "Tidak Ada Video Ditemukan"
                  : "Database Video Kosong"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm
                  ? "Coba ubah kata kunci pencarian."
                  : "Mulai tambahkan video fitness untuk pengguna."}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminGuide;
