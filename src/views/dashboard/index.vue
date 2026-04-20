<!--
 * 仪表盘页面
 * 用途：展示商城核心数据概览和销售趋势
 -->
<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="item in statsCards" :key="item.key">
        <el-card class="stats-card" :body-style="{ padding: '20px' }">
          <div class="stats-content">
            <div class="stats-icon" :style="{ backgroundColor: item.color }">
              <el-icon :size="32"><component :is="item.icon" /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ formatNumber(stats[item.key]) }}</div>
              <div class="stats-label">{{ item.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 销售趋势图表 -->
    <el-card class="chart-card">
      <template #header>
        <div class="chart-header">
          <span>销售趋势</span>
          <el-radio-group v-model="trendDays" @change="fetchSalesTrend">
            <el-radio-button :value="7">近7天</el-radio-button>
            <el-radio-button :value="30">近30天</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div ref="chartRef" class="chart-container"></div>
    </el-card>

    <!-- 快捷入口 -->
    <el-card class="shortcut-card">
      <template #header>
        <span>快捷入口</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in shortcuts" :key="item.path">
          <div class="shortcut-item" @click="navigateTo(item.path)">
            <el-icon :size="40" :color="item.color"><component :is="item.icon" /></el-icon>
            <div class="shortcut-label">{{ item.label }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart, Wallet, User, Goods } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import {
  getDashboardStats,
  getSalesTrend,
  type DashboardStats,
  type SalesTrend,
} from '@/api/dashboard'

const router = useRouter()

// 统计数据
const stats = ref<DashboardStats>({
  todayOrders: 0,
  todaySales: 0,
  totalUsers: 0,
  totalProducts: 0,
})

// 趋势天数
const trendDays = ref(7)

// 图表引用
const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 统计卡片配置
const statsCards = [
  { key: 'todayOrders', label: '今日订单', icon: ShoppingCart, color: '#e1251b' },
  { key: 'todaySales', label: '今日销售额', icon: Wallet, color: '#ff9800' },
  { key: 'totalUsers', label: '总用户数', icon: User, color: '#4caf50' },
  { key: 'totalProducts', label: '总商品数', icon: Goods, color: '#2196f3' },
]

// 快捷入口配置
const shortcuts = [
  { label: '商品管理', path: '/admin/product', icon: Goods, color: '#e1251b' },
  { label: '订单管理', path: '/admin/order', icon: ShoppingCart, color: '#ff9800' },
  { label: '用户管理', path: '/admin/member', icon: User, color: '#4caf50' },
  { label: '优惠券', path: '/admin/coupon', icon: Wallet, color: '#2196f3' },
]

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num?.toLocaleString() || '0'
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await getDashboardStats()
    stats.value = res
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

// 获取销售趋势
const fetchSalesTrend = async () => {
  try {
    const res = await getSalesTrend(trendDays.value)
    renderChart(res)
  } catch (error) {
    console.error('获取销售趋势失败', error)
  }
}

// 渲染图表
const renderChart = (data: SalesTrend[]) => {
  if (!chartRef.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['销售额', '订单数'],
      left: 'left', // 添加：左对齐
      top: 'top', // 添加：顶部对齐
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.date),
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额(元)',
        position: 'left',
      },
      {
        type: 'value',
        name: '订单数',
        position: 'right',
      },
    ],
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: data.map((item) => item.sales),
        itemStyle: { color: '#e1251b' },
      },
      {
        name: '订单数',
        type: 'line',
        yAxisIndex: 1,
        data: data.map((item) => item.orders),
        itemStyle: { color: '#ff9800' },
        smooth: true,
      },
    ],
  }

  chartInstance.setOption(option)
}

// 导航跳转
const navigateTo = (path: string) => {
  router.push(path)
}

// 窗口大小变化时重新渲染图表
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  fetchStats()
  fetchSalesTrend()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;

  .stats-row {
    margin-bottom: 20px;
  }

  .stats-card {
    .stats-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stats-icon {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .stats-info {
      flex: 1;
    }

    .stats-value {
      font-size: 28px;
      font-weight: bold;
      color: #333;
    }

    .stats-label {
      font-size: 14px;
      color: #999;
      margin-top: 4px;
    }
  }

  .chart-card {
    margin-bottom: 20px;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-container {
      height: 400px;
    }
  }

  .shortcut-card {
    .shortcut-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        background-color: #f5f5f5;
      }
    }

    .shortcut-label {
      margin-top: 10px;
      font-size: 14px;
      color: #666;
    }
  }
}
</style>
