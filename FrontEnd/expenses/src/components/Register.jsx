import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { email, password, name });
      alert("Registration successful! Please login.");
      navigate("/"); // Redirect to login page
    } catch (error) {
      alert("Registration failed! Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleRegister} className="bg-gray-100 p-6 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full mb-4 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full mb-4 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full mb-4 p-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
