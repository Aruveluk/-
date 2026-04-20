<!--
 * 顶部导航组件
 * 用途：后台管理系统顶部导航栏
 * 说明：左侧折叠按钮+面包屑，右侧用户信息+退出登录
 -->
<template>
  <div class="header-container">
    <!-- 左侧区域 -->
    <div class="header-left">
      <!-- 折叠按钮 -->
      <div class="collapse-btn" @click="handleToggleSidebar">
        <el-icon :size="20">
          <Fold v-if="!isCollapsed" />
          <Expand v-else />
        </el-icon>
      </div>

      <!-- 面包屑导航 -->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">
          <el-icon><HomeFilled /></el-icon>
          首页
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentRoute.meta?.title">
          {{ currentRoute.meta.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧区域 -->
    <div class="header-right">
      <!-- 用户信息 -->
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" class="user-avatar">
            {{ username?.charAt(0)?.toUpperCase() }}
          </el-avatar>
          <span class="username">{{ username || 'Admin' }}</span>
          <el-icon class="el-icon--right">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              账户设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Fold, Expand, HomeFilled, User, Setting, SwitchButton, ArrowDown } from '@element-plus/icons-vue'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'

// 路由
const route = useRoute()

// Store
const menuStore = useMenuStore()
const userStore = useUserStore()

// 从localStorage获取用户名
const username = computed(() => {
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      return JSON.parse(userInfo).username
    } catch {
      return 'Admin'
    }
  }
  return 'Admin'
})

// 响应式状态
const isCollapsed = computed(() => menuStore.isCollapsed)

// 当前路由
const currentRoute = computed(() => route)

// 切换侧边栏
function handleToggleSidebar() {
  menuStore.toggleSidebar()
}

// 处理下拉菜单命令
async function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心功能开发中...')
      break
    case 'settings':
      ElMessage.info('账户设置功能开发中...')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await userStore.logout()
      } catch {
        // 用户取消操作
      }
      break
  }
}
</script>

<style lang="scss" scoped>
.header-container {
  position: fixed;
  top: 0;
  left: 200px;
  right: 0;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  transition: left 0.3s ease-in-out;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  color: #606266;

  &:hover {
    background-color: #f5f7fa;
    color: #e1251b;
  }
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f5f7fa;
  }

  .user-avatar {
    background-color: #e1251b;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
  }

  .username {
    font-size: 14px;
    color: #303133;
  }

  .el-icon--right {
    color: #909399;
  }
}
</style>