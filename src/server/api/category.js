const categoriesEndpoint = '/categories';

import http from '../utils/http.js';
import authHttp from '../utils/auth_http.js';
import authMultipart from '../utils/authMultipart.js';

export async function fetchAllCategories() {
    return await http.get(categoriesEndpoint);
}

export async function createCategory(formData) {
    return await authMultipart.post(categoriesEndpoint, formData);
}

export async function deleteCategory(categoryId) {
    return await authHttp.delete(`${categoriesEndpoint}/${categoryId}`);
}