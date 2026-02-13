const sizesEndpoint = '/sizes';
import http from '../utils/http.js';
import authHttp from '../utils/auth_http.js';

export async function getAllSizes() {
    return await http.get(sizesEndpoint);
}
export async function createSize(sizeData) {
    return await authHttp.post(sizesEndpoint, sizeData);
}

export async function deleteSize(sizeId) {
    return await authHttp.delete(`${sizesEndpoint}/${sizeId}`);
}

export async function temp_auth_check() {
    return await authHttp.get(`${sizesEndpoint}/temp_auth_check`);  
}