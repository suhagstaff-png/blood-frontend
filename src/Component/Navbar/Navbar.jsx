// components/Navbar.js
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);
    alert("Logout successful!");
    navigate("/");
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate("/profile");
  };

  const handleDashboardClick = () => {
    setShowDropdown(false);
    navigate("/dashboard");
  };

  return (
    <nav className="bg-red-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-red-600 font-bold text-2xl">♥</span>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">DonorHub</h1>
              <p className="text-red-200 text-xs">Save Lives</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`${
                location.pathname === "/"
                  ? "text-white border-b-2 border-white"
                  : "text-red-200"
              } hover:text-white transition font-semibold`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`${
                location.pathname === "/about"
                  ? "text-white border-b-2 border-white"
                  : "text-red-200"
              } hover:text-white transition font-semibold`}
            >
              About Us
            </Link>

            <Link
              to="/searchdonor"
              className={`${
                location.pathname === "/searchdonor"
                  ? "text-white border-b-2 border-white"
                  : "text-red-200"
              } hover:text-white transition font-semibold`}
            >
              Find Blood
            </Link>
            <Link
              to="/review"
              className={`${
                location.pathname === "/review"
                  ? "text-white border-b-2 border-white"
                  : "text-red-200"
              } hover:text-white transition font-semibold`}
            >
              Reviews
            </Link>
            <Link
              to="/contact"
              className={`${
                location.pathname === "/contact"
                  ? "text-white border-b-2 border-white"
                  : "text-red-200"
              } hover:text-white transition font-semibold`}
            >
              Contact
            </Link>

            {/* Conditional rendering based on login status */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 bg-red-700 hover:bg-red-600 px-4 py-2 rounded-full transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">
                      {user?.fullName?.charAt(0) || "U"}
                    </span>
                  </div>
                  <span className="text-white font-semibold text-sm max-w-24 truncate">
                    {user?.fullName?.split(" ")[0] || "User"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-white transition-transform ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {user?.fullName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <button
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile
                    </button>

                    {/* <button
                      onClick={handleDashboardClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Dashboard
                    </button> */}

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <button className="bg-white text-red-700 px-6 py-2 rounded-full font-bold hover:bg-red-100 transition shadow-lg">
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="border-2 border-white text-white px-6 py-2 rounded-full font-bold hover:bg-white hover:text-red-700 transition">
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-red-700 px-2 pt-2 pb-3 space-y-1 shadow-lg">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block text-white hover:bg-red-600 px-3 py-2 rounded-md font-semibold"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="block text-white hover:bg-red-600 px-3 py-2 rounded-md font-semibold"
            >
              About Us
            </Link>
            <Link
              to="/donate"
              onClick={() => setIsOpen(false)}
              className="block text-white hover:bg-red-600 px-3 py-2 rounded-md font-semibold"
            >
              Donate Blood
            </Link>
            <Link
              to="/searchdonor"
              onClick={() => setIsOpen(false)}
              className="block text-white hover:bg-red-600 px-3 py-2 rounded-md font-semibold"
            >
              Find Blood
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="block text-white hover:bg-red-600 px-3 py-2 rounded-md font-semibold"
            >
              Contact
            </Link>

            {/* Mobile Authentication Buttons */}
            {isLoggedIn ? (
              <div className="pt-2 border-t border-red-600">
                <div className="flex items-center space-x-3 px-3 py-2 mb-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">
                      {user?.fullName?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {user?.fullName}
                    </p>
                    <p className="text-red-200 text-xs">{user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleProfileClick();
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full text-white hover:bg-red-600 px-3 py-2 rounded-md font-semibold"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile
                </button>

                {/* <button
                  onClick={() => {
                    handleDashboardClick();
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full text-white hover:bg-red-600 px-3 py-2 rounded-md font-semibold"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Dashboard
                </button> */}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full text-white hover:bg-red-600 px-3 py-2 rounded-md font-semibold text-red-200"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-red-600 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-white text-red-700 text-center px-3 py-2 rounded-full font-bold hover:bg-red-100 transition shadow-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full border-2 border-white text-white text-center px-3 py-2 rounded-full font-bold hover:bg-white hover:text-red-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay for dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
