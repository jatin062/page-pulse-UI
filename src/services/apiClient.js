import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const nextConfig = { ...config };
  nextConfig.headers = {
    ...nextConfig.headers,
    'X-Requested-With': 'XMLHttpRequest',
  };
  return nextConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default apiClient;
