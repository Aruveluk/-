<!--
 * 会员列表页面
 * 用途：展示会员列表，支持筛选、禁用/启用、删除操作
 -->
<template>
  <div class="user-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="搜索关键词">
          <el-input
              v-model="searchForm.keyword"
              placeholder="用户名/昵称/手机号"
              clearable
              @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="会员状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option
                v-for="(item, key) in memberStatusMap"
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

    <!-- 会员列表 -->
    <el-card class="table-card">
      <el-table :data="memberList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="email" label="邮箱" width="160" />
        <el-table-column prop="memberLevel" label="会员等级" width="100">
          <template #default="{ row }">
            <el-tag type="warning">{{ memberLevelMap[row.memberLevel] || '普通会员' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="integration" label="积分" width="80" />
        <el-table-column prop="balance" label="余额" width="100">
          <template #default="{ row }">
            ¥{{ row.balance?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="memberStatusMap[row.status]?.type">
              {{ memberStatusMap[row.status]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              查看
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

    <!-- 会员详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="会员详情" width="700px">
      <el-descriptions :column="2" border v-if="currentMember">
        <el-descriptions-item label="用户名">{{ currentMember.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentMember.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentMember.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentMember.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ genderMap[currentMember.gender] || '未知' }}</el-descriptions-item>
        <el-descriptions-item label="生日">{{ currentMember.birthday || '-' }}</el-descriptions-item>
        <el-descriptions-item label="城市">{{ currentMember.city || '-' }}</el-descriptions-item>
        <el-descriptions-item label="职业">{{ currentMember.job || '-' }}</el-descriptions-item>
        <el-descriptions-item label="会员等级">
          <el-tag type="warning">{{ memberLevelMap[currentMember.memberLevel] || '普通会员' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="memberStatusMap[currentMember.status]?.type">
            {{ memberStatusMap[currentMember.status]?.label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="积分">{{ currentMember.integration || 0 }}</el-descriptions-item>
        <el-descriptions-item label="成长值">{{ currentMember.growth || 0 }}</el-descriptions-item>
        <el-descriptions-item label="余额">
          <span style="color: #e1251b; font-weight: bold;">¥{{ currentMember.balance?.toFixed(2) || '0.00' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentMember.createTime }}</el-descriptions-item>
        <el-descriptions-item label="最后登录">{{ currentMember.lastLoginTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="个性签名" :span="2">{{ currentMember.personalizedSignature || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getMemberList,
  deleteMember,
  updateMemberStatus,
  memberStatusMap,
  memberLevelMap,
  genderMap,
  type Member
} from '@/api/member'

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: undefined as number | undefined
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 会员列表
const memberList = ref<Member[]>([])
const loading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentMember = ref<Member | null>(null)

// 获取会员列表
const fetchMemberList = async () => {
  loading.value = true
  try {
    const res = await getMemberList({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status
    })
    memberList.value = res.data.records
    pagination.total = res.data.total
  } catch (error) {
    ElMessage.error('获取会员列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchMemberList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = undefined
  handleSearch()
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchMemberList()
}

const handleCurrentChange = (page: number) => {
  pagination.pageNum = page
  fetchMemberList()
}

// 查看详情
const handleView = (row: Member) => {
  currentMember.value = row
  detailDialogVisible.value = true
}

// 切换状态
const handleToggleStatus = (row: Member) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 0 ? '禁用' : '启用'

  ElMessageBox.confirm(`确定要${action}会员 ${row.username} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await updateMemberStatus(row.id, newStatus)
      ElMessage.success(`${action}成功`)
      fetchMemberList()
    } catch (error) {
      ElMessage.error(`${action}失败`)
    }
  })
}

// 删除
const handleDelete = (row: Member) => {
  ElMessageBox.confirm(`确定要删除会员 ${row.username} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteMember(row.id)
      ElMessage.success('删除成功')
      fetchMemberList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  fetchMemberList()
})
</script>

<style lang="scss" scoped>
.user-container {
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