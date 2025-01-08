import React, { useState, useEffect } from "react";
import api from "../services/api";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    createdAt: "",
    updatedAt: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (error) {
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    if (!profile.name || !profile.email) {
      setError("Name and email cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await api.put(
        "/user/profile",
        { ...profile, password },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(response.data);
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setError("Failed to update profile. Please try again.");
    }
  };

  // Loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="spinner-border animate-spin text-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 space-y-8">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
        My Profile
      </h1>
      {error && (
        <p className="text-red-600 text-center mb-4">{error}</p>
      )}

      {!isEditing ? (
        <div className="space-y-4">
          <div className="flex justify-between">
            <strong className="text-lg text-gray-700">Name:</strong>
            <span className="text-gray-600">{profile.name}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-lg text-gray-700">Email:</strong>
            <span className="text-gray-600">{profile.email}</span>
          </div>
          <div className="flex justify-between">
            <strong className="text-lg text-gray-700">Account Created:</strong>
            <span className="text-gray-600">
              {new Date(profile.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <strong className="text-lg text-gray-700">Last Updated:</strong>
            <span className="text-gray-600">
              {new Date(profile.updatedAt).toLocaleString()}
            </span>
          </div>

          <div className="mt-6 text-center">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition-all duration-300"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="text-red-600 text-center">
              {error}
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition-all duration-300"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="ml-4 text-blue-600 px-6 py-2 rounded-full hover:bg-blue-50 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;
