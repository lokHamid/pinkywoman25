// src/utils/authMultipart.js
const API_URL = 'http://localhost:8080/api';

const getToken = () => localStorage.getItem('jwt');

export const authMultipart = {
    /**
     * POST multipart/form-data with Authorization
     */
    post: async (endpoint, formData) => {
        const token = getToken();
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // ! VERY IMPORTANT → DO NOT set Content-Type
        // Browser will set correct multipart boundary automatically

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        return handleMultipartResponse(response);
    },

    /**
     * PUT multipart/form-data with Authorization
     */
    put: async (endpoint, formData) => {
        const token = getToken();
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: formData,
        });

        return handleMultipartResponse(response);
    },
};

/**
 * Almost the same as your current handleResponse
 * (just a little more defensive)
 */
async function handleMultipartResponse(response) {
    if (!response.ok) {
        let errorMessage = 'Erreur inconnue';

        try {
            const errorBody = await response.json();
            errorMessage = errorBody.message || errorBody.error || `HTTP ${response.status}`;
        } catch {
            try {
                errorMessage = await response.text();
            } catch {
                // empty
            }
        }

        throw new Error(errorMessage);
    }

    // 204 = no content
    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export default authMultipart;