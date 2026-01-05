<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { storeToRefs } from 'pinia'
import { useMobileControlStore } from '@/store/mobileControl'

const router = useRouter()
const toast = useToast()
const mobileControlStore = useMobileControlStore()

const { isLocked, isInLotteryPage, lotteryStatus } = storeToRefs(mobileControlStore)
const deviceName = ref('')

// 奖项信息
const prizeInfo = ref<any>(null)

// WebSocket连接
const ws = ref<WebSocket | null>(null)
const statusCheckCount = ref(0)
const maxStatusChecks = 10

// 获取API基础URL（从当前页面主机推断，端口改为3001）
const getApiBaseUrl = () => {
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const port = '3001'
  return `${protocol}//${hostname}:${port}`
}

// 获取WebSocket URL
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const hostname = window.location.hostname
  const port = '3001'
  return `${protocol}//${hostname}:${port}/ws/mobile-control`
}

// 获取设备名称
const getDeviceName = () => {
  const userAgent = navigator.userAgent
  if (userAgent.includes('iPhone')) {
    return 'iPhone'
  } else if (userAgent.includes('iPad')) {
    return 'iPad'
  } else if (userAgent.includes('Android')) {
    return 'Android'
  } else {
    return 'Mobile Device'
  }
}

// 初始化WebSocket连接
const initWebSocket = () => {
  try {
    const wsUrl = getWebSocketUrl()
    console.log('[MobileControl] Connecting to WebSocket:', wsUrl)

    ws.value = new WebSocket(wsUrl)

    ws.value.onopen = () => {
      console.log('[MobileControl] WebSocket connected')

      // 发送手机连接消息
      if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        ws.value.send(JSON.stringify({
          type: 'mobile_connect',
          device: deviceName.value,
        }))
        console.log('[MobileControl] Sent mobile_connect message')
      }
    }

    ws.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('[MobileControl] Received message:', data)

        handleWebSocketMessage(data)
      } catch (error) {
        console.error('[MobileControl] Failed to parse message:', error)
      }
    }

    ws.value.onerror = (error) => {
      console.error('[MobileControl] WebSocket error:', error)
      toast.error('WebSocket连接错误')
    }

    ws.value.onclose = () => {
      console.log('[MobileControl] WebSocket disconnected')
      toast.warning('与断开大屏连接')

      // 3秒后重连
      setTimeout(() => {
        console.log('[MobileControl] Reconnecting...')
        initWebSocket()
      }, 3000)
    }
  } catch (error) {
    console.error('[MobileControl] Failed to connect WebSocket:', error)
    toast.error('连接失败，请检查网络')
  }
}

// 处理WebSocket消息
const handleWebSocketMessage = (data: any) => {
  switch (data.type) {
    case 'connected':
      console.log('[MobileControl] Server acknowledged connection')
      toast.success('已连接到大屏')
      break
      case 'status':
      // 接收到大屏状态
      if (data.data) {
        mobileControlStore.isLocked = data.data.locked
        mobileControlStore.isInLotteryPage = data.data.inLotteryPage
        // 更新抽奖状态
        if (data.data.lotteryStatus !== undefined) {
          mobileControlStore.lotteryStatus = data.data.lotteryStatus
        }

        // 更新奖项信息
        if (data.data.prizeInfo) {
          prizeInfo.value = data.data.prizeInfo
          console.log('[MobileControl] Prize info updated from WebSocket:', data.data.prizeInfo)
        }

        // 收到有效状态后，重置检测计数
        statusCheckCount.value = 0

        console.log('[MobileControl] Status updated:', {
          locked: data.data.locked,
          inLotteryPage: data.data.inLotteryPage,
          lotteryStatus: data.data.lotteryStatus,
          prizeInfo: data.data.prizeInfo
        })
      }
      break
    case 'error':
      console.error('[MobileControl] Server error:', data.message)
      toast.error(data.message || '服务器错误')
      break
    default:
      console.warn('[MobileControl] Unknown message type:', data.type)
  }
}

// 获取奖项配置（从localStorage）
const getPrizeConfig = () => {
  try {
    const prizeConfigStr = localStorage.getItem('prizeConfig')
    return prizeConfigStr ? JSON.parse(prizeConfigStr) : null
  } catch (error) {
    console.error('[MobileControl] Failed to get prize config:', error)
    return null
  }
}

// 请求状态（通过HTTP API）
const requestStatus = async () => {
  try {
    const apiUrl = getApiBaseUrl()
    const prizeConfig = getPrizeConfig()

    console.log('[MobileControl] requestStatus - prizeConfig from localStorage:', prizeConfig)

    const headers: Record<string, string> = {}
    if (prizeConfig) {
      headers['X-Prize-Config'] = JSON.stringify(prizeConfig)
    }

    const response = await fetch(`${apiUrl}/api/mobile-control/status`, { headers })
    const data = await response.json()

    console.log('[MobileControl] requestStatus - API response:', data)

    if (data.success) {
      mobileControlStore.isLocked = data.locked
      mobileControlStore.isInLotteryPage = data.inLotteryPage
      // 更新抽奖状态
      if (data.lotteryStatus !== undefined) {
        mobileControlStore.lotteryStatus = data.lotteryStatus
      }
      prizeInfo.value = data.prizeInfo || null

      console.log('[MobileControl] Status from API:', {
        locked: data.locked,
        inLotteryPage: data.inLotteryPage,
        lotteryStatus: data.lotteryStatus,
        prizeInfo: data.prizeInfo
      })
    }
  } catch (error) {
    console.error('[MobileControl] Failed to request status:', error)
  }
}

// 自动检测状态
const autoCheckStatus = async () => {
  statusCheckCount.value++

  // 先通过HTTP API请求状态
  await requestStatus()

  // 如果已经连接了WebSocket，就不需要轮询了
  // 但如果WebSocket没连接，就继续轮询
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
    if (statusCheckCount.value <= maxStatusChecks) {
      setTimeout(autoCheckStatus, 2000)
    }
  }
}

// 检查是否可以控制抽奖
const canControl = () => {
  if (isLocked.value) {
    return false
  }
  if (!isInLotteryPage.value) {
    return false
  }
  // 检查奖项是否已抽完（已抽完则不能继续抽奖）
  if (prizeInfo.value && prizeInfo.value.isUsed) {
    return false
  }
  return true
}

// 获取状态文本
const getStatusText = () => {
  if (isLocked.value) {
    return { text: '大屏已锁定', color: 'text-red-600' }
  }
  if (!isInLotteryPage.value) {
    return { text: '大屏不在抽奖界面', color: 'text-orange-600' }
  }
  if (prizeInfo.value && prizeInfo.value.isUsed) {
    return { text: `【${prizeInfo.value.name}】已抽完`, color: 'text-purple-600' }
  }
  return { text: '可以控制', color: 'text-green-600' }
}

// 获取抽奖状态对应的按钮配置
const getLotteryButton = () => {
  // lotteryStatus: 0:初始状态, 1:准备状态, 2:抽奖中, 3:已中奖
  switch (lotteryStatus.value) {
    case 0:
      return {
        text: '开始抽奖',
        icon: '▶️',
        color: 'bg-green-500 hover:bg-green-600',
        action: 'enter'
      }
    case 1:
      return {
        text: '开始抽奖',
        icon: '▶️',
        color: 'bg-green-500 hover:bg-green-600',
        action: 'start'
      }
    case 2:
      return {
        text: '停止抽奖',
        icon: '⏸️',
        color: 'bg-red-500 hover:bg-red-600',
        action: 'stop'
      }
    case 3:
      return {
        text: '继续抽奖',
        icon: '➡️',
        color: 'bg-blue-500 hover:bg-blue-600',
        action: 'continue'
      }
    default:
      return {
        text: '开始抽奖',
        icon: '▶️',
        color: 'bg-green-500 hover:bg-green-600',
        action: 'start'
      }
  }
}

// 开始抽奖
const handleStartLottery = async () => {
  if (!canControl()) {
    toast.error('无法操作：' + getStatusText().text)
    return
  }

  try {
    // 优先通过WebSocket发送
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({
        type: 'start_lottery',
        device: deviceName.value,
      }))
      console.log('[MobileControl] Sent start_lottery via WebSocket')
      toast.success('开始抽奖')
    } else {
      // WebSocket未连接，使用HTTP API
      const apiUrl = getApiBaseUrl()
      const prizeConfig = getPrizeConfig()

      const body: any = {
        device: deviceName.value,
      }
      if (prizeConfig) {
        body.prizeConfig = JSON.stringify(prizeConfig)
      }

      const response = await fetch(`${apiUrl}/api/mobile-control/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('开始抽奖')
      } else {
        toast.error(data.error || '操作失败')
        // 如果是奖项已抽完的错误，刷新状态
        if (data.error && data.error.includes('已抽完')) {
          await requestStatus()
        }
      }
    }
  } catch (error) {
    console.error('Start lottery failed:', error)
    toast.error('操作失败')
  }
}

// 停止抽奖
const handleStopLottery = async () => {
  if (!canControl()) {
    toast.error('无法操作：' + getStatusText().text)
    return
  }

  try {
    // 优先通过WebSocket发送
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({
        type: 'stop_lottery',
        device: deviceName.value,
      }))
      console.log('[MobileControl] Sent stop_lottery via WebSocket')
      toast.success('停止抽奖')
    } else {
      // WebSocket未连接，使用HTTP API
      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/mobile-control/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device: deviceName.value,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('停止抽奖')
      } else {
        toast.error(data.error || '操作失败')
      }
    }
  } catch (error) {
    console.error('Stop lottery failed:', error)
    toast.error('操作失败')
  }
}

// 统一处理抽奖操作
const handleLotteryAction = async () => {
  const buttonConfig = getLotteryButton()
  const action = buttonConfig.action

  if (action === 'enter') {
    // 进入抽奖准备状态
    await handleStartLottery()
  } else if (action === 'start') {
    // 开始抽奖
    await handleStartLottery()
  } else if (action === 'stop') {
    // 停止抽奖
    await handleStopLottery()
  } else if (action === 'continue') {
    // 继续抽奖 - 发送继续抽奖命令
    await handleContinueLottery()
  }
}

// 继续抽奖
const handleContinueLottery = async () => {
  console.log('[MobileControl] handleContinueLottery called')
  console.log('[MobileControl] ws.value:', ws.value)
  console.log('[MobileControl] ws.value?.readyState:', ws.value?.readyState)

  if (!canControl()) {
    console.log('[MobileControl] Cannot control:', getStatusText().text)
    toast.error('无法操作：' + getStatusText().text)
    return
  }

  try {
    // 优先通过WebSocket发送
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      const message = {
        type: 'continue_lottery',
        device: deviceName.value,
      }
      console.log('[MobileControl] Sending message:', message)
      ws.value.send(JSON.stringify(message))
      console.log('[MobileControl] Sent continue_lottery via WebSocket')
      toast.success('继续抽奖')
    } else {
      console.log('[MobileControl] WebSocket not connected')
      // WebSocket未连接，使用HTTP API - 继续抽奖目前只通过WebSocket支持
      toast.error('WebSocket未连接，请确保大屏已打开')
    }
  } catch (error) {
    console.error('Continue lottery failed:', error)
    toast.error('操作失败')
  }
}

// 跳过中奖人员
const handleSkipWinner = async (winnerId: number, winnerName: string) => {
  if (!canControl()) {
    toast.error('无法操作：' + getStatusText().text)
    return
  }

  // 二次确认
  const confirmed = confirm(
    `确认跳过【${winnerName}】吗？\n\n跳过后：\n• 该人员从中奖名单中移除\n• 已使用名额 -1\n• 可以继续抽取新的中奖人员`
  )

  if (!confirmed) {
    return
  }

  try {
    // 优先通过WebSocket发送
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({
        type: 'skip_winner',
        device: deviceName.value,
        winnerId: winnerId,
        winnerName: winnerName,
      }))
      console.log('[MobileControl] Sent skip_winner via WebSocket')
      toast.success(`已跳过【${winnerName}】`)
    } else {
      // WebSocket未连接，使用HTTP API
      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/mobile-control/skip-winner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device: deviceName.value,
          winnerId: winnerId,
          winnerName: winnerName,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`已跳过【${winnerName}】`)
      } else {
        toast.error(data.error || '操作失败')
      }
    }
  } catch (error) {
    console.error('Skip winner failed:', error)
    toast.error('操作失败')
  }
}

// 查看中奖名单
const handleViewWinners = () => {
  // 通过WebSocket发送查看中奖名单请求
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    ws.value.send(JSON.stringify({
      type: 'show_winners',
      device: deviceName.value,
    }))
    console.log('[MobileControl] Sent show_winners via WebSocket')
    toast.success('正在查看中奖名单')
  } else {
    // WebSocket未连接，使用HTTP API
    const apiUrl = getApiBaseUrl()
    fetch(`${apiUrl}/api/mobile-control/show-winners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device: deviceName.value,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          toast.success('正在查看中奖名单')
        } else {
          toast.error(data.error || '操作失败')
        }
      })
      .catch(error => {
        console.error('Show winners failed:', error)
        toast.error('操作失败')
      })
  }
}

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    // 关闭WebSocket连接
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    router.push('/mobile-control')
  }
}

onMounted(() => {
  deviceName.value = getDeviceName()

  // 先请求一次状态（登录后立即检测）
  requestStatus()

  // 启动自动状态检测（登录后立即开始，检测20秒）
  autoCheckStatus()

  // 初始化WebSocket连接
  initWebSocket()
})

onUnmounted(() => {
  // 关闭WebSocket连接
  if (ws.value) {
    ws.value.close()
    ws.value = null
  }
})
</script>

<template>
  <div class="h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 overflow-y-auto">
    <div class="max-w-md mx-auto pb-20">
      <!-- 头部 -->
      <div class="bg-white rounded-2xl shadow-2xl p-6 mb-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h1 class="text-xl font-bold text-gray-800">🎮 抽奖控制面板</h1>
            <p class="text-sm text-gray-600 mt-1">{{ deviceName }}</p>
          </div>
          <button
            class="btn btn-sm btn-ghost text-red-600"
            @click="handleLogout"
          >
            退出登录
          </button>
        </div>
        <!-- 查看中奖名单按钮 -->
        <div v-if="prizeInfo && prizeInfo.usedCount > 0" class="mt-3">
          <button
            @click="handleViewWinners"
            class="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            📋 查看中奖名单
          </button>
        </div>
      </div>

      <!-- 状态卡片 -->
      <div class="bg-white rounded-2xl shadow-2xl p-6 mb-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">大屏状态</h2>
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-4 h-4 rounded-full"
            :class="canControl() ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
          />
          <span :class="getStatusText().color" class="font-medium">
            {{ getStatusText().text }}
          </span>
        </div>

        <!-- 奖项信息 -->
        <div v-if="prizeInfo" class="mt-4 pt-4 border-t border-gray-200">
          <!-- 当前抽取奖项 -->
          <div class="bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 rounded-2xl p-5 shadow-lg mb-4">
            <div class="text-xs text-white/90 font-medium mb-1">当前抽取</div>
            <div class="text-2xl font-black text-white drop-shadow-lg">{{ prizeInfo.name }}</div>
          </div>

          <!-- 抽取人数信息 -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div class="text-xs text-blue-600 font-medium mb-1">💎 单次抽取</div>
              <div class="text-xl font-bold text-blue-800">
                {{ prizeInfo.separateCount && prizeInfo.separateCount.singleDrawCount ? prizeInfo.separateCount.singleDrawCount : prizeInfo.totalCount }} 人
              </div>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div class="text-xs text-purple-600 font-medium mb-1">📊 总名额</div>
              <div class="text-xl font-bold text-purple-800">{{ prizeInfo.totalCount }} 人</div>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <div class="text-xs text-green-600 font-medium mb-1">✅ 已抽取</div>
              <div class="text-xl font-bold text-green-800">{{ prizeInfo.usedCount }} 人</div>
            </div>
            <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
              <div class="text-xs text-orange-600 font-medium mb-1">⏳ 剩余</div>
              <div class="text-xl font-bold text-orange-800">{{ prizeInfo.remainingCount }} 人</div>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="mt-4">
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span class="font-medium">完成进度</span>
              <span class="font-bold text-blue-600">{{ Math.round((prizeInfo.usedCount / prizeInfo.totalCount) * 100) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                class="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg"
                :style="{ width: `${(prizeInfo.usedCount / prizeInfo.totalCount) * 100}%` }"
              />
            </div>
            <div class="text-xs text-gray-500 mt-1 text-center">{{ prizeInfo.usedCount }} / {{ prizeInfo.totalCount }}</div>
          </div>
        </div>

        <!-- 无奖项信息提示 -->
        <div v-else class="mt-4 pt-4 border-t border-gray-200">
          <div class="text-center py-6 text-gray-400">
            <div class="text-4xl mb-3">🎁</div>
            <div class="text-sm">暂无奖项信息</div>
            <div class="text-xs mt-1">请在大屏上选择奖项</div>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="grid grid-cols-1 gap-4">
        <button
          @click="handleLotteryAction"
          :disabled="!canControl()"
          :class="[
            'p-6 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-2xl shadow-xl transition-all active:scale-95',
            getLotteryButton().color
          ]"
        >
          <div class="text-4xl mb-2">{{ getLotteryButton().icon }}</div>
          <div class="font-bold text-lg">{{ getLotteryButton().text }}</div>
        </button>
      </div>

      <!-- 提示信息 -->
      <div class="mt-4 p-4 bg-white rounded-2xl shadow-lg">
        <div class="text-sm text-gray-600 space-y-2">
          <p class="flex items-center gap-2">
            <span class="text-green-500">✓</span>
            大屏在抽奖界面 + 开锁状态 = 可以控制
          </p>
          <p class="flex items-center gap-2">
            <span class="text-red-500">✗</span>
            大屏已锁定 = 无法操作
          </p>
          <p class="flex items-center gap-2">
            <span class="text-red-500">✗</span>
            大屏不在抽奖界面 = 无法操作
          </p>
          <p class="flex items-center gap-2">
            <span class="text-purple-500">⚠️</span>
            中奖人员不在现场可点击"取消"按钮，重新抽奖
          </p>
        </div>
      </div>


      <!-- 版权信息 -->
      <div class="mt-6 text-center text-white text-sm opacity-60">
        © 2024 CT-Lottery
      </div>
    </div>
  </div>
</template>
