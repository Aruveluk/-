<!--
 * AI知识库管理页面
 * 用途：管理AI客服的知识库内容
 -->
<template>
  <div class="knowledge-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>知识库管理</span>
          <el-button type="primary" @click="handleAdd">添加知识</el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="请输入关键词" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="商品相关" :value="1" />
            <el-option label="订单相关" :value="2" />
            <el-option label="售后相关" :value="3" />
            <el-option label="活动相关" :value="4" />
            <el-option label="其他" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="keywords" label="关键词" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="pagination.pageNum"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑知识' : '添加知识'" width="600px">
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型">
            <el-option label="商品相关" :value="1" />
            <el-option label="订单相关" :value="2" />
            <el-option label="售后相关" :value="3" />
            <el-option label="活动相关" :value="4" />
            <el-option label="其他" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="5" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="关键词" prop="keywords">
          <el-input v-model="formData.keywords" placeholder="多个关键词用逗号分隔" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  getKnowledgeList,
  addKnowledge,
  updateKnowledge,
  deleteKnowledge,
  type KnowledgeItem,
  type KnowledgeForm
} from '@/api/knowledge'

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: undefined as number | undefined
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref<KnowledgeItem[]>([])
const loading = ref(false)
const submitLoading = ref(false)

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<KnowledgeForm>({
  title: '',
  content: '',
  type: 1,
  keywords: '',
  status: 1
})

// 表单验证
const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

// 获取类型名称
const getTypeName = (type: number) => {
  const types: Record<number, string> = {
    1: '商品相关',
    2: '订单相关',
    3: '售后相关',
    4: '活动相关',
    5: '其他'
  }
  return types[type] || '未知'
}

// 获取列表
const fetchList = async () => {
  loading.value = true
  try {
    const res = await getKnowledgeList({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      type: searchForm.type
    })
    tableData.value = res.records || []
    pagination.total = res.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.type = undefined
  handleSearch()
}

// 添加
const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    title: '',
    content: '',
    type: 1,
    keywords: '',
    status: 1
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: KnowledgeItem) => {
  isEdit.value = true
  Object.assign(formData, {
    title: row.title,
    content: row.content,
    type: row.type,
    keywords: row.keywords,
    status: row.status
  })
  ;(formData as any).id = row.id
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: KnowledgeItem) => {
  try {
    await ElMessageBox.confirm('确定要删除该知识吗？', '提示', { type: 'warning' })
    await deleteKnowledge(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await updateKnowledge((formData as any).id, formData)
      ElMessage.success('更新成功')
    } else {
      await addKnowledge(formData)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
    fetchList()
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitLoading.value = false
  }
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchList()
}

const handleCurrentChange = (page: number) => {
  pagination.pageNum = page
  fetchList()
}

onMounted(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>
.knowledge-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>