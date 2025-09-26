import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx"; // Pastikan path ini benar
import { LogIn, AlertTriangle } from "lucide-react";

function AdminLogin() {
  // State untuk form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State untuk UI feedback
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Hook dari context dan router
  const { login, logout } = useAuth(); // Kita butuh logout jika login berhasil tapi bukan admin
  const navigate = useNavigate();

  // UID Admin yang diizinkan
  const adminUid = "lTxrKpb9Pnaj0npGe87mzFrJiYc2";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error setiap kali submit

    if (!email || !password) {
      return setError("Email dan password harus diisi.");
    }

    try {
      setLoading(true);
      const { user } = await login(email, password);

      // --- Pengecekan Kritis: Apakah user ini adalah admin? ---
      if (user.uid === adminUid) {
        // Jika YA, arahkan ke dashboard admin
        navigate("/admin");
      } else {
        // Jika BUKAN, tolak akses, langsung logout, dan tampilkan pesan error
        await logout(); // Langsung logout pengguna yang tidak sah
        setError("Akses ditolak. Akun ini bukan akun admin.");
      }
    } catch (err) {
      // Menangani error dari Firebase
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Email atau password yang Anda masukkan salah.");
      } else {
        setError("Terjadi kesalahan saat login. Silakan coba lagi.");
        console.error("Firebase login error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <p className="mt-2 text-gray-500">Silakan login untuk melanjutkan</p>
        </div>

        {/* Area Pesan Error */}
        {error && (
          <div className="mt-4 flex items-center rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="mr-3 h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Alamat Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              placeholder="admin@revitameal.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-orange-400"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-orange-500 group-hover:text-orange-400" />
              </span>
              {loading ? "Memproses..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
