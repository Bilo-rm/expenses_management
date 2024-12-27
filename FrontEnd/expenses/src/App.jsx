import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Expenses from "./components/Expenses";
import Profile from "./components/Profile";
import Navbar from "./components/Navbar";

const App = () => {
  const token = localStorage.getItem("token"); // Check if the user is authenticated

  return (
    <Router>
      <Routes>
        {/* Redirect to login if user is not authenticated */}
        <Route path="/" element={token ? <Navigate to="/home" /> : <Login />} />
        <Route path="/login" element={<Login />} />
        {/* Only show Navbar for authenticated users */}
        <Route
          path="/home"
          element={token ? (
            <>
              <Navbar />
              <Home />
            </>
          ) : <Navigate to="/login" />}
        />
        <Route
          path="/expenses"
          element={token ? (
            <>
              <Navbar />
              <Expenses />
            </>
          ) : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={token ? (
            <>
              <Navbar />
              <Profile />
            </>
          ) : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
