// src/pages/auth/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import loginHeroImage from "../../assets/login-hero.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-[#F27F34] via-[#E06B2A] to-[#B23501] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#FFD580]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Hero Content */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <div className="max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Lanjutkan
              <span className="block bg-gradient-to-r from-[#FFD580] to-[#F9A03F] bg-clip-text text-transparent">
                Perjalanan Sehat Anda
              </span>
            </h1>

            <p className="text-lg text-white/90 leading-relaxed mb-8">
              Masuk ke akun Anda untuk menemukan menu sehat, melacak nutrisi,
              dan melihat riwayat pesanan dengan mudah.
            </p>
            <div className="mt-10 group perspective-1000">
              <div className="w-full h-80 rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-500 group-hover:rotate-y-3">
                <img
                  src={loginHeroImage}
                  alt="Healthy food bowl"
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover transform transition-transform duration-500 group-hover:rotate-y-3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-4xl font-black text-white mb-2">
                REVITAMEAL
              </h1>
              <p className="text-white/80">Good Food Good Mood No Plastic</p>
            </div>

            {/* Login Form Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Selamat Datang
                </h2>
                <p className="text-white/70">
                  Masuk ke akun Anda untuk melanjutkan
                </p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-100 p-4 rounded-xl mb-6 backdrop-blur-sm">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:border-[#FFD580]/50 focus:ring-2 focus:ring-[#FFD580]/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90 block">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:border-[#FFD580]/50 focus:ring-2 focus:ring-[#FFD580]/20 transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full relative overflow-hidden bg-gradient-to-r from-[#F9A03F] via-[#F6B049] to-[#FFD580] text-[#B23501] font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#B23501]/30 border-t-[#B23501] rounded-full animate-spin"></div>
                        <span>Memuat...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk ke Dashboard</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-8 space-y-4">
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/5 text-white/60 backdrop-blur-sm rounded-full">
                      Belum punya akun?
                    </span>
                  </div>
                </div>

                <Link
                  to="/register"
                  className="group w-full flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
