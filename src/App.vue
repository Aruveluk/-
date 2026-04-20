<!--
 * Vue根组件 - mall-admin后台管理系统
 * 用途：应用最外层容器，使用router-view渲染路由页面
 * 说明：所有页面内容都通过router-view渲染到此组件
 -->
<template>
  <router-view />
</template>

<script setup lang="ts">
// 根组件无需额外逻辑
</script>

<style>
/* 全局样式已在main.ts中引入 */
</style>