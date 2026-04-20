/**
 * 订单管理API
 * 用途：订单列表、详情、发货等接口
 */
import request from '@/utils/request'

// 订单状态枚举
export enum OrderStatus {
    PENDING_PAYMENT = 0,   // 待付款
    PENDING_DELIVERY = 1,  // 待发货
    DELIVERED = 2,         // 已发货
    COMPLETED = 3,         // 已完成
    CLOSED = 4,            // 已关闭
}

// 订单状态映射
export const orderStatusMap: Record<number, { label: string; type: string }> = {
    0: { label: '待付款', type: 'warning' },
    1: { label: '待发货', type: 'primary' },
    2: { label: '已发货', type: 'info' },
    3: { label: '已完成', type: 'success' },
    4: { label: '已关闭', type: 'danger' },
}

// 支付方式映射
export const payTypeMap: Record<number, string> = {
    0: '未支付',
    1: '支付宝',
    2: '微信',
}

// 订单来源映射
export const sourceTypeMap: Record<number, string> = {
    0: 'PC端',
    1: 'APP端',
    2: '小程序',
}

// 订单类型定义
export interface Order {
    id: number
    orderSn: string
    memberId: number
    couponId: number
    useIntegration: number
    integrationAmount: number
    couponAmount: number
    discountAmount: number
    payAmount: number
    totalAmount: number
    freightAmount: number
    payType: number
    sourceType: number
    status: number
    deliverySn: string
    deliveryCompany: string
    receiverName: string
    receiverPhone: string
    receiverPostCode: string
    receiverProvince: string
    receiverCity: string
    receiverDistrict: string
    receiverAddress: string
    receiverTag: string
    note: string
    confirmStatus: number
    paymentTime: string
    deliveryTime: string
    receiveTime: string
    commentTime: string
    createTime: string
    updateTime: string
}

// 分页查询参数
export interface OrderListParams {
    pageNum: number
    pageSize: number
    status?: number
    orderSn?: string
}

// 分页结果
export interface OrderListResult {
    records: Order[]
    total: number
}

// 发货参数
export interface DeliverParams {
    id: number
    deliveryCompany: string
    deliverySn: string
}

// 获取订单列表
export function getOrderList(params: OrderListParams) {
    return request.get<OrderListResult>('/admin/order/list', { params })
}

// 获取订单详情
export function getOrderById(id: number) {
    return request.get<Order>(`/admin/order/${id}`)
}

// 修改订单状态
export function updateOrderStatus(id: number, status: number) {
    return request.post('/admin/order/status', null, { params: { id, status } })
}

// 发货
export function deliverOrder(data: DeliverParams) {
    return request.post('/admin/order/deliver', null, { params: data })
}

// 删除订单
export function deleteOrder(id: number) {
    return request.delete(`/admin/order/${id}`)
}