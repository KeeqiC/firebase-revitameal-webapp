import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import RootLayout from "./layouts/RootLayout.jsx";

// Halaman-halaman
import Home from "./pages/Home.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Home />} />
      <Route path="register" element={<Home />} />
      <Route path="dashboard" element={<Home />} />
      <Route path="lunchboost" element={<Home />} />
      <Route path="calories" element={<Home />} />
      <Route path="diet-planner" element={<Home />} />
      <Route path="food-journal" element={<Home />} />
      <Route path="fitness-guide" element={<Home />} />
      <Route path="chibo" element={<Home />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
