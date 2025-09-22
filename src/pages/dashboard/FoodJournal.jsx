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
  });
  const [journalHistory, setJournalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

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
      setLoading(false);
    });

    return () => unsubscribe();
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
        timestamp: serverTimestamp(),
        // Note: In production, you would upload to Firebase Storage first
        photoUrl: previewImage || null,
        date: format(new Date(), "yyyy-MM-dd"),
      });

      // Reset form
      setJournalEntry({
        name: "",
        time: "",
        notes: "",
        photo: null,
      });
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
                <input
                  type="text"
                  name="name"
                  value={journalEntry.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                  placeholder="Contoh: Sarapan Nasi Gudeg"
                  required
                />
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

                        {/* Delete button - visible on hover */}
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
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
