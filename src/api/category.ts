/**
 * 商品分类管理模块 API 接口封装
 * 用途：封装分类相关的所有 HTTP 请求
 */

import request from '@/utils/request';
import type { CategoryFormData, CategoryTreeItem } from '@/types/product';

// API 基础路径
const BASE_URL = '/admin/category';

/**
 * 获取分类树
 */
export function getCategoryTree() {
    return request.get<CategoryTreeItem[]>(`${BASE_URL}/tree`);
}

/**
 * 获取分类列表（分页）
 */
export function getCategoryList(params: {
    pageNum?: number;
    pageSize?: number;
    keyword?: string;
    parentId?: number;
    status?: number;
}) {
    return request.get<any>(`${BASE_URL}/list`, { params });
}

/**
 * 获取分类详情
 */
export function getCategoryDetail(id: number) {
    return request.get<CategoryTreeItem>(`${BASE_URL}/${id}`);
}

/**
 * 添加分类
 */
export function addCategory(data: CategoryFormData) {
    return request.post<{ id: number }>(`${BASE_URL}`, data);
}

/**
 * 更新分类
 */
export function updateCategory(id: number, data: CategoryFormData) {
    return request.put<void>(`${BASE_URL}/${id}`, data);
}

/**
 * 删除分类
 */
export function deleteCategory(id: number) {
    return request.delete<void>(`${BASE_URL}/${id}`);
}