import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePrizeConfig } from './prizeConfig'

export const useMobileControlStore = defineStore(
  'mobileControl',
  () => {
    // 总开关
    const enabled = ref(true)

    // 验证码
    const verifyCode = ref('123456')

    // 大屏状态
    const isLocked = ref(false)
    const isInLotteryPage = ref(false)
    const lotteryStatus = ref(0) // 0:初始状态, 1:准备状态, 2:抽奖中, 3:已中奖

    // 连接状态
    const isConnected = ref(false)
    const connectedDevice = ref<string | null>(null)

    // 设置抽奖状态
    const setLotteryStatus = (status: number) => {
      lotteryStatus.value = status
      sendStatus()
    }

    // WebSocket 连接
    let ws: WebSocket | null = null
    const reconnectTimer = ref<number | null>(null)

    // 初始化 WebSocket 连接
    const initWebSocket = () => {
      if (!enabled.value) {
        console.log('[MobileControl] Mobile control is disabled, skipping WebSocket init')
        return
      }

      // 重置连接状态,防止持久化的错误状态
      isConnected.value = false
      connectedDevice.value = null

      // 从当前主机名和后端端口3001构建WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const hostname = window.location.hostname
      const port = '3001' // 后端服务器端口
      const wsUrl = `${protocol}//${hostname}:${port}/ws/mobile-control`

      console.log('[MobileControl] Connecting to WebSocket:', wsUrl)

      try {
        ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          console.log('[MobileControl] WebSocket connected')
          isConnected.value = true

          // 发送大屏连接消息
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'screen_connect' }))
            console.log('[MobileControl] Sent screen_connect message')
          }

          // 发送大屏状态
          sendStatus()
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            handleWebSocketMessage(data)
          } catch (error) {
            console.error('[MobileControl] Failed to parse message:', error)
          }
        }

        ws.onerror = (error) => {
          console.error('[MobileControl] WebSocket error:', error)
        }

        ws.onclose = () => {
          console.log('[MobileControl] WebSocket disconnected')
          isConnected.value = false
          connectedDevice.value = null

          // 断线重连
          if (reconnectTimer.value) {
            clearTimeout(reconnectTimer.value)
          }
          reconnectTimer.value = window.setTimeout(() => {
            console.log('[MobileControl] Reconnecting...')
            initWebSocket()
          }, 3000)
        }
      } catch (error) {
        console.error('[MobileControl] Failed to connect WebSocket:', error)
      }
    }

    // 处理 WebSocket 消息
    const handleWebSocketMessage = (data: any) => {
      switch (data.type) {
        case 'connected':
          isConnected.value = true
          connectedDevice.value = data.device
          // 连接成功后立即发送大屏标识
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'screen_connect' }))
          }
          break
        case 'disconnected':
          isConnected.value = false
          connectedDevice.value = null
          break
        case 'start_lottery':
          // 触发开始抽奖事件
          window.dispatchEvent(new CustomEvent('mobile-start-lottery'))
          break
        case 'stop_lottery':
          // 触发停止抽奖事件
          window.dispatchEvent(new CustomEvent('mobile-stop-lottery'))
          break
        case 'continue_lottery':
          console.log('[MobileControl Store] Received continue_lottery message from mobile')
          // 触发继续抽奖事件
          window.dispatchEvent(new CustomEvent('mobile-continue-lottery'))
          break
        case 'show_winners':
          // 触发显示中奖名单事件
          console.log('[MobileControl Store] Dispatching mobile-show-winners event')
          window.dispatchEvent(new CustomEvent('mobile-show-winners'))
          break
        case 'status':
          // 忽略status消息,这是大屏发送给手机的广播
          break
        case 'status_request':
          // 手机请求状态，发送当前状态
          sendStatus()
          break
        default:
          console.warn('[MobileControl] Unknown message type:', data.type)
      }
    }

    // 发送大屏状态
    const sendStatus = () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        // 获取当前奖项信息
        const prizeConfig = usePrizeConfig()
        const currentPrize = prizeConfig.prizeConfig.currentPrize

        console.log('[MobileControl] sendStatus - currentPrize:', currentPrize)

        const statusData: any = {
          enabled: enabled.value,
          locked: isLocked.value,
          inLotteryPage: isInLotteryPage.value,
          lotteryStatus: lotteryStatus.value,
        }

        // 如果有当前奖项，添加奖项信息
        if (currentPrize) {
          statusData.prizeInfo = {
            name: currentPrize.name,
            totalCount: currentPrize.count,
            usedCount: currentPrize.isUsedCount || 0,
            remainingCount: currentPrize.count - (currentPrize.isUsedCount || 0),
            isUsed: currentPrize.isUsed,
            separateCount: currentPrize.separateCount
          }
          console.log('[MobileControl] sendStatus - prizeInfo:', statusData.prizeInfo)
        } else {
          console.log('[MobileControl] sendStatus - no currentPrize')
        }

        ws.send(JSON.stringify({
          type: 'status',
          data: statusData,
        }))
      }
    }

    // 关闭 WebSocket
    const closeWebSocket = () => {
      if (ws) {
        ws.close()
        ws = null
      }
      if (reconnectTimer.value) {
        clearTimeout(reconnectTimer.value)
        reconnectTimer.value = null
      }
    }

    // 设置是否在抽奖页面
    const setInLotteryPage = (value: boolean) => {
      isInLotteryPage.value = value
      sendStatus()
    }

    // 设置锁定状态
    const setLocked = (value: boolean) => {
      isLocked.value = value
      sendStatus()
    }

    // 设置总开关
    const setEnabled = (value: boolean) => {
      enabled.value = value
      if (value && !ws) {
        initWebSocket()
      } else if (!value) {
        closeWebSocket()
      }
    }

    // 更新验证码
    const updateVerifyCode = (code: string) => {
      verifyCode.value = code
    }

    // 锁定/解锁
    const toggleLock = () => {
      setLocked(!isLocked.value)
    }

    return {
      // 状态
      enabled,
      verifyCode,
      isLocked,
      isInLotteryPage,
      lotteryStatus,
      isConnected,
      connectedDevice,

      // 方法
      initWebSocket,
      closeWebSocket,
      setInLotteryPage,
      setLocked,
      setLotteryStatus,
      setEnabled,
      updateVerifyCode,
      toggleLock,
      sendStatus,
    }
  },
  {
    persist: true,
  },
)
