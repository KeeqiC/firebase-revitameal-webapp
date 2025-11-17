import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";

// Layouts & Guards
import MainLayout from "./layouts/MainLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import ScrollManager from "./utils/ScrollManager.jsx";

// --- Lazy-loaded Pages ---

// Public Pages
const Home = lazy(() => import("./pages/public/Home.jsx"));
const Login = lazy(() => import("./pages/auth/Login.jsx"));
const Register = lazy(() => import("./pages/auth/Register.jsx"));

// Dashboard Pages
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard.jsx"));
const LunchBoost = lazy(() => import("./pages/dashboard/LunchBoost.jsx"));
const CalorieTracker = lazy(() =>
  import("./pages/dashboard/CalorieTracker.jsx")
);
const DietPlanner = lazy(() => import("./pages/dashboard/DietPlanner.jsx"));
const FoodJournal = lazy(() => import("./pages/dashboard/FoodJournal.jsx"));
const FitnessGuide = lazy(() => import("./pages/dashboard/FitnessGuide.jsx"));
const ChiboAssistant = lazy(() =>
  import("./pages/dashboard/ChiboAssistant.jsx")
);
const Profile = lazy(() => import("./pages/dashboard/Profile.jsx"));
const OrderHistory = lazy(() => import("./pages/dashboard/OrderHistory.jsx"));
const Checkout = lazy(() => import("./pages/dashboard/Checkout.jsx"));

// Admin Pages
const AdminLogin = lazy(() => import("./pages/auth/AdminLogin.jsx"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout.jsx"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage.jsx"));
const AdminGuide = lazy(() => import("./pages/admin/AdminGuide.jsx"));

// 🆕 DOKU Payment Pages (HARUS PUBLIC!)
const PaymentSuccess = lazy(() => import("./pages/payment/PaymentSuccess.jsx"));
const PaymentCancel = lazy(() => import("./pages/payment/PaymentCancel.jsx"));
const PaymentResult = lazy(() => import("./pages/payment/paymentResult.jsx"));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollManager />
        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-screen">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
        >
          <Routes>
            {/* Rute Publik */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ✅ DOKU Payment Callback Routes (PUBLIC - TIDAK PROTECTED!) */}
            {/* Harus di luar ProtectedRoute karena DOKU redirect tanpa auth context */}
            <Route path="/payment/result" element={<PaymentResult />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />

            {/* --- RUTE ADMIN --- */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminPage />} />
                <Route path="guide" element={<AdminGuide />} />
              </Route>
            </Route>

            {/* Rute Terproteksi Pengguna Biasa */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="lunch-boost" element={<LunchBoost />} />
                <Route path="calorie-tracker" element={<CalorieTracker />} />
                <Route path="diet-planner" element={<DietPlanner />} />
                <Route path="food-journal" element={<FoodJournal />} />
                <Route path="fitness-guide" element={<FitnessGuide />} />
                <Route path="chibo" element={<ChiboAssistant />} />
                <Route path="profile" element={<Profile />} />
                <Route path="order-history" element={<OrderHistory />} />
                <Route path="checkout" element={<Checkout />} />
              </Route>
            </Route>

            {/* 404 Not Found */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-800 mb-4">
                      404
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                      Halaman tidak ditemukan
                    </p>
                    <a
                      href="/dashboard"
                      className="bg-gradient-to-r from-[#F27F34] to-[#B23501] text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-shadow"
                    >
                      Kembali ke Dashboard
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
