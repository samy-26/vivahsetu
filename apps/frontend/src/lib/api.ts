import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const original = error.config as any;

    if (error.response?.status === 401 && typeof window !== 'undefined' && !original._retry) {
      const refreshToken = localStorage.getItem('refreshToken');

      // No refresh token — go to login
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject((error.response?.data as any) || error);
      }

      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const newToken = res.data?.data?.accessToken || res.data?.accessToken;
        if (!newToken) throw new Error('No token in refresh response');

        localStorage.setItem('accessToken', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // Flush queued requests
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        // Refresh failed — clear session and redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        refreshQueue = [];
        window.location.href = '/auth/login';
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject((error.response?.data as any) || error);
  },
);

export default api;
