<!--
 * 优惠券管理页面
 * 用途：展示优惠券列表，支持筛选、创建、编辑、禁用/启用、删除操作
 -->
<template>
  <div class="coupon-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="优惠券名称">
          <el-input
              v-model="searchForm.name"
              placeholder="请输入优惠券名称"
              clearable
              @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="优惠券类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option
                v-for="(label, key) in couponTypeMap"
                :key="key"
                :label="label"
                :value="Number(key)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option
                v-for="(item, key) in couponStatusMap"
                :key="key"
                :label="item.label"
                :value="Number(key)"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">添加优惠券</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 优惠券列表 -->
    <el-card class="table-card">
      <el-table :data="couponList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="优惠券名称" min-width="150" />
        <el-table-column prop="code" label="优惠券码" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ couponTypeMap[row.type] || '未知' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优惠内容" width="120">
          <template #default="{ row }">
            <span v-if="row.type === 0 || row.type === 2">
              满{{ row.minPoint }}减{{ row.faceValue }}
            </span>
            <span v-else-if="row.type === 1">
              {{ row.discountRate }}折
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="totalCount" label="发行量" width="80" />
        <el-table-column label="已领取/剩余" width="110">
          <template #default="{ row }">
            {{ row.totalCount - row.count }} / {{ row.count || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="perLimit" label="每人限领" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="couponStatusMap[row.status]?.type">
              {{ couponStatusMap[row.status]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="有效期" min-width="180">
          <template #default="{ row }">
            {{ row.useStartTime?.slice(0, 10) }} ~ {{ row.useEndTime?.slice(0, 10) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
                :type="row.status === 1 ? 'warning' : 'success'"
                link
                size="small"
                @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
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

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑优惠券' : '添加优惠券'" width="700px">
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优惠券名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入优惠券名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优惠券码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入优惠券码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优惠券类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择类型">
                <el-option
                    v-for="(label, key) in couponTypeMap"
                    :key="key"
                    :label="label"
                    :value="Number(key)"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用类型" prop="useType">
              <el-select v-model="formData.useType" placeholder="请选择使用类型">
                <el-option
                    v-for="(label, key) in useTypeMap"
                    :key="key"
                    :label="label"
                    :value="Number(key)"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最低消费" prop="minPoint">
              <el-input-number v-model="formData.minPoint" :min="0" :precision="2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="formData.type === 1" label="折扣率" prop="discountRate">
              <el-input-number v-model="formData.discountRate" :min="0.1" :max="9.9" :precision="1" />
            </el-form-item>
            <el-form-item v-else label="面值" prop="faceValue">
              <el-input-number v-model="formData.faceValue" :min="0" :precision="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发行量" prop="totalCount">
              <el-input-number v-model="formData.totalCount" :min="1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="每人限领" prop="perLimit">
              <el-input-number v-model="formData.perLimit" :min="1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="使用时间" prop="useTime">
          <el-date-picker
              v-model="useTimeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="领取时间" prop="receiveTime">
          <el-date-picker
              v-model="receiveTimeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="请输入优惠券描述" />
        </el-form-item>
        <el-form-item label="备注" prop="note">
          <el-input v-model="formData.note" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  getCouponList,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  updateCouponStatus,
  couponTypeMap,
  couponStatusMap,
  useTypeMap,
  type Coupon
} from '@/api/coupon'

// 防抖函数
const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// 搜索表单
const searchForm = reactive({
  name: '',
  type: undefined as number | undefined,
  status: undefined as number | undefined
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 优惠券列表
const couponList = ref<Coupon[]>([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<Coupon>({
  id: 0,
  type: 0,
  name: '',
  code: '',
  minPoint: 0,
  faceValue: 0,
  discountRate: 8,
  totalCount: 100,
  count: 0,
  perLimit: 1,
  useType: 0,
  useStartTime: '',
  useEndTime: '',
  receiveStartTime: '',
  receiveEndTime: '',
  publishStartTime: '',
  publishEndTime: '',
  description: '',
  note: '',
  status: 1,
  createTime: '',
  updateTime: ''
})

// 时间范围
const useTimeRange = ref<string[]>([])
const receiveTimeRange = ref<string[]>([])

// 表单验证规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入优惠券码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择优惠券类型', trigger: 'change' }]
}

// 获取优惠券列表
const fetchCouponList = async () => {
  loading.value = true
  try {
    const res = await getCouponList({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      type: searchForm.type,
      status: searchForm.status
    })
    couponList.value = res.records || []
    pagination.total = res.total || 0
  } catch (error) {
    ElMessage.error('获取优惠券列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索（添加防抖）
const handleSearch = debounce(() => {
  pagination.pageNum = 1
  fetchCouponList()
}, 300)

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.type = undefined
  searchForm.status = undefined
  handleSearch()
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchCouponList()
}

const handleCurrentChange = (page: number) => {
  pagination.pageNum = page
  fetchCouponList()
}

// 重置表单
const resetForm = () => {
  formData.id = 0
  formData.type = 0
  formData.name = ''
  formData.code = ''
  formData.minPoint = 0
  formData.faceValue = 0
  formData.discountRate = 8
  formData.totalCount = 100
  formData.count = 0
  formData.perLimit = 1
  formData.useType = 0
  formData.useStartTime = ''
  formData.useEndTime = ''
  formData.receiveStartTime = ''
  formData.receiveEndTime = ''
  formData.publishStartTime = ''
  formData.publishEndTime = ''
  formData.description = ''
  formData.note = ''
  formData.status = 1
  useTimeRange.value = []
  receiveTimeRange.value = []
}

// 添加
const handleAdd = () => {
  resetForm()
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Coupon) => {
  resetForm()
  isEdit.value = true
  Object.assign(formData, row)
  useTimeRange.value = [row.useStartTime, row.useEndTime]
  receiveTimeRange.value = [row.receiveStartTime, row.receiveEndTime]
  dialogVisible.value = true
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // 处理时间
    if (useTimeRange.value && useTimeRange.value.length === 2) {
      formData.useStartTime = useTimeRange.value[0]
      formData.useEndTime = useTimeRange.value[1]
    }
    if (receiveTimeRange.value && receiveTimeRange.value.length === 2) {
      formData.receiveStartTime = receiveTimeRange.value[0]
      formData.receiveEndTime = receiveTimeRange.value[1]
    }

    try {
      if (isEdit.value) {
        await updateCoupon(formData.id, formData)
        ElMessage.success('更新成功')
      } else {
        await createCoupon(formData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchCouponList()
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    }
  })
}

// 切换状态
const handleToggleStatus = (row: Coupon) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 0 ? '禁用' : '启用'

  ElMessageBox.confirm(`确定要${action}优惠券 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await updateCouponStatus(row.id, newStatus)
      ElMessage.success(`${action}成功`)
      fetchCouponList()
    } catch (error) {
      ElMessage.error(`${action}失败`)
    }
  })
}

// 删除
const handleDelete = (row: Coupon) => {
  ElMessageBox.confirm(`确定要删除优惠券 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCoupon(row.id)
      ElMessage.success('删除成功')
      fetchCouponList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  fetchCouponList()
})
</script>

<style lang="scss" scoped>
.coupon-container {
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