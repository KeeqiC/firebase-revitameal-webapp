// src/pages/auth/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Gagal masuk. Periksa email dan kata sandi Anda.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#B23501] text-white p-4">
      <div className="bg-[#F27F34] p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Login</h1>
        <p className="mb-8 text-white/80">
          Selamat datang kembali. Masuk untuk melanjutkan.
        </p>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#B23501] text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#B23501] text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B23501] text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transform transition duration-300 flex items-center justify-center space-x-2 disabled:bg-gray-400"
          >
            <span>{loading ? "Memuat..." : "Masuk"}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <div className="mt-8 text-sm">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="font-semibold underline hover:text-white"
          >
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
