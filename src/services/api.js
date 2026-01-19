import axios from "axios";

const API_URL = "https://cana-tech-task-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      const errorMessage = data?.error || data?.message || "An error occurred";
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      return Promise.reject(
        new Error("Network error. Please check your connection."),
      );
    } else {
      return Promise.reject(error);
    }
  },
);

export default api;
