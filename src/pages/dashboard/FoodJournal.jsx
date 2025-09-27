// src/pages/dashboard/FoodJournal.jsx
import { useState, useEffect } from "react";
import {
  PlusCircle,
  Camera,
  FileText,
  Clock,
  ImageIcon,
  BookOpen,
  Calendar,
  Sparkles,
  Activity,
  Eye,
  Upload,
  X,
  CheckCircle,
  Plus,
  Flame,
  Target,
  TrendingUp,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  serverTimestamp,
  addDoc,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { format } from "date-fns";
import { id } from "date-fns/locale";

function FoodJournal() {
  const { currentUser } = useAuth();
  const [journalEntry, setJournalEntry] = useState({
    name: "",
    time: "",
    notes: "",
    photo: null,
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });
  const [journalHistory, setJournalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [dailyStats, setDailyStats] = useState({
    totalEntries: 0,
    trackedEntries: 0,
    estimatedCalories: 0,
  });
  const [isCustomFood, setIsCustomFood] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const journalRef = collection(db, "users", currentUser.uid, "foodJournal");
    const q = query(journalRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setJournalHistory(entries);

      const today = format(new Date(), "yyyy-MM-dd");
      const todayEntries = entries.filter((entry) => entry.date === today);
      const trackedEntries = todayEntries.filter(
        (entry) => entry.addedToTracker
      );
      const estimatedCalories = todayEntries.reduce(
        (sum, entry) => sum + (entry.calories || 0),
        0
      );

      setDailyStats({
        totalEntries: todayEntries.length,
        trackedEntries: trackedEntries.length,
        estimatedCalories,
      });

      setLoading(false);
    });

    const menuCollectionRef = collection(db, "revitameal_menu_templates");
    const unsubMenu = onSnapshot(menuCollectionRef, (snapshot) => {
      const menu = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuData(menu);
    });

    return () => {
      unsubscribe();
      unsubMenu();
    };
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJournalEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setJournalEntry((prev) => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setJournalEntry((prev) => ({ ...prev, photo: null }));
    setPreviewImage(null);
    // Reset file input
    const fileInput = document.getElementById("photo-upload");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !journalEntry.name.trim()) return;

    // Validation for custom food
    if (isCustomFood && (!journalEntry.calories || journalEntry.calories <= 0)) {
      alert("Untuk makanan custom, harap masukkan informasi kalori yang valid.");
      return;
    }

    setSubmitting(true);
    try {
      const journalRef = collection(
        db,
        "users",
        currentUser.uid,
        "foodJournal"
      );
      await addDoc(journalRef, {
        name: journalEntry.name.trim(),
        time: journalEntry.time,
        notes: journalEntry.notes.trim() || "",
        calories: parseInt(journalEntry.calories) || 0,
        protein: parseFloat(journalEntry.protein) || 0,
        carbs: parseFloat(journalEntry.carbs) || 0,
        fats: parseFloat(journalEntry.fats) || 0,
        timestamp: serverTimestamp(),
        photoUrl: previewImage || null,
        date: format(new Date(), "yyyy-MM-dd"),
        addedToTracker: false,
        isCustomFood: isCustomFood,
        source: isCustomFood ? "custom" : "menu",
      });

      // Reset form
      setJournalEntry({
        name: "",
        time: "",
        notes: "",
        photo: null,
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      });
      setIsCustomFood(false);
      setPreviewImage(null);

      // Reset file input
      const fileInput = document.getElementById("photo-upload");
      if (fileInput) fileInput.value = "";

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Gagal menambahkan entri jurnal:", error);
      alert("Gagal menambahkan entri jurnal.");
    }
    setSubmitting(false);
  };

  const deleteEntry = async (entryId) => {
    if (!window.confirm("Yakin ingin menghapus catatan ini?")) return;

    try {
      await deleteDoc(
        doc(db, "users", currentUser.uid, "foodJournal", entryId)
      );
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Gagal menghapus catatan.");
    }
  };

  const addToCalorieTracker = async (entry) => {
    if (!entry.calories || entry.calories <= 0) {
      alert(
        "Entry ini tidak memiliki data kalori. Tambahkan kalori terlebih dahulu untuk melakukan tracking."
      );
      return;
    }

    if (entry.addedToTracker) {
      alert("Entry ini sudah ditambahkan ke Calorie Tracker.");
      return;
    }

    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const logDocRef = doc(db, "users", currentUser.uid, "dailyLogs", today);
      const mealsCollectionRef = collection(logDocRef, "meals");

      // Add to calorie tracker
      await addDoc(mealsCollectionRef, {
        name: entry.name,
        calories: entry.calories || 0,
        protein: entry.protein || 0,
        carbs: entry.carbs || 0,
        fats: entry.fats || 0,
        fromJournal: true,
        journalEntryId: entry.id,
        timestamp: serverTimestamp(),
      });

      // Update daily totals (get current totals first)
      // This would need to be implemented properly with a transaction

      // Mark entry as added to tracker
      await doc(db, "users", currentUser.uid, "foodJournal", entry.id).update({
        addedToTracker: true,
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding to calorie tracker:", error);
      alert("Gagal menambahkan ke Calorie Tracker.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F27F34] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">
            Memuat jurnal makanan...
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

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Food Tracking
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">
            <span className="bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
              Food
            </span>{" "}
            Journal
          </h1>
          <p className="text-xl text-gray-600">
            Catat dan pantau pola makan harian Anda dengan mudah
          </p>
        </header>

        {/* Daily Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-2">
              Catatan Hari Ini
            </p>
            <h3 className="text-2xl font-black text-gray-800">
              {dailyStats.totalEntries}
            </h3>
            <span className="text-sm text-gray-500">entries</span>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-2">
              Sudah di-Track
            </p>
            <h3 className="text-2xl font-black text-gray-800">
              {dailyStats.trackedEntries}
            </h3>
            <span className="text-sm text-gray-500">
              dari {dailyStats.totalEntries}
            </span>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <Activity className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-2">
              Est. Kalori
            </p>
            <h3 className="text-2xl font-black text-gray-800">
              {dailyStats.estimatedCalories}
            </h3>
            <span className="text-sm text-gray-500">kcal</span>
          </div>
        </section>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-xl flex items-center space-x-3">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Catatan berhasil ditambahkan!</span>
          </div>
        )}

        {/* Add New Entry Form */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <PlusCircle className="h-6 w-6 mr-3 text-[#B23501]" />
              Tambah Catatan Baru
            </h2>
            <Sparkles className="h-5 w-5 text-[#B23501]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nama Makanan / Waktu Makan
                </label>
                {/* Toggle between menu and custom */}
                <div className="mb-3 flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomFood(false);
                      setJournalEntry((prev) => ({
                        ...prev,
                        name: "",
                        calories: "",
                        protein: "",
                        carbs: "",
                        fats: "",
                      }));
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !isCustomFood
                        ? "bg-[#F27F34] text-white shadow-md"
                        : "bg-white/50 text-gray-600 hover:bg-white/70"
                    }`}
                  >
                    Dari Menu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomFood(true);
                      setJournalEntry((prev) => ({
                        ...prev,
                        name: "",
                        calories: "",
                        protein: "",
                        carbs: "",
                        fats: "",
                      }));
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isCustomFood
                        ? "bg-[#F27F34] text-white shadow-md"
                        : "bg-white/50 text-gray-600 hover:bg-white/70"
                    }`}
                  >
                    Makanan Custom
                  </button>
                </div>

                {isCustomFood ? (
                  /* Custom Food Input */
                  <input
                    type="text"
                    name="name"
                    value={journalEntry.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                    placeholder="Contoh: Bakso Malang, Soto Ayam, dll"
                    required
                  />
                ) : (
                  /* Menu Selection */
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="name"
                      value={journalEntry.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                      placeholder="Ketik nama makanan atau pilih dari menu"
                      required
                    />

                    {/* Quick Select dari Menu */}
                    <div>
                      <p className="text-xs text-gray-600 mb-2">
                        Pilih dari menu Revitameal:
                      </p>
                      <select
                        onChange={(e) => {
                          const selectedMenu = menuData.find(
                            (m) => m.id === e.target.value
                          );
                          if (selectedMenu) {
                            setJournalEntry((prev) => ({
                              ...prev,
                              name: selectedMenu.name,
                              calories: selectedMenu.calories || "",
                              protein: selectedMenu.protein || "",
                              carbs: selectedMenu.carbs || "",
                              fats: selectedMenu.fats || "",
                            }));
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-white/50 border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50"
                      >
                        <option value="">Pilih dari menu...</option>
                        {menuData.map((menu) => (
                          <option key={menu.id} value={menu.id}>
                            {menu.name} - {menu.calories || 0} kcal
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Waktu
                </label>
                <input
                  type="time"
                  name="time"
                  value={journalEntry.time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Nutrition Fields */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Informasi Nutrisi {isCustomFood ? "(Wajib untuk custom food)" : "(Opsional)"}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <input
                    type="number"
                    name="calories"
                    value={journalEntry.calories}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50"
                    placeholder="Kalori"
                    min="0"
                  />
                  <span className="text-xs text-gray-500">kcal</span>
                </div>
                <div>
                  <input
                    type="number"
                    name="protein"
                    value={journalEntry.protein}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50"
                    placeholder="Protein"
                    min="0"
                    step="0.1"
                  />
                  <span className="text-xs text-gray-500">gram</span>
                </div>
                <div>
                  <input
                    type="number"
                    name="carbs"
                    value={journalEntry.carbs}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50"
                    placeholder="Karbo"
                    min="0"
                    step="0.1"
                  />
                  <span className="text-xs text-gray-500">gram</span>
                </div>
                <div>
                  <input
                    type="number"
                    name="fats"
                    value={journalEntry.fats}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50"
                    placeholder="Lemak"
                    min="0"
                    step="0.1"
                  />
                  <span className="text-xs text-gray-500">gram</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                name="notes"
                value={journalEntry.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Bagaimana rasa makanannya? Porsinya? Perasaan setelah makan?"
              />
            </div>

            {/* Photo Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Foto Makanan (Opsional)
              </label>

              {!previewImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#F27F34] transition-colors duration-300">
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer group"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-[#F27F34] to-[#B23501] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-600 font-medium mb-2">
                      Klik untuk upload foto
                    </p>
                    <p className="text-gray-500 text-sm">
                      Maksimal 5MB, format JPG/PNG
                    </p>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !journalEntry.name.trim()}
              className="group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-3 w-full justify-center"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10"></div>
              ) : (
                <PlusCircle className="h-5 w-5 relative z-10" />
              )}
              <span className="relative z-10">
                {submitting ? "Menyimpan..." : "Tambah Catatan"}
              </span>
              {!submitting && <Upload className="h-5 w-5 relative z-10" />}
            </button>
          </form>
        </section>

        {/* Journal History */}
        <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <BookOpen className="h-6 w-6 mr-3 text-[#B23501]" />
              Riwayat Jurnal Makanan
            </h2>
            <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">
              {journalHistory.length} catatan
            </span>
          </div>

          {journalHistory.length > 0 ? (
            <div className="space-y-4">
              {journalHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="group relative overflow-hidden bg-gradient-to-br from-white/50 to-white/30 p-6 rounded-2xl border border-white/20 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    {/* Photo or Icon */}
                    <div className="flex-shrink-0">
                      {entry.photoUrl ? (
                        <img
                          src={entry.photoUrl}
                          alt={entry.name}
                          className="w-16 h-16 rounded-xl object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg mb-1">
                            {entry.name}
                          </h3>
                          {entry.isCustomFood && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              Custom
                            </span>
                          )}

                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{entry.time || "Waktu tidak dicatat"}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {entry.timestamp && entry.timestamp.toDate
                                  ? format(
                                      entry.timestamp.toDate(),
                                      "d MMM yyyy",
                                      { locale: id }
                                    )
                                  : "Tanggal tidak tersedia"}
                              </span>
                            </span>
                          </div>

                          {entry.notes && (
                            <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                              "{entry.notes}"
                            </p>
                          )}
                        </div>

                        {/* Nutrition Info */}
                        {(entry.calories > 0 ||
                          entry.protein > 0 ||
                          entry.carbs > 0 ||
                          entry.fats > 0) && (
                          <div className="flex items-center space-x-4 text-xs text-gray-500 bg-gradient-to-r from-orange-50 to-red-50 px-3 py-2 rounded-lg mb-3">
                            {entry.calories > 0 && (
                              <span className="flex items-center space-x-1">
                                <Flame className="h-3 w-3 text-orange-500" />
                                <span>{entry.calories} kcal</span>
                              </span>
                            )}
                            {entry.protein > 0 && (
                              <span className="flex items-center space-x-1">
                                <Activity className="h-3 w-3 text-blue-500" />
                                <span>{entry.protein}g protein</span>
                              </span>
                            )}
                            {entry.carbs > 0 && (
                              <span>{entry.carbs}g karbo</span>
                            )}
                            {entry.fats > 0 && <span>{entry.fats}g lemak</span>}
                          </div>
                        )}

                        {/* Status badge */}
                        {entry.addedToTracker && (
                          <span className="inline-flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                            <CheckCircle className="h-3 w-3" />
                            <span>Sudah di-track</span>
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {!entry.addedToTracker && entry.calories > 0 && (
                          <button
                            onClick={() => addToCalorieTracker(entry)}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                            title="Tambah ke Calorie Tracker"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          title="Hapus catatan"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50/50 to-gray-100/50 rounded-2xl border border-gray-200/50">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Belum Ada Catatan
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Mulai catat makanan Anda hari ini untuk membangun kebiasaan
                makan yang lebih sehat.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                <Activity className="h-4 w-4" />
                <span>Konsistensi adalah kunci kesuksesan</span>
              </div>
            </div>
          )}
        </section>

        {/* Tips Section */}
        <section className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-bold text-gray-800">Tips Food Journal</h3>
          </div>
          <ul className="text-gray-600 text-sm space-y-2">
            <li>
              • Catat makanan segera setelah makan untuk hasil yang lebih akurat
            </li>
            <li>• Tambahkan foto untuk dokumentasi visual yang membantu</li>
            <li>• Tulis catatan tentang perasaan dan kondisi saat makan</li>
            <li>• Review jurnal mingguan untuk mengidentifikasi pola makan</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default FoodJournal;
