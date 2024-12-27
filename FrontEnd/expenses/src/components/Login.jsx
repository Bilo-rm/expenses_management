import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import for navigation
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate(); // Initialize navigation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State for handling error messages

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { email, password });

      // Save token in localStorage or sessionStorage
      localStorage.setItem("token", response.data.token);

      // Redirect to Home after successful login
      navigate("/");
    } catch (error) {
      // Handle error and show user-friendly message
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className="block font-bold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>} {/* Display error message */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
