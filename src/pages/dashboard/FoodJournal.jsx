// src/pages/dashboard/FoodJournal.jsx
import { useState, useEffect } from "react";
import { PlusCircle, Camera, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";

function FoodJournal() {
  const { currentUser } = useAuth();
  const [journalEntry, setJournalEntry] = useState({
    name: "",
    time: "",
    photo: null,
  });
  const [journalHistory, setJournalHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data riwayat jurnal secara real-time
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const journalRef = collection(db, "users", currentUser.uid, "foodJournal");
    const q = query(journalRef);

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
    setJournalEntry((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const journalRef = collection(
        db,
        "users",
        currentUser.uid,
        "foodJournal"
      );
      await addDoc(journalRef, {
        name: journalEntry.name,
        time: journalEntry.time,
        timestamp: serverTimestamp(),
        // Unggah foto ke Firebase Storage akan ditambahkan di sini
        photoUrl: journalEntry.photo
          ? URL.createObjectURL(journalEntry.photo)
          : null,
      });

      // Reset form
      setJournalEntry({
        name: "",
        time: "",
        photo: null,
      });
    } catch (error) {
      console.error("Gagal menambahkan entri jurnal:", error);
      alert("Gagal menambahkan entri jurnal.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-xl text-gray-500">Memuat riwayat jurnal...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Food Journal
        </h1>
        <p className="text-gray-600">
          Catat apa yang Anda makan dan perhatikan pola makan Anda.
        </p>
      </div>

      {/* Formulir Catatan */}
      <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Tambah Catatan Baru
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={journalEntry.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
              placeholder="Contoh: Makan Siang"
              required
            />
          </div>
          <div>
            <label
              htmlFor="time"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Waktu
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={journalEntry.time}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Unggah Foto Makanan
            </label>
            <div className="flex items-center space-x-4">
              <label
                htmlFor="photo-upload"
                className="cursor-pointer bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                <Camera className="h-5 w-5 inline-block mr-2" /> Pilih Foto
              </label>
              <input
                id="photo-upload"
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {journalEntry.photo && (
                <span className="text-gray-600 truncate">
                  {journalEntry.photo.name}
                </span>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[#B23501] text-white py-2.5 rounded-lg font-semibold hover:bg-[#F9A03F] transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Tambah Catatan</span>
          </button>
        </form>
      </section>

      {/* Riwayat Jurnal */}
      <section className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Riwayat Jurnal Anda
        </h2>
        <div className="space-y-4">
          {journalHistory.length > 0 ? (
            journalHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200"
              >
                {entry.photoUrl && (
                  <img
                    src={entry.photoUrl}
                    alt={entry.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{entry.name}</p>
                  <p className="text-sm text-gray-500">
                    {entry.timestamp?.toDate().toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              Belum ada catatan makanan.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default FoodJournal;
