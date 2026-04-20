<!--
 * 商品分类页面
 * 用途：管理商品分类的树形结构
 * 功能：分类列表、添加、编辑、删除
 -->
<template>
  <div class="category-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">商品分类</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加分类
        </el-button>
      </div>
    </div>

    <!-- 分类表格 -->
    <div class="table-container">
      <el-table
          v-loading="loading"
          :data="categoryList"
          row-key="id"
          border
          default-expand-all
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :header-cell-style="{ background: '#f5f7fa', color: '#333' }"
      >
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column prop="id" label="ID" width="100" align="center" />
        <el-table-column prop="level" label="层级" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small">第{{ row.level }}级</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="导航状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
                v-model="row.navStatus"
                :active-value="1"
                :inactive-value="0"
                @change="handleNavStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="显示状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
                v-model="row.showStatus"
                :active-value="1"
                :inactive-value="0"
                @change="handleShowStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
                v-if="row.level < 2"
                type="success"
                link
                size="small"
                @click="handleAddChild(row)"
            >
              添加子分类
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分类编辑弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
        destroy-on-close
    >
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="上级分类">
          <el-cascader
              v-model="formData.parentIds"
              :options="categoryOptions"
              :props="{ label: 'name', value: 'id', checkStrictly: true, emitPath: false }"
              placeholder="请选择上级分类（不选则为顶级）"
              clearable
              filterable
              style="width: 100%"
              @change="handleParentChange"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="分类图标">
          <el-input v-model="formData.icon" placeholder="请输入图标URL" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="formData.keywords" placeholder="请输入关键词" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入分类描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { getCategoryTree, addCategory, updateCategory, deleteCategory } from '@/api/category';
import type { CategoryTreeItem, CategoryFormData } from '@/types/product';

// 列表数据
const loading = ref(false);
const categoryList = ref<CategoryTreeItem[]>([]);

// 弹窗
const dialogVisible = ref(false);
const dialogTitle = ref('添加分类');
const formRef = ref<FormInstance>();
const submitting = ref(false);

// 表单数据
const formData = reactive<CategoryFormData>({
  id: 0,
  name: '',
  parentId: 0,
  parentIds: [] as number[],
  level: 1,
  sort: 0,
  icon: '',
  keywords: '',
  description: '',
  navStatus: 1,
  showStatus: 1
});

// 表单验证
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
};

// 分类选项（用于选择父级）
const categoryOptions = computed(() => {
  const rootOption = { id: 0, name: '顶级分类', children: categoryList.value };
  return [rootOption];
});

// 加载分类树
const loadCategoryTree = async () => {
  loading.value = true;
  try {
    const data = await getCategoryTree();
    categoryList.value = data || [];
  } catch (error) {
    console.error('加载分类树失败', error);
    ElMessage.error('加载分类树失败');
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(() => {
  loadCategoryTree();
});

// 添加分类
const handleAdd = () => {
  dialogTitle.value = '添加分类';
  Object.assign(formData, {
    id: 0,
    name: '',
    parentId: 0,
    parentIds: [],
    level: 1,
    sort: 0,
    icon: '',
    keywords: '',
    description: '',
    navStatus: 1,
    showStatus: 1
  });
  dialogVisible.value = true;
};

// 添加子分类
const handleAddChild = (row: CategoryTreeItem) => {
  dialogTitle.value = '添加子分类';
  Object.assign(formData, {
    id: 0,
    name: '',
    parentId: row.id,
    parentIds: [row.id],
    level: row.level + 1,
    sort: 0,
    icon: '',
    keywords: '',
    description: '',
    navStatus: 1,
    showStatus: 1
  });
  dialogVisible.value = true;
};

// 编辑分类
const handleEdit = (row: CategoryTreeItem) => {
  dialogTitle.value = '编辑分类';
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    parentId: row.parentId,
    parentIds: row.parentId > 0 ? [row.parentId] : [],
    level: row.level,
    sort: row.sort,
    icon: row.icon || '',
    keywords: row.keywords || '',
    description: row.description || '',
    navStatus: row.navStatus ?? 1,
    showStatus: row.showStatus ?? 1
  });
  dialogVisible.value = true;
};

// 父级分类变化
const handleParentChange = (value: number | number[]) => {
  const parentId = Array.isArray(value) ? value[value.length - 1] || 0 : value || 0;
  formData.parentId = parentId;
  formData.level = parentId > 0 ? 2 : 1;
};

// 删除分类
const handleDelete = async (row: CategoryTreeItem) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除分类"${row.name}"吗？删除后无法恢复！`,
        '警告',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    );

    await deleteCategory(row.id);
    ElMessage.success('删除成功');
    await loadCategoryTree();
  } catch (error: any) {
    if (error !== 'cancel') {
      const message = error?.response?.data?.message || error?.message || '删除失败';
      ElMessage.error(message);
    }
  }
};

// 导航状态切换
const handleNavStatusChange = async (row: CategoryTreeItem) => {
  try {
    await updateCategory(row.id, {
      name: row.name,
      parentId: row.parentId,
      level: row.level,
      sort: row.sort,
      navStatus: row.navStatus,
      showStatus: row.showStatus
    });
    ElMessage.success('更新成功');
  } catch (error) {
    row.navStatus = row.navStatus === 1 ? 0 : 1;
    ElMessage.error('更新失败');
  }
};

// 显示状态切换
const handleShowStatusChange = async (row: CategoryTreeItem) => {
  try {
    await updateCategory(row.id, {
      name: row.name,
      parentId: row.parentId,
      level: row.level,
      sort: row.sort,
      navStatus: row.navStatus,
      showStatus: row.showStatus
    });
    ElMessage.success('更新成功');
  } catch (error) {
    row.showStatus = row.showStatus === 1 ? 0 : 1;
    ElMessage.error('更新失败');
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    const submitData = {
      name: formData.name,
      parentId: formData.parentId || 0,
      level: formData.level,
      sort: formData.sort,
      icon: formData.icon,
      keywords: formData.keywords,
      description: formData.description,
      navStatus: formData.navStatus,
      showStatus: formData.showStatus
    };

    if (formData.id) {
      await updateCategory(formData.id, submitData);
      ElMessage.success('编辑成功');
    } else {
      await addCategory(submitData);
      ElMessage.success('添加成功');
    }

    dialogVisible.value = false;
    await loadCategoryTree();
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
.category-container {
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

.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}
</style>