// frontend/src/lib/api.js
import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/lib/constants";

// 1.  Create a reusable Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // "http://127.0.0.1:8000"
  timeout: 15_000                       // 15-second network timeout
});

// 2.  Attach the JWT to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3.  Handle auth errors globally
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const { response } = error;
//     if (response && [401, 403].includes(response.status)) {
//       // Wipe tokens and redirect to login
//        if (!window.location.pathname.includes('/login')) {
//           localStorage.removeItem(ACCESS_TOKEN);
//           localStorage.removeItem(REFRESH_TOKEN);
//           window.location.assign("/login");
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// 3. Handle auth errors globally — try silent refresh before logging out
let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    if (response?.status === 401 && !config._retry) {
      config._retry = true;

      if (isRefreshing) return Promise.reject(error);
      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN);

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/users/refresh/`,
            { refresh: refreshToken }
          );

          localStorage.setItem(ACCESS_TOKEN, data.access);
          localStorage.setItem(REFRESH_TOKEN, data.refresh);
          config.headers.Authorization = `Bearer ${data.access}`;
          isRefreshing = false;
          return api(config);

        } catch (refreshError) {
          isRefreshing = false;
          localStorage.removeItem(ACCESS_TOKEN);
          localStorage.removeItem(REFRESH_TOKEN);
          window.location.assign("/login");
          return Promise.reject(refreshError);
        }
      } else {
        window.location.assign("/login");
      }
    }

    // 403 — authenticated but not allowed
    if (response?.status === 403) {
      window.location.assign("/login");
    }

    return Promise.reject(error);
  }
);

export default api;
