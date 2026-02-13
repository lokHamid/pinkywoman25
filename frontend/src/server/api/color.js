const colorsEndpoint = '/colors';
import http from '../utils/http.js';
import authHttp from '../utils/auth_http.js';

export async function getAllColors() {
    return await http.get(colorsEndpoint);
}
export async function createColor(colorData) {
    return await authHttp.post(colorsEndpoint, colorData);
}
export async function deleteColor(colorId) {
    return await authHttp.delete(`${colorsEndpoint}/${colorId}`);
}