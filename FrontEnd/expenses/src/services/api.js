import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Get the token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
