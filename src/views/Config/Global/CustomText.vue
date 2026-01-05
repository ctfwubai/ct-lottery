<script setup lang='ts'>
import useStore from '@/store'
import { storeToRefs } from 'pinia'
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const globalConfig = useStore().globalConfig

// 自定义文字配置
const customText1 = ref('')
const customText2 = ref('')

// 自定义链接配置
const customUrl = ref('')

onMounted(() => {
  // 从存储中加载配置
  const storedText1 = localStorage.getItem('customText1')
  const storedText2 = localStorage.getItem('customText2')
  const storedUrl = localStorage.getItem('customUrl')

  if (storedText1) customText1.value = storedText1
  if (storedText2) customText2.value = storedText2
  if (storedUrl) customUrl.value = storedUrl

  // 如果没有存储的值，设置默认值
  if (!storedText1) customText1.value = '行有不得，反求诸己'
  if (!storedText2) customText2.value = '破山中贼易，破心中贼难'
  if (!storedUrl) customUrl.value = 'https://github.com/ctfwubai/ct-lottery'
})

// 监听变化并保存
watch(customText1, (val) => {
  localStorage.setItem('customText1', val)
})

watch(customText2, (val) => {
  localStorage.setItem('customText2', val)
})

watch(customUrl, (val) => {
  localStorage.setItem('customUrl', val)
})

function resetToDefault() {
  customText1.value = '行有不得，反求诸己'
  customText2.value = '破山中贼易，破心中贼难'
  customUrl.value = 'https://github.com/ctfwubai/ct-lottery'
}
</script>

<template>
  <div>
    <h2>自定义文字和链接</h2>

    <div class="mb-6">
      <div class="alert alert-info" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-6 h-6 stroke-current shrink-0">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>在此页面可以自定义显示的文字和相关链接</span>
      </div>
    </div>

    <div class="space-y-6">
      <!-- 自定义文字1 -->
      <div class="w-full max-w-xs form-control">
        <div class="label">
          <span class="label-text">自定义文字 1</span>
        </div>
        <input
          v-model="customText1"
          type="text"
          placeholder="请输入自定义文字"
          class="w-full max-w-xs input input-bordered"
        />
        <div class="text-sm text-gray-500 mt-1">
          第一行显示的文字
        </div>
      </div>

      <!-- 自定义文字2 -->
      <div class="w-full max-w-xs form-control">
        <div class="label">
          <span class="label-text">自定义文字 2</span>
        </div>
        <input
          v-model="customText2"
          type="text"
          placeholder="请输入自定义文字"
          class="w-full max-w-xs input input-bordered"
        />
        <div class="text-sm text-gray-500 mt-1">
          第二行显示的文字
        </div>
      </div>

      <!-- 自定义链接 -->
      <div class="w-full max-w-xs form-control">
        <div class="label">
          <span class="label-text">自定义链接</span>
        </div>
        <input
          v-model="customUrl"
          type="url"
          placeholder="https://example.com"
          class="w-full max-w-xs input input-bordered"
        />
        <div class="text-sm text-gray-500 mt-1">
          页面底部的跳转链接地址
        </div>
      </div>

      <!-- 重置按钮 -->
      <div class="flex gap-3 mt-4">
        <button class="btn btn-info btn-sm" @click="resetToDefault">
          恢复默认设置
        </button>
      </div>
    </div>

    <!-- 预览区域 -->
    <div class="mt-8 p-6 border rounded-lg">
      <h3 class="mb-4 text-lg font-semibold">预览效果</h3>
      <div class="flex flex-col items-center justify-center space-y-4">
        <div class="text-xl font-bold text-center">{{ customText1 }}</div>
        <div class="text-xl font-bold text-center">{{ customText2 }}</div>
        <a
          :href="customUrl"
          target="_blank"
          class="text-blue-500 hover:text-blue-700 underline"
        >
          {{ customUrl }}
        </a>
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped></style>
