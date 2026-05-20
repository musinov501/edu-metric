import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    // TODO: route 401 → /login, surface toast for 5xx
    return Promise.reject(err);
  },
);
