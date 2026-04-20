import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
}

const service: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
})

let isRefreshing = false
let requestsQueue: Array<() => void> = []

const processQueue = (error: Error | null) => {
    requestsQueue.forEach((resolve) => {
        if (error) {
            resolve()
        } else {
            resolve()
        }
    })
    requestsQueue = []
}

service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('smart_mall_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

service.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        const res = response.data

        if (res.code === 200) {
            return res.data
        }

        if (res.code === 401) {
            const userStore = useUserStore()
            const originalRequest = response.config

            if (!isRefreshing) {
                isRefreshing = true
                userStore.refreshToken()
                    .then(() => {
                        processQueue(null)
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('smart_mall_token')}`
                        }
                        return service(originalRequest)
                    })
                    .catch(() => {
                        processQueue(new Error('Token refresh failed'))
                    })
                    .finally(() => {
                        isRefreshing = false
                    })

                return new Promise((resolve) => {
                    requestsQueue.push(() => {
                        resolve(service(originalRequest))
                    })
                })
            }

            return new Promise((resolve) => {
                requestsQueue.push(() => {
                    resolve(service(originalRequest))
                })
            })
        }

        ElMessage.error(res.message || '请求失败')
        return Promise.reject(new Error(res.message || '请求失败'))
    },
    (error) => {
        if (error.response?.status === 401) {
            const userStore = useUserStore()
            userStore.logout()
            return Promise.reject(error)
        }
        ElMessage.error(error.message || '网络错误')
        return Promise.reject(error)
    }
)

export const request = {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return service.get(url, config)
    },
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.post(url, data, config)
    },
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return service.put(url, data, config)
    },
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return service.delete(url, config)
    }
}

export default service