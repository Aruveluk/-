/**
 * 优惠券管理API
 * 用途：优惠券列表、详情、创建、修改等接口
 */
import request from '@/utils/request'

// 优惠券类型枚举
export enum CouponType {
    FULL_REDUCTION = 0,  // 满减券
    DISCOUNT = 1,        // 折扣券
    CASH = 2,            // 现金券
}

// 优惠券类型映射
export const couponTypeMap: Record<number, string> = {
    0: '满减券',
    1: '折扣券',
    2: '现金券',
}

// 优惠券状态枚举
export enum CouponStatus {
    DISABLED = 0,  // 禁用
    ENABLED = 1,   // 启用
    EXPIRED = 2,   // 已过期
}

// 优惠券状态映射
export const couponStatusMap: Record<number, { label: string; type: string }> = {
    0: { label: '禁用', type: 'danger' },
    1: { label: '启用', type: 'success' },
    2: { label: '已过期', type: 'info' },
}

// 使用类型映射
export const useTypeMap: Record<number, string> = {
    0: '全场通用',
    1: '指定分类',
    2: '指定商品',
}

// 优惠券类型定义
export interface Coupon {
    id: number
    type: number
    name: string
    code: string
    minPoint: number
    faceValue: number
    discountRate: number
    totalCount: number
    count: number
    perLimit: number
    useType: number
    useStartTime: string
    useEndTime: string
    receiveStartTime: string
    receiveEndTime: string
    publishStartTime: string
    publishEndTime: string
    description: string
    note: string
    status: number
    createTime: string
    updateTime: string
}

// 分页查询参数
export interface CouponListParams {
    pageNum: number
    pageSize: number
    type?: number
    status?: number
    name?: string
}

// 分页结果
export interface CouponListResult {
    records: Coupon[]
    total: number
}

// 获取优惠券列表
export function getCouponList(params: CouponListParams) {
    return request.get<CouponListResult>('/admin/coupon/list', { params })
}

// 获取优惠券详情
export function getCouponById(id: number) {
    return request.get<Coupon>(`/admin/coupon/${id}`)
}

// 创建优惠券
export function createCoupon(data: Coupon) {
    return request.post<{ id: number }>('/admin/coupon', data)
}

// 更新优惠券
export function updateCoupon(id: number, data: Coupon) {
    return request.put(`/admin/coupon/${id}`, data)
}

// 修改优惠券状态
export function updateCouponStatus(id: number, status: number) {
    return request.post('/admin/coupon/status', null, { params: { id, status } })
}

// 删除优惠券
export function deleteCoupon(id: number) {
    return request.delete(`/admin/coupon/${id}`)
}