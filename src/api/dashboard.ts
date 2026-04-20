/**
 * 仪表盘API
 * 用途：仪表盘统计数据接口
 */
import request from '@/utils/request'

// 统计数据类型
export interface DashboardStats {
    todayOrders: number
    todaySales: number
    totalUsers: number
    totalProducts: number
}

// 销售趋势类型
export interface SalesTrend {
    date: string
    sales: number
    orders: number
}

// 获取统计概览
export function getDashboardStats() {
    return request.get<DashboardStats>('/admin/dashboard/stats')
}

// 获取销售趋势
export function getSalesTrend(days: number = 7) {
    return request.get<SalesTrend[]>('/admin/dashboard/sales-trend', { params: { days } })
}