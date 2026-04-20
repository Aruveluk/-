import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'


declare module 'vue-router' {
    interface RouteMeta {
        title?: string
        requiresAuth?: boolean
    }
}

const AdminLayout = () => import('@/layouts/AdminLayout.vue')
const Login = () => import('@/views/login/index.vue')
const Dashboard = () => import('@/views/dashboard/index.vue')

const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { title: '登录', requiresAuth: false }
    },
    {
        path: '/admin',
        component: AdminLayout,
        redirect: '/admin/dashboard',
        meta: { requiresAuth: true },
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: Dashboard,
                meta: { title: '仪表盘' }
            },
            {
                path: 'product/list',
                name: 'ProductList',
                component: () => import('@/views/product/list.vue'),
                meta: { title: '商品列表' }
            },
            {
                path: 'product/add',
                name: 'ProductAdd',
                component: () => import('@/views/product/add.vue'),
                meta: { title: '添加商品' }
            },
            {
                path: 'product/edit/:id',
                name: 'ProductEdit',
                component: () => import('@/views/product/add.vue'),
                meta: { title: '编辑商品' }
            },
            {
                path: 'product/category',
                name: 'ProductCategory',
                component: () => import('@/views/product/category.vue'),
                meta: { title: '商品分类' }
            },
            {
                path: 'product/brand',
                name: 'ProductBrand',
                component: () => import('@/views/product/brand.vue'),
                meta: { title: '品牌管理' }
            },
            {
                path: 'order/list',
                name: 'OrderList',
                component: () => import('@/views/order/list.vue'),
                meta: { title: '订单列表' }
            },
            {
                path: 'user/list',
                name: 'UserList',
                component: () => import('@/views/user/list.vue'),
                meta: { title: '用户列表' }
            },
            {
                path: 'marketing/coupon',
                name: 'Coupon',
                component: () => import('@/views/marketing/coupon.vue'),
                meta: { title: '优惠券' }
            },
            {
                path: 'ai/chat',
                name: 'AiChat',
                component: () => import('@/views/ai/index.vue'),
                meta: { title: 'AI客服' }
            },
            {
                path: 'ai/knowledge',
                name: 'AiKnowledge',
                component: () => import('@/views/ai/knowledge.vue'),
                meta: { title: '知识库管理' }
            }
        ]
    },
    {
        path: '/',
        redirect: '/admin/dashboard'
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/admin/dashboard'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, _from) => {
    const userStore = useUserStore()

    if (to.meta.title) {
        document.title = `${to.meta.title} - 智能商城后台管理`
    }

    if (to.meta.requiresAuth !== false && !userStore.token) {
        return { path: '/login', query: { redirect: to.fullPath } }
    }

    if (to.path === '/login' && userStore.token) {
        return '/admin/dashboard'
    }
})

export default router