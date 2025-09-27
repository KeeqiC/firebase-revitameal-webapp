// src/pages/dashboard/Profile.jsx

import { useState, useEffect } from "react";

import {
  User,
  Mail,
  Target,
  Settings,
  Save,
  Scale,
  Heart,
  Shield,
  Activity,
  Sparkles,
  Edit3,
  Check,
  AlertCircle,
  Calculator,
} from "lucide-react";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";

function Profile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    currentWeight: "",
    targetWeight: "",
    dietGoal: "",
    foodAllergies: "",
    height: "",
    age: "",
    gender: "",
    activityLevel: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setProfile({
              name: userData.name || "",
              email: currentUser.email || "",
              currentWeight: userData.currentWeight || "",
              targetWeight: userData.targetWeight || "",
              dietGoal: userData.dietGoal || "",
              foodAllergies: userData.foodAllergies || "",
              height: userData.height || "",
              age: userData.age || "",
              gender: userData.gender || "",
              activityLevel: userData.activityLevel || "",
            });
          } else {
            setProfile((prev) => ({ ...prev, email: currentUser.email || "" }));
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const calculateBMI = () => {
    if (profile.currentWeight && profile.height) {
      const weight = parseFloat(profile.currentWeight);
      const height = parseFloat(profile.height) / 100; // Convert cm to meters
      const bmi = weight / (height * height);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMIStatus = (bmi) => {
    if (!bmi) return null;
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5)
      return { status: "Underweight", color: "text-blue-600" };
    if (bmiValue < 25) return { status: "Normal", color: "text-green-600" };
    if (bmiValue < 30)
      return { status: "Overweight", color: "text-yellow-600" };
    return { status: "Obese", color: "text-red-600" };
  };

  // Fungsi untuk menghitung BMR (Basal Metabolic Rate) menggunakan rumus Mifflin-St Jeor
  const calculateBMR = () => {
    if (
      !profile.currentWeight ||
      !profile.height ||
      !profile.age ||
      !profile.gender
    ) {
      return null;
    }

    const weight = parseFloat(profile.currentWeight);
    const height = parseFloat(profile.height);
    const age = parseFloat(profile.age);

    let bmr;
    if (profile.gender === "Laki-laki") {
      // BMR untuk pria = 10 × berat(kg) + 6.25 × tinggi(cm) - 5 × usia(tahun) + 5
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (profile.gender === "Perempuan") {
      // BMR untuk wanita = 10 × berat(kg) + 6.25 × tinggi(cm) - 5 × usia(tahun) - 161
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    return bmr ? Math.round(bmr) : null;
  };

  // Fungsi untuk menghitung TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = () => {
    const bmr = calculateBMR();
    if (!bmr || !profile.activityLevel) return null;

    const activityMultipliers = {
      "Sangat Rendah": 1.2,
      Rendah: 1.375,
      Sedang: 1.55,
      Tinggi: 1.725,
      "Sangat Tinggi": 1.9,
    };

    const multiplier = activityMultipliers[profile.activityLevel];
    return multiplier ? Math.round(bmr * multiplier) : null;
  };

  // Fungsi untuk menghitung kalori berdasarkan tujuan diet
  const calculateDailyCalories = () => {
    const tdee = calculateTDEE();
    if (!tdee || !profile.dietGoal) return null;

    let calorieAdjustment = 0;
    switch (profile.dietGoal) {
      case "Menurunkan Berat Badan":
        calorieAdjustment = -500; // Defisit 500 kalori untuk turun ~0.5kg per minggu
        break;
      case "Menambah Massa Otot":
        calorieAdjustment = 300; // Surplus 300 kalori untuk menambah massa
        break;
      case "Mempertahankan Berat Badan":
      case "Gaya Hidup Sehat":
        calorieAdjustment = 0; // Maintenance calories
        break;
      default:
        calorieAdjustment = 0;
    }

    return Math.round(tdee + calorieAdjustment);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    try {
      const docRef = doc(db, "users", currentUser.uid);
      const profileData = { ...profile };
      delete profileData.email; // Don't save email to Firestore

      // Tambahkan kalori yang dihitung otomatis ke data yang disimpan
      const calculatedCalories = calculateDailyCalories();
      if (calculatedCalories) {
        profileData.dailyCalories = calculatedCalories;
      }

      await updateDoc(docRef, profileData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Gagal memperbarui profil:", err);
      alert("Gagal memperbarui profil.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F27F34]/5 via-[#E06B2A]/5 to-[#B23501]/10 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F27F34] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">Memuat profil...</p>
        </div>
      </div>
    );
  }

  const bmi = calculateBMI();
  const bmiStatus = getBMIStatus(bmi);
  const bmr = calculateBMR();
  const tdee = calculateTDEE();
  const dailyCalories = calculateDailyCalories();

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
              Profile Settings
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">
            <span className="bg-gradient-to-r from-[#F27F34] to-[#B23501] bg-clip-text text-transparent">
              Profil
            </span>{" "}
            & Pengaturan
          </h1>
          <p className="text-xl text-gray-600">
            Kelola informasi dan preferensi akun Anda
          </p>
        </header>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-xl flex items-center space-x-3">
            <Check className="h-5 w-5" />
            <span className="font-medium">Profil berhasil diperbarui!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <User className="h-6 w-6 mr-3 text-[#B23501]" />
                Informasi Pribadi
              </h2>
              <Sparkles className="h-5 w-5 text-[#B23501]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={currentUser?.email || ""}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100/70 border border-gray-200 text-gray-600 cursor-not-allowed"
                    disabled
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-2 text-xs text-gray-500 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Email tidak dapat diubah untuk keamanan
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Usia
                </label>
                <input
                  type="number"
                  name="age"
                  value={profile.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                  placeholder="Usia dalam tahun"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Jenis Kelamin
                </label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>
          </section>

          {/* Body Measurements */}
          <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Scale className="h-6 w-6 mr-3 text-[#B23501]" />
                Pengukuran Tubuh
              </h2>
              <Activity className="h-5 w-5 text-[#B23501]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tinggi Badan (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={profile.height}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                  placeholder="170"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Berat Badan Saat Ini (kg)
                </label>
                <input
                  type="number"
                  name="currentWeight"
                  value={profile.currentWeight}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                  placeholder="70"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Berat Badan Target (kg)
                </label>
                <input
                  type="number"
                  name="targetWeight"
                  value={profile.targetWeight}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                  placeholder="65"
                  min="1"
                />
              </div>
            </div>

            {/* BMI Calculator */}
            {bmi && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">
                      Body Mass Index (BMI)
                    </h3>
                    <p className="text-3xl font-black text-gray-800">{bmi}</p>
                    {bmiStatus && (
                      <p className={`text-sm font-semibold ${bmiStatus.color}`}>
                        Status: {bmiStatus.status}
                      </p>
                    )}
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Calorie Calculator Display */}
            {bmr && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center">
                    <Calculator className="h-5 w-5 mr-2 text-orange-600" />
                    Kalkulasi Kalori Otomatis
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">
                      BMR (Kalori Dasar)
                    </p>
                    <p className="text-2xl font-bold text-gray-800">{bmr}</p>
                    <p className="text-xs text-gray-500">kalori/hari</p>
                  </div>

                  {tdee && (
                    <div className="text-center p-4 bg-white/50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">
                        TDEE (Total Pengeluaran)
                      </p>
                      <p className="text-2xl font-bold text-gray-800">{tdee}</p>
                      <p className="text-xs text-gray-500">kalori/hari</p>
                    </div>
                  )}

                  {dailyCalories && (
                    <div className="text-center p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl border-2 border-orange-300">
                      <p className="text-sm text-gray-600 mb-1">
                        Target Kalori Harian
                      </p>
                      <p className="text-3xl font-black text-orange-700">
                        {dailyCalories}
                      </p>
                      <p className="text-xs text-gray-500">kalori/hari</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <p className="text-xs text-gray-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1 text-yellow-600" />
                    Kalori dihitung otomatis berdasarkan rumus Mifflin-St Jeor
                    dan disesuaikan dengan tujuan diet Anda
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Diet Preferences */}
          <section className="bg-white/70 backdrop-blur-xl border border-white/30 p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Target className="h-6 w-6 mr-3 text-[#B23501]" />
                Preferensi Diet
              </h2>
              <Heart className="h-5 w-5 text-[#B23501]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tujuan Diet Utama
                </label>
                <select
                  name="dietGoal"
                  value={profile.dietGoal}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Pilih tujuan diet</option>
                  <option value="Menurunkan Berat Badan">
                    Menurunkan Berat Badan
                  </option>
                  <option value="Menambah Massa Otot">
                    Menambah Massa Otot
                  </option>
                  <option value="Mempertahankan Berat Badan">
                    Mempertahankan Berat Badan
                  </option>
                  <option value="Gaya Hidup Sehat">Gaya Hidup Sehat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tingkat Aktivitas
                </label>
                <select
                  name="activityLevel"
                  value={profile.activityLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Pilih tingkat aktivitas</option>
                  <option value="Sangat Rendah">
                    Sangat Rendah (Tidak olahraga)
                  </option>
                  <option value="Rendah">Rendah (Olahraga 1-3x/minggu)</option>
                  <option value="Sedang">Sedang (Olahraga 3-5x/minggu)</option>
                  <option value="Tinggi">Tinggi (Olahraga 6-7x/minggu)</option>
                  <option value="Sangat Tinggi">
                    Sangat Tinggi (Olahraga 2x/hari)
                  </option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Alergi Makanan
                </label>
                <input
                  type="text"
                  name="foodAllergies"
                  value={profile.foodAllergies}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F27F34]/50 focus:border-transparent transition-all duration-300"
                  placeholder="Contoh: kacang, seafood, gluten"
                />
                <p className="mt-2 text-xs text-gray-500 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Pisahkan dengan koma jika lebih dari satu
                </p>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={saving}
              className="group relative overflow-hidden bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-12 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-3"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10"></div>
              ) : (
                <Save className="h-5 w-5 relative z-10" />
              )}
              <span className="relative z-10">
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </span>
              {!saving && <Edit3 className="h-5 w-5 relative z-10" />}
            </button>
          </div>
        </form>

        {/* Tips Section */}
        <section className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-bold text-gray-800">Tips Profil</h3>
          </div>
          <ul className="text-gray-600 text-sm space-y-2">
            <li>
              • Lengkapi semua informasi untuk perhitungan kalori yang akurat
            </li>
            <li>
              • Update berat badan secara berkala untuk tracking yang lebih baik
            </li>
            <li>
              • Kalori harian dihitung otomatis berdasarkan BMR dan tingkat
              aktivitas Anda
            </li>
            <li>
              • Informasi alergi akan membantu filter menu yang aman untuk Anda
            </li>
            <li>
              • Pilih tujuan diet yang sesuai untuk penyesuaian kalori yang
              tepat
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Profile;
