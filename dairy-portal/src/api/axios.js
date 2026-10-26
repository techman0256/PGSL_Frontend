
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let refreshRequest;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = /\/auth\/(login|register|refresh|logout)/.test(
      originalRequest?.url || ""
    );

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    refreshRequest ||= api.post("/auth/refresh", undefined, {
      _skipAuthRefresh: true,
    });

    try {
      await refreshRequest;
      return api(originalRequest);
    } finally {
      refreshRequest = undefined;
    }
  }
);

export default api;
