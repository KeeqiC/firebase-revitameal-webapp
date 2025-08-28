// src/pages/dashboard/Profile.jsx
import { useState, useEffect } from "react";
import { User, Mail, Target, Settings, Save } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    currentWeight: "",
    targetWeight: "",
    dietGoal: "",
    foodAllergies: "",
  });
  const [loading, setLoading] = useState(true);

  // Ambil data profil dari Firestore saat komponen dimuat
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          console.log("Tidak ada dokumen profil untuk pengguna ini!");
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, profile);
      alert("Profil berhasil diperbarui!");
    } catch (err) {
      console.error("Gagal memperbarui profil:", err);
      alert("Gagal memperbarui profil.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-500">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Profil & Pengaturan
        </h1>
        <p className="text-gray-600">
          Kelola informasi dan preferensi akun Anda di sini.
        </p>
      </div>

      {/* Formulir Informasi Pribadi */}
      <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <User className="h-6 w-6 text-[#B23501]" />
          <span>Informasi Pribadi</span>
        </h2>
        <form className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Nama Lengkap
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
              disabled
            />
            <p className="mt-1 text-xs text-gray-500">
              Email tidak bisa diubah.
            </p>
          </div>
        </form>
      </section>

      {/* Formulir Preferensi Diet */}
      <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Target className="h-6 w-6 text-[#B23501]" />
          <span>Preferensi Diet</span>
        </h2>
        <form className="space-y-6">
          <div>
            <label
              htmlFor="currentWeight"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Berat Badan Saat Ini (kg)
            </label>
            <input
              type="number"
              id="currentWeight"
              name="currentWeight"
              value={profile.currentWeight}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
            />
          </div>
          <div>
            <label
              htmlFor="targetWeight"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Berat Badan Target (kg)
            </label>
            <input
              type="number"
              id="targetWeight"
              name="targetWeight"
              value={profile.targetWeight}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
            />
          </div>
          <div>
            <label
              htmlFor="dietGoal"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Tujuan Diet Utama
            </label>
            <select
              id="dietGoal"
              name="dietGoal"
              value={profile.dietGoal}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
            >
              <option value="">Pilih Tujuan</option>
              <option value="weight-loss">Menurunkan Berat Badan</option>
              <option value="muscle-gain">Menambah Massa Otot</option>
              <option value="healthy-living">Gaya Hidup Sehat</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="foodAllergies"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Alergi Makanan (opsional)
            </label>
            <input
              type="text"
              id="foodAllergies"
              name="foodAllergies"
              value={profile.foodAllergies}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B23501]"
              placeholder="Contoh: kacang, seafood"
            />
          </div>
        </form>
      </section>

      {/* Tombol Simpan */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          className="bg-[#B23501] text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-[#F9A03F] transition-colors duration-200 flex items-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>Simpan Perubahan</span>
        </button>
      </div>
    </div>
  );
}

export default Profile;
