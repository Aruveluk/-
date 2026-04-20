<!--
 * 左侧菜单组件
 * 用途：后台管理系统侧边栏导航菜单
 * 说明：深色背景，支持折叠/展开，京东红高亮选中项
 -->
<template>
  <div class="sidebar-container" :class="{ 'is-collapsed': isCollapsed }">
    <!-- Logo 区域 -->
    <div class="sidebar-logo">
      <router-link to="/admin/dashboard">
        <span v-if="!isCollapsed" class="logo-text">智能商城</span>
        <span v-else class="logo-text-collapsed">商城</span>
      </router-link>
    </div>

    <!-- 菜单区域 -->
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
          :default-active="activeMenu"
          :collapse="isCollapsed"
          :collapse-transition="false"
          :unique-opened="true"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#e1251b"
          class="sidebar-menu"
          router
      >
        <template v-for="item in menuItems" :key="item.id">
          <!-- 有子菜单 -->
          <el-sub-menu v-if="item.children && item.children.length" :index="item.id">
            <template #title>
              <el-icon><component :is="getIcon(item.icon)" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
                v-for="child in item.children"
                :key="child.id"
                :index="child.path || child.id"
            >
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 无子菜单 -->
          <el-menu-item v-else :index="item.path || item.id">
            <el-icon><component :is="getIcon(item.icon)" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import {
  Odometer, Goods, List, User, Sell
} from '@element-plus/icons-vue'

// 路由
const route = useRoute()

// Store
const menuStore = useMenuStore()

// 响应式状态
const isCollapsed = computed(() => menuStore.isCollapsed)
const menuItems = computed(() => menuStore.menuItems)

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 获取图标组件
function getIcon(iconName?: string) {
  const icons: Record<string, any> = {
    Odometer,
    Goods,
    List,
    User,
    Sell
  }
  return iconName ? icons[iconName] : Odometer
}
</script>

<style lang="scss" scoped>
.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 200px;
  height: 100vh;
  background-color: #304156;
  transition: width 0.3s ease-in-out;
  z-index: 1001;
  overflow: hidden;

  &.is-collapsed {
    width: 64px;

    .logo-text-collapsed {
      display: block;
    }
  }
}

.sidebar-logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  background-color: #2b3a4b;
  overflow: hidden;

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-decoration: none;
  }

  .logo-text {
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    letter-spacing: 2px;
  }

  .logo-text-collapsed {
    font-size: 14px;
    font-weight: bold;
    color: #fff;
    letter-spacing: 1px;
  }
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - 60px);
}

// Element Plus 菜单样式覆盖
:deep(.el-menu) {
  border-right: none;
  background-color: #304156;

  .el-menu-item,
  .el-sub-menu__title {
    color: #bfcbd9;
    height: 50px;
    line-height: 50px;

    &:hover {
      background-color: #263445;
      color: #fff;
    }
  }

  .el-sub-menu {
    .el-menu-item {
      height: 46px;
      line-height: 46px;
      padding-left: 50px !important;

      &.is-active {
        color: #e1251b;
        background-color: #263445;
        border-right: 3px solid #e1251b;
      }
    }
  }

  .el-menu-item.is-active {
    color: #e1251b;
    background-color: #263445;
  }
}

.scrollbar-wrapper {
  overflow-x: hidden;
}
</style>