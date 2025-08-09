import axios from "axios";
import { API_BASE_URL } from "@/app/api/libApi/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để tự động gắn token vào mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // hoặc lấy từ context/state
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
