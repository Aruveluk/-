<template>
  <div class="ai-chat-container">
    <!-- 左侧会话列表 -->
    <div class="conversation-sidebar">
      <div class="sidebar-header">
        <el-button type="primary" class="new-chat-btn" @click="handleNewChat">
          <el-icon><Plus /></el-icon>
          新建对话
        </el-button>
      </div>

      <div class="conversation-list">
        <div
            v-for="item in conversationList"
            :key="item.id"
            :class="['conversation-item', { active: currentConversation?.id === item.id }]"
            @click="handleSelectConversation(item)"
        >
          <div class="conversation-content">
            <div class="conversation-title">
              <span v-if="editingId !== item.id">{{ item.title }}</span>
              <el-input
                  v-else
                  v-model="editTitle"
                  size="small"
                  @blur="handleRenameConfirm(item)"
                  @keyup.enter="handleRenameConfirm(item)"
                  ref="editInputRef"
                  maxlength="50"
              />
            </div>
            <div class="conversation-info">
              <span class="message-preview">{{ item.lastMessage || '暂无消息' }}</span>
              <span class="message-time">{{ formatTime(item.updateTime) }}</span>
            </div>
          </div>
          <div class="conversation-actions" @click.stop>
            <el-dropdown trigger="click">
              <el-icon class="action-icon"><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleRename(item)">
                    <el-icon><Edit /></el-icon>
                    重命名
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleDelete(item)" divided>
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <el-empty v-if="conversationList.length === 0" description="暂无历史会话" />
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-main">
      <el-card class="chat-card" v-if="currentConversation">
        <template #header>
          <div class="chat-header">
            <div class="header-left">
              <el-icon size="24" color="#409EFF"><ChatDotRound /></el-icon>
              <span class="title">{{ currentConversation.title }}</span>
            </div>
          </div>
        </template>

        <!-- 消息列表 -->
        <div class="message-list" ref="messageListRef">
          <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="['message-item', msg.role]"
          >
            <div class="avatar">
              <el-icon v-if="msg.role === 'user'" size="24"><User /></el-icon>
              <el-icon v-else size="24"><Service /></el-icon>
            </div>
            <div class="message-content">
              <div class="message-text">{{ msg.content }}</div>
              <div class="message-time">{{ formatTime(msg.createdAt) }}</div>
            </div>
          </div>

          <!-- 加载指示器 -->
          <div v-if="loading" class="message-item assistant">
            <div class="avatar">
              <el-icon size="24"><Service /></el-icon>
            </div>
            <div class="message-content">
              <div class="message-text loading">
                <span class="loading-dots">
                  <span></span><span></span><span></span>
                </span>
                AI 正在思考中...
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="请输入您的问题，我随时为您服务..."
              @keydown.enter.ctrl="handleSend"
              resize="none"
          />
          <div class="input-actions">
            <span class="shortcut-hint">Ctrl + Enter 发送</span>
            <el-button
                type="primary"
                :disabled="!inputMessage.trim() || loading"
                @click="handleSend"
                :icon="Promotion"
            >
              发送
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 欢迎页（未选择会话时） -->
      <div v-else class="welcome-page">
        <div class="welcome-content">
          <el-icon size="80" color="#F56C6C"><Headset /></el-icon>
          <h1>您好，我是智能客服小智 👋</h1>
          <p class="hint">我可以帮您解答商品、订单、售后等问题</p>

          <div class="quick-actions">
            <el-button @click="handleQuickAction('推荐热门商品')">推荐热门商品</el-button>
            <el-button @click="handleQuickAction('查询我的订单')">查询我的订单</el-button>
            <el-button @click="handleQuickAction('售后服务咨询')">售后服务咨询</el-button>
            <el-button @click="handleQuickAction('优惠活动有哪些')">优惠活动有哪些</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * AI客服对话页面
 * Smart Mall - AI Customer Service Chat Page
 * @author SmartMall
 * @version 1.0.0
 */
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ChatDotRound, User, Service, Promotion, MoreFilled, Edit, Delete, Headset } from '@element-plus/icons-vue'
import {
  chat,
  createConversation,
  listConversations,
  getMessages,
  renameConversation,
  deleteConversation
} from '@/api/ai'
import type { ChatMessage, Conversation, ChatRequest, ChatResponse } from '@/api/ai'

// 会话列表
const conversationList = ref<Conversation[]>([])

// 当前会话
const currentConversation = ref<Conversation | null>(null)

// 消息列表
const messages = ref<ChatMessage[]>([])

// 输入消息
const inputMessage = ref<string>('')

// 加载状态
const loading = ref<boolean>(false)

// 消息列表DOM引用
const messageListRef = ref<HTMLElement>()

// 编辑状态
const editingId = ref<number | null>(null)
const editTitle = ref<string>('')
const editInputRef = ref()

/**
 * 格式化时间
 */
const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

/**
 * 加载会话列表
 */
const loadConversationList = async () => {
  try {
    const response = await listConversations()
    conversationList.value = response || []
  } catch (error: any) {
    console.error('加载会话列表失败:', error)
  }
}

/**
 * 新建对话
 */
const handleNewChat = async () => {
  try {
    const newConversation = await createConversation()

    // 添加到列表头部
    conversationList.value.unshift(newConversation)

    // 自动选中新对话
    handleSelectConversation(newConversation)

    ElMessage.success('已开启新对话')
  } catch (error: any) {
    ElMessage.error(error.message || '创建会话失败')
  }
}

/**
 * 选择会话
 */
const handleSelectConversation = async (conversation: Conversation) => {
  try {
    currentConversation.value = conversation

    // 加载消息历史
    const response = await getMessages(conversation.id)
    messages.value = response || []

    // 滚动到底部
    scrollToBottom()
  } catch (error: any) {
    ElMessage.error(error.message || '加载消息历史失败')
  }
}

/**
 * 发送消息
 */
const handleSend = async () => {
  const message = inputMessage.value.trim()
  if (!message || loading.value) return

  inputMessage.value = ''

  // 添加用户消息
  messages.value.push({
    id: Date.now(),
    conversationId: currentConversation.value?.id || 0,
    role: 'user',
    content: message,
    createdAt: new Date().toISOString()
  })

  scrollToBottom()
  loading.value = true

  try {
    const request: ChatRequest = {
      message: message,
      conversationId: currentConversation.value?.id
    }

    const data: ChatResponse = await chat(request)

    // 添加AI回复
    messages.value.push({
      id: Date.now() + 1,
      conversationId: data.conversationId,
      role: 'assistant',
      content: data.reply,
      createdAt: new Date().toISOString()
    })

    // 更新当前会话信息
    if (currentConversation.value && currentConversation.value.id === data.conversationId) {
      currentConversation.value.lastMessage = data.reply.substring(0, 50)
      currentConversation.value.messageCount = (currentConversation.value.messageCount || 0) + 2
    }

    scrollToBottom()

  } catch (error: any) {
    ElMessage.error(error.message || '发送消息失败')
  } finally {
    loading.value = false
  }
}

/**
 * 快捷操作
 */
const handleQuickAction = async (action: string) => {
  // 先创建新会话
  await handleNewChat()

  // 设置快捷问题
  inputMessage.value = action
}

/**
 * 重命名会话
 */
const handleRename = (conversation: Conversation) => {
  editingId.value = conversation.id
  editTitle.value = conversation.title
  nextTick(() => {
    const input = editInputRef.value as any
    if (input?.focus) {
      input.focus()
    }
  })
}

/**
 * 确认重命名
 */
const handleRenameConfirm = async (conversation: Conversation) => {
  if (!editTitle.value.trim()) {
    ElMessage.warning('会话名称不能为空')
    editingId.value = null
    return
  }

  try {
    await renameConversation(conversation.id, editTitle.value.trim())
    conversation.title = editTitle.value.trim()
    ElMessage.success('重命名成功')
  } catch (error: any) {
    ElMessage.error(error.message || '重命名失败')
  } finally {
    editingId.value = null
  }
}

/**
 * 删除会话
 */
const handleDelete = async (conversation: Conversation) => {
  try {
    await ElMessageBox.confirm('确定要删除这个会话吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteConversation(conversation.id)

    // 从列表中移除
    const index = conversationList.value.findIndex(c => c.id === conversation.id)
    if (index !== -1) {
      conversationList.value.splice(index, 1)
    }

    // 如果删除的是当前会话，清空消息
    if (currentConversation.value?.id === conversation.id) {
      currentConversation.value = null
      messages.value = []
    }

    ElMessage.success('会话已删除')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除会话失败')
    }
  }
}

/**
 * 组件挂载时加载会话列表
 */
onMounted(() => {
  loadConversationList()
})
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  height: calc(100vh - 140px);
  background-color: #f5f7fa;
  gap: 20px;
  padding: 20px;
}

/* 左侧会话列表 */
.conversation-sidebar {
  width: 280px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.new-chat-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 4px;
}

.conversation-item:hover {
  background-color: #f5f7fa;
}

.conversation-item.active {
  background-color: #ecf5ff;
}

.conversation-content {
  flex: 1;
  overflow: hidden;
}

.conversation-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-title .el-input {
  width: 100%;
}

.conversation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.message-preview {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.message-time {
  font-size: 12px;
  color: #c0c4cc;
  margin-left: 8px;
}

.conversation-actions {
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.conversation-item:hover .conversation-actions {
  opacity: 1;
}

.action-icon {
  cursor: pointer;
  color: #909399;
  font-size: 16px;
}

.action-icon:hover {
  color: #409eff;
}

/* 右侧聊天区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left .title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 消息列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-state p {
  margin-top: 16px;
  font-size: 16px;
}

.empty-state .hint {
  font-size: 14px;
  color: #c0c4cc;
  margin-top: 8px;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-item.user .avatar {
  background-color: #409eff;
  color: #fff;
}

.message-item.assistant .avatar {
  background-color: #67c23a;
  color: #fff;
}

.message-content {
  max-width: 70%;
  margin: 0 12px;
}

.message-item.user .message-content {
  align-items: flex-end;
}

.message-text {
  padding: 12px 16px;
  border-radius: 8px;
  line-height: 1.6;
  word-break: break-word;
}

.message-item.user .message-text {
  background-color: #409eff;
  color: #fff;
  border-bottom-right-radius: 2px;
}

.message-item.assistant .message-text {
  background-color: #f5f7fa;
  color: #303133;
  border-bottom-left-radius: 2px;
}

.message-time {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
}

.message-item.user .message-time {
  text-align: right;
}

.loading .loading-dots {
  display: inline-block;
  margin-right: 8px;
}

.loading-dots span {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #909399;
  animation: loading 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }
.loading-dots span:nth-child(3) { animation-delay: 0s; }

@keyframes loading {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* 输入区域 */
.input-area {
  padding: 16px;
  border-top: 1px solid #ebeef5;
}

.input-area .el-textarea {
  margin-bottom: 12px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shortcut-hint {
  font-size: 12px;
  color: #c0c4cc;
}

/* 欢迎页 */
.welcome-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
}

.welcome-content {
  text-align: center;
}

.welcome-content h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 24px 0 12px;
}

.welcome-content .hint {
  font-size: 14px;
  color: #909399;
  margin-bottom: 32px;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.quick-actions .el-button {
  min-width: 160px;
}
</style>