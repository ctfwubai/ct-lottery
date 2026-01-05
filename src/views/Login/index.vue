<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1 class="login-title">🎰 幸运抽奖系统</h1>
        <p class="login-subtitle">请登录以继续</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">账号</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="form-input"
            placeholder="请输入账号"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="请输入密码"
            required
            autocomplete="current-password"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="login-footer">
        <p class="footer-text">© 2025 CT-Lottery System</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

// 获取自定义账号密码
const getLoginAccount = () => {
  try {
    const customUsername = localStorage.getItem('lottery_login_username')
    const customPassword = localStorage.getItem('lottery_login_password')
    if (customUsername && customPassword) {
      return { username: customUsername, password: customPassword }
    }
  } catch (error) {
    console.error('读取自定义账号密码失败:', error)
  }
  // 返回默认账号密码
  return {
    username: import.meta.env.VITE_AUTH_USERNAME || 'admin',
    password: import.meta.env.VITE_AUTH_PASSWORD || 'admin123'
  }
}

const AUTH_ACCOUNT = getLoginAccount()
const AUTH_USERNAME = AUTH_ACCOUNT.username
const AUTH_PASSWORD = AUTH_ACCOUNT.password

const handleLogin = () => {
  errorMessage.value = ''

  // 验证输入
  if (!username.value.trim() || !password.value.trim()) {
    errorMessage.value = '请输入账号和密码'
    return
  }

  loading.value = true

  // 模拟登录验证（延迟一下，显示加载状态）
  setTimeout(() => {
    if (username.value === AUTH_USERNAME && password.value === AUTH_PASSWORD) {
      // 登录成功，保存到 localStorage
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('loginTime', Date.now().toString())
      // 同步保存管理员密码，用于其他功能验证
      localStorage.setItem('adminPassword', AUTH_PASSWORD)

      toast.open({
        message: '登录成功！',
        type: 'success',
        position: 'top',
      })

      // 跳转到首页
      router.push('/ct-lottery/home')
    } else {
      errorMessage.value = '账号或密码错误'
      toast.open({
        message: '登录失败，请检查账号密码',
        type: 'error',
        position: 'top',
      })
    }
    loading.value = false
  }, 500)
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 10px 0;
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.form-input {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
  outline: none;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-input:focus {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.error-message {
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  font-size: 14px;
  text-align: center;
}

.login-button {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 30px;
  text-align: center;
}

.footer-text {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  margin: 0;
}
</style>
