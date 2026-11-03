import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// In-memory token management
let memoryToken = null;
let onAuthFailureCallback = null;

export const setAccessToken = (token) => {
  memoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('swiggy_token', token);
    } else {
      sessionStorage.removeItem('swiggy_token');
    }
  }
};

export const getAccessToken = () => {
  if (memoryToken) return memoryToken;
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('swiggy_token');
    if (stored) {
      memoryToken = stored;
      return stored;
    }
  }
  return null;
};

export const clearAccessToken = () => {
  memoryToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('swiggy_token');
  }
};

// Admin secret key management (entered at runtime by authorized admin)
export const setAdminSecret = (secret) => {
  if (typeof window !== 'undefined') {
    if (secret) {
      sessionStorage.setItem('swiggy_admin_secret', secret);
    } else {
      sessionStorage.removeItem('swiggy_admin_secret');
    }
  }
};

export const getAdminSecret = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('swiggy_admin_secret') || '';
  }
  return '';
};

export const clearAdminSecret = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('swiggy_admin_secret');
  }
};

export const registerAuthFailureHandler = (cb) => {
  onAuthFailureCallback = cb;
};

// Centralized Axios Instance
const api = axios.create({
  baseURL,
  withCredentials: true, // For cookie-based refresh token handling
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: attach token & admin secret if available
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const adminSecret = getAdminSecret();
    if (adminSecret) {
      config.headers['x-admin-secret'] = adminSecret;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle 401 with refresh token rotation & queued retry
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response or already retried or it's an auth endpoint (login/register/refresh), don't loop
    if (
      !error.response ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh-token')
    ) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (expired access token)
    if (error.response.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAccessToken();
        if (onAuthFailureCallback) {
          onAuthFailureCallback();
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
