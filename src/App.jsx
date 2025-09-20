// src/App.jsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPage from "./pages/dashboard/AdminPage";
import ScrollManager from "./utils/ScrollManager";

// Menggunakan React.lazy() untuk memuat halaman secara dinamis
const Home = lazy(() => import("./pages/public/Home"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));

const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const LunchBoost = lazy(() => import("./pages/dashboard/LunchBoost"));
const CalorieTracker = lazy(() => import("./pages/dashboard/CalorieTracker"));
const DietPlanner = lazy(() => import("./pages/dashboard/DietPlanner"));
const FoodJournal = lazy(() => import("./pages/dashboard/FoodJournal"));
const FitnessGuide = lazy(() => import("./pages/dashboard/FitnessGuide"));
const ChiboAssistant = lazy(() => import("./pages/dashboard/ChiboAssistant"));
const Profile = lazy(() => import("./pages/dashboard/Profile"));
const OrderHistory = lazy(() => import("./pages/dashboard/OrderHistory"));
const Checkout = lazy(() => import("./pages/dashboard/Checkout"));

function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <p className="text-xl text-gray-500">Memuat...</p>
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

          {/* Rute Terproteksi */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="admin" element={<AdminPage />} />
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
  );
}

export default App;
