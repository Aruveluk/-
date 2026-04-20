<!--
 * 首页组件 - mall-admin后台管理系统
 * 用途：登录后的首页，展示系统概览和快捷入口
 * 说明：简单的欢迎页面，后续可添加数据统计图表
 -->
<template>
  <div class="home-container">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎回来</span>
        </div>
      </template>
      <div class="welcome-content">
        <h1>智能商城后台管理系统</h1>
        <p>基于 Spring Boot + Vue 3 + Element Plus</p>
        <div class="quick-links">
          <el-button type="primary" @click="goTo('/product')">
            商品管理
          </el-button>
          <el-button type="primary" @click="goTo('/order')">
            订单管理
          </el-button>
          <el-button type="primary" @click="goTo('/member')">
            会员管理
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 跳转到指定页面
const goTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.welcome-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.welcome-content {
  text-align: center;
  padding: 40px 0;
}

.welcome-content h1 {
  color: #e1251b;
  margin-bottom: 20px;
}

.welcome-content p {
  color: #909399;
  margin-bottom: 30px;
}

.quick-links {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.quick-links .el-button {
  background-color: #e1251b;
  border-color: #e1251b;
}

.quick-links .el-button:hover {
  background-color: #c41a15;
  border-color: #c41a15;
}
</style>