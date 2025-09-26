import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx"; // 1. Bungkus dengan AuthProvider

// Layouts & Guards
import MainLayout from "./layouts/MainLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx"; // 2. Impor penjaga rute admin
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

// Admin Pages (BARU)
const AdminLogin = lazy(() => import("./pages/auth/AdminLogin.jsx"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout.jsx"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage.jsx"));
const AdminGuide = lazy(() => import("./pages/admin/AdminGuide.jsx"));

function App() {
  return (
    // 3. AuthProvider membungkus semuanya
    <AuthProvider>
      <BrowserRouter>
        <ScrollManager />
        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-screen">
              {/* Fallback yang lebih menarik */}
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
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
