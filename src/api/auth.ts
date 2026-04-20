/*
 * 认证相关API - mall-admin后台管理系统
 * 用途：登录、登出、获取用户信息等接口
 * 说明：对接后端 /admin/* 接口
 * 注意：request.ts 响应拦截器返回 res.data，所以接口类型要匹配拦截后的格式
 */
import { request } from '@/utils/request'

// 登录参数
export interface LoginParams {
    username: string
    password: string
}

// 登录响应 - 匹配 request.ts 拦截器返回的格式
// 后端返回 { code: 200, data: { token, expiration } }
// 拦截器返回 { token, expiration }
export interface LoginResult {
    token: string
    expiration: number
}

// 用户信息
export interface UserInfo {
    id: number
    username: string
    nickName: string
    email: string
    createTime: string
    status: number
    roles: string[]
    permissions: string[]
}

// 登录接口
export const login = (data: LoginParams): Promise<LoginResult> => {
    return request.post('/admin/auth/login', data)
}

// 获取用户信息
export const getUserInfo = (): Promise<UserInfo> => {
    return request.get('/admin/auth/info')
}

// 登出接口
export const logout = (): Promise<void> => {
    return request.post('/admin/auth/logout')
}

// 刷新Token接口
export const refreshToken = (): Promise<LoginResult> => {
    return request.post('/admin/auth/refresh')
}
