const API_URL = 'http://localhost:8080/api';

export const handleResponse = async (response) => {
  // (status not in 200-299)
  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  // Parse JSON response
  return response.json();
};

export const http = {
  // GET
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`);
    return handleResponse(response);
  },

  // POST
  post: async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // PUT
  put: async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // DELETE
  delete: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // For file uploads or custom headers
  uploadFile: async (endpoint, options = {}) => {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });
    return handleResponse(response);
  },
};

export default http;