import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format error responses
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const customError = new Error(data?.error?.message || `Request failed with status ${status}`);
      customError.status = status;
      customError.code = data?.error?.code || 'ERROR';
      customError.details = data?.error?.details;
      
      // Auto logout on 401
      if (status === 401 && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('cms_token');
        localStorage.removeItem('cms_user');
        window.location.href = '/login';
      }
      
      return Promise.reject(customError);
    } else if (error.request) {
      const netError = new Error('Network error: Unable to connect to CMS Server.');
      netError.status = 0;
      netError.code = 'NETWORK_ERROR';
      return Promise.reject(netError);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
