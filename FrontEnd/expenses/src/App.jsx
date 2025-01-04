import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Expenses from "./components/Expenses";
import Profile from "./components/Profile";
import Navbar from "./components/Navbar";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Sync token state with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Route for Login */}
        <Route
          path="/"
          element={token ? <Navigate to="/home" /> : <Login setToken={setToken} />}
        />
        
        {/* Route for Register */}
        <Route path="/register" element={<Register />} />
        
        {/* Route for Home */}
        <Route
          path="/home"
          element={
            token ? (
              <>
                <Navbar setToken={setToken} />
                <Home />
              </>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        
        {/* Route for Expenses */}
        <Route
          path="/expenses"
          element={
            token ? (
              <>
                <Navbar setToken={setToken} />
                <Expenses />
              </>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        
        {/* Route for Profile */}
        <Route
          path="/profile"
          element={
            token ? (
              <>
                <Navbar setToken={setToken} />
                <Profile />
              </>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
