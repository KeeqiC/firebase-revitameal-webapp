// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Halaman Publik
import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Halaman Dashboard (Terproteksi)
import Dashboard from "./pages/dashboard/Dashboard";
import LunchBoost from "./pages/dashboard/LunchBoost";
import CalorieTracker from "./pages/dashboard/CalorieTracker";
import DietPlanner from "./pages/dashboard/DietPlanner";
import FoodJournal from "./pages/dashboard/FoodJournal";
import FitnessGuide from "./pages/dashboard/FitnessGuide";
import ChiboAssistant from "./pages/dashboard/ChiboAssistant";
import Profile from "./pages/dashboard/Profile";
import OrderHistory from "./pages/dashboard/OrderHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Publik (Akses bebas) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          {/* Halaman publik lain bisa ditambahkan di sini */}
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rute Terproteksi (Hanya untuk pengguna login) */}
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
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
