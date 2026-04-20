/**
 * 品牌管理模块 API 接口封装
 * 用途：封装品牌相关的所有 HTTP 请求
 */

import request from '@/utils/request';
import type { BrandFormData, BrandItem, BrandListQuery } from '@/types/product';

// API 基础路径
const BASE_URL = '/admin/brand';

/**
 * 获取品牌列表（分页）
 */
export async function getBrandList(params: BrandListQuery) {
    const response = await request.get<any>(`${BASE_URL}/list`, { params });
    // 处理MyBatis-Plus Page对象的字段映射
    if (response && response.records) {
        return {
            list: response.records,
            total: response.total || 0
        };
    }
    return response || { list: [], total: 0 };
}

/**
 * 获取所有品牌（用于下拉选择）
 */
export function getAllBrands() {
    return request.get<BrandItem[]>(`${BASE_URL}/all`);
}

/**
 * 获取品牌详情
 */
export function getBrandDetail(id: number) {
    return request.get<BrandItem>(`${BASE_URL}/${id}`);
}

/**
 * 添加品牌
 */
export function addBrand(data: BrandFormData) {
    return request.post<{ id: number }>(`${BASE_URL}`, data);
}

/**
 * 更新品牌
 */
export function updateBrand(id: number, data: BrandFormData) {
    return request.put<void>(`${BASE_URL}/${id}`, data);
}

/**
 * 删除品牌
 */
export function deleteBrand(id: number) {
    return request.delete<void>(`${BASE_URL}/${id}`);
}

/**
 * 更新品牌状态
 */
export function updateBrandStatus(id: number, status: number) {
    return request.put<void>(`${BASE_URL}/status/${id}`, null, {
        params: { status }
    });
}