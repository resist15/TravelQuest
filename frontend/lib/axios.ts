import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";

type FailedRequest = {
  resolve: (value?: string | null | PromiseLike<string | null>) => void;
  reject: (reason?: unknown) => void;
};

type RefreshResponse = {
  token: string;
  refreshToken: string;
};

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as CustomAxiosRequestConfig;
    const requestUrl = originalRequest?.url || "";
    const isLoginRequest = requestUrl.endsWith("/api/auth/login");

    if (err.response?.status === 401 && !isLoginRequest) {
      if (originalRequest._retry) {
        logoutAndRedirect();
        return Promise.reject(err);
      }

      if (isRefreshing) {
  return new Promise<string | null>((resolve, reject) => {
    const resolveTyped = resolve as (value: string | PromiseLike<string | null> | null | undefined) => void;
    failedQueue.push({ resolve: resolveTyped, reject });
  })
          .then((token) => {
            if (token) {
              originalRequest.headers["Authorization"] = "Bearer " + token;
            }
            return api(originalRequest);
          })
          .catch((error) => Promise.reject(error));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          logoutAndRedirect();
          return Promise.reject(err);
        }

        const response = await axios.post<RefreshResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh`,
          { refreshToken }
        );

        const { token, refreshToken: newRefresh } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", newRefresh);
        api.defaults.headers.common["Authorization"] = "Bearer " + token;
        processQueue(null, token);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logoutAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

function logoutAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  toast.error("Your session has expired. Please log in again.");
  window.location.href = "/login";
}

export async function initAuth() {
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!token || !refreshToken) return;

  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    if (exp * 1000 < Date.now()) {
      const res = await axios.post<RefreshResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh`,
        { refreshToken }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("refreshToken", res.data.refreshToken);
    }
  } catch (e) {
    console.error("Token parse error:", e);
    logoutAndRedirect();
  }
}

export default api;
