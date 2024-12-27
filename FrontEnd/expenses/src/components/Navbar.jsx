import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    navigate("/"); // Redirect to login page
  };

  return (
    <nav className="bg-blue-500 p-4 text-white">
      <ul className="flex justify-around">
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/expenses">Expenses</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li>
          <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
