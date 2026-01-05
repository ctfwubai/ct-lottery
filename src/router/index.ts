import Layout from '@/layout/index.vue'
import i18n from '@/locales/i18n'
import Home from '@/views/Home/index.vue'
import { createRouter, createWebHistory,createWebHashHistory } from 'vue-router'

export const configRoutes = {
  path: '/ct-lottery/config',
  name: 'Config',
  component: () => import('@/views/Config/index.vue'),
  meta: {
    requiresAuth: true,
  },
  children: [
    {
      path: '',
      redirect: '/ct-lottery/config/person',
    },
    {
      path: '/ct-lottery/config/person',
      name: 'PersonConfig',
      component: () => import('@/views/Config/Person/PersonConfig.vue'),
      meta: {
        title: i18n.global.t('sidebar.personConfiguration'),
        icon: 'person',
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          redirect: '/ct-lottery/config/person/all',
        },
        {
          path: '/ct-lottery/config/person/all',
          name: 'AllPersonConfig',
          component: () => import('@/views/Config/Person/PersonAll.vue'),
          meta: {
            title: i18n.global.t('sidebar.personList'),
            icon: 'all',
            requiresAuth: true,
          },
        },
        {
          path: '/ct-lottery/config/person/already',
          name: 'AlreadyPerson',
          component: () => import('@/views/Config/Person/PersonAlready.vue'),
          meta: {
            title: i18n.global.t('sidebar.winnerList'),
            icon: 'already',
            requiresAuth: true,
          },
        },
        // {
        //     path:'other',
        //     name:'OtherPersonConfig',
        //     component:()=>import('@/views/Config/Person/OtherPersonConfig.vue'),
        //     meta:{
        //         title:'其他配置',
        //         icon:'other'
        //     }
        // }
      ],
    },
    {
      path: '/ct-lottery/config/prize',
      name: 'PrizeConfig',
      component: () => import('@/views/Config/Prize/PrizeConfig.vue'),
      meta: {
        title: i18n.global.t('sidebar.prizeConfiguration'),
        icon: 'prize',
        requiresAuth: true,
      },
    },
    {
      path: '/ct-lottery/config/global',
      name: 'GlobalConfig',
      redirect: '/ct-lottery/config/global/all',
      meta: {
        title: i18n.global.t('sidebar.globalSetting'),
        icon: 'global',
        requiresAuth: true,
      },
      children: [
        {
          path: '/ct-lottery/config/global/face',
          name: 'FaceConfig',
          component: () => import('@/views/Config/Global/FaceConfig.vue'),
          meta: {
            title: i18n.global.t('sidebar.viewSetting'),
            icon: 'face',
            requiresAuth: true,
          },
        },
        {
          path: '/ct-lottery/config/global/custom',
          name: 'CustomTextConfig',
          component: () => import('@/views/Config/Global/CustomText.vue'),
          meta: {
            title: '自定义文字',
            icon: 'edit',
            requiresAuth: true,
          },
        },
        {
          path: '/ct-lottery/config/global/image',
          name: 'ImageConfig',
          component: () => import('@/views/Config/Global/ImageConfig.vue'),
          meta: {
            title: i18n.global.t('sidebar.imagesManagement'),
            icon: 'image',
            requiresAuth: true,
          },
        },
        {
          path: '/ct-lottery/config/global/music',
          name: 'MusicConfig',
          component: () => import('@/views/Config/Global/MusicConfig.vue'),
          meta: {
            title: i18n.global.t('sidebar.musicManagement'),
            icon: 'music',
            requiresAuth: true,
          },
        },
        {
          path: '/ct-lottery/config/global/font',
          name: 'FontConfig',
          component: () => import('@/views/Config/Global/FontConfig.vue'),
          meta: {
            title: i18n.global.t('sidebar.fontManagement'),
            icon: 'font',
            requiresAuth: true,
          },
        },
        {
          path: '/ct-lottery/config/global/template',
          name: 'TemplateConfig',
          component: () => import('@/views/Config/Global/TemplateConfig.vue'),
          meta: {
            title: i18n.global.t('sidebar.templateManage'),
            icon: 'template',
            requiresAuth: true,
          },
        },
        {
          path: '/ct-lottery/config/global/mobile-control',
          name: 'MobileControlConfig',
          component: () => import('@/views/Config/Global/MobileControlConfig.vue'),
          meta: {
            title: '手机控制',
            icon: 'mobile',
            requiresAuth: true,
          },
        },
      ],
    },
    {
      path: '/ct-lottery/config/special',
      name: 'SpecialConfig',
      component: () => import('@/views/Config/Special/index.vue'),
      meta: {
        title: '系统设置',
        icon: 'special',
        requiresAuth: true,
      },
    },
    {
      path: '/ct-lottery/config/readme',
      name: 'Readme',
      component: () => import('@/views/Config/Readme/index.vue'),
      meta: {
        title: i18n.global.t('sidebar.operatingInstructions'),
        icon: 'readme',
        requiresAuth: true,
      },
    },
  ],
}
const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: {
      public: true,
    },
  },
  {
    path: '/mobile-control',
    name: 'MobileControl',
    component: () => import('@/views/MobileControl/Login.vue'),
    meta: {
      public: true,
    },
  },
  {
    path: '/mobile-control/control',
    name: 'MobileControlPanel',
    component: () => import('@/views/MobileControl/Control.vue'),
    meta: {
      public: true,
    },
  },
  {
    path: '/ct-lottery',
    component: Layout,
    meta: {
      requiresAuth: true,
    },
    redirect: '/ct-lottery/home',
    children: [
      {
        path: '/ct-lottery/home',
        name: 'Home',
        component: Home,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/ct-lottery/demo',
        name: 'Demo',
        component: () => import('@/views/Demo/index.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      configRoutes,
    ],
  },
];
const envMode=import.meta.env.MODE;
const router = createRouter({
    // 读取环境变量
  history: envMode==='file'?createWebHashHistory():createWebHistory(),
  routes,
})

// 路由守卫 - 检查登录状态
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const loginTime = localStorage.getItem('loginTime')
  
  // 检查登录是否过期（24小时）
  let isExpired = false
  if (loginTime && isLoggedIn) {
    const elapsed = Date.now() - Number.parseInt(loginTime)
    const hoursElapsed = elapsed / (1000 * 60 * 60)
    if (hoursElapsed > 24) {
      isExpired = true
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('loginTime')
    }
  }

  // 如果路由标记为公开页面，直接放行
  if (to.meta.public) {
    if (isLoggedIn && !isExpired && to.path === '/login') {
      // 已登录用户访问登录页，重定向到首页
      next('/ct-lottery/home')
    } else {
      next()
    }
    return
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth && (!isLoggedIn || isExpired)) {
    // 未登录或登录已过期，重定向到登录页
    next('/login')
  } else {
    next()
  }
})

export default router
