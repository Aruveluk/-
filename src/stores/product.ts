/**
 * 商品管理模块 Pinia 状态管理
 * 用途：管理商品列表、当前编辑商品、分页信息等状态
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
    ProductItem,
    ProductFormData,
    ProductListQuery,
    ProductCategory
} from '@/types/product';
import { ProductStatus } from '@/types/product';
import * as productApi from '@/api/product';

export const useProductStore = defineStore('product', () => {
    // ==================== 状态定义 ====================

    /** 商品列表数据 */
    const productList = ref<ProductItem[]>([]);

    /** 商品总数 */
    const total = ref(0);

    /** 当前页码 */
    const pageNum = ref(1);

    /** 每页数量 */
    const pageSize = ref(10);

    /** 加载状态 */
    const loading = ref(false);

    /** 当前编辑的商品 */
    const currentProduct = ref<ProductItem | null>(null);

    /** 商品表单数据（用于添加/编辑） */
    const formData = ref<ProductFormData>({
        name: '',
        subtitle: '',
        categoryId: 0,
        mainImage: '',
        images: [],
        price: 0,
        originalPrice: 0,
        costPrice: 0,
        stock: 0,
        lowStock: 10,
        detail: '',
        status: ProductStatus.OFF_SALE
    });

    /** 商品分类列表 */
    const categoryList = ref<ProductCategory[]>([]);

    /** 分类树结构 */
    const categoryTree = ref<ProductCategory[]>([]);

    /** 是否正在提交表单 */
    const submitting = ref(false);

    /** 选中的商品ID列表（用于批量操作） */
    const selectedIds = ref<number[]>([]);

    /** 查询参数（保留搜索条件） */
    const searchParams = ref<ProductListQuery>({});

    // ==================== 计算属性 ====================

    /** 是否有选中商品 */
    const hasSelection = computed(() => selectedIds.value.length > 0);

    /** 选中的商品数量 */
    const selectionCount = computed(() => selectedIds.value.length);

    // ==================== 方法定义 ====================

    /**
     * 获取商品列表
     */
    async function fetchProductList(params?: ProductListQuery) {
        loading.value = true;
        try {
            const queryParams: ProductListQuery = {
                pageNum: pageNum.value,
                pageSize: pageSize.value,
                ...searchParams.value,
                ...params
            };

            searchParams.value = queryParams;

            const res = await productApi.getProductList(queryParams);
            productList.value = res.list || [];
            total.value = res.total || 0;

            return res;
        } catch (error) {
            console.error('获取商品列表失败:', error);
            productList.value = [];
            total.value = 0;
            throw error;
        } finally {
            loading.value = false;
        }
    }

    /**
     * 获取商品详情
     */
    async function fetchProductDetail(id: number) {
        loading.value = true;
        try {
            const res = await productApi.getProductDetail(id);
            currentProduct.value = res;
            formData.value = { ...res };
            return res;
        } finally {
            loading.value = false;
        }
    }

    /**
     * 添加商品
     */
    async function addProduct() {
        submitting.value = true;
        try {
            const res = await productApi.addProduct(formData.value);
            return res;
        } finally {
            submitting.value = false;
        }
    }

    /**
     * 更新商品
     */
    async function updateProduct() {
        submitting.value = true;
        try {
            await productApi.updateProduct(formData.value);
        } finally {
            submitting.value = false;
        }
    }

    /**
     * 删除商品
     */
    async function deleteProduct(id: number) {
        await productApi.deleteProduct(id);
        await fetchProductList();
    }

    /**
     * 更新商品状态
     */
    async function updateStatus(id: number, status: ProductStatus) {
        await productApi.updateProductStatus(id, status);
        const product = productList.value.find(p => p.id === id);
        if (product) {
            product.status = status;
        }
    }

    /**
     * 批量更新商品状态
     */
    async function batchUpdateStatus(status: ProductStatus) {
        await productApi.batchUpdateStatus(selectedIds.value, status);
        productList.value.forEach(product => {
            if (selectedIds.value.includes(product.id!)) {
                product.status = status;
            }
        });
        selectedIds.value = [];
    }

    /**
     * 获取分类树
     */
    async function fetchCategoryTree() {
        try {
            const res = await productApi.getCategoryTree();
            categoryTree.value = res || [];
            return res;
        } catch (error) {
            console.error('获取分类树失败:', error);
            categoryTree.value = [];
        }
    }

    /**
     * 设置页码
     */
    function setPage(page: number, size?: number) {
        pageNum.value = page;
        if (size) pageSize.value = size;
    }

    /**
     * 设置选中项
     */
    function setSelection(ids: number[]) {
        selectedIds.value = ids;
    }

    /**
     * 重置搜索条件
     */
    function resetSearch() {
        searchParams.value = {};
        pageNum.value = 1;
    }

    /**
     * 重置表单数据
     */
    function resetForm() {
        formData.value = {
            name: '',
            subtitle: '',
            categoryId: 0,
            mainImage: '',
            images: [],
            price: 0,
            originalPrice: 0,
            costPrice: 0,
            stock: 0,
            lowStock: 10,
            detail: '',
            status: ProductStatus.OFF_SALE
        };
        currentProduct.value = null;
    }

    return {
        // 状态
        productList,
        total,
        pageNum,
        pageSize,
        loading,
        currentProduct,
        formData,
        categoryList,
        categoryTree,
        submitting,
        selectedIds,
        searchParams,
        // 计算属性
        hasSelection,
        selectionCount,
        // 方法
        fetchProductList,
        fetchProductDetail,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStatus,
        batchUpdateStatus,
        fetchCategoryTree,
        setPage,
        setSelection,
        resetSearch,
        resetForm
    };
});