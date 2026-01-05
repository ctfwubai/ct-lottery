<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()

const verifyCode = ref('')
const loading = ref(false)
const deviceId = ref('')

// 获取API基础URL（从当前页面主机推断，端口改为3001）
const getApiBaseUrl = () => {
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  // 如果URL中有自定义端口参数，使用该端口-3000（前端端口是6719，后端是3001）
  const port = '3001'
  return `${protocol}//${hostname}:${port}`
}

// 生成设备ID
const generateDeviceId = () => {
  return `MOBILE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 检查是否启用
const checkEnabled = async () => {
  try {
    const apiUrl = getApiBaseUrl()
    const response = await fetch(`${apiUrl}/api/mobile-control/enabled`)
    const data = await response.json()
    if (!data.success || !data.enabled) {
      toast.error('手机控制功能已关闭')
      router.push('/')
    }
  } catch (error) {
    console.error('Failed to check enabled status:', error)
    toast.error('网络连接失败，请检查网络。确保后端服务器（端口3001）已启动')
  }
}

// 登录
const handleLogin = async () => {
  if (!verifyCode.value || !/^\d{4,8}$/.test(verifyCode.value)) {
    toast.error('请输入 4-8 位数字验证码')
    return
  }

  loading.value = true
  try {
    const apiUrl = getApiBaseUrl()
    const response = await fetch(`${apiUrl}/api/mobile-control/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: verifyCode.value,
        device: deviceId.value,
      }),
    })

    const data = await response.json()
    if (data.success) {
      toast.success('登录成功')
      // 跳转到控制面板
      router.push('/mobile-control/control')
    } else {
      toast.error(data.error || '验证码错误')
    }
  } catch (error) {
    console.error('Login failed:', error)
    toast.error('网络连接失败，请检查网络。确保后端服务器（端口3001）已启动')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  deviceId.value = generateDeviceId()
  checkEnabled()
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="text-6xl mb-4">📱</div>
          <h1 class="text-2xl font-bold text-gray-800">手机控制登录</h1>
          <p class="text-gray-600 mt-2">扫码后输入验证码连接大屏</p>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              验证码
            </label>
            <input
              v-model="verifyCode"
              type="tel"
              maxlength="8"
              inputmode="numeric"
              placeholder="请输入 4-8 位数字验证码"
              class="w-full px-4 py-3 text-2xl text-center border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none tracking-widest"
              :disabled="loading"
            />
            <p class="text-sm text-gray-500 mt-2 text-center">
              请在大屏配置页面查看验证码
            </p>
          </div>

          <button
            type="submit"
            class="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading || !verifyCode"
          >
            <span v-if="loading" class="inline-block animate-spin mr-2">⏳</span>
            {{ loading ? '登录中...' : '登 录' }}
          </button>
        </form>

        <!-- 提示信息 -->
        <div class="mt-6 p-4 bg-blue-50 rounded-xl">
          <p class="text-sm text-blue-800">
            <strong>提示：</strong>请确保大屏幕已启动并处于开锁状态
          </p>
        </div>

        <!-- 返回按钮 -->
        <div class="mt-6 text-center">
          <button
            class="text-blue-600 hover:text-blue-800 text-sm"
            @click="router.push('/')"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
