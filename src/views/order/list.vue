<!--
 * 订单列表页面
 * 用途：展示订单列表，支持筛选、发货、删除操作
 -->
<template>
  <div class="order-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderSn"
            placeholder="请输入订单号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option
              v-for="(item, key) in orderStatusMap"
              :key="key"
              :label="item.label"
              :value="Number(key)"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单状态 -->
    <el-form-item label="订单状态">
      <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
        <el-option
          v-for="(item, key) in orderStatusMap"
          :key="key"
          :label="item.label"
          :value="Number(key)"
        />
      </el-select>
    </el-form-item>

    <!-- 订单列表 -->
    <el-card class="table-card">
      <el-table :data="orderList" v-loading="loading" stripe>
        <el-table-column prop="orderSn" label="订单号" min-width="180" />
        <el-table-column prop="receiverName" label="收货人" width="100" />
        <el-table-column prop="receiverPhone" label="联系电话" width="120" />
        <el-table-column label="收货地址" min-width="200">
          <template #default="{ row }">
            {{ row.receiverProvince }}{{ row.receiverCity }}{{ row.receiverDistrict
            }}{{ row.receiverAddress }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="订单金额" width="100">
          <template #default="{ row }"> ¥{{ row.totalAmount?.toFixed(2) }} </template>
        </el-table-column>
        <el-table-column prop="payAmount" label="实付金额" width="100">
          <template #default="{ row }">
            <span style="color: #e1251b; font-weight: bold">¥{{ row.payAmount?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payType" label="支付方式" width="100">
          <template #default="{ row }">
            {{ payTypeMap[row.payType] || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="orderStatusMap[row.status]?.type">
              {{ orderStatusMap[row.status]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)"> 查看 </el-button>
            <el-button
              v-if="row.status === 1"
              type="success"
              link
              size="small"
              @click="handleDeliver(row)"
            >
              发货
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 发货对话框 -->
    <el-dialog v-model="deliverDialogVisible" title="订单发货" width="500px">
      <el-form :model="deliverForm" label-width="100px">
        <el-form-item label="物流公司">
          <el-select v-model="deliverForm.deliveryCompany" placeholder="请选择物流公司">
            <el-option label="顺丰快递" value="顺丰快递" />
            <el-option label="圆通快递" value="圆通快递" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="韵达快递" value="韵达快递" />
            <el-option label="申通快递" value="申通快递" />
            <el-option label="京东物流" value="京东物流" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号">
          <el-input v-model="deliverForm.deliverySn" placeholder="请输入物流单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deliverDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDeliver">确认发货</el-button>
      </template>
    </el-dialog>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="700px">
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="订单号">{{ currentOrder.orderSn }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="orderStatusMap[currentOrder.status]?.type">
            {{ orderStatusMap[currentOrder.status]?.label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="收货人">{{ currentOrder.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{
          currentOrder.receiverPhone
        }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">
          {{ currentOrder.receiverProvince }}{{ currentOrder.receiverCity
          }}{{ currentOrder.receiverDistrict }}{{ currentOrder.receiverAddress }}
        </el-descriptions-item>
        <el-descriptions-item label="订单金额"
          >¥{{ currentOrder.totalAmount?.toFixed(2) }}</el-descriptions-item
        >
        <el-descriptions-item label="运费"
          >¥{{ currentOrder.freightAmount?.toFixed(2) }}</el-descriptions-item
        >
        <el-descriptions-item label="优惠券抵扣"
          >¥{{ currentOrder.couponAmount?.toFixed(2) }}</el-descriptions-item
        >
        <el-descriptions-item label="积分抵扣"
          >¥{{ currentOrder.integrationAmount?.toFixed(2) }}</el-descriptions-item
        >
        <el-descriptions-item label="实付金额">
          <span style="color: #e1251b; font-weight: bold; font-size: 16px">
            ¥{{ currentOrder.payAmount?.toFixed(2) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">{{
          payTypeMap[currentOrder.payType]
        }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{
          currentOrder.paymentTime || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="发货时间">{{
          currentOrder.deliveryTime || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="物流公司">{{
          currentOrder.deliveryCompany || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="物流单号">{{
          currentOrder.deliverySn || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{
          currentOrder.note || '无'
        }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getOrderList,
  deleteOrder,
  deliverOrder,
  orderStatusMap,
  payTypeMap,
  type Order,
  type DeliverParams,
} from '@/api/order'

// 搜索表单
const searchForm = reactive({
  orderSn: '',
  status: undefined as number | undefined,
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 订单列表
const orderList = ref<Order[]>([])
const loading = ref(false)

// 发货对话框
const deliverDialogVisible = ref(false)
const deliverForm = reactive<DeliverParams>({
  id: 0,
  deliveryCompany: '',
  deliverySn: '',
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentOrder = ref<Order | null>(null)

// 获取订单列表
const fetchOrderList = async () => {
  loading.value = true
  try {
    const data = await getOrderList({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      orderSn: searchForm.orderSn || undefined,
      status: searchForm.status,
    })
    orderList.value = data.records
    pagination.total = data.total
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchOrderList()
}

// 重置
const handleReset = () => {
  searchForm.orderSn = ''
  searchForm.status = undefined
  handleSearch()
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchOrderList()
}

const handleCurrentChange = (page: number) => {
  pagination.pageNum = page
  fetchOrderList()
}

// 查看详情
const handleView = (row: Order) => {
  currentOrder.value = row
  detailDialogVisible.value = true
}

// 发货
const handleDeliver = (row: Order) => {
  deliverForm.id = row.id
  deliverForm.deliveryCompany = ''
  deliverForm.deliverySn = ''
  deliverDialogVisible.value = true
}

// 确认发货
const confirmDeliver = async () => {
  if (!deliverForm.deliveryCompany) {
    ElMessage.warning('请选择物流公司')
    return
  }
  if (!deliverForm.deliverySn) {
    ElMessage.warning('请输入物流单号')
    return
  }

  try {
    await deliverOrder(deliverForm)
    ElMessage.success('发货成功')
    deliverDialogVisible.value = false
    fetchOrderList()
  } catch (error) {
    ElMessage.error('发货失败')
  }
}

// 删除
const handleDelete = (row: Order) => {
  ElMessageBox.confirm(`确定要删除订单 ${row.orderSn} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteOrder(row.id)
      ElMessage.success('删除成功')
      fetchOrderList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  fetchOrderList()
})
</script>

<style lang="scss" scoped>
.order-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
