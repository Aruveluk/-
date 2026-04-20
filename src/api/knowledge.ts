/**
 * 知识库管理API
 */
import request from '@/utils/request'

// 知识项类型
export interface KnowledgeItem {
    id: number
    title: string
    content: string
    type: number
    keywords: string
    status: number
    sort: number
    createTime: string
    updateTime: string
}

// 知识表单类型
export interface KnowledgeForm {
    id?: number
    title: string
    content: string
    type: number
    keywords: string
    status: number
    sort?: number
}

// 分页响应类型
export interface KnowledgePageResponse {
    records: KnowledgeItem[]
    total: number
    size: number
    current: number
    pages: number
}

// 获取知识列表
export const getKnowledgeList = (params: {
    pageNum: number
    pageSize: number
    keyword?: string
    type?: number
}): Promise<KnowledgePageResponse> => {
    return request.get('/ai/knowledge/list', { params })
}

// 添加知识
export const addKnowledge = (data: KnowledgeForm): Promise<void> => {
    return request.post('/ai/knowledge/add', data)
}

// 更新知识
export const updateKnowledge = (id: number, data: KnowledgeForm): Promise<void> => {
    return request.put(`/ai/knowledge/update/${id}`, data)
}

// 删除知识
export const deleteKnowledge = (id: number): Promise<void> => {
    return request.delete(`/ai/knowledge/delete/${id}`)
}

// 获取知识详情
export const getKnowledgeDetail = (id: number): Promise<KnowledgeItem> => {
    return request.get(`/ai/knowledge/${id}`)
}

// 更新状态
export const updateKnowledgeStatus = (id: number, status: number): Promise<void> => {
    return request.put(`/ai/knowledge/status/${id}?status=${status}`)
}