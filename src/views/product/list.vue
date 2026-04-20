<!--
 * 商品列表页面
 * 用途：展示商品列表、搜索筛选、批量操作
 -->
<template>
  <div class="product-list-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">商品管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加商品
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-cascader
              v-model="searchForm.categoryId"
              :options="categoryTree"
              :props="{ label: 'name', value: 'id', checkStrictly: true }"
              placeholder="请选择分类"
              clearable
              style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="hasSelection" class="batch-actions">
      <span>已选择 {{ selectionCount }} 项</span>
      <el-button type="success" size="small" @click="handleBatchOnSale">批量上架</el-button>
      <el-button type="warning" size="small" @click="handleBatchOffSale">批量下架</el-button>
      <el-button type="danger" size="small" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 商品表格 -->
    <div class="table-container">
      <el-table
          v-loading="loading"
          :data="productList"
          border
          stripe
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="商品图片" width="100" align="center">
          <template #default="{ row }">
            <el-image
                v-if="row.pic"
                :src="row.pic"
                fit="contain"
                style="width: 60px; height: 60px; border-radius: 4px"
                :preview-src-list="[row.pic]"
                preview-teleported
            />
            <span v-else style="color: #ccc">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="180">
          <template #default="{ row }">
            <div>
              <span style="font-weight: 500">{{ row.name }}</span>
              <div v-if="row.subtitle" style="color: #999; font-size: 12px">{{ row.subtitle }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="100" align="center" />
        <el-table-column label="价格" width="120" align="center">
          <template #default="{ row }">
            <span style="color: #e1251b; font-weight: 500">¥{{ formatPrice(row.price) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.stock <= 10 ? '#f56c6c' : '#333' }">{{ row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button :type="row.status === 1 ? 'warning' : 'success'" link size="small" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'
import type { ProductItem, ProductStatus } from '@/types/product'
import { formatPrice } from '@/utils/format'

const router = useRouter()
const productStore = useProductStore()

const searchForm = reactive({
  keyword: '',
  categoryId: undefined as number | undefined,
  status: undefined as number | undefined
})

const productList = computed(() => productStore.productList)
const total = computed(() => productStore.total)
const pageNum = computed({
  get: () => productStore.pageNum,
  set: (val) => productStore.setPage(val)
})
const pageSize = computed({
  get: () => productStore.pageSize,
  set: (val) => productStore.setPage(productStore.pageNum, val)
})
const loading = computed(() => productStore.loading)
const categoryTree = computed(() => productStore.categoryTree)
const hasSelection = computed(() => productStore.hasSelection)
const selectionCount = computed(() => productStore.selectionCount)

onMounted(async () => {
  await Promise.all([
    productStore.fetchProductList(),
    productStore.fetchCategoryTree()
  ])
})

const handleSearch = async () => {
  productStore.setPage(1)
  await productStore.fetchProductList({
    keyword: searchForm.keyword || undefined,
    categoryId: searchForm.categoryId,
    status: searchForm.status as ProductStatus | undefined
  })
}

const handleReset = async () => {
  searchForm.keyword = ''
  searchForm.categoryId = undefined
  searchForm.status = undefined
  productStore.resetSearch()
  await productStore.fetchProductList()
}

const handlePageChange = async (page: number) => {
  productStore.setPage(page)
  await productStore.fetchProductList()
}

const handleSizeChange = async (size: number) => {
  productStore.setPage(1, size)
  await productStore.fetchProductList()
}

const handleSelectionChange = (selection: ProductItem[]) => {
  productStore.setSelection(selection.map(item => item.id!))
}

const handleAdd = () => {
  productStore.resetForm()
  router.push('/admin/product/add')
}

const handleEdit = (row: ProductItem) => {
  router.push(`/admin/product/add?id=${row.id}`)
}

const handleToggleStatus = async (row: ProductItem) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(`确定要${action}该商品吗？`, '提示', { type: 'warning' })
    await productStore.updateStatus(row.id!, newStatus as ProductStatus)
    ElMessage.success(`${action}成功`)
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(`${action}失败`)
  }
}

const handleDelete = async (row: ProductItem) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '警告', { type: 'warning' })
    await productStore.deleteProduct(row.id!)
    ElMessage.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleBatchOnSale = async () => {
  try {
    await ElMessageBox.confirm(`确定要上架选中的商品吗？`, '提示', { type: 'warning' })
    await productStore.batchUpdateStatus(1)
    ElMessage.success('批量上架成功')
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error('批量上架失败')
  }
}

const handleBatchOffSale = async () => {
  try {
    await ElMessageBox.confirm(`确定要下架选中的商品吗？`, '提示', { type: 'warning' })
    await productStore.batchUpdateStatus(0)
    ElMessage.success('批量下架成功')
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error('批量下架失败')
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的商品吗？`, '警告', { type: 'warning' })
    ElMessage.success('批量删除成功')
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error('批量删除失败')
  }
}
</script>

<style lang="scss" scoped>
.product-list-container { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 500; color: #303133; margin: 0; }
.search-bar { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 20px; }
.batch-actions { background: #fff; padding: 10px 20px; border-radius: 4px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
.batch-actions span { color: #e1251b; font-weight: 500; }
.table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 20px; }
.pagination-container { background: #fff; padding: 16px 20px; border-radius: 4px; display: flex; justify-content: flex-end; }
</style>