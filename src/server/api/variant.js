const variantsEndpoint = '/variants';
import http from '../utils/http.js';
import authHttp from '../utils/auth_http.js';

export async function createVariant(variantData){
    return await authHttp.post(`${variantsEndpoint}`, variantData);
}
export async function updateVariant(variantId, variantData){
    return await authHttp.put(`${variantsEndpoint}/${variantId}`, variantData);
}
export async function updateVariantStock(sku, newStock){
    return await authHttp.put(`${variantsEndpoint}/${sku}/stock`, { stock: newStock });
}
export async function deleteVariant(sku){
    return await authHttp.delete(`${variantsEndpoint}/${sku}`);
}

export async function getAllVariants(){
    return await authHttp.get(variantsEndpoint);
}
export async function getVariantsByProductId(productId){
    return await http.get(`${variantsEndpoint}/product/${productId}`);
}
export async function getVariantBySku(sku){
    return await http.get(`${variantsEndpoint}/${sku}`);
}