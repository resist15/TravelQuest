import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Skip logout redirect on /api/auth/login failure
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const requestUrl = err.config?.url || "";
    const isLoginRequest = requestUrl.endsWith("/api/auth/login");

    if (err.response?.status === 401 && !isLoginRequest) {
      logoutAndRedirect();
    }

    return Promise.reject(err);
  }
);

function logoutAndRedirect() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

export default api;
