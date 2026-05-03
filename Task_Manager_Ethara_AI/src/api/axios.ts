import axios from "axios";

// For local development: http://localhost:5000/api
// For production: replace with your Railway backend URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const instance = axios.create({
  baseURL: "https://taskmanagerea-production.up.railway.app/api",
});

// Automatically attach JWT token to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// Handle 401 globally - redirect to login
instance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default instance;
