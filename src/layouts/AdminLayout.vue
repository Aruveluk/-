<!--
 * 后台管理主布局组件
 * 用途：整合侧边栏、顶部导航和主内容区
 * 说明：响应式布局，支持菜单折叠/展开动画
 -->
<template>
  <div class="admin-layout">
    <!-- 左侧菜单 -->
    <Sidebar />

    <!-- 顶部导航 -->
    <Header />

    <!-- 主内容区域 -->
    <main
        class="main-content"
        :class="{ 'is-collapsed': isCollapsed }"
    >
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMenuStore, useUserStore } from '@/stores'
import Sidebar from '@/components/Sidebar/index.vue'
import Header from '@/components/Header/index.vue'

// Store
const menuStore = useMenuStore()
const userStore = useUserStore()

// 响应式状态
const isCollapsed = computed(() => menuStore.isCollapsed)

// 组件挂载时获取用户信息
onMounted(async () => {
  if (userStore.token && !userStore.userInfo) {
    await userStore.fetchUserInfo()
  }
})
</script>

<style lang="scss" scoped>
.admin-layout {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  position: fixed;
  top: 60px;
  left: 200px;
  right: 0;
  bottom: 0;
  background-color: #f0f2f5;
  overflow-y: auto;
  transition: left 0.3s ease-in-out;

  &.is-collapsed {
    left: 64px;
  }
}

.content-wrapper {
  padding: 20px;
  min-height: calc(100vh - 60px);
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>