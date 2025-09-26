import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Enable sending cookies
});

// Thêm interceptor để xử lý token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    console.error('API Error:', {
      status: error.response?.status,
      message: errorMessage,
      url: error.config?.url,
      method: error.config?.method,
    });
    
    // Retry the request once if it's a network error
    if (error.code === 'ERR_NETWORK' && !error.config.__isRetry) {
      error.config.__isRetry = true;
      return apiClient(error.config);
    }
    
    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

export default apiClient;
