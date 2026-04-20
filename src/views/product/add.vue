<!--
 * 商品添加/编辑页面 - mall-admin后台管理系统
 * 用途：商品信息的添加和编辑表单
 * 说明：支持添加和编辑两种模式，通过路由参数区分
 * 修改：品牌改为可输入+可选+非必填
 -->
<template>
  <div class="product-add-container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑商品' : '添加商品' }}</span>
        </div>
      </template>

      <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="120px"
          class="product-form"
      >
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>

        <el-form-item label="商品名称" prop="name">
          <el-input
              v-model="formData.name"
              placeholder="请输入商品名称"
              maxlength="100"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="副标题" prop="subTitle">
          <el-input
              v-model="formData.subTitle"
              placeholder="请输入商品副标题"
              maxlength="200"
          />
        </el-form-item>

        <el-form-item label="商品分类" prop="categoryId">
          <el-cascader
              v-model="formData.categoryIds"
              :options="categoryTree"
              :props="{ value: 'id', label: 'name', children: 'children' }"
              placeholder="请选择商品分类"
              clearable
              @change="handleCategoryChange"
          />
        </el-form-item>

        <!-- 品牌选择器 - 可输入+可选+非必填 -->
        <el-form-item label="商品品牌">
          <el-select
              v-model="formData.brandName"
              filterable
              allow-create
              default-first-option
              clearable
              placeholder="请输入或选择品牌（可选）"
              style="width: 100%"
          >
            <el-option
                v-for="brand in brandList"
                :key="brand.id"
                :label="brand.name"
                :value="brand.name"
            />
          </el-select>
          <div class="form-tip">可直接输入新品牌名称，或从已有品牌中选择</div>
        </el-form-item>

        <!-- 价格库存 -->
        <el-divider content-position="left">价格库存</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="售价" prop="price">
              <el-input-number
                  v-model="formData.price"
                  :min="0"
                  :precision="2"
                  placeholder="请输入售价"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="原价" prop="originalPrice">
              <el-input-number
                  v-model="formData.originalPrice"
                  :min="0"
                  :precision="2"
                  placeholder="请输入原价"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="成本价" prop="costPrice">
              <el-input-number
                  v-model="formData.costPrice"
                  :min="0"
                  :precision="2"
                  placeholder="请输入成本价"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number
                  v-model="formData.stock"
                  :min="0"
                  placeholder="请输入库存"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存预警" prop="lowStock">
              <el-input-number
                  v-model="formData.lowStock"
                  :min="0"
                  placeholder="请输入库存预警值"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 商品图片 -->
        <el-divider content-position="left">商品图片</el-divider>

        <el-form-item label="商品主图" prop="pic">
          <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleMainImageSuccess"
              :before-upload="beforeImageUpload"
          >
            <img v-if="formData.pic" :src="formData.pic" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="轮播图" prop="albumPics">
          <el-upload
              :action="uploadUrl"
              :headers="uploadHeaders"
              list-type="picture-card"
              :file-list="albumPicsList"
              :on-success="handleAlbumPicsSuccess"
              :on-remove="handleAlbumPicsRemove"
              :before-upload="beforeImageUpload"
              :limit="5"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">最多上传5张图片</div>
        </el-form-item>

        <!-- 商品状态 -->
        <el-divider content-position="left">商品状态</el-divider>

        <el-form-item label="上架状态">
          <el-switch
              v-model="formData.publishStatus"
              :active-value="1"
              :inactive-value="0"
              active-text="上架"
              inactive-text="下架"
          />
        </el-form-item>

        <el-form-item label="新品推荐">
          <el-switch
              v-model="formData.newStatus"
              :active-value="1"
              :inactive-value="0"
          />
        </el-form-item>

        <el-form-item label="推荐状态">
          <el-switch
              v-model="formData.recommendStatus"
              :active-value="1"
              :inactive-value="0"
          />
        </el-form-item>

        <!-- 商品详情 -->
        <el-divider content-position="left">商品详情</el-divider>

        <el-form-item label="商品详情">
          <el-input
              v-model="formData.detailHtml"
              type="textarea"
              :rows="6"
              placeholder="请输入商品详情（支持HTML）"
          />
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isEdit ? '保存修改' : '添加商品' }}
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { getProductDetail, addProduct, updateProduct, getCategoryTree } from '@/api/product'

// 路由
const router = useRouter()
const route = useRoute()

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 是否编辑模式 - 从query参数获取id
const isEdit = computed(() => !!route.query.id)

// 商品ID - 从query参数获取
const productId = computed(() => route.query.id as string)

// 上传地址
const uploadUrl = '/api/admin/upload/image'

// 上传请求头
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('smart_mall_token')}`
}

// 分类树数据
const categoryTree = ref<any[]>([])

// 品牌列表
const brandList = ref<any[]>([])

// 轮播图列表
const albumPicsList = ref<UploadFile[]>([])

// 表单数据
const formData = reactive({
  id: undefined as number | undefined,
  name: '',
  subTitle: '',
  productSn: '',
  brandId: undefined as number | undefined,
  brandName: '',  // 新增：品牌名称（可输入）
  categoryIds: [] as number[],
  categoryId: undefined as number | undefined,
  price: 0,
  originalPrice: 0,
  costPrice: 0,
  stock: 0,
  lowStock: 10,
  unit: '件',
  weight: 0,
  volume: 0,
  keywords: '',
  description: '',
  pic: '',
  albumPics: [] as string[],
  detailHtml: '',
  publishStatus: 0,
  newStatus: 0,
  recommendStatus: 0,
  sort: 0
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  categoryIds: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入售价', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' }
  ]
}

// 分类选择变化
const handleCategoryChange = (value: number[]) => {
  if (value && value.length > 0) {
    formData.categoryId = value[value.length - 1]
  } else {
    formData.categoryId = undefined
  }
}

// 主图上传成功
const handleMainImageSuccess = (response: any) => {
  if (response.code === 200) {
    formData.pic = response.data.url || response.data
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 轮播图上传成功
const handleAlbumPicsSuccess = (response: any, file: UploadFile) => {
  if (response.code === 200) {
    formData.albumPics.push(response.data.url || response.data)
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 轮播图移除
const handleAlbumPicsRemove = (file: UploadFile) => {
  const index = formData.albumPics.findIndex(url => url === file.url || file.response?.data?.url === url)
  if (index > -1) {
    formData.albumPics.splice(index, 1)
  }
}

// 图片上传前校验
const beforeImageUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 获取分类树
const loadCategoryTree = async () => {
  try {
    const data = await getCategoryTree()
    categoryTree.value = data || []
  } catch (error) {
    console.error('获取分类树失败', error)
  }
}

// 获取品牌列表（新增）
const loadBrandList = async () => {
  try {
    const token = localStorage.getItem('smart_mall_token')
    const response = await fetch('/api/admin/brand/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const result = await response.json()
    if (result.code === 200) {
      brandList.value = result.data || []
    }
  } catch (error) {
    console.error('获取品牌列表失败', error)
  }
}

// 加载商品详情（编辑模式）
const loadProductDetail = async () => {
  if (!isEdit.value) return

  try {
    loading.value = true
    const data = await getProductDetail(Number(productId.value))

    // 填充表单数据
    Object.assign(formData, {
      ...data,
      brandName: (data as any).brandName || '',
      categoryIds: []
    })

    // 处理轮播图
    if (data.albumPics) {
      const pics = data.albumPics.split(',')
      formData.albumPics = pics
      albumPicsList.value = pics.map((url: string, index: number) => ({
        name: `image-${index}`,
        url
      }))
    }

  } catch (error) {
    ElMessage.error('获取商品详情失败')
    router.push('/admin/product/list')
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      loading.value = true

      const submitData = {
        ...formData,
        albumPics: formData.albumPics.join(','),
        // 确保pic字段有值
        pic: formData.pic
      }

      if (isEdit.value) {
        await updateProduct(submitData)
        ElMessage.success('修改成功')
      } else {
        await addProduct(submitData)
        ElMessage.success('添加成功')
      }

      router.push('/admin/product/list')
    } catch (error) {
      ElMessage.error(isEdit.value ? '修改失败' : '添加失败')
    } finally {
      loading.value = false
    }
  })
}

// 取消
const handleCancel = () => {
  router.push('/admin/product/list')
}

// 初始化
onMounted(() => {
  loadCategoryTree()
  loadBrandList()
  if (isEdit.value) {
    loadProductDetail()
  }
})
</script>

<style scoped>
.product-add-container {
  padding: 20px;
}

.form-card {
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.product-form {
  padding: 20px 0;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader:hover {
  border-color: #e1251b;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 150px;
  height: 150px;
  line-height: 150px;
  text-align: center;
}

.avatar {
  width: 150px;
  height: 150px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}

:deep(.el-divider__text) {
  background-color: #fff;
  padding: 0 10px;
  font-weight: bold;
  color: #303133;
}
</style>
