import React, { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // Logika login akan ditambahkan di langkah selanjutnya
    console.log("Logging in with:", email, password);
  };

  const handleGoogleSignIn = () => {
    // Logika Google Sign-In akan ditambahkan di langkah selanjutnya
    console.log("Signing in with Google");
  };

  return (
    <div className="bg-[#cd5c2f] min-h-screen text-white flex items-center justify-center p-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
        {/* Bagian Kiri */}
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
            REVITAMEAL
          </h1>
          <p className="text-xl font-light mb-8">Healthy Catering</p>
        </div>

        {/* Bagian Kanan - Formulir Login */}
        <div className="flex-1 max-w-sm md:max-w-md bg-white p-8 rounded-xl shadow-2xl text-gray-800">
          <h2 className="text-3xl font-bold text-center mb-6">Sign In</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email/No. Telp
              </label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-black p-2"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Kata Sandi
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-black p-2"
              />
            </div>
            <div className="flex items-center">
              <input
                id="promo-checkbox"
                name="promo-checkbox"
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label
                htmlFor="promo-checkbox"
                className="ml-2 block text-xs text-gray-600"
              >
                Dengan login, Anda menyetujui Syarat Layanan, Kebijakan Privasi,
                dan bersedia menerima informasi terkait promo & layanan terbaru
                dari Revitameal.
              </label>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e99a2c] hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              >
                Masuk
              </button>
            </div>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Atau</span>
            </div>
          </div>
          <div>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
