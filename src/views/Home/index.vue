<script setup lang="ts">
import type { IPersonConfig, IPrizeConfig } from '@/types/storeType'
import type { Material } from 'three'
import StarsBackground from '@/components/StarsBackground/index.vue'
import { useElementPosition, useElementStyle } from '@/hooks/useElement'
import i18n from '@/locales/i18n'
import useStore from '@/store'
import { filterData, selectCard } from '@/utils'
import { rgba } from '@/utils/color'
import * as TWEEN from '@tweenjs/tween.js'
import confetti from 'canvas-confetti'
import { storeToRefs } from 'pinia'
import { Object3D, PerspectiveCamera, Scene, Vector3 } from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three-css3d'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import PrizeList from './PrizeList.vue'
import { useMobileControlStore } from '@/store/mobileControl'
// @ts-ignore
import QRCode from 'qrcode'
import 'vue-toast-notification/dist/theme-sugar.css'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const personConfig = useStore().personConfig
const globalConfig = useStore().globalConfig
const prizeConfig = useStore().prizeConfig
const mobileControlStore = useMobileControlStore()

// 手机控制相关
const showQRCode = ref(false)
const qrCodeUrl = ref('')
const startButtonRef = ref<HTMLElement>()
const showUnlockDialog = ref(false)
const unlockPassword = ref('')
const { enabled: mobileEnabled, isLocked, isConnected, connectedDevice, isInLotteryPage } = storeToRefs(mobileControlStore)

// 重置密码相关
const RESET_PASSWORD = 'admin888'
const showResetDialog = ref(false)
const resetPasswordInput = ref('')

// 取消确认对话框相关
const showCancelDialog = ref(false)

// 中奖人员查看和筛选相关
const showWinnersDialog = ref(false)
const selectedPrizeFilter = ref<string>('all') // all, 或具体的奖项ID
const searchKeyword = ref('') // 工号或姓名搜索
const isMobileShowWinners = ref(false) // 是否通过手机控制显示中奖名单

// 生成二维码
const generateQRCode = async () => {
  try {
    let url = ''

    // 检查是否启用自定义URL
    try {
      const customUrlConfig = localStorage.getItem('lottery_custom_url')
      if (customUrlConfig) {
        const config = JSON.parse(customUrlConfig)
        if (config.enabled && config.host) {
          url = `${config.protocol}://${config.host}:${config.port}/mobile-control`
        }
      }
    } catch (error) {
      console.error('Failed to read custom URL config:', error)
    }

    // 如果没有自定义URL配置，使用当前地址
    if (!url) {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
      const host = window.location.host
      url = `${protocol}//${host}/mobile-control`
    }

    qrCodeUrl.value = await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
  } catch (error) {
    console.error('Failed to generate QR code:', error)
  }
}

// 显示/隐藏二维码
const handleStartButtonHover = (show: boolean) => {
  if (mobileEnabled.value) {
    showQRCode.value = show
  }
}

// 锁定/解锁
const handleLockToggle = () => {
  if (isLocked.value) {
    // 已锁定，弹出解锁对话框
    showUnlockDialog.value = true
  } else {
    // 未锁定，直接锁定
    mobileControlStore.toggleLock()
    toast.info('大屏已锁定')
  }
}

// 解锁大屏
const handleUnlock = () => {
  const adminPassword = localStorage.getItem('adminPassword')
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  if (!isLoggedIn || !adminPassword) {
    toast.error('请先登录管理员账户（点击右上角菜单 → 退出登录，然后重新登录）')
    showUnlockDialog.value = false
    return
  }

  if (unlockPassword.value !== adminPassword) {
    toast.error(`管理员密码错误。提示：您的登录密码是 ${adminPassword}`)
    return
  }

  mobileControlStore.setLocked(false)
  toast.success('大屏已解锁')
  showUnlockDialog.value = false
  unlockPassword.value = ''
}

// 手机控制 - 开始抽奖
const handleMobileStartLottery = () => {
  if (isLocked.value) {
    toast.error('大屏已锁定，无法操作')
    return
  }

  if (currentStatus.value === 2) {
    toast.warning('抽奖正在进行中')
    return
  }

  startLottery()
  toast.info('手机控制：开始抽奖')
}

// 手机控制 - 停止抽奖
const handleMobileStopLottery = async () => {
  if (isLocked.value) {
    toast.error('大屏已锁定，无法操作')
    return
  }

  if (currentStatus.value !== 2) {
    toast.warning('没有正在进行的抽奖')
    return
  }

  stopLottery()
  toast.info('手机控制：停止抽奖')
}

// 手机控制 - 继续抽奖
const handleMobileContinueLottery = async () => {
  console.log('[Home] handleMobileContinueLottery called, currentStatus:', currentStatus.value, 'isLocked:', isLocked.value)

  if (isLocked.value) {
    toast.error('大屏已锁定，无法操作')
    return
  }

  if (currentStatus.value !== 3) {
    console.log('[Home] Current status is not 3, cannot continue')
    toast.warning('当前状态不支持继续抽奖')
    return
  }

  console.log('[Home] Calling continueLottery()')
  await continueLottery()
  toast.info('手机控制：继续抽奖')
}

// 手机控制 - 显示当前奖项中奖名单
const handleMobileShowWinners = () => {
  console.log('[Home] handleMobileShowWinners called')
  console.log('[Home] isLocked:', isLocked.value)
  console.log('[Home] currentPrize:', currentPrize.value)
  
  if (isLocked.value) {
    toast.error('大屏已锁定，无法操作')
    return
  }

  // 检查当前奖项是否抽完
  if (!currentPrize.value.isUsed || currentPrize.value.isUsedCount === 0) {
    toast.warning('当前奖项还未开始抽奖或未抽完，暂无中奖人员')
    return
  }

  console.log('[Home] Opening winners dialog')
  // 标记为手机控制显示
  isMobileShowWinners.value = true
  openCurrentPrizeWinnersDialog()
  toast.info('手机控制：显示中奖名单')
}

// 大屏直接跳过中奖人员（带二次确认）
const handleSkipWinner = async (winnerId: number) => {
  if (isLocked.value) {
    toast.error('大屏已锁定，无法操作')
    return
  }

  // 找到对应的中奖人员
  const winner = allPersonList.value.find(p => p.id === winnerId)
  if (!winner) {
    toast.error('未找到该中奖人员')
    return
  }

  // 显示二次确认对话框
  const confirmed = confirm(
    `确认跳过【${winner.name}】吗？\n\n跳过后：\n• 该人员从中奖名单中移除\n• 已使用名额 -1\n• 可以继续抽取新的中奖人员`
  )

  if (!confirmed) {
    return
  }

  // 从已中奖名单中移除
  winner.isWin = false
  const prizeIndex = winner.prizeId.indexOf(currentPrize.value.id.toString())
  if (prizeIndex > -1) {
    winner.prizeId.splice(prizeIndex, 1)
    winner.prizeName.splice(prizeIndex, 1)
    winner.prizeTime.splice(prizeIndex, 1)
  }

  // 减少已使用计数（不增加总名额，只减少已使用名额）
  currentPrize.value.isUsedCount -= 1
  if (currentPrize.value.isUsedCount < currentPrize.value.count) {
    currentPrize.value.isUsed = false
  }

  // 更新奖项配置
  prizeConfig.updatePrizeConfig(currentPrize.value)

  // 同步奖项状态到手机控制端
  mobileControlStore.sendStatus()

  toast.success(`已跳过【${winner.name}】，名额剩余${currentPrize.value.count - currentPrize.value.isUsedCount}个`)

  // 刷新中奖名单对话框
  closeWinnersDialog()
  await new Promise(resolve => setTimeout(resolve, 100))
  openCurrentPrizeWinnersDialog()
}

// 手机控制 - 跳过当前中奖人员
const handleMobileSkipWinner = async (winnerId: number) => {
  if (isLocked.value) {
    toast.error('大屏已锁定，无法操作')
    return
  }

  // 找到对应的中奖人员
  const winner = allPersonList.value.find(p => p.id === winnerId)
  if (!winner) {
    toast.error('未找到该中奖人员')
    return
  }

  // 手机控制不显示二次确认，直接执行
  // 从已中奖名单中移除
  winner.isWin = false
  const prizeIndex = winner.prizeId.indexOf(currentPrize.value.id.toString())
  if (prizeIndex > -1) {
    winner.prizeId.splice(prizeIndex, 1)
    winner.prizeName.splice(prizeIndex, 1)
    winner.prizeTime.splice(prizeIndex, 1)
  }

  // 减少已使用计数（不增加总名额，只减少已使用名额）
  currentPrize.value.isUsedCount -= 1
  if (currentPrize.value.isUsedCount < currentPrize.value.count) {
    currentPrize.value.isUsed = false
  }

  // 更新奖项配置
  prizeConfig.updatePrizeConfig(currentPrize.value)

  // 同步奖项状态到手机控制端
  mobileControlStore.sendStatus()

  toast.success(`已跳过【${winner.name}】，名额剩余${currentPrize.value.count - currentPrize.value.isUsedCount}个`)

  // 刷新中奖名单对话框
  closeWinnersDialog()
  await new Promise(resolve => setTimeout(resolve, 100))
  openCurrentPrizeWinnersDialog()
}

const { getAllPersonList: allPersonList, getNotPersonList: notPersonList, getNotThisPrizePersonList: notThisPrizePersonList,
} = storeToRefs(personConfig)
const { getCurrentPrize: currentPrize } = storeToRefs(prizeConfig)
const { getTopTitle: topTitle, getCardColor: cardColor, getPatterColor: patternColor, getPatternList: patternList, getTextColor: textColor, getLuckyColor: luckyColor, getCardSize: cardSize, getTextSize: textSize, getRowCount: rowCount, getBackground: homeBackground, getIsShowAvatar: isShowAvatar, getTitleConfig: titleConfig, getFontList: fontList } = storeToRefs(globalConfig)
const tableData = ref<any[]>([])
const currentStatus = ref(0) // 0为初始状态， 1为抽奖准备状态，2为抽奖中状态，3为抽奖结束状态
const ballRotationY = ref(0)
const containerRef = ref<HTMLElement>()
const canOperate = ref(true)
const cameraZ = ref(3000)
const animationFrameId = ref<any>(null)

const scene = ref()
const camera = ref()
const renderer = ref()
const controls = ref()
const objects = ref<any[]>([])
interface TargetType {
  grid: any[]
  helix: any[]
  table: any[]
  sphere: any[]
}
const targets: TargetType = {
  grid: [],
  helix: [],
  table: [],
  sphere: [],
}

const luckyTargets = ref<any[]>([])
const luckyCardList = ref<number[]>([])
const luckyCount = ref(10)
const personPool = ref<IPersonConfig[]>([])
const hasRecordedWinners = ref(false) // 标记是否已记录中奖人员

// 获取自定义抽奖配置
const { getDrawConfig: drawConfig } = storeToRefs(globalConfig)

const intervalTimer = ref<any>(null)
const scrollAnimationTimer = ref<any>(null)
const isScrollingEnabled = ref(false)
// 填充数据，填满七行
function initTableData() {
  if (allPersonList.value.length <= 0) {
    return
  }
  const totalCount = rowCount.value * 7
  const originPersonData = JSON.parse(JSON.stringify(allPersonList.value))
  const originPersonLength = originPersonData.length
  if (originPersonLength < totalCount) {
    const repeatCount = Math.ceil(totalCount / originPersonLength)
    // 复制数据
    for (let i = 0; i < repeatCount; i++) {
      tableData.value = tableData.value.concat(JSON.parse(JSON.stringify(originPersonData)))
    }
  }
  else {
    tableData.value = originPersonData.slice(0, totalCount)
  }
  tableData.value = filterData(tableData.value.slice(0, totalCount), rowCount.value)
}
function init() {
  const felidView = 40
  const width = window.innerWidth
  const height = window.innerHeight
  const aspect = width / height
  const nearPlane = 1
  const farPlane = 10000
  const WebGLoutput = containerRef.value

  scene.value = new Scene()
  camera.value = new PerspectiveCamera(felidView, aspect, nearPlane, farPlane)
  camera.value.position.z = cameraZ.value
  renderer.value = new CSS3DRenderer()
  renderer.value.setSize(width, height * 0.9)
  renderer.value.domElement.style.position = 'absolute'
  // 垂直居中
  renderer.value.domElement.style.paddingTop = '50px'
  renderer.value.domElement.style.top = '50%'
  renderer.value.domElement.style.left = '50%'
  renderer.value.domElement.style.transform = 'translate(-50%, -50%)'
  WebGLoutput!.appendChild(renderer.value.domElement)

  controls.value = new TrackballControls(camera.value, renderer.value.domElement)
  controls.value.rotateSpeed = 1
  controls.value.staticMoving = true
  controls.value.minDistance = 500
  controls.value.maxDistance = 6000
  controls.value.addEventListener('change', render)

  const tableLen = tableData.value.length
  for (let i = 0; i < tableLen; i++) {
    let element = document.createElement('div')
    element.className = 'element-card'

    const number = document.createElement('div')
    number.className = 'card-id'
    number.textContent = tableData.value[i].uid
    if (isShowAvatar.value)
      number.style.display = 'none'
    element.appendChild(number)

    const symbol = document.createElement('div')
    symbol.className = 'card-name'
    symbol.textContent = tableData.value[i].name
    if (isShowAvatar.value)
      symbol.className = 'card-name card-avatar-name'
    element.appendChild(symbol)

    const detail = document.createElement('div')
    detail.className = 'card-detail'
    detail.innerHTML = `${tableData.value[i].department}<br/>${tableData.value[i].identity}`
    if (isShowAvatar.value)
      detail.style.display = 'none'
    element.appendChild(detail)

    const avatar = document.createElement('img')
    avatar.className = 'card-avatar'
    avatar.src = tableData.value[i].avatar
    avatar.alt = 'avatar'
    avatar.style.width = '140px'
    avatar.style.height = '140px'
    if (!isShowAvatar.value)
      avatar.style.display = 'none'
    element.appendChild(avatar)

    element = useElementStyle(element, tableData.value[i], i, patternList.value, patternColor.value, cardColor.value, cardSize.value, textSize.value)

    // 添加鼠标悬停放大效果
    let hoverTween: any = null
    element.addEventListener('mouseenter', () => {
      if (hoverTween) {
        hoverTween.stop()
      }
      const targetScale = 1.3
      hoverTween = new TWEEN.Tween(object.scale)
        .to({ x: targetScale, y: targetScale, z: targetScale }, 200)
        .easing(TWEEN.Easing.Back.Out)
        .onUpdate(render)
        .start()
    })

    element.addEventListener('mouseleave', () => {
      if (hoverTween) {
        hoverTween.stop()
      }
      hoverTween = new TWEEN.Tween(object.scale)
        .to({ x: 1, y: 1, z: 1 }, 200)
        .easing(TWEEN.Easing.Back.Out)
        .onUpdate(render)
        .start()
    })

    const object = new CSS3DObject(element)
    object.position.x = Math.random() * 4000 - 2000
    object.position.y = Math.random() * 4000 - 2000
    object.position.z = Math.random() * 4000 - 2000
    scene.value.add(object)

    objects.value.push(object)
  }

  createTableVertices()
  createSphereVertices()
  createHelixVertices()

  function createTableVertices() {
    const tableLen = tableData.value.length

    for (let i = 0; i < tableLen; i++) {
      const object = new Object3D()

      object.position.x = tableData.value[i].x * (cardSize.value.width + 40) - rowCount.value * 90
      object.position.y = -tableData.value[i].y * (cardSize.value.height + 20) + 1000
      object.position.z = 0

      targets.table.push(object)
    }
  }

  function createSphereVertices() {
    let i = 0
    const objLength = objects.value.length
    const vector = new Vector3()

    for (; i < objLength; ++i) {
      const phi = Math.acos(-1 + (2 * i) / objLength)
      const theta = Math.sqrt(objLength * Math.PI) * phi
      const object = new Object3D()

      object.position.x = 800 * Math.cos(theta) * Math.sin(phi)
      object.position.y = 800 * Math.sin(theta) * Math.sin(phi)
      object.position.z = -800 * Math.cos(phi)

      // rotation object

      vector.copy(object.position).multiplyScalar(2)
      object.lookAt(vector)
      targets.sphere.push(object)
    }
  }
  function createHelixVertices() {
    let i = 0
    const vector = new Vector3()
    const objLength = objects.value.length
    for (; i < objLength; ++i) {
      const phi = i * 0.213 + Math.PI

      const object = new Object3D()

      object.position.x = 800 * Math.sin(phi)
      object.position.y = -(i * 8) + 450
      object.position.z = 800 * Math.cos(phi + Math.PI)

      object.scale.set(1.1, 1.1, 1.1)

      vector.x = object.position.x * 2
      vector.y = object.position.y
      vector.z = object.position.z * 2

      object.lookAt(vector)

      targets.helix.push(object)
    }
  }
  window.addEventListener('resize', onWindowResize, false)
  transform(targets.table, 1000)
  render()
}

function transform(targets: any[], duration: number) {
  TWEEN.removeAll()
  if (intervalTimer.value) {
    clearInterval(intervalTimer.value)
    intervalTimer.value = null
    randomBallData('sphere')
  }

  return new Promise((resolve) => {
    const objLength = objects.value.length
    for (let i = 0; i < objLength; ++i) {
      const object = objects.value[i]
      const target = targets[i]
      new TWEEN.Tween(object.position)
        .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()

      new TWEEN.Tween(object.rotation)
        .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()
        .onComplete(() => {
          if (luckyCardList.value.length) {
            luckyCardList.value.forEach((cardIndex: any) => {
              const item = objects.value[cardIndex]
              useElementStyle(item.element, {} as any, i, patternList.value, patternColor.value, cardColor.value, cardSize.value, textSize.value, 'sphere')
            })
          }
          luckyTargets.value = []
          luckyCardList.value = []

          canOperate.value = true
        })
    }

    // 这个补间用来在位置与旋转补间同步执行，通过onUpdate在每次更新数据后渲染scene和camera
    new TWEEN.Tween({})
      .to({}, duration * 2)
      .onUpdate(render)
      .start()
      .onComplete(() => {
        canOperate.value = true
        resolve('')
      })
  })
}
function onWindowResize() {
  camera.value.aspect = window.innerWidth / window.innerHeight
  camera.value.updateProjectionMatrix()

  renderer.value.setSize(window.innerWidth, window.innerHeight)
  render()
}

/**
 * [animation update all tween && controls]
 */
function animation() {
  TWEEN.update()
  if (controls.value) {
    controls.value.update()
  }
  // 设置自动旋转
  // 设置相机位置
  animationFrameId.value = requestAnimationFrame(animation)
}

// // 旋转的动画
function rollBall(rotateY: number, duration: number) {
  TWEEN.removeAll()

  return new Promise((resolve) => {
    scene.value.rotation.y = 0
    ballRotationY.value = Math.PI * rotateY * 1000
    const rotateObj = new TWEEN.Tween(scene.value.rotation)
    rotateObj
      .to(
        {
          // x: Math.PI * rotateX * 1000,
          x: 0,
          y: ballRotationY.value,
          // z: Math.PI * rotateZ * 1000
          z: 0,
        },
        duration * 1000,
      )
      .onUpdate(render)
      .start()
      .onStop(() => {
        resolve('')
      })
      .onComplete(() => {
        resolve('')
      })
  })
}
// 将视野转回正面
function resetCamera() {
  new TWEEN.Tween(camera.value.position)
    .to(
      {
        x: 0,
        y: 0,
        z: 3000,
      },
      1000,
    )
    .onUpdate(render)
    .start()
    .onComplete(() => {
      new TWEEN.Tween(camera.value.rotation)
        .to(
          {
            x: 0,
            y: 0,
            z: 0,
          },
          1000,
        )
        .onUpdate(render)
        .start()
        .onComplete(() => {
          canOperate.value = true
          // camera.value.lookAt(scene.value.position)
          camera.value.position.y = 0
          camera.value.position.x = 0
          camera.value.position.z = 3000
          camera.value.rotation.x = 0
          camera.value.rotation.y = 0
          camera.value.rotation.z = -0
          controls.value.reset()
        })
    })
}

function render() {
  if (renderer.value) {
    renderer.value.render(scene.value, camera.value)
  }
}
async function enterLottery() {
  if (!canOperate.value) {
    return
  }
  // 停止滚动动画
  stopScrollAnimation()
  if (!intervalTimer.value) {
    randomBallData()
  }
  if (patternList.value.length) {
    for (let i = 0; i < patternList.value.length; i++) {
      if (i < rowCount.value * 7) {
        objects.value[patternList.value[i] - 1].element.style.backgroundColor = rgba(cardColor.value, Math.random() * 0.5 + 0.25)
      }
    }
  }
  canOperate.value = false
  await transform(targets.sphere, 1000)
  currentStatus.value = 1
  mobileControlStore.setLotteryStatus(1)
  rollBall(0.1, 2000)
}
// 开始抽奖
function startLottery() {
  if (!canOperate.value) {
    return
  }
  // 验证是否已抽完全部奖项
  if (currentPrize.value.isUsed || !currentPrize.value) {
    toast.open({
      message: i18n.global.t('error.personIsAllDone'),
      type: 'warning',
      position: 'top-right',
      duration: 10000,
    })

    return
  }
  // 检查是否启用特殊模式
  if (currentPrize.value.isSpecial && currentPrize.value.specialUsers && currentPrize.value.specialUsers.length > 0) {
    // 特殊模式：只从特殊人员中抽奖
    const specialUsers = allPersonList.value.filter(person =>
      currentPrize.value.specialUsers.includes(person.uid) &&
      !person.isWin
    )
    personPool.value = specialUsers

    if (personPool.value.length === 0) {
      toast.open({
        message: '特殊人员已全部中奖或不存在',
        type: 'warning',
        position: 'top-right',
        duration: 10000,
      })
      return
    }
  } else {
    // 普通模式：从未中奖人员中抽奖（排除已特殊分配到其他奖项的人员）
    personPool.value = currentPrize.value.isAll ? notThisPrizePersonList.value : notPersonList.value

    // 排除已被特殊分配到其他奖项但未中奖的人员
    personPool.value = personPool.value.filter(person => {
      // 如果该人员已被特殊分配到其他奖项，则排除
      const isSpecialToOtherPrize = prizeConfig.getPrizeConfig.some(prize =>
        prize.id !== currentPrize.value.id &&
        prize.isSpecial &&
        prize.specialUsers.includes(person.uid)
      )
      return !isSpecialToOtherPrize
    })
  }

  // 计算剩余需要抽奖的人数
  const totalLeftover = currentPrize.value.count - currentPrize.value.isUsedCount

  // 优先使用奖项设置的单次抽取人数
  let drawCount = 0
  const separateCount = currentPrize.value.separateCount

  if (separateCount && separateCount.singleDrawCount && separateCount.singleDrawCount > 0) {
    // 使用奖项设置的单次抽取人数
    drawCount = separateCount.singleDrawCount
  } else if (drawConfig.value.enableCustomCount && drawConfig.value.customDrawCount) {
    // 使用全局自定义抽奖人数
    drawCount = drawConfig.value.customDrawCount
  } else {
    // 默认抽取剩余人数
    drawCount = totalLeftover
  }

  // 智能调整：确保不超过剩余人数和可用人员数
  drawCount = Math.min(drawCount, totalLeftover, personPool.value.length)

  // 验证是否有足够的人员
  if (personPool.value.length === 0 || totalLeftover === 0) {
    toast.open({
      message: '没有可抽奖的人员或奖项已抽完',
      type: 'warning',
      position: 'top-right',
      duration: 10000,
    })
    return
  }

  // 清空之前的抽奖目标
  luckyTargets.value = []

  // 重置中奖记录标志
  hasRecordedWinners.value = false

  // 恢复之前中奖卡片的样式（清空样式类名和内联样式）
  if (luckyCardList.value.length) {
    luckyCardList.value.forEach((cardIndex: any) => {
      const item = objects.value[cardIndex]
      if (item && item.element) {
        // 移除中奖样式类名
        if (item.element.classList.contains('lucky-element-card')) {
          item.element.classList.remove('lucky-element-card')
          item.element.classList.add('element-card')
        }
        // 重置为默认样式
        useElementStyle(item.element, {} as any, cardIndex, patternList.value, patternColor.value, cardColor.value, cardSize.value, textSize.value, 'sphere')
        // 重置缩放
        if (item.scale) {
          new TWEEN.Tween(item.scale)
            .to({ x: 1, y: 1, z: 1 }, 200)
            .easing(TWEEN.Easing.Back.Out)
            .start()
        }
      }
    })
    luckyCardList.value = []
  }

  // 抽取指定人数
  for (let i = 0; i < drawCount; i++) {
    if (personPool.value.length > 0) {
      // 修复索引计算错误
      const randomIndex = Math.floor(Math.random() * personPool.value.length)
      luckyTargets.value.push(personPool.value[randomIndex])
      personPool.value.splice(randomIndex, 1)
    }
  }

  luckyCount.value = drawCount

  toast.open({
    message: `现在抽取 ${currentPrize.value.name} ${drawCount} 人`,
    type: 'default',
    position: 'top-right',
    duration: 8000,
  })
  currentStatus.value = 2
  mobileControlStore.setLotteryStatus(2)
  rollBall(10, 3000)
}

async function stopLottery() {
  if (!canOperate.value) {
    return
  }
  //   clearInterval(intervalTimer.value)
  //   intervalTimer.value = null
  canOperate.value = false
  rollBall(0, 1)

  const windowSize = { width: window.innerWidth, height: window.innerHeight }
  luckyTargets.value.forEach((person: IPersonConfig, index: number) => {
    const cardIndex = selectCard(luckyCardList.value, tableData.value.length, person.id)
    luckyCardList.value.push(cardIndex)
    const totalLuckyCount = luckyTargets.value.length
    const item = objects.value[cardIndex]
    const { xTable, yTable } = useElementPosition(item, rowCount.value, totalLuckyCount, { width: cardSize.value.width * 2, height: cardSize.value.height * 2 }, windowSize, index)
    new TWEEN.Tween(item.position)
      .to({
        x: xTable,
        y: yTable,
        z: 1000,
      }, 1200)
      .easing(TWEEN.Easing.Exponential.InOut)
      .onStart(() => {
        item.element = useElementStyle(item.element, person, cardIndex, patternList.value, patternColor.value, luckyColor.value, { width: cardSize.value.width * 2, height: cardSize.value.height * 2 }, textSize.value * 2, 'lucky')
      })
      .start()
      .onComplete(() => {
        canOperate.value = true
        currentStatus.value = 3
        mobileControlStore.setLotteryStatus(3)

        // 停止抽奖后，不立即记录中奖人员
        // 等待用户点击"继续"或"取消"后再处理
      })
    new TWEEN.Tween(item.rotation)
      .to({
        x: 0,
        y: 0,
        z: 0,
      }, 900)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start()
      .onComplete(() => {
        confettiFire()
        resetCamera()
      })
  })
}

// 记录中奖人员（不重置抽奖状态）
async function recordWinners() {
  if (luckyTargets.value.length === 0) {
    return
  }

  // 更新奖项的已使用计数
  currentPrize.value.isUsedCount += luckyTargets.value.length

  // 检查是否抽完
  if (currentPrize.value.isUsedCount >= currentPrize.value.count) {
    currentPrize.value.isUsed = true
    currentPrize.value.isUsedCount = currentPrize.value.count
  }

  // 标记中奖人员
  personConfig.addAlreadyPersonList(luckyTargets.value, currentPrize.value)

  // 如果是特殊模式中奖，需要将该人员从所有特殊名单中移除，防止重复中奖
  if (currentPrize.value.isSpecial) {
    luckyTargets.value.forEach(winner => {
      prizeConfig.getPrizeConfig.forEach(prize => {
        if (prize.specialUsers && prize.specialUsers.includes(winner.uid)) {
          prize.specialUsers = prize.specialUsers.filter(uid => uid !== winner.uid)
        }
      })
    })
  }

  // 更新奖项配置
  prizeConfig.updatePrizeConfig(currentPrize.value)

  // 同步奖项状态到手机控制端
  mobileControlStore.sendStatus()

  // 注意：不清空 luckyTargets 和 luckyCount，保留中奖人员显示
  // 用户需要点击"继续抽奖"才会重置
}
// 继续
async function continueLottery() {
  console.log('[Home] continueLottery() called, canOperate:', canOperate.value)

  if (!canOperate.value) {
    console.log('[Home] Cannot operate, returning')
    return
  }

  console.log('[Home] Recording winners...')

  // 先记录当前中奖人员
  recordWinners()

  // 重置中奖记录标志
  hasRecordedWinners.value = false

  // 清空抽奖目标
  luckyTargets.value = []
  luckyCount.value = 0

  console.log('[Home] Entering lottery preparation state...')

  // 重新进入抽奖准备状态
  await enterLottery()

  console.log('[Home] continueLottery() completed')
}
function quitLottery() {
  showCancelDialog.value = true
}

// 确认取消抽奖
function confirmCancel() {
  showCancelDialog.value = false

  // 清空之前中奖卡片的样式
  if (luckyCardList.value.length) {
    luckyCardList.value.forEach((cardIndex: any) => {
      const item = objects.value[cardIndex]
      if (item && item.element) {
        // 移除中奖样式类名
        if (item.element.classList.contains('lucky-element-card')) {
          item.element.classList.remove('lucky-element-card')
          item.element.classList.add('element-card')
        }
        // 重置为默认样式
        useElementStyle(item.element, {} as any, cardIndex, patternList.value, patternColor.value, cardColor.value, cardSize.value, textSize.value, 'sphere')
        // 重置缩放
        if (item.scale) {
          new TWEEN.Tween(item.scale)
            .to({ x: 1, y: 1, z: 1 }, 200)
            .easing(TWEEN.Easing.Back.Out)
            .start()
        }
      }
    })
    luckyCardList.value = []
  }

  // 清空中奖目标
  luckyTargets.value = []
  luckyCount.value = 0

  // 重置状态为准备状态
  enterLottery()
  currentStatus.value = 0
  mobileControlStore.setLotteryStatus(0)
}

// 取消确认对话框
function closeCancelDialog() {
  showCancelDialog.value = false
}
// 庆祝动画
function confettiFire() {
  const duration = 3 * 1000
  const end = Date.now() + duration;
  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    })
    // and launch a few from the right edge
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    })

    // keep going until we are out of time
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }())
  centerFire(0.25, {
    spread: 26,
    startVelocity: 55,
  })
  centerFire(0.2, {
    spread: 60,
  })
  centerFire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  })
}
function centerFire(particleRatio: number, opts: any) {
  const count = 200
  confetti({
    origin: { y: 0.7 },
    ...opts,
    particleCount: Math.floor(count * particleRatio),
  })
}

// 打开重置对话框
function openResetDialog() {
  showResetDialog.value = true
  resetPasswordInput.value = ''
}

// 打开中奖人员对话框
function openWinnersDialog() {
  showWinnersDialog.value = true
  selectedPrizeFilter.value = 'all'
  searchKeyword.value = ''
}

// 手机控制：打开当前奖项的中奖人员对话框
function openCurrentPrizeWinnersDialog() {
  // 设置筛选为当前奖项
  selectedPrizeFilter.value = currentPrize.value.id.toString()
  searchKeyword.value = ''
  showWinnersDialog.value = true
}

// 关闭中奖人员对话框
function closeWinnersDialog() {
  showWinnersDialog.value = false
  isMobileShowWinners.value = false
}

// 获取筛选后的中奖人员
function getFilteredWinners() {
  let winners = allPersonList.value.filter(person => person.isWin)

  // 按奖项筛选
  if (selectedPrizeFilter.value !== 'all') {
    winners = winners.filter(person =>
      person.prizeId.includes(selectedPrizeFilter.value)
    )
  }

  // 按关键词搜索（工号或姓名）
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    winners = winners.filter(person =>
      person.uid.toLowerCase().includes(keyword) ||
      person.name.toLowerCase().includes(keyword)
    )
  }

  return winners
}

// 获取所有奖项列表
function getAllPrizes() {
  return prizeConfig.getPrizeConfig.filter(prize => prize.isShow)
}

// 开始卡片滚动效果（已关闭）
function startScrollAnimation() {
  // 关闭排列打散滚动效果以降低性能消耗
  return

  // if (scrollAnimationTimer.value) {
  //   clearInterval(scrollAnimationTimer.value)
  // }

  // isScrollingEnabled.value = true

  // // 每隔一段时间移动卡片
  // scrollAnimationTimer.value = setInterval(() => {
  //   if (!isScrollingEnabled.value || currentStatus.value !== 0) {
  //     return
  //   }

  //   // 获取所有卡片的位置
  //   const cardHeight = (cardSize.value.height + 20) // 卡片高度 + 间距
  //   const twoRowCount = rowCount.value * 2 // 两行的索引

  //   // 对所有卡片进行上移
  //   for (let i = 0; i < objects.value.length; i++) {
  //     const object = objects.value[i]
  //     const currentY = object.position.y

  //     // 向上移动一个卡片高度
  //     const targetY = currentY - cardHeight

  //     new TWEEN.Tween(object.position)
  //       .to({ y: targetY }, 500)
  //       .easing(TWEEN.Easing.Linear.None)
  //       .onUpdate(render)
  //       .start()
  //   }

  //   // 检查是否有卡片超出顶部，如果有，将其移到底部
  //   setTimeout(() => {
  //     const topBoundary = 1000 + (cardHeight * rowCount.value) // 顶部边界

  //     for (let i = 0; i < objects.value.length; i++) {
  //       const object = objects.value[i]
  //       const currentIndex = i % twoRowCount // 计算当前卡片在两行中的位置

  //       // 如果卡片位置超出顶部，重新设置到底部
  //       if (object.position.y < topBoundary - cardHeight) {
  //         const bottomBoundary = 1000 - (cardHeight * Math.floor(objects.value.length / rowCount.value))
  //         const randomX = (Math.random() - 0.5) * 3000
  //         const randomZ = Math.random() * 2000 - 1000

  //         new TWEEN.Tween(object.position)
  //           .to({
  //             x: randomX,
  //             y: bottomBoundary,
  //             z: randomZ,
  //           }, 300)
  //           .easing(TWEEN.Easing.Quadratic.Out)
  //           .onUpdate(render)
  //           .start()
  //       }
  //     }
  //   }, 600)
  // }, 2000) // 每2秒滚动一次
}

// 停止卡片滚动效果
function stopScrollAnimation() {
  if (scrollAnimationTimer.value) {
    clearInterval(scrollAnimationTimer.value)
    scrollAnimationTimer.value = null
  }
  isScrollingEnabled.value = false
}

// 关闭重置对话框
function closeResetDialog() {
  showResetDialog.value = false
  resetPasswordInput.value = ''
}

// 验证密码并重置
function verifyAndReset() {
  if (resetPasswordInput.value === RESET_PASSWORD) {
    closeResetDialog()
    resetToInitialEffect()
    toast.open({
      message: '重置成功!',
      type: 'success',
      position: 'top-right',
      duration: 3000,
    })
  } else {
    toast.open({
      message: '密码错误!',
      type: 'error',
      position: 'top-right',
      duration: 3000,
    })
    resetPasswordInput.value = ''
  }
}

// 恢复初始飘舞效果（不清除数据）
function restoreFloatingEffect() {
  // 停止当前的所有动画
  TWEEN.removeAll()
  if (intervalTimer.value) {
    clearInterval(intervalTimer.value)
    intervalTimer.value = null
  }

  // 重置相机位置
  camera.value.position.set(0, 0, 3000)
  camera.value.rotation.set(0, 0, 0)

  // 重置场景旋转
  scene.value.rotation.set(0, 0, 0)

  // 重置控制器
  controls.value.reset()

  // 清空中奖名单显示
  luckyTargets.value = []
  luckyCardList.value = []
  luckyCount.value = 0

  // 重置状态为初始状态
  currentStatus.value = 0
  mobileControlStore.setLotteryStatus(0)

  // 恢复所有卡片到随机位置(飘舞效果)
  for (let i = 0; i < objects.value.length; i++) {
    const object = objects.value[i]
    new TWEEN.Tween(object.position)
      .to({
        x: Math.random() * 4000 - 2000,
        y: Math.random() * 4000 - 2000,
        z: Math.random() * 4000 - 2000,
      }, 2000)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start()
  }

  // 开始随机数据变换动画
  randomBallData()

  // 渲染动画
  new TWEEN.Tween({})
    .to({}, 2000)
    .onUpdate(render)
    .start()

  // 撒金粉效果
  triggerGoldenConfetti()

  // 设置可以操作
  canOperate.value = true

  // 重新初始化表格数据,保持自定义排序
  initTableData()

  // 延迟启动滚动动画，等待卡片移动到随机位置后
  setTimeout(() => {
    startScrollAnimation()
  }, 2500)
}

// 重置所有数据（需要密码）
function resetToInitialEffect() {
  // 停止当前的所有动画
  TWEEN.removeAll()
  if (intervalTimer.value) {
    clearInterval(intervalTimer.value)
    intervalTimer.value = null
  }

  // 重置所有人员的获奖状态
  personConfig.resetAlreadyPerson()

  // 重置所有奖项的使用状态
  prizeConfig.getPrizeConfig.forEach(prize => {
    prize.isUsed = false
    prize.isUsedCount = 0
  })

  // 重置相机位置
  camera.value.position.set(0, 0, 3000)
  camera.value.rotation.set(0, 0, 0)

  // 重置场景旋转
  scene.value.rotation.set(0, 0, 0)

  // 重置控制器
  controls.value.reset()

  // 清空中奖名单
  luckyTargets.value = []
  luckyCardList.value = []
  luckyCount.value = 0

  // 重置状态为初始状态
  currentStatus.value = 0
  mobileControlStore.setLotteryStatus(0)

  // 恢复所有卡片到随机位置(飘舞效果)
  for (let i = 0; i < objects.value.length; i++) {
    const object = objects.value[i]
    new TWEEN.Tween(object.position)
      .to({
        x: Math.random() * 4000 - 2000,
        y: Math.random() * 4000 - 2000,
        z: Math.random() * 4000 - 2000,
      }, 2000)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start()
  }

  // 开始随机数据变换动画
  randomBallData()

  // 渲染动画
  new TWEEN.Tween({})
    .to({}, 2000)
    .onUpdate(render)
    .start()

  // 撒金粉效果
  triggerGoldenConfetti()

  // 设置可以操作
  canOperate.value = true

  // 重新初始化表格数据,保持自定义排序
  initTableData()

  // 延迟启动滚动动画，等待卡片移动到随机位置后
  setTimeout(() => {
    startScrollAnimation()
  }, 2500)
}

// 撒金粉效果
function triggerGoldenConfetti() {
  const duration = 3 * 1000
  const end = Date.now() + duration

  // 金色纸屑从上往下飘落
  ;(function frame() {
    confetti({
      particleCount: 3,
      angle: 270, // 从上方
      spread: 180,
      origin: { x: Math.random(), y: 0 }, // 从顶部随机位置
      colors: ['#FFD700', '#FFA500', '#FFEC8B', '#F0E68C', '#FF8C00'],
      drift: Math.random() * 2 - 1,
      gravity: 1.5,
      scalar: 1.2,
    })

    // 左右两侧也撒一些
    confetti({
      particleCount: 2,
      angle: 0,
      spread: 45,
      origin: { x: 0, y: 0.3 },
      colors: ['#FFD700', '#FFA500', '#FFEC8B'],
    })

    confetti({
      particleCount: 2,
      angle: 180,
      spread: 45,
      origin: { x: 1, y: 0.3 },
      colors: ['#FFD700', '#FFA500', '#FFEC8B'],
    })

    // 中心爆发
    confetti({
      particleCount: 5,
      spread: 100,
      startVelocity: 30,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#FFD700', '#FFA500', '#FFEC8B', '#F0E68C'],
      decay: 0.92,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }())
}

function setDefaultPersonList() {
  personConfig.setDefaultPersonList()
  // 刷新页面
  window.location.reload()
}
// 随机替换数据（已关闭）
function randomBallData(mod: 'default' | 'lucky' | 'sphere' = 'default') {
  // 关闭200ms自动刷新功能以降低性能消耗
  return

  // intervalTimer.value = setInterval(() => {
  //   // 产生随机数数组
  //   const indexLength = 4
  //   const cardRandomIndexArr: number[] = []
  //   const personRandomIndexArr: number[] = []
  //   for (let i = 0; i < indexLength; i++) {
  //     // 解决随机元素概率过于不均等问题
  //     const randomCardIndex = Math.floor(Math.random() * (tableData.value.length - 1))
  //     const randomPersonIndex = Math.floor(Math.random() * (allPersonList.value.length - 1))
  //     if (luckyCardList.value.includes(randomCardIndex)) {
  //       continue
  //     }
  //     cardRandomIndexArr.push(randomCardIndex)
  //     personRandomIndexArr.push(randomPersonIndex)
  //   }
  //   for (let i = 0; i < cardRandomIndexArr.length; i++) {
  //     if (!objects.value[cardRandomIndexArr[i]]) {
  //       continue
  //     }
  //     objects.value[cardRandomIndexArr[i]].element = useElementStyle(objects.value[cardRandomIndexArr[i]].element, allPersonList.value[personRandomIndexArr[i]], cardRandomIndexArr[i], patternList.value, patternColor.value, cardColor.value, { width: cardSize.value.width, height: cardSize.value.height }, textSize.value, mod, 'change')
  //   }
  // }, 200)
}
// 监听键盘
function listenKeyboard(e: any) {
  if ((e.keyCode !== 32 || e.keyCode !== 27) && !canOperate.value) {
    return
  }
  if (e.keyCode === 27 && currentStatus.value === 3) {
    quitLottery()
  }
  if (e.keyCode !== 32) {
    return
  }
  switch (currentStatus.value) {
    case 0:
      enterLottery()
      break
    case 1:
      startLottery()
      break
    case 2:
      stopLottery()
      break
    case 3:
      continueLottery()
      break
    default:
      break
  }
}

function cleanup() {
  // 停止所有Tween动画
  TWEEN.removeAll()

  // 清理动画循环
  if ((window as any).cancelAnimationFrame) {
    (window as any).cancelAnimationFrame(animationFrameId.value)
  }
  //   animationRunning.value = false
  clearInterval(intervalTimer.value)
  intervalTimer.value = null
  clearInterval(scrollAnimationTimer.value)
  scrollAnimationTimer.value = null
  if (scene.value) {
    scene.value.traverse((object: Object3D) => {
      if ((object as any).material) {
        if (Array.isArray((object as any).material)) {
          (object as any).material.forEach((material: Material) => {
            material.dispose()
          })
        }
        else {
          (object as any).material.dispose()
        }
      }
      if ((object as any).geometry) {
        (object as any).geometry.dispose()
      }
      if ((object as any).texture) {
        (object as any).texture.dispose()
      }
    })
    scene.value.clear()
  }

  if (objects.value) {
    objects.value.forEach((object) => {
      if (object.element) {
        object.element.remove()
      }
    })
    objects.value = []
  }

  if (controls.value) {
    controls.value.removeEventListener('change')
    controls.value.dispose()
  }
  //   移除所有事件监听
  window.removeEventListener('resize', onWindowResize)
  scene.value = null
  camera.value = null
  renderer.value = null
  controls.value = null
}
onMounted(() => {
  initTableData()
  init()
  animation()
  containerRef.value!.style.color = `${textColor}`
  randomBallData()
  window.addEventListener('keydown', listenKeyboard)

  // 加载自定义标题字体
  if (titleConfig.value.fontFamily && fontList.value.length > 0) {
    // 从字体列表中查找当前字体的实际URL
    const currentFont = fontList.value.find(f => f.name === titleConfig.value.fontFamily)
    if (currentFont && currentFont.url && currentFont.url !== 'Storage') {
      const style = document.createElement('style')
      const fileName = currentFont.url
      const fileNameLower = fileName.toLowerCase()
      let format = 'truetype'

      if (fileNameLower.endsWith('.otf')) {
        format = 'opentype'
      } else if (fileNameLower.endsWith('.woff')) {
        format = 'woff'
      } else if (fileNameLower.endsWith('.woff2')) {
        format = 'woff2'
      }

      style.textContent = `
        @font-face {
          font-family: '${titleConfig.value.fontFamily}';
          src: url('${currentFont.url}') format('${format}');
          font-weight: normal;
          font-style: normal;
        }
      `
      document.head.appendChild(style)
    }
  }

  // 延迟启动滚动动画，等待初始化完成
  setTimeout(() => {
    startScrollAnimation()
  }, 3000)

  // 手机控制初始化
  mobileControlStore.initWebSocket()

  // 标记当前在抽奖页面
  mobileControlStore.setInLotteryPage(true)

  // 生成二维码
  generateQRCode()

  // 监听手机控制事件
  window.addEventListener('mobile-start-lottery', handleMobileStartLottery)
  window.addEventListener('mobile-stop-lottery', handleMobileStopLottery)
  window.addEventListener('mobile-continue-lottery', handleMobileContinueLottery)
  window.addEventListener('mobile-show-winners', handleMobileShowWinners)
  window.addEventListener('mobile-skip-winner', (e: any) => {
    handleMobileSkipWinner(e.detail.winnerId)
  })
})
onUnmounted(() => {
  // 清理手机控制
  mobileControlStore.setInLotteryPage(false)
  mobileControlStore.closeWebSocket()
  window.removeEventListener('mobile-start-lottery', handleMobileStartLottery)
  window.removeEventListener('mobile-stop-lottery', handleMobileStopLottery)
  window.removeEventListener('mobile-continue-lottery', handleMobileContinueLottery)
  window.removeEventListener('mobile-show-winners', handleMobileShowWinners)

  nextTick(() => {
    cleanup()
  })
  clearInterval(intervalTimer.value)
  intervalTimer.value = null
  window.removeEventListener('keydown', listenKeyboard)
})
onUnmounted(() => {
  nextTick(() => {
    cleanup()
  })
  clearInterval(intervalTimer.value)
  intervalTimer.value = null
  window.removeEventListener('keydown', listenKeyboard)
})
</script>

<template>
  <!-- 右上角按钮组 -->
  <div v-if="tableData.length > 0" class="top-right-buttons">
    <!-- 手机控制 - 锁定按钮 -->
    <button
      v-if="mobileEnabled"
      class="btn-circle-mini btn-lock-circle"
      @click="handleLockToggle"
      :title="isLocked ? '点击解锁' : '点击锁定'"
    >
      {{ isLocked ? '🔒' : '🔓' }}
    </button>

    <!-- 连接状态指示器 -->
    <div v-if="mobileEnabled && isConnected" class="connection-badge-mini">
      已连接
    </div>

    <!-- 重置按钮 -->
    <button
      class="btn-circle-mini"
      @click="openResetDialog"
      title="重置(需要密码)"
    >
      ↺
    </button>

    <!-- 恢复飘舞效果按钮 -->
    <button
      class="btn-circle-mini"
      @click="restoreFloatingEffect"
      title="恢复飘舞效果"
    >
      ✨
    </button>

    <!-- 查看中奖名单按钮 -->
    <button
      class="btn-circle-mini"
      @click="openWinnersDialog"
      title="查看中奖名单"
    >
      📋
    </button>
  </div>

  <!-- 手机控制 - 二维码悬浮框 -->
  <div
    v-if="showQRCode && qrCodeUrl && mobileEnabled"
    class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-6 bg-white rounded-2xl shadow-2xl"
  >
    <div class="text-center">
      <h3 class="text-xl font-bold mb-4 text-gray-800">📱 扫码用手机控制</h3>
      <img :src="qrCodeUrl" class="w-48 h-48 mx-auto rounded-lg border-4 border-gray-200" alt="QR Code">
      <p class="mt-4 text-gray-600">请输入验证码连接</p>
      <button class="mt-4 btn btn-outline btn-sm text-black" @click="showQRCode = false">
        关闭
      </button>
    </div>
  </div>

  <!-- 手机控制 - 解锁对话框 -->
  <dialog v-if="showUnlockDialog" class="modal" :open="true">
    <div class="modal-box">
      <h3 class="text-lg font-bold">🔓 解锁手机控制</h3>
      <p class="py-4">请输入管理员密码以解锁手机控制功能</p>
      <input
        v-model="unlockPassword"
        type="password"
        placeholder="请输入管理员密码"
        class="input input-bordered w-full"
        @keyup.enter="handleUnlock"
      />
      <div class="modal-action">
        <button class="btn btn-ghost" @click="showUnlockDialog = false; unlockPassword = ''">
          取消
        </button>
        <button class="btn btn-primary" @click="handleUnlock">
          解锁
        </button>
      </div>
    </div>
  </dialog>

  <div class="absolute z-10 flex flex-col items-center justify-center -translate-x-1/2 left-1/2">
    <h2
      class="pt-12 m-0 mb-12 tracking-wide text-center leading-12 header-title"
      :style="{ fontSize: `${titleConfig.fontSize}px`, color: textColor, fontFamily: titleConfig.fontFamily }"
    >
      {{ topTitle }}
    </h2>
    <div class="flex gap-3">
      <button
        v-if="tableData.length <= 0" class="cursor-pointer btn btn-outline btn-secondary btn-lg"
        @click="router.push('config')"
      >
        {{ t('button.noInfoAndImport') }}
      </button>
      <button
        v-if="tableData.length <= 0" class="cursor-pointer btn btn-outline btn-secondary btn-lg"
        @click="setDefaultPersonList"
      >
        {{ t('button.useDefault') }}
      </button>
    </div>
  </div>
  <div id="container" ref="containerRef" class="3dContainer">
    <!-- 选中菜单结构 start -->
    <div id="menu">
      <button v-if="currentStatus === 0 && tableData.length > 0" class="btn-end " @click="enterLottery">
        {{ t('button.enterLottery') }}
      </button>

      <div v-if="currentStatus === 1" class="start">
        <button
          ref="startButtonRef"
          class="btn-start"
          @click="startLottery"
          @mouseenter="handleStartButtonHover(true)"
          @mouseleave="handleStartButtonHover(false)"
        >
          <strong>{{ t('button.start') }}</strong>
          <div id="container-stars">
            <div id="stars" />
          </div>

          <div id="glow">
            <div class="circle" />
            <div class="circle" />
          </div>
        </button>
      </div>

      <button v-if="currentStatus === 2" class="btn-end btn glass btn-lg" @click="stopLottery">
        {{ t('button.selectLucky') }}
      </button>

      <div v-if="currentStatus === 3" class="flex justify-center gap-6 enStop">
        <div class="start">
          <button class="btn-start" @click="continueLottery">
            <strong>{{ t('button.continue') }}</strong>
            <div id="container-stars">
              <div id="stars" />
            </div>

            <div id="glow">
              <div class="circle" />
              <div class="circle" />
            </div>
          </button>
        </div>

        <div class="start">
          <button class="btn-cancel" @click="quitLottery">
            <strong>{{ t('button.cancel') }}</strong>
            <div id="container-stars">
              <div id="stars" />
            </div>

            <div id="glow">
              <div class="circle" />
              <div class="circle" />
            </div>
          </button>
        </div>
      </div>
    </div>
    <!-- end -->
  </div>

  <!-- 重置密码对话框 -->
  <Transition name="fade">
    <div v-if="showResetDialog" class="reset-dialog-overlay" @click.self="closeResetDialog">
      <div class="reset-dialog">
        <h3 class="dialog-title">🔒 重置需要密码</h3>
        <div class="dialog-content">
          <input
            v-model="resetPasswordInput"
            type="password"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            class="password-input"
            placeholder="请输入密码"
            @keyup.enter="verifyAndReset"
          />
          <div class="dialog-buttons">
            <button class="dialog-btn dialog-btn-cancel" @click="closeResetDialog">
              取消
            </button>
            <button class="dialog-btn dialog-btn-confirm" @click="verifyAndReset">
              确认重置
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 取消抽奖确认对话框 -->
  <Transition name="fade">
    <div v-if="showCancelDialog" class="cancel-dialog-overlay" @click.self="closeCancelDialog">
      <div class="cancel-dialog">
        <h3 class="cancel-dialog-title">⚠️ 确认取消抽奖?</h3>
        <div class="cancel-dialog-content">
          <p class="cancel-dialog-warning">
            当前中奖结果将会丢失,无法恢复!
          </p>
          <p class="cancel-dialog-info">
            确认要取消并重新开始抽奖吗?
          </p>
          <div class="cancel-dialog-buttons">
            <button class="cancel-dialog-btn cancel-dialog-btn-cancel" @click="closeCancelDialog">
              返回
            </button>
            <button class="cancel-dialog-btn cancel-dialog-btn-confirm" @click="confirmCancel">
              确认取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 中奖人员查看和筛选对话框 -->
  <Transition name="fade">
    <div v-if="showWinnersDialog" class="winners-dialog-overlay" @click.self="closeWinnersDialog">
      <div class="winners-dialog">
        <h3 class="winners-dialog-title">🏆 中奖人员名单</h3>

        <div class="winners-dialog-content">
          <!-- 筛选区域 -->
          <div class="winners-filter-section">
            <div class="filter-row">
              <label class="filter-label">奖项筛选：</label>
              <select v-model="selectedPrizeFilter" class="filter-select">
                <option value="all">全部奖项</option>
                <option v-for="prize in getAllPrizes()" :key="prize.id" :value="prize.id">
                  {{ prize.name }} ({{ prize.isUsedCount }}/{{ prize.count }})
                </option>
              </select>
            </div>

            <div class="filter-row">
              <label class="filter-label">搜索：</label>
              <input
                v-model="searchKeyword"
                type="text"
                class="filter-input"
                placeholder="输入工号或姓名"
              />
            </div>
          </div>

          <!-- 中奖人员列表 -->
          <div class="winners-list">
            <div v-if="getFilteredWinners().length === 0" class="no-winners">
              暂无中奖人员
            </div>
            <table v-else class="winners-table">
              <thead>
                <tr>
                  <th>工号</th>
                  <th>姓名</th>
                  <th>部门</th>
                  <th>身份</th>
                  <th>中奖奖项</th>
                  <th>中奖时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(winner, index) in getFilteredWinners()" :key="winner.id">
                  <td>{{ winner.uid }}</td>
                  <td>{{ winner.name }}</td>
                  <td>{{ winner.department }}</td>
                  <td>{{ winner.identity }}</td>
                  <td>
                    <span v-for="(prizeName, idx) in winner.prizeName" :key="idx" class="prize-tag">
                      {{ prizeName }}
                    </span>
                  </td>
                  <td>{{ winner.prizeTime.join(', ') }}</td>
                  <td>
                    <button
                      v-if="!isLocked"
                      class="skip-winner-btn"
                      @click="handleSkipWinner(winner.id)"
                      title="跳过此人（已使用名额-1）"
                    >
                      ⏭️ 跳过
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 统计信息 -->
          <div class="winners-stats">
            <span class="stats-text">共 {{ getFilteredWinners().length }} 人中奖</span>
          </div>

          <div class="winners-dialog-buttons">
            <button class="winners-dialog-btn winners-dialog-btn-close" @click="closeWinnersDialog">
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <StarsBackground :home-background="homeBackground" />
  <PrizeList class="absolute left-0 top-32" />
</template>

<style scoped lang="scss">
#menu {
    position: absolute;
    z-index: 100;
    width: 100%;
    bottom: 50px;
    text-align: center;
    margin: 0 auto;
    font-size: 32px;
}

.header-title {
    -webkit-animation: tracking-in-expand-fwd 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000) both;
    animation: tracking-in-expand-fwd 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000) both;
}

.start {
    // 居中
    display: flex;
    justify-content: center;
}

.btn-start {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 13rem;
    overflow: hidden;
    height: 3rem;
    background-size: 300% 300%;
    backdrop-filter: blur(1rem);
    border-radius: 5rem;
    transition: 0.5s;
    animation: gradient_301 5s ease infinite;
    border: double 4px transparent;
    background-image: linear-gradient(#212121, #212121), linear-gradient(137.48deg, #ffdb3b 10%, #FE53BB 45%, #8F51EA 67%, #0044ff 87%);
    background-origin: border-box;
    background-clip: content-box, border-box;
    -webkit-animation: pulsate-fwd 1.2s ease-in-out infinite both;
    animation: pulsate-fwd 1.2s ease-in-out infinite both;
}

.btn-cancel {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 13rem;
    overflow: hidden;
    height: 3rem;
    background-size: 300% 300%;
    backdrop-filter: blur(1rem);
    border-radius: 5rem;
    transition: 0.5s;
    animation: gradient_301 5s ease infinite;
    border: double 4px transparent;
    background-image: linear-gradient(#212121, #212121), linear-gradient(137.48deg, #ffdb3b 10%, #FE53BB 45%, #8F51EA 67%, #0044ff 87%);
    background-origin: border-box;
    background-clip: content-box, border-box;
}

#container-stars {
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition: 0.5s;
    backdrop-filter: blur(1rem);
    border-radius: 5rem;
}

strong {
    z-index: 2;
    font-family: 'Avalors Personal Use';
    font-size: 12px;
    letter-spacing: 5px;
    color: #FFFFFF;
    text-shadow: 0 0 4px white;
}

#glow {
    position: absolute;
    display: flex;
    width: 12rem;
}

.circle {
    width: 100%;
    height: 30px;
    filter: blur(2rem);
    animation: pulse_3011 4s infinite;
    z-index: -1;
}

.circle:nth-of-type(1) {
    background: rgba(254, 83, 186, 0.636);
}

.circle:nth-of-type(2) {
    background: rgba(142, 81, 234, 0.704);
}

.btn-start:hover #container-stars {
    z-index: 1;
    background-color: #212121;
}

.btn-start:hover {
    transform: scale(1.1)
}

.btn-start:active {
    border: double 4px #FE53BB;
    background-origin: border-box;
    background-clip: content-box, border-box;
    animation: none;
}

.btn-start:active .circle {
    background: #FE53BB;
}

#stars {
    position: relative;
    background: transparent;
    width: 200rem;
    height: 200rem;
}

#stars::after {
    content: "";
    position: absolute;
    top: -10rem;
    left: -100rem;
    width: 100%;
    height: 100%;
    animation: animStarRotate 90s linear infinite;
}

#stars::after {
    background-image: radial-gradient(#ffffff 1px, transparent 1%);
    background-size: 50px 50px;
}

#stars::before {
    content: "";
    position: absolute;
    top: 0;
    left: -50%;
    width: 170%;
    height: 500%;
    animation: animStar 60s linear infinite;
}

#stars::before {
    background-image: radial-gradient(#ffffff 1px, transparent 1%);
    background-size: 50px 50px;
    opacity: 0.5;
}

@keyframes animStar {
    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(-135rem);
    }
}

@keyframes animStarRotate {
    from {
        transform: rotate(360deg);
    }

    to {
        transform: rotate(0);
    }
}

@keyframes gradient_301 {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

@keyframes pulse_3011 {
    0% {
        transform: scale(0.75);
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
    }

    70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
    }

    100% {
        transform: scale(0.75);
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
    }
}

.btn-end {
    -webkit-animation: pulsate-fwd 0.9s ease-in-out infinite both;
    animation: pulsate-fwd 0.9s ease-in-out infinite both;
    cursor: pointer;
}

.btn-end {
    --glow-color: rgb(217, 176, 255);
    --glow-spread-color: rgba(191, 123, 255, 0.781);
    --enhanced-glow-color: rgb(231, 206, 255);
    --btn-color: rgb(100, 61, 136);
    border: .25em solid var(--glow-color);
    padding: 1em 3em;
    color: var(--glow-color);
    font-size: 15px;
    font-weight: bold;
    background-color: var(--btn-color);
    border-radius: 1em;
    outline: none;
    box-shadow: 0 0 1em .25em var(--glow-color),
        0 0 4em 1em var(--glow-spread-color),
        inset 0 0 .75em .25em var(--glow-color);
    text-shadow: 0 0 .5em var(--glow-color);
    position: relative;
    transition: all 0.3s;
    -webkit-animation: swing-in-top-fwd 0.5s cubic-bezier(0.175, 0.885, 0.320, 1.275) both;
    animation: swing-in-top-fwd 0.5s cubic-bezier(0.175, 0.885, 0.320, 1.275) both;
}

.btn-end::after {
    pointer-events: none;
    content: "";
    position: absolute;
    top: 120%;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: var(--glow-spread-color);
    filter: blur(2em);
    opacity: .7;
    transform: perspective(1.5em) rotateX(35deg) scale(1, .6);
}

.btn-end:hover {
    color: var(--btn-color);
    background-color: var(--glow-color);
    box-shadow: 0 0 1em .25em var(--glow-color),
        0 0 4em 2em var(--glow-spread-color),
        inset 0 0 .75em .25em var(--glow-color);
}

.btn-end:active {
    box-shadow: 0 0 0.6em .25em var(--glow-color),
        0 0 2.5em 2em var(--glow-spread-color),
        inset 0 0 .5em .25em var(--glow-color);
}

// 按钮动画
@-webkit-keyframes pulsate-fwd {
    0% {
        -webkit-transform: scale(1);
        transform: scale(1);
    }

    50% {
        -webkit-transform: scale(1.1);
        transform: scale(1.1);
    }

    100% {
        -webkit-transform: scale(1);
        transform: scale(1);
    }
}

@keyframes pulsate-fwd {
    0% {
        -webkit-transform: scale(1);
        transform: scale(1);
    }

    50% {
        -webkit-transform: scale(1.2);
        transform: scale(1.2);
    }

    100% {
        -webkit-transform: scale(1);
        transform: scale(1);
    }
}

// 恢复飘舞效果按钮样式
.btn-reset {
    -webkit-animation: shimmer 2s ease-in-out infinite;
    animation: shimmer 2s ease-in-out infinite;
    cursor: pointer;
    padding: 0.6em 2em;
    font-size: 16px;
    font-weight: bold;
    color: #FFD700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: 2px solid #FFD700;
    border-radius: 1em;
    outline: none;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5),
        0 0 30px rgba(255, 215, 0, 0.3),
        inset 0 0 15px rgba(255, 215, 0, 0.2);
    text-shadow: 0 0 5px rgba(255, 215, 0, 0.8);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

.btn-reset::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
        45deg,
        transparent,
        rgba(255, 215, 0, 0.1),
        transparent,
        rgba(255, 215, 0, 0.1),
        transparent
    );
    transform: rotate(45deg);
    animation: shine 3s linear infinite;
}

.btn-reset:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8),
        0 0 40px rgba(255, 215, 0, 0.5),
        inset 0 0 20px rgba(255, 215, 0, 0.3);
    border-color: #FFA500;
}

.btn-reset:active {
    transform: scale(0.95);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.6),
        inset 0 0 10px rgba(255, 215, 0, 0.4);
}

// 操作按钮列容器
.action-buttons-column {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

// 圆形按钮样式（统一）
.btn-circle {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 2px solid #FFD700;
    outline: none;
    cursor: pointer;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5),
        0 0 30px rgba(255, 215, 0, 0.3),
        inset 0 0 15px rgba(255, 215, 0, 0.2);
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    animation: shimmer 2s ease-in-out infinite;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #FFD700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.btn-circle::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
        45deg,
        transparent,
        rgba(255, 215, 0, 0.1),
        transparent,
        rgba(255, 215, 0, 0.1),
        transparent
    );
    transform: rotate(45deg);
    animation: shine 3s linear infinite;
}

.btn-circle:hover {
    transform: scale(1.1);
    box-shadow: 0 0 25px rgba(255, 215, 0, 0.8),
        0 0 40px rgba(255, 215, 0, 0.5),
        inset 0 0 20px rgba(255, 215, 0, 0.3);
}

.btn-circle:active {
    transform: scale(0.95);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.6),
        inset 0 0 10px rgba(255, 215, 0, 0.4);
}

@keyframes shine {
    0% {
        transform: translateX(-100%) rotate(45deg);
    }
    100% {
        transform: translateX(100%) rotate(45deg);
    }
}

@keyframes shimmer {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.85;
    }
}



@-webkit-keyframes tracking-in-expand-fwd {
    0% {
        letter-spacing: -0.5em;
        -webkit-transform: translateZ(-700px);
        transform: translateZ(-700px);
        opacity: 0;
    }

    40% {
        opacity: 0.6;
    }

    100% {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        opacity: 1;
    }
}

@keyframes tracking-in-expand-fwd {
    0% {
        letter-spacing: -0.5em;
        -webkit-transform: translateZ(-700px);
        transform: translateZ(-700px);
        opacity: 0;
    }

    40% {
        opacity: 0.6;
    }

    100% {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        opacity: 1;
    }
}

// 右上角按钮组样式
.top-right-buttons {
    position: fixed;
    top: 30px;
    right: 30px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
}

// 连接状态指示器
.connection-badge-mini {
    font-size: 12px;
    color: #4FCF70;
    background: rgba(79, 207, 112, 0.2);
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid rgba(79, 207, 112, 0.5);
    text-align: center;
}

// 迷你圆形按钮样式（右上角）
.btn-circle-mini {
    position: relative;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid #FFD700;
    outline: none;
    cursor: pointer;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    animation: shimmer 2s ease-in-out infinite;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #FFD700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.btn-circle-mini::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
        45deg,
        transparent,
        rgba(255, 215, 0, 0.1),
        transparent,
        rgba(255, 215, 0, 0.1),
        transparent
    );
    transform: rotate(45deg);
    animation: shine 3s linear infinite;
}

.btn-circle-mini:hover {
    transform: scale(1.1);
    box-shadow: 0 0 25px rgba(255, 215, 0, 0.8);
}

.btn-circle-mini:active {
    transform: scale(0.95);
}

.btn-lock-circle:active {
    transform: scale(0.95);
}

// 密码对话框样式
.reset-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.reset-dialog {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 2px solid #FF4D4D;
    border-radius: 20px;
    padding: 40px;
    min-width: 400px;
    box-shadow: 0 0 30px rgba(255, 77, 77, 0.5),
        0 0 60px rgba(255, 77, 77, 0.3);
    animation: dialogIn 0.3s ease-out;
}

@keyframes dialogIn {
    from {
        transform: scale(0.8) translateY(-50px);
        opacity: 0;
    }
    to {
        transform: scale(1) translateY(0);
        opacity: 1;
    }
}

.dialog-title {
    text-align: center;
    color: #FF4D4D;
    font-size: 24px;
    font-weight: bold;
    margin: 0 0 30px 0;
    text-shadow: 0 0 10px rgba(255, 77, 77, 0.5);
}

.dialog-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.password-input {
    width: 100%;
    padding: 15px 20px;
    font-size: 16px;
    border: 2px solid #333;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    outline: none;
    transition: all 0.3s ease;
}

.password-input:focus {
    border-color: #FF4D4D;
    box-shadow: 0 0 15px rgba(255, 77, 77, 0.3);
}

.password-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.dialog-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.dialog-btn {
    flex: 1;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.dialog-btn-cancel {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.dialog-btn-cancel:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.dialog-btn-confirm {
    background: linear-gradient(135deg, #FF4D4D 0%, #CC0000 100%);
    color: #fff;
    box-shadow: 0 0 15px rgba(255, 77, 77, 0.5);
}

.dialog-btn-confirm:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 25px rgba(255, 77, 77, 0.7);
}

.dialog-btn:active {
    transform: translateY(0);
}

// 取消确认对话框样式
.cancel-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.cancel-dialog {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 2px solid #FF9800;
    border-radius: 20px;
    padding: 40px;
    min-width: 450px;
    box-shadow: 0 0 30px rgba(255, 152, 0, 0.5),
        0 0 60px rgba(255, 152, 0, 0.3);
    animation: dialogIn 0.3s ease-out;
}

.cancel-dialog-title {
    text-align: center;
    color: #FF9800;
    font-size: 24px;
    font-weight: bold;
    margin: 0 0 25px 0;
    text-shadow: 0 0 10px rgba(255, 152, 0, 0.5);
}

.cancel-dialog-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.cancel-dialog-warning {
    text-align: center;
    color: #FF6B6B;
    font-size: 18px;
    font-weight: bold;
    margin: 0;
    padding: 15px;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 10px;
    border: 1px solid rgba(255, 107, 107, 0.3);
}

.cancel-dialog-info {
    text-align: center;
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    margin: 0;
}

.cancel-dialog-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 10px;
}

.cancel-dialog-btn {
    flex: 1;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.cancel-dialog-btn-cancel {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.cancel-dialog-btn-cancel:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.cancel-dialog-btn-confirm {
    background: linear-gradient(135deg, #FF9800 0%, #FF5722 100%);
    color: #fff;
    box-shadow: 0 0 15px rgba(255, 152, 0, 0.5);
}

.cancel-dialog-btn-confirm:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 25px rgba(255, 152, 0, 0.7);
}

.cancel-dialog-btn:active {
    transform: translateY(0);
}

// 淡入淡出动画
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

// 查看中奖名单按钮样式
.btn-view-winners {
    color: #4FCF70;
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    border: 2px solid #4FCF70;
    box-shadow: 0 0 15px rgba(79, 207, 112, 0.5),
        0 0 30px rgba(79, 207, 112, 0.3),
        inset 0 0 15px rgba(79, 207, 112, 0.2);
    text-shadow: 0 0 5px rgba(79, 207, 112, 0.8);
}

.btn-view-winners:hover {
    box-shadow: 0 0 20px rgba(79, 207, 112, 0.8),
        0 0 40px rgba(79, 207, 112, 0.5),
        inset 0 0 20px rgba(79, 207, 112, 0.3);
    border-color: #2ecc71;
}

.btn-view-winners:active {
    box-shadow: 0 0 10px rgba(79, 207, 112, 0.6),
        inset 0 0 10px rgba(79, 207, 112, 0.4);
}

// 中奖人员对话框样式
.winners-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.winners-dialog {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 2px solid #4FCF70;
    border-radius: 20px;
    padding: 30px;
    min-width: 900px;
    max-width: 95vw;
    max-height: 90vh;
    box-shadow: 0 0 30px rgba(79, 207, 112, 0.5),
        0 0 60px rgba(79, 207, 112, 0.3);
    animation: dialogIn 0.3s ease-out;
    display: flex;
    flex-direction: column;
}

.winners-dialog-title {
    text-align: center;
    color: #4FCF70;
    font-size: 24px;
    font-weight: bold;
    margin: 0 0 25px 0;
    text-shadow: 0 0 10px rgba(79, 207, 112, 0.5);
}

.winners-dialog-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: hidden;
}

.winners-filter-section {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    border: 1px solid rgba(79, 207, 112, 0.3);
}

.filter-row {
    display: flex;
    align-items: center;
    gap: 10px;
}

.filter-label {
    min-width: 80px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-weight: bold;
}

.filter-select,
.filter-input {
    flex: 1;
    padding: 10px 15px;
    font-size: 14px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
    color: #fff;
    outline: none;
    transition: all 0.3s ease;
}

.filter-select:focus,
.filter-input:focus {
    border-color: #4FCF70;
    box-shadow: 0 0 10px rgba(79, 207, 112, 0.3);
}

.filter-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.winners-list {
    flex: 1;
    overflow-y: auto;
    min-height: 400px;
    max-height: 500px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
}

.winners-list::-webkit-scrollbar {
    width: 8px;
}

.winners-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

.winners-list::-webkit-scrollbar-thumb {
    background: rgba(79, 207, 112, 0.5);
    border-radius: 4px;
}

.winners-list::-webkit-scrollbar-thumb:hover {
    background: rgba(79, 207, 112, 0.8);
}

.no-winners {
    text-align: center;
    padding: 60px 20px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 18px;
}

.winners-table {
    width: 100%;
    border-collapse: collapse;
}

.winners-table thead {
    position: sticky;
    top: 0;
    z-index: 10;
    background: rgba(79, 207, 112, 0.2);
}

.winners-table th {
    padding: 12px;
    text-align: left;
    color: #4FCF70;
    font-size: 14px;
    font-weight: bold;
    border-bottom: 2px solid rgba(79, 207, 112, 0.5);
}

.winners-table td {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
}

.winners-table tbody tr:hover {
    background: rgba(79, 207, 112, 0.1);
}

.winners-table tbody tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.02);
}

.prize-tag {
    display: inline-block;
    padding: 3px 8px;
    margin: 2px;
    font-size: 12px;
    border-radius: 4px;
    background: linear-gradient(135deg, rgba(79, 207, 112, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
}

.skip-winner-btn {
    padding: 6px 12px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.skip-winner-btn:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(239, 68, 68, 0.4);
}

.skip-winner-btn:active {
    transform: translateY(0);
}

.winners-stats {
    padding: 10px 20px;
    text-align: center;
    background: rgba(79, 207, 112, 0.1);
    border-radius: 8px;
}

.stats-text {
    color: #4FCF70;
    font-size: 16px;
    font-weight: bold;
}

.winners-dialog-buttons {
    display: flex;
    justify-content: center;
    padding-top: 10px;
}

.winners-dialog-btn {
    padding: 12px 40px;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.winners-dialog-btn-close {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 0 15px rgba(102, 126, 234, 0.5);
}

.winners-dialog-btn-close:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 25px rgba(102, 126, 234, 0.7);
}

.winners-dialog-btn:active {
    transform: translateY(0);
}


</style>
