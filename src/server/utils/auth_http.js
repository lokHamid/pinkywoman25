import { handleResponse } from './http.js';

const API_URL = 'http://localhost:8080/api';

const getToken = () => localStorage.getItem('jwt');

const authFetch = async (url, options = {}) => {
  const token = getToken();

  const authHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  return handleResponse(response);
};



export const authHttp = {
  get: async (endpoint) => authFetch(`${API_URL}${endpoint}`),

  post: async (endpoint, data) =>
    authFetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: async (endpoint, data) =>
    authFetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: async (endpoint) =>
    authFetch(`${API_URL}${endpoint}`, { method: 'DELETE' }),
};

export default authHttp;