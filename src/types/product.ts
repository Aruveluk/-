/**
 * 商品管理模块类型定义
 * 用途：定义商品相关的数据结构和接口参数类型
 */

/**
 * 商品状态枚举
 */
export enum ProductStatus {
    /** 上架 */
    ON_SALE = 1,
    /** 下架 */
    OFF_SALE = 0
}

/**
 * 商品状态选项（用于下拉选择）
 */
export const ProductStatusOptions = [
    { label: '上架', value: ProductStatus.ON_SALE },
    { label: '下架', value: ProductStatus.OFF_SALE }
];

/**
 * 商品分类信息
 */
export interface ProductCategory {
    id: number;
    name: string;
    parentId: number;
    level: number;
    sort: number;
    icon?: string;
    children?: ProductCategory[];
}

/**
 * 商品基本信息
 */
export interface ProductBase {
    /** 商品ID（编辑时必填） */
    id?: number;
    /** 商品名称 */
    name: string;
    /** 商品副标题 */
    subtitle?: string;
    /** 商品分类ID */
    categoryId: number;
    /** 分类名称 */
    categoryName?: string;
    /** 商品主图 */
    mainImage?: string;
    /** 商品轮播图列表 */
    images?: string[];
    /** 售价（元） */
    price: number;
    /** 原价（元） */
    originalPrice?: number;
    /** 成本价（元） */
    costPrice?: number;
    /** 库存数量 */
    stock: number;
    /** 预警库存 */
    lowStock?: number;
    /** 商品详情 */
    detail?: string;
    /** 商品状态：1-上架，0-下架 */
    status?: ProductStatus;
}

/**
 * 商品列表项（表格展示用）
 */
export interface ProductItem extends ProductBase {
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}

/**
 * 商品列表查询参数
 */
export interface ProductListQuery {
    /** 关键词搜索（商品名称） */
    keyword?: string;
    /** 商品分类ID */
    categoryId?: number;
    /** 商品状态 */
    status?: ProductStatus;
    /** 当前页码 */
    pageNum?: number;
    /** 每页数量 */
    pageSize?: number;
}

/**
 * 商品列表响应
 */
export interface ProductListResponse {
    /** 商品列表 */
    list: ProductItem[];
    /** 总记录数 */
    total: number;
    /** 当前页码 */
    pageNum: number;
    /** 每页数量 */
    pageSize: number;
}

/**
 * 商品表单数据（添加/编辑）
 */
export interface ProductFormData extends ProductBase {
    /** 商品图片ID列表 */
    imageIds?: number[];
}

/**
 * 上传响应结果
 */
export interface UploadResponse {
    /** 文件访问URL */
    url: string;
    /** 文件名 */
    fileName: string;
}

// ========================================
// 分类管理相关类型
// ========================================

/**
 * 分类树节点
 */
export interface CategoryTreeItem {
    /** 分类ID */
    id: number;
    /** 父分类ID */
    parentId: number;
    /** 分类名称 */
    name: string;
    /** 层级：1-一级，2-二级 */
    level: number;
    /** 排序 */
    sort: number;
    /** 图标URL */
    icon?: string;
    /** 关键词 */
    keywords?: string;
    /** 描述 */
    description?: string;
    /** 导航状态：1-显示，0-不显示 */
    navStatus?: number;
    /** 显示状态：1-启用，0-禁用 */
    showStatus?: number;
    /** 子分类 */
    children?: CategoryTreeItem[];
}

/**
 * 分类表单数据
 */
export interface CategoryFormData {
    /** 分类ID（编辑时必填） */
    id?: number;
    /** 分类名称 */
    name: string;
    /** 父分类ID */
    parentId?: number;
    /** 父分类ID路径（用于级联选择） */
    parentIds?: number[];
    /** 层级 */
    level?: number;
    /** 排序 */
    sort?: number;
    /** 图标URL */
    icon?: string;
    /** 关键词 */
    keywords?: string;
    /** 描述 */
    description?: string;
    /** 导航状态：1-显示，0-不显示 */
    navStatus?: number;
    /** 显示状态：1-启用，0-禁用 */
    showStatus?: number;
}

/**
 * 分类列表查询参数
 */
export interface CategoryListQuery {
    /** 关键词搜索 */
    keyword?: string;
    /** 父分类ID */
    parentId?: number;
    /** 显示状态 */
    status?: number;
    /** 当前页码 */
    pageNum?: number;
    /** 每页数量 */
    pageSize?: number;
}

// ========================================
// 品牌管理相关类型
// ========================================

/**
 * 品牌信息
 */
export interface BrandItem {
    /** 品牌ID */
    id: number;
    /** 品牌名称 */
    name: string;
    /** 首字母 */
    firstLetter?: string;
    /** 品牌Logo */
    logo?: string;
    /** 大图 */
    bigPic?: string;
    /** 品牌故事 */
    brandStory?: string;
    /** 排序 */
    sort?: number;
    /** 厂家状态 */
    factoryStatus?: number;
    /** 显示状态：1-启用，0-禁用 */
    showStatus?: number;
    /** 商品数量 */
    productCount?: number;
    /** 评论数量 */
    productCommentCount?: number;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
}

/**
 * 品牌表单数据
 */
export interface BrandFormData {
    /** 品牌ID（编辑时必填） */
    id?: number;
    /** 品牌名称 */
    name: string;
    /** 首字母 */
    firstLetter?: string;
    /** 品牌Logo */
    logo?: string;
    /** 大图 */
    bigPic?: string;
    /** 品牌故事 */
    brandStory?: string;
    /** 排序 */
    sort?: number;
    /** 显示状态 */
    showStatus?: number;
}

/**
 * 品牌列表查询参数
 */
export interface BrandListQuery {
    /** 关键词搜索 */
    keyword?: string;
    /** 显示状态 */
    status?: number;
    /** 当前页码 */
    pageNum?: number;
    /** 每页数量 */
    pageSize?: number;
}