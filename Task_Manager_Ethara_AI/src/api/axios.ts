import axios from "axios";

let BASE_URL = "http://localhost:5000/api"; // Default for local dev

// For production, load API URL from config.json
if (!window.location.hostname.includes("localhost")) {
  (async () => {
    try {
      const response = await fetch("/config.json");
      if (response.ok) {
        const config = await response.json();
        BASE_URL = config.apiUrl || BASE_URL;
        console.log("Production API URL loaded:", BASE_URL);
      }
    } catch (error) {
      console.warn("Could not load config.json, using default API URL:", BASE_URL);
    }
  })();
}

console.log("API URL:", BASE_URL);

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
