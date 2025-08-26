import { Link, Outlet } from "react-router-dom";
import { useState } from "react";

function RootLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Header section dengan desain Anda */}
      <header className="bg-white text-[#cd5c2f] p-4 shadow-md">
        <nav className="container mx-auto flex justify-between items-center">
          {/* Tombol hamburger menu untuk mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-[#cd5c2f] focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </div>

          <h1 className="text-2xl font-bold">Revitameal</h1>

          {/* Navigasi Desktop */}
          <ul className="hidden md:flex space-x-6 items-center">
            <li>
              <Link
                to="/"
                className="text-gray-700 hover:text-[#e99a2c] transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/menu"
                className="text-gray-700 hover:text-[#e99a2c] transition-colors"
              >
                Menu
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-[#e99a2c] transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/about-us"
                className="text-gray-700 hover:text-[#e99a2c] transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/cart"
                className="flex items-center space-x-1 text-gray-700 hover:text-[#e99a2c] transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h18l-1.5 9h-15l-1.5-9zM7 21a2 2 0 100-4 2 2 0 000 4zM17 21a2 2 100-4 2 2 0 000 4z"
                  ></path>
                </svg>
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="bg-[#cd5c2f] text-white px-4 py-2 rounded-lg hover:bg-[#e99a2c] transition-colors"
              >
                Sign In
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="bg-[#e99a2c] text-white px-4 py-2 rounded-lg hover:bg-[#cd5c2f] transition-colors"
              >
                Sign Up
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white text-[#cd5c2f] shadow-lg">
          <ul className="flex flex-col space-y-2 p-4">
            <li>
              <Link
                to="/"
                className="block p-2 hover:bg-gray-100 transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/menu"
                className="block p-2 hover:bg-gray-100 transition-colors"
              >
                Menu
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="block p-2 hover:bg-gray-100 transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/about-us"
                className="block p-2 hover:bg-gray-100 transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="block p-2 hover:bg-gray-100 transition-colors"
              >
                Sign In
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="block p-2 hover:bg-gray-100 transition-colors"
              >
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center mt-auto">
        <p>&copy; 2024 Revitameal. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default RootLayout;
