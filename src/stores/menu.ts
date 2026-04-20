/**
 * 菜单状态管理
 * 用途：管理侧边栏折叠状态、菜单配置、当前激活菜单
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 存储键名
const STORAGE_KEYS = {
    SIDEBAR_COLLAPSED: 'smart_mall_sidebar_collapsed'
}

// 本地存储操作
const storage = {
    get<T = any>(key: string): T | null {
        const value = localStorage.getItem(key)
        if (!value) return null
        try {
            return JSON.parse(value) as T
        } catch {
            return value as any
        }
    },
    set(key: string, value: any): void {
        const data = typeof value === 'string' ? value : JSON.stringify(value)
        localStorage.setItem(key, data)
    }
}

// 菜单项类型
interface MenuItem {
    id: string
    title: string
    icon?: string
    path?: string
    children?: MenuItem[]
}

export const useMenuStore = defineStore('menu', () => {
    // 状态
    const isCollapsed = ref<boolean>(storage.get(STORAGE_KEYS.SIDEBAR_COLLAPSED) ?? false)
    const activeMenu = ref<string>('')
    const openMenus = ref<string[]>([])

    // 菜单配置
    const menuItems = ref<MenuItem[]>([
        {
            id: 'dashboard',
            title: '仪表盘',
            icon: 'Odometer',
            path: '/admin/dashboard'
        },
        {
            id: 'product',
            title: '商品管理',
            icon: 'Goods',
            children: [
                { id: 'product-list', title: '商品列表', path: '/admin/product/list' },
                { id: 'product-add', title: '添加商品', path: '/admin/product/add' },
                { id: 'product-category', title: '商品分类', path: '/admin/product/category' },
                { id: 'product-brand', title: '品牌管理', path: '/admin/product/brand' }
            ]
        },
        {
            id: 'order',
            title: '订单管理',
            icon: 'List',
            children: [
                { id: 'order-list', title: '订单列表', path: '/admin/order/list' }
            ]
        },
        {
            id: 'user',
            title: '用户管理',
            icon: 'User',
            children: [
                { id: 'user-list', title: '用户列表', path: '/admin/user/list' }
            ]
        },
        {
            id: 'marketing',
            title: '营销管理',
            icon: 'Sell',
            children: [
                { id: 'coupon', title: '优惠券', path: '/admin/marketing/coupon' }
            ]
        },
        // 添加 AI 客服菜单
        {
            id: 'ai',
            title: 'AI客服',
            icon: 'Service',
            children: [
                { id: 'ai-chat', title: '智能对话', path: '/admin/ai/chat' },
                { id: 'ai-knowledge', title: '知识库管理', path: '/admin/ai/knowledge' }
            ]
        }
    ])

    // 计算属性
    const sidebarWidth = computed(() => isCollapsed.value ? '64px' : '200px')

    // 方法
    function toggleSidebar() {
        isCollapsed.value = !isCollapsed.value
        storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, isCollapsed.value)
    }

    function setActiveMenu(menuId: string) {
        activeMenu.value = menuId
    }

    function setOpenMenus(menus: string[]) {
        openMenus.value = menus
    }

    return {
        isCollapsed,
        activeMenu,
        openMenus,
        menuItems,
        sidebarWidth,
        toggleSidebar,
        setActiveMenu,
        setOpenMenus
    }
})