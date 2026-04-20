/*
 * 用户状态管理 - mall-admin后台管理系统
 * 用途：管理用户登录状态、Token、用户信息
 * 说明：使用Pinia持久化存储Token到localStorage
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getUserInfo as getUserInfoApi, logout as logoutApi, refreshToken as refreshTokenApi } from '@/api/auth'
import type { LoginParams, UserInfo } from '@/api/auth'
import { ElMessage } from 'element-plus'
import router from '@/router'

// Token存储key - 与request.ts保持一致
const TOKEN_KEY = 'smart_mall_token'

export const useUserStore = defineStore('user', () => {
    // ==================== 状态定义 ====================

    /** 用户Token */
    const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '')

    /** 用户信息 */
    const userInfo = ref<UserInfo | null>(null)

    /** 登录状态 */
    const isLoggedIn = ref<boolean>(!!token.value)

    // ==================== 方法定义 ====================

    /**
     * 用户登录
     * @param params 登录参数（用户名、密码）
     * @returns 登录是否成功
     */
    const login = async (params: LoginParams) => {
        try {
            const result = await loginApi(params)
            console.log('登录响应:', result)

            // 存储Token
            // request.ts 响应拦截器返回 res.data，所以 result 已经是 { token: "xxx" }
            token.value = result.token
            localStorage.setItem(TOKEN_KEY, result.token)
            isLoggedIn.value = true

            // 获取用户信息
            await fetchUserInfo()

            ElMessage.success('登录成功')

            // 跳转到首页或redirect指定的页面
            const redirect = router.currentRoute.value.query.redirect as string
            router.push(redirect || '/admin/dashboard')

            return true
        } catch (error) {
            console.error('登录失败:', error)
            return false
        }
    }

    /**
     * 获取用户信息
     */
    const fetchUserInfo = async () => {
        try {
            const info = await getUserInfoApi()
            console.log('用户信息:', info)
            userInfo.value = info
            localStorage.setItem('userInfo', JSON.stringify(info))
        } catch (error) {
            console.error('获取用户信息失败', error)
        }
    }

    /**
     * 用户登出
     */
    const logout = async () => {
        try {
            await logoutApi()
        } catch (error) {
            console.error('登出接口调用失败', error)
        } finally {
            // 清除状态
            token.value = ''
            userInfo.value = null
            isLoggedIn.value = false
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem('userInfo')

            ElMessage.success('已退出登录')
            router.push('/login')
        }
    }

    /**
     * 刷新Token
     * @returns 刷新是否成功
     */
    const refreshToken = async (): Promise<boolean> => {
        try {
            const result = await refreshTokenApi()
            token.value = result.token
            localStorage.setItem(TOKEN_KEY, result.token)
            return true
        } catch (error) {
            console.error('Token刷新失败', error)
            await logout()
            return false
        }
    }

    /**
     * 从localStorage恢复用户信息
     */
    const restoreUserInfo = () => {
        const storedUserInfo = localStorage.getItem('userInfo')
        if (storedUserInfo) {
            try {
                userInfo.value = JSON.parse(storedUserInfo)
            } catch (error) {
                console.error('解析用户信息失败', error)
            }
        }
    }

    // 初始化时恢复用户信息
    restoreUserInfo()

    return {
        token,
        userInfo,
        isLoggedIn,
        login,
        logout,
        fetchUserInfo,
        refreshToken
    }
})
