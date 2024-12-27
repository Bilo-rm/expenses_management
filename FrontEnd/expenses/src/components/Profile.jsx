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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/user/profile"); // Fetch user profile
        setProfile(response.data);
      } catch (error) {
        alert("Failed to load profile data. Please try again later.");
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put("/user/profile", profile); // Update user profile
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {!isEditing ? (
        <div>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Account Created:</strong> {new Date(profile.createdAt).toLocaleString()}</p>
          <p><strong>Last Updated:</strong> {new Date(profile.updatedAt).toLocaleString()}</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="block font-bold mb-2">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block font-bold mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;
