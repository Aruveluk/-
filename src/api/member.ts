/**
 * 会员管理API
 * 用途：会员列表、详情、状态修改等接口
 */
import request from '@/utils/request'

// 会员状态枚举
export enum MemberStatus {
    DISABLED = 0,  // 禁用
    ENABLED = 1,   // 启用
}

// 会员状态映射
export const memberStatusMap: Record<number, { label: string; type: string }> = {
    0: { label: '禁用', type: 'danger' },
    1: { label: '正常', type: 'success' },
}

// 会员等级映射
export const memberLevelMap: Record<number, string> = {
    1: '普通会员',
    2: '铜牌会员',
    3: '银牌会员',
    4: '金牌会员',
    5: '钻石会员',
}

// 性别映射
export const genderMap: Record<number, string> = {
    0: '未知',
    1: '男',
    2: '女',
}

// 会员类型定义
export interface Member {
    id: number
    memberLevel: number
    username: string
    password: string
    nickname: string
    phone: string
    email: string
    avatar: string
    gender: number
    birthday: string
    city: string
    job: string
    personalizedSignature: string
    integration: number
    growth: number
    balance: number
    status: number
    lastLoginTime: string
    createTime: string
    updateTime: string
}

// 分页查询参数
export interface MemberListParams {
    pageNum: number
    pageSize: number
    status?: number
    keyword?: string
}

// 分页结果
export interface MemberListResult {
    records: Member[]
    total: number
}

// 获取会员列表
export function getMemberList(params: MemberListParams) {
    return request.get<MemberListResult>('/admin/member/list', { params })
}

// 获取会员详情
export function getMemberById(id: number) {
    return request.get<Member>(`/admin/member/${id}`)
}

// 修改会员状态
export function updateMemberStatus(id: number, status: number) {
    return request.post('/admin/member/status', null, { params: { id, status } })
}

// 删除会员
export function deleteMember(id: number) {
    return request.delete(`/admin/member/${id}`)
}