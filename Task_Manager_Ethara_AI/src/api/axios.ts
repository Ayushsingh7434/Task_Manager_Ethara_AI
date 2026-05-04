import axios from "axios";

// Determine the correct API base URL
function getBaseUrl(): string {
  // On localhost, use localhost backend
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:5000/api";
  }

  // On production Railway: extract backend URL from known pattern
  // Frontend: taskmanageretharaai-production-d2a6.up.railway.app
  // Backend: taskmanageretharaai-production-0d38.up.railway.app
  // Map d2a6 (frontend) to 0d38 (backend)
  const hostname = window.location.hostname;
  if (hostname.includes("taskmanageretharaai-production")) {
    return "https://taskmanageretharaai-production-0d38.up.railway.app/api";
  }

  // Fallback: try to load from config.json
  // This is async so may not work reliably, but kept as last resort
  const configUrl = "/config.json";
  return configUrl;
}

const BASE_URL = getBaseUrl();
console.log("API Base URL:", BASE_URL);

const instance = axios.create({
  baseURL: BASE_URL,
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

