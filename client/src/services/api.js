import axios from "axios";

// Central Axios instance for API calls
const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:8000",
  withCredentials: true,
});

export default api;
