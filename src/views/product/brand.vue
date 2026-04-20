<!--
 * 品牌管理页面
 * 用途：管理商品品牌信息
 * 功能：品牌列表、添加、编辑、删除、状态切换
 -->
<template>
  <div class="brand-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">品牌管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加品牌
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="品牌名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入品牌名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
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

    <!-- 品牌表格 -->
    <div class="table-container">
      <el-table v-loading="loading" :data="brandList" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="品牌Logo" width="100" align="center">
          <template #default="{ row }">
            <el-image
                v-if="row.logo"
                :src="row.logo"
                fit="contain"
                style="width: 60px; height: 60px"
                :preview-src-list="[row.logo]"
                preview-teleported
            />
            <span v-else style="color: #ccc">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="品牌名称" min-width="150" />
        <el-table-column prop="firstLetter" label="首字母" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.firstLetter }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="productCount" label="商品数量" width="100" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.productCount > 0 ? '#67c23a' : '#999' }">
              {{ row.productCount || 0 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
                v-model="row.showStatus"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
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
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
      />
    </div>

    <!-- 品牌编辑弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="600px"
        destroy-on-close
    >
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
      >
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入品牌名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="首字母" prop="firstLetter">
          <el-input
              v-model="formData.firstLetter"
              placeholder="品牌首字母"
              maxlength="1"
              style="width: 100px"
          />
        </el-form-item>
        <el-form-item label="品牌Logo">
          <el-upload
              class="logo-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleLogoSuccess"
              :before-upload="beforeLogoUpload"
          >
            <el-image
                v-if="formData.logo"
                :src="formData.logo"
                fit="contain"
                style="width: 100px; height: 100px"
            />
            <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸：200x200，支持 JPG、PNG 格式</div>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="是否显示">
          <el-switch
              v-model="formData.showStatus"
              :active-value="1"
              :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="品牌故事">
          <el-input
              v-model="formData.brandStory"
              type="textarea"
              :rows="4"
              placeholder="请输入品牌故事"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, Refresh } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { getBrandList, getBrandDetail, addBrand, updateBrand, deleteBrand, updateBrandStatus } from '@/api/brand';
import type { BrandItem, BrandFormData } from '@/types/product';

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: undefined as number | undefined
});

// 列表数据
const loading = ref(false);
const brandList = ref<BrandItem[]>([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);

// 弹窗
const dialogVisible = ref(false);
const dialogTitle = ref('添加品牌');
const formRef = ref<FormInstance>();
const submitting = ref(false);

// 上传配置
const uploadUrl = '/api/admin/upload/image';
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('smart_mall_token')}`
};

// 表单数据
const formData = reactive<BrandFormData>({
  id: 0,
  name: '',
  firstLetter: '',
  logo: '',
  sort: 0,
  showStatus: 1,
  brandStory: ''
});

// 表单验证
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入品牌名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  firstLetter: [
    { required: true, message: '请输入首字母', trigger: 'blur' }
  ]
};

// 加载品牌列表
const loadBrandList = async () => {
  loading.value = true;
  try {
    const result = await getBrandList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status
    });
    brandList.value = result.list || [];
    total.value = result.total || 0;
  } catch (error) {
    console.error('加载品牌列表失败', error);
    ElMessage.error('加载品牌列表失败');
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(() => {
  loadBrandList();
});

// 搜索
const handleSearch = () => {
  pageNum.value = 1;
  loadBrandList();
};

// 重置
const handleReset = () => {
  searchForm.keyword = '';
  searchForm.status = undefined;
  pageNum.value = 1;
  loadBrandList();
};

// 分页
const handlePageChange = (page: number) => {
  pageNum.value = page;
  loadBrandList();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  pageNum.value = 1;
  loadBrandList();
};

// 添加品牌
const handleAdd = () => {
  dialogTitle.value = '添加品牌';
  Object.assign(formData, {
    id: 0,
    name: '',
    firstLetter: '',
    logo: '',
    sort: 0,
    showStatus: 1,
    brandStory: ''
  });
  dialogVisible.value = true;
};

// 编辑品牌
const handleEdit = async (row: BrandItem) => {
  dialogTitle.value = '编辑品牌';
  try {
    const data = await getBrandDetail(row.id);
    Object.assign(formData, {
      id: data.id,
      name: data.name,
      firstLetter: data.firstLetter,
      logo: data.logo || '',
      sort: data.sort || 0,
      showStatus: data.showStatus ?? 1,
      brandStory: data.brandStory || ''
    });
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取品牌详情失败');
  }
};

// 删除品牌
const handleDelete = async (row: BrandItem) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除品牌"${row.name}"吗？`,
        '警告',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );

    await deleteBrand(row.id);
    ElMessage.success('删除成功');
    await loadBrandList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 状态切换
const handleStatusChange = async (row: BrandItem) => {
  try {
    await updateBrandStatus(row.id, row.showStatus);
    ElMessage.success('更新成功');
  } catch (error) {
    row.showStatus = row.showStatus === 1 ? 0 : 1;
    ElMessage.error('更新失败');
  }
};

// Logo上传成功
const handleLogoSuccess = (response: any) => {
  if (response.code === 200) {
    formData.logo = response.data;
    ElMessage.success('上传成功');
  } else {
    ElMessage.error(response.message || '上传失败');
  }
};

// Logo上传前校验
const beforeLogoUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    // 自动生成首字母
    if (!formData.firstLetter && formData.name) {
      formData.firstLetter = formData.name.charAt(0).toUpperCase();
    }

    const submitData = {
      name: formData.name,
      firstLetter: formData.firstLetter,
      logo: formData.logo,
      sort: formData.sort,
      showStatus: formData.showStatus,
      brandStory: formData.brandStory
    };

    if (formData.id) {
      await updateBrand(formData.id, submitData);
      ElMessage.success('编辑成功');
    } else {
      await addBrand(submitData);
      ElMessage.success('添加成功');
    }

    dialogVisible.value = false;
    await loadBrandList();
  } catch (error: any) {
    if (error !== 'cancel') {
      const message = error?.response?.data?.message || '操作失败';
      ElMessage.error(message);
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.brand-container {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .page-title {
    font-size: 20px;
    font-weight: 500;
    color: #303133;
    margin: 0;
  }
}

.search-bar {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.pagination-container {
  background: #fff;
  padding: 16px 20px;
  border-radius: 4px;
  display: flex;
  justify-content: flex-end;
}

.logo-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: #e1251b;
  }
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
  margin-left: 10px;
}
</style>