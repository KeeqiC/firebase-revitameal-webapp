// src/pages/dashboard/FoodJournal.jsx
import { useState } from "react";
import { PlusCircle, Camera, FileText } from "lucide-react";

function FoodJournal() {
  const [journalEntry, setJournalEntry] = useState({
    name: "",
    time: "",
    photo: null,
  });

  const [journalHistory, setJournalHistory] = useState([
    // Data dummy untuk riwayat
    {
      id: 1,
      name: "Salad Ayam",
      time: "12:30 PM",
      date: "28/11/2024",
      photoUrl: "https://via.placeholder.com/150x150.png?text=Salad",
    },
    {
      id: 2,
      name: "Smoothie Pisang",
      time: "08:00 AM",
      date: "28/11/2024",
      photoUrl: "https://via.placeholder.com/150x150.png?text=Smoothie",
    },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJournalEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setJournalEntry((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic untuk mengunggah foto dan menyimpan data ke database
    console.log("Jurnal Ditambahkan:", journalEntry);
    setJournalHistory((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: journalEntry.name,
        time: "Sekarang", // Ganti dengan waktu asli
        date: "Hari ini", // Ganti dengan tanggal asli
        photoUrl: journalEntry.photo
          ? URL.createObjectURL(journalEntry.photo)
          : null,
      },
    ]);
    // Reset form
    setJournalEntry({
      name: "",
      time: "",
      photo: null,
    });
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header Halaman */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
        Food Journal
      </h1>
      <p className="text-gray-600 mb-8">
        Catat apa yang Anda makan dan perhatikan pola makan Anda.
      </p>

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
                  <h3 className="font-semibold text-gray-800">{entry.name}</h3>
                  <p className="text-sm text-gray-500">
                    {entry.date} - {entry.time}
                  </p>
                </div>
                <FileText className="h-6 w-6 text-[#B23501] flex-shrink-0" />
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
