/**
 * AI 客服 API 接口
 * Smart Mall - AI Customer Service API
 * 注意：request.ts 响应拦截器返回 res.data，所以接口类型要匹配拦截后的格式
 */
import request from '@/utils/request'

/**
 * 聊天请求参数
 */
export interface ChatRequest {
    message: string
    conversationId?: number
    chatType?: number
}

/**
 * 聊天响应
 */
export interface ChatResponse {
    conversationId: number
    reply: string
    chatType: number
}

/**
 * 聊天消息
 */
export interface ChatMessage {
    id: number
    conversationId: number
    role: 'user' | 'assistant'
    content: string
    tokenCount?: number
    createdAt: string
}

/**
 * 对话会话
 */
export interface Conversation {
    id: number
    memberId: number
    title: string
    chatType: number
    messageCount: number
    lastMessage?: string
    createTime: string
    updateTime: string
}

/**
 * 发送消息给 AI 客服
 * @param data 聊天请求参数
 * @returns AI 回复
 */
export function chat(data: ChatRequest): Promise<ChatResponse> {
    return request.post('/ai/chat/send', data)
}

/**
 * 创建新会话
 * @param title 会话标题（可选）
 * @returns 新创建的会话
 */
export function createConversation(title?: string): Promise<Conversation> {
    return request.post('/ai/chat/conversation/create', null, { params: { title } })
}

/**
 * 获取用户的所有对话会话列表
 * @returns 会话列表
 */
export function listConversations(): Promise<Conversation[]> {
    return request.get('/ai/chat/conversation/list')
}

/**
 * 获取某个会话的详细历史
 * @param conversationId 会话ID
 * @returns 对话历史消息列表
 */
export function getMessages(conversationId: number): Promise<ChatMessage[]> {
    return request.get(`/ai/chat/conversation/${conversationId}/messages`)
}

/**
 * 重命名会话
 * @param conversationId 会话ID
 * @param title 新标题
 * @returns 操作结果
 */
export function renameConversation(conversationId: number, title: string): Promise<void> {
    return request.put(`/ai/chat/conversation/${conversationId}/rename`, null, { params: { title } })
}

/**
 * 删除某个会话
 * @param conversationId 会话ID
 * @returns 操作结果
 */
export function deleteConversation(conversationId: number): Promise<void> {
    return request.delete(`/ai/chat/conversation/${conversationId}`)
}
