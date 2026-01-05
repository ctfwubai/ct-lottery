<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toast-notification'
import { useMobileControlStore } from '@/store/mobileControl'
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const toast = useToast()
const mobileControlStore = useMobileControlStore()

// 从store获取状态
const { enabled, isConnected, connectedDevice } = storeToRefs(mobileControlStore)

// 状态
const currentCode = ref('')
const newCode = ref('')
const logs = ref<string[]>([])
const showLogs = ref(false)
const showUpdateCode = ref(false)
const showPasswordDialog = ref(false)
const passwordDialogValue = ref('')
let refreshLogsTimer: number | null = null

// 日志类型翻译
const logTypeMap: Record<string, string> = {
  verify_code: '验证码验证',
  device_connect: '设备连接',
  device_disconnect: '设备断开',
  mobile_start_lottery: '手机开始抽奖',
  mobile_stop_lottery: '手机停止抽奖',
  mobile_skip_winner: '手机跳过中奖者',
  mobile_show_winners: '手机查看中奖名单',
  toggle_enabled: '切换总开关',
  update_code: '更新验证码',
  lock_control: '锁定/解锁',
}

// 状态翻译
const statusMap: Record<string, string> = {
  success: '✅ 成功',
  failed: '❌ 失败',
}

// 原因翻译
const reasonMap: Record<string, string> = {
  invalid_code: '验证码错误',
  invalid_admin_password: '管理员密码错误',
  feature_disabled: '手机控制功能已关闭',
  locked: '大屏已锁定',
  not_in_lottery_page: '不在抽奖页面',
}

// 解析和格式化日志
const formatLog = (log: string) => {
  try {
    // 日志格式: [时间] [类型] [设备] 状态 {数据}
    const match = log.match(/\[(.*?)\] \[(.*?)\] \[(.*?)\] (\w+)(.*)/)

    if (!match) {
      return log
    }

    const [, time, type, device, status, extra] = match
    const typeText = logTypeMap[type] || type
    const statusText = statusMap[status] || status

    let extraText = ''
    if (extra) {
      try {
        const data = JSON.parse(extra.trim())
        const parts: string[] = []

        if (data.reason) {
          parts.push(`原因: ${reasonMap[data.reason] || data.reason}`)
        }

        if (data.enabled !== undefined) {
          parts.push(`开关状态: ${data.enabled ? '开启' : '关闭'}`)
        }

        if (data.action) {
          parts.push(`操作: ${data.action === 'lock' ? '锁定' : '解锁'}`)
        }

        if (data.winnerId || data.winnerName) {
          parts.push(`中奖者: ${data.winnerName || data.winnerId}`)
        }

        if (data.newCodeLength) {
          parts.push(`验证码长度: ${data.newCodeLength}`)
        }

        if (data.prizeInfo) {
          parts.push(`奖项: ${data.prizeInfo.name}`)
        }

        if (parts.length > 0) {
          extraText = ` (${parts.join(', ')})`
        }
      } catch (e) {
        extraText = extra
      }
    }

    return `${time} | ${typeText} | ${device} | ${statusText}${extraText}`
  } catch (error) {
    return log
  }
}

// 自动刷新日志
const startAutoRefreshLogs = () => {
  if (refreshLogsTimer) {
    clearInterval(refreshLogsTimer)
  }
  // 每3秒刷新一次日志
  refreshLogsTimer = window.setInterval(() => {
    loadLogs()
  }, 3000)
}

const stopAutoRefreshLogs = () => {
  if (refreshLogsTimer) {
    clearInterval(refreshLogsTimer)
    refreshLogsTimer = null
  }
}

// 自定义URL配置
const customUrlEnabled = ref(false)
const customProtocol = ref('http')
const customHost = ref('')
const customPort = ref('6719')
const showUrlConfig = ref(false)

// 加载自定义URL配置
const loadCustomUrlConfig = () => {
  try {
    const saved = localStorage.getItem('lottery_custom_url')
    if (saved) {
      const config = JSON.parse(saved)
      customUrlEnabled.value = config.enabled || false
      customProtocol.value = config.protocol || 'http'
      customHost.value = config.host || ''
      customPort.value = config.port || '6719'
    }
  } catch (error) {
    console.error('Failed to load custom URL config:', error)
  }
}

// 保存自定义URL配置
const saveCustomUrlConfig = () => {
  try {
    const config = {
      enabled: customUrlEnabled.value,
      protocol: customProtocol.value,
      host: customHost.value,
      port: customPort.value,
    }
    localStorage.setItem('lottery_custom_url', JSON.stringify(config))
    toast.success('自定义URL配置已保存')
    // 保存后关闭配置框
    if (customUrlEnabled.value) {
      showUrlConfig.value = false
    }
  } catch (error) {
    console.error('Failed to save custom URL config:', error)
    toast.error('保存失败')
  }
}

// 获取当前URL（用于显示）
const getCurrentUrl = () => {
  if (customUrlEnabled.value && customHost.value) {
    return `${customProtocol.value}://${customHost.value}:${customPort.value}/mobile-control`
  }
  return window.location.origin + '/mobile-control'
}

// 加载配置
const loadConfig = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/mobile-control/code')
    const data = await response.json()
    if (data.success) {
      currentCode.value = data.code
      // 同步store的enabled状态
      mobileControlStore.setEnabled(data.enabled)
    }
  } catch (error) {
    console.error('Failed to load config:', error)
    // 静默失败，不显示错误提示，因为可能是后端服务未启动
    // 使用默认值
    if (!currentCode.value) {
      currentCode.value = '123456'
    }
  }
}

// 更新验证码
const updateCode = async () => {
  if (!newCode.value || !/^\d{4,8}$/.test(newCode.value)) {
    toast.error('验证码必须是 4-8 位数字')
    return
  }

  try {
    const response = await fetch('http://localhost:3001/api/mobile-control/code', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newCode: newCode.value,
      }),
    })

    const data = await response.json()
    if (data.success) {
      toast.success('验证码更新成功')
      currentCode.value = '●'.repeat(newCode.value.length)
      newCode.value = ''
      showUpdateCode.value = false
      await loadConfig()
    } else {
      toast.error(data.error || '更新失败')
    }
  } catch (error) {
    console.error('Failed to update code:', error)
    toast.error('更新失败，请检查网络连接')
  }
}

// 切换总开关
const toggleEnabled = () => {
  executeToggleEnabled(null)
}

// 执行切换开关
const executeToggleEnabled = async (password: string | null) => {
  try {
    const body: any = {
      enabled: !enabled.value,
    }

    const response = await fetch('http://localhost:3001/api/mobile-control/enabled', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    if (data.success) {
      // 使用store的setEnabled方法同步状态
      mobileControlStore.setEnabled(data.enabled)
      toast.success(data.enabled ? '已开启手机控制' : '已关闭手机控制')
    } else {
      toast.error(data.error || '操作失败')
    }
  } catch (error) {
    console.error('Failed to toggle enabled:', error)
    toast.error('操作失败，请确保后端服务器（端口3001）正在运行')
  }
}

// 加载日志
const loadLogs = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/mobile-control/logs?limit=100')
    const data = await response.json()
    if (data.success) {
      console.log('[MobileControlConfig] Logs loaded:', data.logs.length)
      logs.value = data.logs
    }
  } catch (error) {
    console.error('[MobileControlConfig] Failed to load logs:', error)
    // 显示错误提示
    logs.value = []
  }
}

// 清空日志
const clearLogs = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/mobile-control/logs', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    const data = await response.json()
    if (data.success) {
      toast.success('日志已清空')
      logs.value = []
    } else {
      toast.error(data.error || '清空失败')
    }
  } catch (error) {
    console.error('Failed to clear logs:', error)
    toast.error('清空失败')
  }
}

onMounted(() => {
  loadConfig()
  loadLogs()
  loadCustomUrlConfig()
  startAutoRefreshLogs()
})

onUnmounted(() => {
  stopAutoRefreshLogs()
})
</script>

<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-6">
      📱 手机控制设置
    </h2>

    <!-- 总开关 -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h3 class="card-title">总开关</h3>
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text text-lg">启用手机控制功能</span>
            <input
              type="checkbox"
              class="toggle toggle-primary toggle-lg"
              :checked="enabled"
              @change="toggleEnabled"
            />
          </label>
        </div>
        <p class="text-sm text-gray-500 mt-2">
          关闭后，所有手机将无法连接控制大屏，鼠标滑过抽奖开始按钮也不会显示二维码
        </p>
      </div>
    </div>

    <!-- 自定义URL配置 -->
    <div class="card bg-base-100 shadow-xl mb-6" :class="{ 'opacity-50': !enabled }">
      <div class="card-body">
        <h3 class="card-title">📡 自定义扫码链接</h3>
        <p class="text-sm text-gray-500 mb-4">
          如果您有多张网卡或使用域名，可以自定义扫码后的访问地址
        </p>

        <div class="form-control mb-4">
          <label class="label cursor-pointer">
            <span class="label-text font-medium">启用自定义URL</span>
            <input
              type="checkbox"
              class="toggle toggle-primary"
              v-model="customUrlEnabled"
              :disabled="!enabled"
              @change="customUrlEnabled ? showUrlConfig = true : saveCustomUrlConfig()"
            />
          </label>
        </div>

        <!-- 当前URL显示 -->
        <div class="alert bg-blue-50 border-blue-200 mb-4">
          <div class="flex-1">
            <div class="text-sm text-gray-600 mb-1">当前扫码链接：</div>
            <div class="font-mono text-blue-600 break-all text-sm">{{ getCurrentUrl() }}</div>
          </div>
        </div>

        <!-- 自定义URL配置表单 -->
        <div v-if="showUrlConfig" class="mt-4 p-4 bg-base-200 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">协议</span>
              </label>
              <select
                v-model="customProtocol"
                class="select select-bordered"
                :disabled="!customUrlEnabled"
              >
                <option value="http">http://</option>
                <option value="https">https://</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">IP地址或域名</span>
              </label>
              <input
                v-model="customHost"
                type="text"
                placeholder="例如: 192.168.1.100 或 example.com"
                class="input input-bordered"
                :disabled="!customUrlEnabled"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">端口</span>
              </label>
              <input
                v-model="customPort"
                type="text"
                placeholder="例如: 6719"
                class="input input-bordered"
                :disabled="!customUrlEnabled"
              />
            </div>
          </div>

          <div class="flex gap-2">
            <button
              class="btn btn-primary"
              @click="saveCustomUrlConfig"
              :disabled="!customUrlEnabled"
            >
              保存配置
            </button>
            <button
              class="btn btn-ghost"
              @click="showUrlConfig = false"
            >
              取消
            </button>
          </div>

          <div v-if="customUrlEnabled && String(customHost)" class="mt-4 alert alert-info">
            <div>
              <div class="font-bold">预览</div>
              <div class="font-mono text-sm mt-1">
                {{ customProtocol }}://{{ customHost }}:{{ customPort }}/mobile-control
              </div>
            </div>
          </div>
        </div>

        <div class="text-sm text-gray-500 mt-4">
          <div class="font-medium mb-2">💡 使用说明：</div>
          <ul class="list-disc list-inside space-y-1">
            <li>如果不启用自定义URL，扫码将使用当前浏览器地址</li>
            <li>启用后，手机扫码将跳转到您配置的地址</li>
            <li>支持多网卡环境，选择正确的IP地址</li>
            <li>支持域名配置，如已配置HTTPS，请选择https协议</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 验证码设置 -->
    <div class="card bg-base-100 shadow-xl mb-6" :class="{ 'opacity-50': !enabled }">
      <div class="card-body">
        <h3 class="card-title">验证码设置</h3>
        <p class="text-sm text-gray-500 mb-4">
          手机扫描二维码后需要输入验证码才能连接控制
        </p>

        <div class="flex items-center gap-4 mb-4">
          <div class="text-4xl font-bold tracking-widest">
            {{ currentCode }}
          </div>
          <button
            class="btn btn-primary"
            @click="showUpdateCode = true"
            :disabled="!enabled"
          >
            更新验证码
          </button>
        </div>

        <!-- 更新验证码表单 -->
        <div v-if="showUpdateCode" class="mt-4 p-4 bg-base-200 rounded-lg">
          <div class="form-control">
            <label class="label">
              <span class="label-text">新验证码（4-8位数字）</span>
            </label>
            <input
              v-model="newCode"
              type="text"
              placeholder="请输入新验证码"
              class="input input-bordered w-full max-w-xs"
              maxlength="8"
            />
          </div>
          <div class="flex gap-2 mt-4">
            <button class="btn btn-primary" @click="updateCode">
              确认更新
            </button>
            <button class="btn btn-ghost" @click="showUpdateCode = false">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 连接状态 -->
    <div class="card bg-base-100 shadow-xl mb-6" :class="{ 'opacity-50': !enabled }">
      <div class="card-body">
        <h3 class="card-title">连接状态</h3>
        <div class="flex items-center gap-2">
          <div class="badge badge-lg" :class="isConnected ? 'badge-success' : 'badge-error'">
            {{ isConnected ? `已连接：${connectedDevice || '未知设备'}` : '未连接' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 操作日志 -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h3 class="card-title">操作日志</h3>
          <button class="btn btn-sm btn-error" @click="clearLogs">
            清空日志
          </button>
        </div>

        <button class="btn btn-ghost w-full" @click="showLogs = !showLogs">
          {{ showLogs ? '收起日志' : '查看日志' }}
        </button>

        <div v-if="showLogs" class="mt-4 max-h-96 overflow-y-auto">
          <div v-if="logs.length === 0" class="text-center text-gray-500 py-4">
            暂无日志
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="(log, index) in logs"
              :key="index"
              class="p-3 bg-base-200 rounded-lg text-sm leading-relaxed border-l-4"
              :class="{
                'border-green-500': log.includes('success'),
                'border-red-500': log.includes('failed'),
                'border-blue-500': !log.includes('success') && !log.includes('failed')
              }"
            >
              {{ formatLog(log) }}
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
