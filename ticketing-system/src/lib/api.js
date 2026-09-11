import axios from 'axios';
import { authStorage } from './authStorage';

let API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  if (window.location.hostname.includes('devtunnels.ms')) {
    const host = window.location.hostname.replace('-5173', '-5000');
    API_URL = `https://${host}`;
  } else {
    API_URL = `http://${window.location.hostname}:5000`;
  }
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const accessToken = authStorage.getAccessToken();

  if (accessToken && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

const refreshAccessToken = async () => {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const { data } = await refreshClient.put('/refresh', { refreshToken });
  const accessToken = data.accessToken;

  if (!accessToken) throw new Error('Refresh response did not include an access token');

  authStorage.setAccessToken(accessToken);
  return accessToken;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isRefreshRequest = originalRequest?.url === '/refresh';

    if (status !== 401 || originalRequest?._retry || isRefreshRequest || originalRequest?.skipAuth) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const accessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      authStorage.clear();
      window.dispatchEvent(new Event('auth:expired'));
      return Promise.reject(refreshError);
    }
  },
);

export default api;
