const productsEndpoint = '/products';

import { http } from '../utils/http.js';
import authHttp from '../utils/auth_http.js';
import authMultipart from '../utils/authMultipart.js';

export async function fetchAllProducts() {
    return await authHttp.get(productsEndpoint);
}

export async function fetchProductByPage(params) {
    return await http.get(`${productsEndpoint}/pageable?${params.toString()}`);
}

export async function fetchProductById(productId) {
    return await http.get(`${productsEndpoint}/${productId}`);
}

export async function createProduct(formData) {
    return await authMultipart.post(productsEndpoint, formData);
}

export async function updateProduct(productId, formData) {
    return await authMultipart.put(`${productsEndpoint}/${productId}`, formData);
}

export async function deleteProduct(productId) {
    return await authHttp.delete(`${productsEndpoint}/${productId}`);
}