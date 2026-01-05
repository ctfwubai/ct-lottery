<script setup lang="ts">
import type { IPrizeConfig } from '@/types/storeType'
import useStore from '@/store'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'

const prizeConfig = useStore().prizeConfig
const personConfig = useStore().personConfig
const { getPrizeConfig: prizeList } = storeToRefs(prizeConfig)
const { getAllPersonList: allPersonList } = storeToRefs(personConfig)

// 密码验证
const passwordInput = ref('')
const isVerified = ref(false)
const SYSTEM_PASSWORD = 'admin888'
const passwordError = ref('')

// 获取系统设置密码
const getSystemPassword = () => {
  try {
    const customPassword = localStorage.getItem('lottery_system_password')
    if (customPassword) {
      return customPassword
    }
  } catch (error) {
    console.error('读取系统设置密码失败:', error)
  }
  // 返回默认密码
  return SYSTEM_PASSWORD
}

// 修改系统设置密码相关
const showChangeSystemPassword = ref(false)
const currentSystemPassword = ref('')
const newSystemPassword = ref('')
const confirmSystemPassword = ref('')
const changeSystemPasswordError = ref('')
const changeSystemPasswordSuccess = ref('')

// 修改主页登录账号密码相关
const showChangeLoginAccount = ref(false)
const currentLoginUsername = ref('')
const currentLoginPassword = ref('')
const newLoginUsername = ref('')
const newLoginPassword = ref('')
const confirmLoginPassword = ref('')
const changeLoginAccountError = ref('')
const changeLoginAccountSuccess = ref('')

// 获取当前登录账号密码
const getCurrentLoginAccount = () => {
  try {
    const customUsername = localStorage.getItem('lottery_login_username')
    const customPassword = localStorage.getItem('lottery_login_password')
    return {
      username: customUsername || import.meta.env.VITE_AUTH_USERNAME || 'admin',
      password: customPassword || import.meta.env.VITE_AUTH_PASSWORD || 'admin123'
    }
  } catch (error) {
    console.error('读取登录账号密码失败:', error)
    return {
      username: import.meta.env.VITE_AUTH_USERNAME || 'admin',
      password: import.meta.env.VITE_AUTH_PASSWORD || 'admin123'
    }
  }
}

function verifyPassword() {
  const currentSystemPassword = getSystemPassword()
  if (passwordInput.value === currentSystemPassword) {
    isVerified.value = true
    passwordError.value = ''
    // 登录成功后立即清空密码
    passwordInput.value = ''
  } else {
    passwordError.value = '密码错误'
    passwordInput.value = ''
  }
}

// 修改系统设置密码
function handleChangeSystemPassword() {
  changeSystemPasswordError.value = ''
  changeSystemPasswordSuccess.value = ''

  const currentSystemPasswordValue = getSystemPassword()

  // 验证当前密码
  if (currentSystemPassword.value !== currentSystemPasswordValue) {
    changeSystemPasswordError.value = '当前密码错误'
    return
  }

  // 验证新密码
  if (!newSystemPassword.value.trim()) {
    changeSystemPasswordError.value = '请输入新密码'
    return
  }

  if (newSystemPassword.value.length < 6) {
    changeSystemPasswordError.value = '新密码至少需要6位'
    return
  }

  if (newSystemPassword.value !== confirmSystemPassword.value) {
    changeSystemPasswordError.value = '两次输入的密码不一致'
    return
  }

  if (newSystemPassword.value === currentSystemPassword.value) {
    changeSystemPasswordError.value = '新密码不能与当前密码相同'
    return
  }

  // 保存到 localStorage
  try {
    localStorage.setItem('lottery_system_password', newSystemPassword.value)
    changeSystemPasswordSuccess.value = '系统设置密码修改成功！'

    // 清空表单
    currentSystemPassword.value = ''
    newSystemPassword.value = ''
    confirmSystemPassword.value = ''

    // 3秒后关闭
    setTimeout(() => {
      showChangeSystemPassword.value = false
      changeSystemPasswordSuccess.value = ''
    }, 3000)
  } catch (error) {
    changeSystemPasswordError.value = '保存失败，请重试'
  }
}

// 修改主页登录账号密码
function handleChangeLoginAccount() {
  changeLoginAccountError.value = ''
  changeLoginAccountSuccess.value = ''

  const currentAccount = getCurrentLoginAccount()

  // 验证当前账号密码
  if (currentLoginUsername.value !== currentAccount.username || currentLoginPassword.value !== currentAccount.password) {
    changeLoginAccountError.value = '当前账号或密码错误'
    return
  }

  // 验证新账号
  if (!newLoginUsername.value.trim()) {
    changeLoginAccountError.value = '请输入新账号'
    return
  }

  // 验证新密码
  if (!newLoginPassword.value.trim()) {
    changeLoginAccountError.value = '请输入新密码'
    return
  }

  if (newLoginPassword.value.length < 6) {
    changeLoginAccountError.value = '新密码至少需要6位'
    return
  }

  if (newLoginPassword.value !== confirmLoginPassword.value) {
    changeLoginAccountError.value = '两次输入的密码不一致'
    return
  }

  if (newLoginPassword.value === currentLoginPassword.value && newLoginUsername.value === currentLoginUsername.value) {
    changeLoginAccountError.value = '新账号密码不能与当前相同'
    return
  }

  // 保存到 localStorage
  try {
    localStorage.setItem('lottery_login_username', newLoginUsername.value)
    localStorage.setItem('lottery_login_password', newLoginPassword.value)
    changeLoginAccountSuccess.value = '登录账号密码修改成功！'

    // 清空表单
    currentLoginUsername.value = ''
    currentLoginPassword.value = ''
    newLoginUsername.value = ''
    newLoginPassword.value = ''
    confirmLoginPassword.value = ''

    // 3秒后关闭
    setTimeout(() => {
      showChangeLoginAccount.value = false
      changeLoginAccountSuccess.value = ''
    }, 3000)
  } catch (error) {
    changeLoginAccountError.value = '保存失败，请重试'
  }
}

function openChangeSystemPasswordDialog() {
  showChangeSystemPassword.value = true
  changeSystemPasswordError.value = ''
  changeSystemPasswordSuccess.value = ''
  currentSystemPassword.value = ''
  newSystemPassword.value = ''
  confirmSystemPassword.value = ''
}

function closeChangeSystemPasswordDialog() {
  showChangeSystemPassword.value = false
  changeSystemPasswordError.value = ''
  changeSystemPasswordSuccess.value = ''
  currentSystemPassword.value = ''
  newSystemPassword.value = ''
  confirmSystemPassword.value = ''
}

function openChangeLoginAccountDialog() {
  showChangeLoginAccount.value = true
  changeLoginAccountError.value = ''
  changeLoginAccountSuccess.value = ''
  currentLoginUsername.value = ''
  currentLoginPassword.value = ''
  newLoginUsername.value = ''
  newLoginPassword.value = ''
  confirmLoginPassword.value = ''
}

function closeChangeLoginAccountDialog() {
  showChangeLoginAccount.value = false
  changeLoginAccountError.value = ''
  changeLoginAccountSuccess.value = ''
  currentLoginUsername.value = ''
  currentLoginPassword.value = ''
  newLoginUsername.value = ''
  newLoginPassword.value = ''
  confirmLoginPassword.value = ''
}

// 添加人员工号
const selectedPrizeId = ref('')
const uidsInput = ref('')

const currentPrize = computed(() => {
  return prizeList.value.find(p => p.id === selectedPrizeId.value)
})

function addUidsToPrize() {
  if (!selectedPrizeId.value || !uidsInput.value.trim()) {
    alert('请选择奖项并输入工号')
    return
  }

  const prize = prizeList.value.find(p => p.id === selectedPrizeId.value)
  if (!prize) return

  // 分割并清理工号
  const uidArray = uidsInput.value
    .split(/[,，\n]/)
    .map(uid => uid.trim())
    .filter(uid => uid.length > 0)

  // 去重
  const uniqueUids = [...new Set(uidArray)]

  // 验证工号是否存在
  const invalidUids = uniqueUids.filter(uid => !allPersonList.value.some(p => p.uid === uid))

  if (invalidUids.length > 0) {
    alert(`以下工号不存在：\n${invalidUids.join(', ')}`)
    return
  }

  // 添加到奖项的特殊人员列表
  if (!prize.specialUsers) {
    prize.specialUsers = []
  }

  // 合并并去重
  prize.specialUsers = [...new Set([...prize.specialUsers, ...uniqueUids])]

  // 更新配置
  prizeConfig.updatePrizeConfig(prize)

  // 清空输入
  uidsInput.value = ''

  alert(`成功添加 ${uniqueUids.length} 个工号到 ${prize.name}`)
}

function removeUidFromPrize(prize: IPrizeConfig, uid: string) {
  if (prize.specialUsers) {
    prize.specialUsers = prize.specialUsers.filter(u => u !== uid)
    prizeConfig.updatePrizeConfig(prize)
  }
}

function clearAllUidsFromPrize(prize: IPrizeConfig) {
  if (confirm(`确定清空 ${prize.name} 的所有人员吗？`)) {
    prize.specialUsers = []
    prizeConfig.updatePrizeConfig(prize)
  }
}

function toggleSpecialMode(prize: IPrizeConfig) {
  prize.isSpecial = !prize.isSpecial
  prizeConfig.updatePrizeConfig(prize)
}

// 获取已指定人员的详细信息
function getPersonDetails(prize: IPrizeConfig) {
  if (!prize.specialUsers || prize.specialUsers.length === 0) return []

  return prize.specialUsers.map(uid => {
    const person = allPersonList.value.find(p => p.uid === uid)
    return person ? { uid, name: person.name } : { uid, name: '未知' }
  })
}
</script>

<template>
  <div class="min-h-screen">
    <!-- 未验证时显示密码输入 -->
    <div v-if="!isVerified" class="flex items-center justify-center min-h-[400px]">
      <div class="w-full max-w-md p-8 bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-700 shadow-2xl">
        <h2 class="mb-6 text-2xl font-bold text-center text-white">系统设置</h2>
        <div class="space-y-4">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-300">请输入访问密码</label>
            <input
              v-model="passwordInput"
              type="password"
              placeholder="请输入密码"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              class="w-full px-4 py-3 text-white bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keyup.enter="verifyPassword"
            >
          </div>
          <div v-if="passwordError" class="text-red-400 text-sm">
            {{ passwordError }}
          </div>
          <button
            @click="verifyPassword"
            class="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
          >
            确认访问
          </button>
        </div>
      </div>
    </div>

    <!-- 验证后显示高级设置界面 -->
    <div v-else class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-white">高级设置</h2>
        <div class="flex gap-2">
          <button
            @click="openChangeSystemPasswordDialog"
            class="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            🔑 修改系统设置密码
          </button>
          <button
            @click="openChangeLoginAccountDialog"
            class="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            📝 修改登录账号密码
          </button>
          <button
            @click="isVerified = false"
            class="px-4 py-2 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            退出
          </button>
        </div>
      </div>

      <div class="p-6 bg-gray-800/60 rounded-xl backdrop-blur-sm border border-gray-700">
        <h3 class="mb-4 text-lg font-semibold text-white">人员管理</h3>
        <p class="mb-4 text-sm text-gray-400">为各奖项单独设置参与人员，开启后将只从指定人员中抽取</p>

        <!-- 添加人员区域 -->
        <div class="p-4 mb-6 bg-gray-900/50 rounded-lg">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">选择奖项</label>
              <select
                v-model="selectedPrizeId"
                class="w-full px-4 py-2 text-white bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择奖项</option>
                <option v-for="prize in prizeList" :key="prize.id" :value="prize.id">
                  {{ prize.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">输入工号</label>
              <textarea
                v-model="uidsInput"
                placeholder="请输入工号，多个工号用逗号或换行分隔&#10;例如：U100156001,U100156002"
                rows="3"
                class="w-full px-4 py-2 text-white bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>
          </div>
          <button
            @click="addUidsToPrize"
            class="mt-4 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            添加人员
          </button>
        </div>

        <!-- 奖项列表 -->
        <div class="space-y-4">
          <div
            v-for="prize in prizeList"
            :key="prize.id"
            class="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <h4 class="text-lg font-semibold text-white">{{ prize.name }}</h4>
                <span class="px-3 py-1 text-xs rounded-full"
                  :class="prize.isSpecial ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'"
                >
                  {{ prize.isSpecial ? '已开启' : '已关闭' }}
                </span>
              </div>
              <div class="flex gap-2">
                <button
                  @click="toggleSpecialMode(prize)"
                  class="px-3 py-1.5 text-sm rounded-lg transition-colors"
                  :class="prize.isSpecial ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'"
                >
                  {{ prize.isSpecial ? '关闭模式' : '开启模式' }}
                </button>
                <button
                  v-if="prize.specialUsers && prize.specialUsers.length > 0"
                  @click="clearAllUidsFromPrize(prize)"
                  class="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  清空
                </button>
              </div>
            </div>

            <!-- 已指定人员列表 -->
            <div v-if="prize.specialUsers && prize.specialUsers.length > 0" class="mt-3">
              <div class="text-sm text-gray-400 mb-2">
                已设置 {{ prize.specialUsers.length }} 人
              </div>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="person in getPersonDetails(prize)"
                  :key="person.uid"
                  class="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 rounded-lg border border-gray-600"
                >
                  <span class="text-blue-400 font-mono">{{ person.uid }}</span>
                  <span class="text-gray-300">{{ person.name }}</span>
                  <button
                    @click="removeUidFromPrize(prize, person.uid)"
                    class="ml-2 text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="mt-3 text-sm text-gray-500">
              暂无设置人员
            </div>
          </div>
        </div>
      </div>

      <!-- 说明 -->
      <div class="p-4 bg-gray-800/40 rounded-xl border border-gray-700">
        <h4 class="mb-2 font-semibold text-gray-300">使用说明</h4>
        <ul class="space-y-1 text-sm text-gray-400 list-disc list-inside">
          <li>开启模式后，该奖项将只从已设置的人员中抽取</li>
          <li>支持批量添加工号，用逗号或换行分隔</li>
          <li>已中奖人员会自动从所有奖项的特殊名单中移除</li>
          <li>关闭模式后，该奖项将恢复普通抽奖模式</li>
        </ul>
      </div>
    </div>

    <!-- 修改系统设置密码对话框 -->
    <Transition name="fade">
      <div
        v-if="showChangeSystemPassword"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        <div class="w-full max-w-md p-8 bg-gray-800 rounded-xl border border-gray-600 shadow-2xl">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-white">🔑 修改系统设置密码</h3>
            <button
              @click="closeChangeSystemPasswordDialog"
              class="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">当前密码</label>
              <input
                v-model="currentSystemPassword"
                type="password"
                placeholder="请输入当前密码"
                autocomplete="current-password"
                class="w-full px-4 py-3 text-white bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">新密码</label>
              <input
                v-model="newSystemPassword"
                type="password"
                placeholder="请输入新密码（至少6位）"
                autocomplete="new-password"
                class="w-full px-4 py-3 text-white bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">确认新密码</label>
              <input
                v-model="confirmSystemPassword"
                type="password"
                placeholder="请再次输入新密码"
                autocomplete="new-password"
                class="w-full px-4 py-3 text-white bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
            </div>

            <div v-if="changeSystemPasswordError" class="p-3 text-sm text-red-400 bg-red-900/20 rounded-lg border border-red-700">
              {{ changeSystemPasswordError }}
            </div>

            <div v-if="changeSystemPasswordSuccess" class="p-3 text-sm text-green-400 bg-green-900/20 rounded-lg border border-green-700">
              {{ changeSystemPasswordSuccess }}
            </div>

            <div class="flex gap-3 pt-2">
              <button
                @click="closeChangeSystemPasswordDialog"
                class="flex-1 py-3 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
              <button
                @click="handleChangeSystemPassword"
                class="flex-1 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 修改主页登录账号密码对话框 -->
    <Transition name="fade">
      <div
        v-if="showChangeLoginAccount"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        <div class="w-full max-w-md p-8 bg-gray-800 rounded-xl border border-blue-600 shadow-2xl">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-white">📝 修改登录账号密码</h3>
            <button
              @click="closeChangeLoginAccountDialog"
              class="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">当前账号</label>
              <input
                v-model="currentLoginUsername"
                type="text"
                placeholder="请输入当前账号"
                autocomplete="username"
                class="w-full px-4 py-3 text-white bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">当前密码</label>
              <input
                v-model="currentLoginPassword"
                type="password"
                placeholder="请输入当前密码"
                autocomplete="current-password"
                class="w-full px-4 py-3 text-white bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">新账号</label>
              <input
                v-model="newLoginUsername"
                type="text"
                placeholder="请输入新账号"
                autocomplete="new-username"
                class="w-full px-4 py-3 text-white bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">新密码</label>
              <input
                v-model="newLoginPassword"
                type="password"
                placeholder="请输入新密码（至少6位）"
                autocomplete="new-password"
                class="w-full px-4 py-3 text-white bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">确认新密码</label>
              <input
                v-model="confirmLoginPassword"
                type="password"
                placeholder="请再次输入新密码"
                autocomplete="new-password"
                class="w-full px-4 py-3 text-white bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div v-if="changeLoginAccountError" class="p-3 text-sm text-red-400 bg-red-900/20 rounded-lg border border-red-700">
              {{ changeLoginAccountError }}
            </div>

            <div v-if="changeLoginAccountSuccess" class="p-3 text-sm text-green-400 bg-green-900/20 rounded-lg border border-green-700">
              {{ changeLoginAccountSuccess }}
            </div>

            <div class="flex gap-3 pt-2">
              <button
                @click="closeChangeLoginAccountDialog"
                class="flex-1 py-3 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
              <button
                @click="handleChangeLoginAccount"
                class="flex-1 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 暗色主题 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
