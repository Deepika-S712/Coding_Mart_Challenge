/**
 * Centralized API Client adhering to CMS-DS v1.0 architecture
 * Frontend -> API Client -> Backend Controller -> Service -> Repository -> Mock Data
 */

const BASE_URL = '/api';

export async function apiClient(endpoint, { method = 'GET', body, headers = {}, ...customConfig } = {}) {
  const token = localStorage.getItem('cms_faculty_token');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers
  };

  const config = {
    method,
    headers: defaultHeaders,
    ...customConfig
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({
      success: false,
      message: 'Failed to parse JSON response'
    }));

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/login')) {
        // Clear expired or invalid session and redirect to login
        localStorage.removeItem('cms_faculty_token');
        localStorage.removeItem('cms_faculty_user');
        window.location.href = '/login';
      }

      const error = new Error(data.message || 'API request failed');
      error.status = response.status;
      error.error = data.error;
      error.details = data.details;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Client Error] ${method} ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  get: (url, config) => apiClient(url, { method: 'GET', ...config }),
  post: (url, body, config) => apiClient(url, { method: 'POST', body, ...config }),
  put: (url, body, config) => apiClient(url, { method: 'PUT', body, ...config }),
  delete: (url, config) => apiClient(url, { method: 'DELETE', ...config })
};
