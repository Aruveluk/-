/**
 * 商品管理模块 API 接口封装
 * 用途：封装商品相关的所有 HTTP 请求
 * 修改：修复列表接口返回数据格式解析（records -> list）
 */

import request from '@/utils/request';
import type {
    ProductListQuery,
    ProductListResponse,
    ProductItem,
    ProductFormData,
    ProductCategory,
    UploadResponse,
    ProductStatus
} from '@/types/product';

// API 基础路径
const BASE_URL = '/admin/product';

/**
 * 获取商品列表
 * 注意：后端返回的是MyBatis-Plus的Page对象，字段是records和total
 */
export async function getProductList(params: ProductListQuery): Promise<ProductListResponse> {
    const response = await request.get<any>(`${BASE_URL}/list`, { params });
    // 处理MyBatis-Plus Page对象的字段映射
    // 后端返回: { records: [...], total: x } -> 前端期望: { list: [...], total: x }
    if (response && response.records) {
        return {
            list: response.records,
            total: response.total || 0
        };
    }
    // 兼容已有的list格式
    return response || { list: [], total: 0 };
}

/**
 * 获取商品详情
 */
export function getProductDetail(id: number) {
    return request.get<ProductItem>(`${BASE_URL}/${id}`);
}

/**
 * 添加商品
 */
export function addProduct(data: ProductFormData) {
    return request.post<{ id: number }>(`${BASE_URL}`, data);
}

/**
 * 更新商品
 */
export function updateProduct(data: ProductFormData) {
    return request.put<void>(`${BASE_URL}/${data.id}`, data);
}

/**
 * 删除商品
 */
export function deleteProduct(id: number) {
    return request.delete<void>(`${BASE_URL}/${id}`);
}

/**
 * 批量删除商品
 */
export function batchDeleteProducts(ids: number[]) {
    return request.post<void>(`${BASE_URL}/batch-delete`, { ids });
}

/**
 * 更新商品状态（上架/下架）
 */
export function updateProductStatus(id: number, status: ProductStatus) {
    return request.put<void>(`${BASE_URL}/status/${id}`, null, {
        params: { status }
    });
}

/**
 * 批量更新商品状态
 */
export function batchUpdateStatus(ids: number[], status: ProductStatus) {
    return request.put<void>(`${BASE_URL}/batch-status`, { ids, status });
}

/**
 * 获取商品分类列表
 */
export function getCategoryList(parentId?: number) {
    return request.get<ProductCategory[]>(`/admin/category/list`, {
        params: { parentId }
    });
}

/**
 * 获取商品分类树
 */
export function getCategoryTree() {
    return request.get<ProductCategory[]>(`/admin/category/tree`);
}

/**
 * 上传商品图片
 */
export function uploadProductImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'product');

    return request.post<UploadResponse>('/admin/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}