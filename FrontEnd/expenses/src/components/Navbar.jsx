import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ setToken }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    setToken(null); // Update token state in App.js
    navigate("/login"); // Redirect to login page
  };

  return (
    <nav className="bg-blue-600 p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <ul className="flex space-x-8 text-lg font-semibold">
          <li>
            <Link
              to="/home"
              className="text-white hover:text-gray-200 transition-all duration-300"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/expenses"
              className="text-white hover:text-gray-200 transition-all duration-300"
            >
              Expenses
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className="text-white hover:text-gray-200 transition-all duration-300"
            >
              Profile
            </Link>
          </li>
        </ul>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
