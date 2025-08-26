import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';

// Halaman-halaman
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LunchBoost from './pages/LunchBoost';
import Calories from './pages/Calories';
import DietPlanner from './pages/DietPlanner';
import FoodJournal from './pages/FoodJournal';
import FitnessGuide from './pages/FitnessGuide';
import Chibo from './pages/Chibo';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="lunchboost" element={<LunchBoost />} />
      <Route path="calories" element={<Calories />} />
      <Route path="diet-planner" element={<DietPlanner />} />
      <Route path="food-journal" element={<FoodJournal />} />
      <Route path="fitness-guide" element={<FitnessGuide />} />
      <Route path="chibo" element={<Chibo />} />
    </Route>
  )
);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
