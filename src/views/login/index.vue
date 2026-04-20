<!--
 * 登录页面 - mall-admin后台管理系统
 * 用途：管理员登录入口，表单验证，调用登录API
 * 说明：使用Element Plus表单组件，京东红主题
 -->
<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">智能商城后台管理系统</h2>
      <el-form :model="loginForm" :rules="rules" ref="formRef" class="login-form">
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              size="large"
              show-password
              @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-tips">
        <p>默认账号：admin / 123456</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 用户store
const userStore = useUserStore()

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

// 表单验证规则
const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 登录处理
const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(loginForm)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #e1251b 0%, #c41a15 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.login-title {
  text-align: center;
  color: #303133;
  margin-bottom: 30px;
  font-size: 22px;
}

.login-form {
  width: 100%;
}

.login-btn {
  width: 100%;
  background-color: #e1251b;
  border-color: #e1251b;
}

.login-btn:hover {
  background-color: #c41a15;
  border-color: #c41a15;
}

.login-tips {
  text-align: center;
  margin-top: 20px;
  color: #909399;
  font-size: 12px;
}
</style>