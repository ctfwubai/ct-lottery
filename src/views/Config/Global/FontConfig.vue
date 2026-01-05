<script setup lang='ts'>
import type { IFont } from '@/types/storeType'
import useStore from '@/store'
import { readFileData } from '@/utils/file'
import localforage from 'localforage'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'

// 类型定义
interface UploadProgress {
  current: number
  total: number
}

const { t } = useI18n()
const globalConfig = useStore().globalConfig
const { getTitleConfig, getFontList: localFontList } = storeToRefs(globalConfig)

const limitType = ref('.ttf,.otf,.woff,.woff2')
const fontUploadToast = ref(0) // 0是不显示，1是成功，2是失败,3是不是字体文件
const uploadProgress = ref<UploadProgress>({ current: 0, total: 0 }) // 上传进度
const projectFonts = ref<IFont[]>([]) // 项目文件夹中的字体列表

// 标题配置
const titleFontSize = ref(getTitleConfig.value.fontSize)
const titleColor = ref('#ffffff')
const previewText = ref('预览文字 ABCD 1234')

// 创建IndexedDB存储实例
const fontDbStore = localforage.createInstance({
  name: 'fontStore',
})

// 动态加载字体
function loadFont(fontFamily: string, fontUrl: string, fileName: string) {
  if (!fontUrl) return

  // 根据文件扩展名确定字体格式
  const fileNameLower = fileName.toLowerCase()
  let format = 'truetype' // 默认 ttf

  if (fileNameLower.endsWith('.otf')) {
    format = 'opentype'
  } else if (fileNameLower.endsWith('.woff')) {
    format = 'woff'
  } else if (fileNameLower.endsWith('.woff2')) {
    format = 'woff2'
  }

  const style = document.createElement('style')
  style.textContent = `
    @font-face {
      font-family: '${fontFamily}';
      src: url('${fontUrl}') format('${format}');
      font-weight: normal;
      font-style: normal;
    }
  `
  document.head.appendChild(style)
}

// 应用字体到标题
function applyTitleFont(font: IFont) {
  globalConfig.setTitleFontFamily(font.name, font.url)
  // 传递完整的文件名以正确识别格式
  let fileName = ''
  if (font.id.includes('+')) {
    fileName = font.id.split('+')[1]
  } else if (font.id.includes('-')) {
    const parts = font.id.split('+')
    fileName = parts[1]
  } else {
    fileName = font.name
  }
  loadFont(font.name, font.url, fileName)
}

// 预览字体
function previewFont(font: IFont) {
  // 传递完整的文件名以正确识别格式
  let fileName = ''
  if (font.id.includes('+')) {
    fileName = font.id.split('+')[1]
  } else if (font.id.includes('-')) {
    const parts = font.id.split('+')
    fileName = parts[1]
  } else {
    fileName = font.name
  }
  loadFont(font.name, font.url, fileName)
}

// 处理文件上传（支持批量上传）
async function handleFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files as FileList

  if (files.length === 0) return

  uploadProgress.value = { current: 0, total: files.length }
  fontUploadToast.value = 0 // 重置提示

  const uploadPromises: Promise<void>[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileName = file.name.toLowerCase()

    // 验证字体文件（通过扩展名而不是 MIME 类型）
    const isFont = fileName.endsWith('.ttf')
      || fileName.endsWith('.otf')
      || fileName.endsWith('.woff')
      || fileName.endsWith('.woff2')

    if (!isFont) {
      continue // 跳过非字体文件
    }

    const { dataUrl } = await readFileData(file)
    const fontName = fileName.replace(/\.(ttf|otf|woff|woff2)$/, '') // 移除扩展名
    const fontId = `${new Date().getTime().toString()}-${i}+${fileName}`

    const uploadPromise = fontDbStore.setItem(fontId, dataUrl)
      .then(() => {
        globalConfig.addFont({
          id: fontId,
          name: fontName,
          url: dataUrl, // 直接存储 dataUrl
        })
        uploadProgress.value.current++
      })

    uploadPromises.push(uploadPromise)
  }

  // 等待所有文件上传完成
  Promise.all(uploadPromises)
    .then(() => {
      if (uploadProgress.value.current > 0) {
        fontUploadToast.value = 1 // 上传成功
      } else {
        fontUploadToast.value = 3 // 没有有效的字体文件
      }
    })
    .catch(() => {
      fontUploadToast.value = 2 // 上传失败
    })
}

// 从IndexedDB加载字体
async function getFontDbStore() {
  const keys = await fontDbStore.keys()
  if (keys.length > 0) {
    for (const key of keys) {
      const fontUrl = await fontDbStore.getItem(key) as string
      // 兼容新旧文件名格式
      let fileName = ''
      let fontName = ''

      if (key.includes('+')) {
        // 旧格式: timestamp+filename
        fileName = key.split('+')[1]
        fontName = fileName.toLowerCase().replace(/\.(ttf|otf|woff|woff2)$/, '')
      } else if (key.includes('-')) {
        // 新格式: timestamp-index+filename
        const parts = key.split('+')
        fileName = parts[1]
        fontName = fileName.toLowerCase().replace(/\.(ttf|otf|woff|woff2)$/, '')
      } else {
        // 直接文件名
        fileName = key
        fontName = key.toLowerCase().replace(/\.(ttf|otf|woff|woff2)$/, '')
      }

      const font = {
        id: key,
        name: fontName,
        url: fontUrl,
      }
      globalConfig.addFont(font)

      // 如果是当前使用的字体,立即加载
      if (getTitleConfig.value.fontFamily === fontName) {
        loadFont(fontName, fontUrl, fileName)
        globalConfig.setTitleFontFamily(fontName, fileName)
      }
    }
  }
}

// 删除字体
function removeFont(item: IFont) {
  if (item.url === 'Storage') {
    fontDbStore.removeItem(item.id).then(() => {
      globalConfig.removeFont(item.id)
    })
  }
  globalConfig.removeFont(item.id)

  // 如果删除的是当前使用的字体，重置为默认字体
  if (getTitleConfig.value.fontFamily === item.name) {
    globalConfig.setTitleFontFamily('font-mono', '')
  }
}

// 从项目文件夹加载字体列表（从服务器 API 获取）
async function loadProjectFonts() {
  try {
    const response = await fetch('http://localhost:3001/api/fonts')

    if (!response.ok) {
      console.warn('Font API not available, falling back to fonts.json')
      // 回退到读取 fonts.json
      const fallbackResponse = await fetch('/fonts/fonts.json')
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json()
        if (data.fonts && Array.isArray(data.fonts)) {
          projectFonts.value = data.fonts.map((font: any) => ({
            id: font.id,
            name: font.name,
            url: font.url,
          }))
        }
      }
      return
    }

    const data = await response.json()

    if (data.fonts && Array.isArray(data.fonts)) {
      projectFonts.value = data.fonts.map((font: any) => ({
        id: font.id,
        name: font.name,
        url: font.url,
      }))

      console.log(`Loaded ${projectFonts.value.length} project fonts from server`)
    }
  } catch (error) {
    console.error('Failed to load fonts:', error)
    projectFonts.value = []
  }
}

// 上传字体到服务器
async function uploadFontToServer(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const arrayBuffer = reader.result as ArrayBuffer

      try {
        const response = await fetch('http://localhost:3001/api/fonts/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-File-Name': file.name,
          },
          body: arrayBuffer,
        })

        if (response.ok) {
          const result = await response.json()
          console.log('Font uploaded successfully:', result)
          await loadProjectFonts() // 刷新字体列表
          resolve(true)
        } else {
          console.error('Upload failed with status:', response.status)
          resolve(false)
        }
      } catch (error) {
        console.error('Failed to upload font:', error)
        resolve(false)
      }
    }
    reader.onerror = () => {
      console.error('FileReader error')
      resolve(false)
    }
    reader.readAsArrayBuffer(file)
  })
}

// 从服务器删除字体
async function deleteFontFromServer(fileName: string) {
  try {
    const response = await fetch(`http://localhost:3001/api/fonts/${fileName}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      console.log('Font deleted successfully:', fileName)
      await loadProjectFonts() // 刷新字体列表
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to delete font:', error)
    return false
  }
}

// 上传单个字体文件
async function handleFontUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const ext = file.name.toLowerCase().match(/\.(ttf|otf|woff|woff2)$/)
  if (!ext) {
    alert(t('error.notFont'))
    return
  }

  const success = await uploadFontToServer(file)
  if (success) {
    alert(t('error.uploadSuccess'))
  } else {
    alert(t('error.uploadFail'))
  }

  (e.target as HTMLInputElement).value = '' // 重置 input
}

// 监听标题字体大小变化
watch(titleFontSize, (val) => {
  globalConfig.setTitleFontSize(val)
}, { deep: true })

// 页面加载时获取字体列表
onMounted(() => {
  getFontDbStore()
  loadProjectFonts()

  // 加载当前使用的字体
  if (getTitleConfig.value.fontUrl) {
    const fileName = getTitleConfig.value.fontUrl
    loadFont(getTitleConfig.value.fontFamily, getTitleConfig.value.fontUrl, fileName)
  }
})
</script>

<template>
  <div class="flex flex-col w-full gap-4 p-6 fontConfig">
    <!-- 标题配置 -->
    <div class="p-4 mb-4 border rounded-lg border-base-300">
      <h3 class="mb-4 text-lg font-bold">{{ t('config.titleConfig') }}</h3>

      <div class="flex flex-wrap gap-4">
        <!-- 标题字体大小 -->
        <label class="w-full max-w-xs form-control">
          <div class="label">
            <span class="label-text">{{ t('config.titleFontSize') }}</span>
          </div>
          <input
            v-model="titleFontSize" type="number" min="20" max="200"
            class="w-full max-w-xs input input-bordered"
            :placeholder="t('config.titleFontSizePlaceholder')"
          >
        </label>

        <!-- 标题颜色 -->
        <label class="w-full max-w-xs form-control">
          <div class="label">
            <span class="label-text">{{ t('config.titleColor') }}</span>
          </div>
          <ColorPicker v-model="titleColor" v-model:pure-color="titleColor" />
        </label>
      </div>
    </div>

    <!-- 字体文件管理 -->
    <div class="p-4 border rounded-lg border-base-300">
      <h3 class="mb-4 text-lg font-bold">{{ t('config.fontManage') }}</h3>

      <!-- 上传按钮 -->
      <div class="flex flex-col gap-2 mb-4">
        <div class="flex items-center gap-2 flex-wrap">
          <label for="fontUpload">
            <input
              id="fontUpload" type="file" class="hidden" style="display: none"
              :accept="limitType"
              @change="handleFontUpload"
            >
            <span class="btn btn-primary btn-sm">{{ t('button.uploadFont') }}</span>
          </label>

          <button
            class="btn btn-secondary btn-sm"
            @click="loadProjectFonts"
          >
            {{ t('button.refreshFonts') }}
          </button>

          <span class="text-sm text-gray-500">{{ t('config.fontSupport') }}: .ttf, .otf, .woff, .woff2</span>
        </div>

        <span class="text-xs text-info">{{ t('config.projectFontsAutoTip') }}</span>

        <!-- 项目文件夹说明 -->
        <div class="mt-3 p-3 bg-base-200 rounded-lg">
          <div class="flex items-start gap-2">
            <span class="text-sm font-semibold">{{ t('config.projectFonts') }}:</span>
            <span class="text-sm text-gray-600 flex-1">
              {{ t('config.projectFontsTip') }}
              <code class="bg-base-300 px-1 rounded">/public/fonts/</code>
            </span>
          </div>
          <div class="mt-2 text-xs text-gray-500">
            {{ t('config.projectFontsAuto') }}
          </div>
          <div class="mt-2 text-xs text-info">
            💡 {{ t('config.projectFontsUpdateTip') }}
          </div>
        </div>

        <!-- 上传进度条 -->
        <div v-if="uploadProgress.total > 0" class="mt-2">
          <div class="flex items-center justify-between text-sm mb-1">
            <span class="flex items-center gap-2">
              <span class="loading loading-spinner loading-sm"></span>
              <span>{{ t('button.uploading') }}</span>
            </span>
            <span>{{ uploadProgress.current }} / {{ uploadProgress.total }}</span>
          </div>
          <div class="w-full bg-base-200 rounded-full h-2.5 overflow-hidden">
            <div
              class="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
              :style="{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }"
            ></div>
          </div>
          <div class="text-xs text-right mt-1 text-gray-500">
            {{ Math.round((uploadProgress.current / uploadProgress.total) * 100) }}%
          </div>
        </div>
      </div>

      <!-- 字体列表 -->
      <div v-if="localFontList.length > 0" class="space-y-2">
        <div
          v-for="item in localFontList"
          :key="item.id"
          class="flex items-center justify-between p-3 border rounded-lg border-base-300"
          :class="{ 'border-primary': getTitleConfig.fontFamily === item.name }"
        >
          <div class="flex-1">
            <span class="font-medium">{{ item.name }}</span>
            <span
              v-if="getTitleConfig.fontFamily === item.name"
              class="ml-2 text-xs text-primary"
            >
              {{ t('config.currentFont') }}
            </span>
          </div>

          <div class="flex gap-2">
            <button
              class="btn btn-xs btn-outline"
              @click="previewFont(item)"
            >
              {{ t('button.preview') }}
            </button>
            <button
              class="btn btn-xs btn-outline"
              :disabled="getTitleConfig.fontFamily === item.name"
              @click="applyTitleFont(item)"
            >
              {{ t('button.apply') }}
            </button>
            <button
              class="btn btn-xs btn-error btn-outline"
              @click="removeFont(item)"
            >
              {{ t('button.delete') }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="p-8 text-center text-gray-500">
        {{ t('config.noFont') }}
      </div>

      <!-- 项目文件夹字体 -->
      <div v-if="projectFonts.length > 0" class="mt-4">
        <h4 class="mb-2 text-sm font-semibold text-gray-600">{{ t('config.projectFonts') }}</h4>
        <div class="space-y-2">
          <div
            v-for="item in projectFonts"
            :key="item.id"
            class="flex items-center justify-between p-3 border rounded-lg border-base-300 bg-base-100"
            :class="{ 'border-primary border-2': getTitleConfig.fontFamily === item.name }"
          >
            <div class="flex-1">
              <span class="font-medium">{{ item.name }}</span>
              <span class="ml-2 text-xs badge badge-info">{{ t('config.fromFolder') }}</span>
              <span
                v-if="getTitleConfig.fontFamily === item.name"
                class="ml-2 text-xs text-primary"
              >
                {{ t('config.currentFont') }}
              </span>
            </div>

          <div class="flex gap-2">
            <button
              class="btn btn-xs btn-outline"
              @click="previewFont(item)"
            >
              {{ t('button.preview') }}
            </button>
            <button
              class="btn btn-xs btn-primary"
              :disabled="getTitleConfig.fontFamily === item.name"
              @click="applyTitleFont(item)"
            >
              {{ t('button.apply') }}
            </button>
            <button
              class="btn btn-xs btn-error btn-outline"
              @click="deleteFontFromServer(item.id.split('-')[1])"
            >
              {{ t('button.delete') }}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 字体预览区域 -->
    <div class="p-4 border rounded-lg border-base-300">
      <div class="mb-4">
        <h3 class="text-lg font-bold">{{ t('config.fontPreview') }}</h3>
        <span class="text-sm text-gray-500">{{ t('config.fontPreviewTip') }}</span>
      </div>

      <!-- 预览文本输入 -->
      <div class="mb-4">
        <label class="form-control">
          <div class="label">
            <span class="label-text">{{ t('config.previewText') }}</span>
          </div>
          <input
            v-model="previewText"
            type="text"
            class="w-full input input-bordered"
            :placeholder="t('config.previewTextPlaceholder')"
          >
        </label>
      </div>

      <!-- 预览显示 -->
      <div class="p-6 bg-base-200 rounded-lg min-h-[120px] flex items-center justify-center">
        <div
          class="text-center transition-all duration-300"
          :style="{
            fontFamily: getTitleConfig.fontFamily,
            fontSize: `${titleFontSize}px`,
            color: titleColor
          }"
        >
          {{ previewText }}
        </div>
      </div>
    </div>

    <!-- 上传状态提示 -->
    <div class="toast toast-top toast-end">
      <div v-if="fontUploadToast === 1" class="alert alert-success">
        <span>{{ t('error.uploadSuccess') }}</span>
      </div>
      <div v-if="fontUploadToast === 2" class="alert alert-error">
        <span>{{ t('error.uploadFail') }}</span>
      </div>
      <div v-if="fontUploadToast === 3" class="alert alert-error">
        <span>{{ t('error.notFont') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fontConfig {
  max-height: 80vh;
  overflow-y: auto;
}
</style>
