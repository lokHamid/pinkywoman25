const ordersEndpoint = '/orders';
import http from '../utils/http.js';
import authHttp from '../utils/auth_http.js';

export async function fetchOrders() {
    return await authHttp.get(ordersEndpoint);
}
export async function fetchOrderById(orderId) {
    return await authHttp.get(`${ordersEndpoint}/${orderId}`);
}
export async function fetchOrdersByStatus(status) {
    return await authHttp.get(`${ordersEndpoint}/${status}`);
}
export async function fetchOrderByWilayah(wilaya) {
    return await authHttp.get(`${ordersEndpoint}/${wilaya}`);
}


export async function submitOrder(orderData) {
    return await http.post(ordersEndpoint, orderData);
}
export async function updateOrder(orderId, orderData) {
    return await authHttp.put(`${ordersEndpoint}/${orderId}`, orderData);
}
export async function deleteOrder(orderId) {
    return await authHttp.delete(`${ordersEndpoint}/${orderId}`);
}
export async function deleteOrdersByStatus(status) {
    return await authHttp.delete(`${ordersEndpoint}/status/${status}`);
}