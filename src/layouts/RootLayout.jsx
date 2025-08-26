import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50">
      <header className="bg-white shadow-md p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-teal-600">Revitameal</h1>
          <ul className="flex space-x-4">
            <li>
              <a
                href="/"
                className="text-gray-700 hover:text-teal-600 transition-colors"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/login"
                className="text-gray-700 hover:text-teal-600 transition-colors"
              >
                Login
              </a>
            </li>
            <li>
              <a
                href="/register"
                className="text-gray-700 hover:text-teal-600 transition-colors"
              >
                Register
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main className="flex-1 container mx-auto p-4">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center mt-auto">
        <p>&copy; 2024 Revitameal. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default RootLayout;
