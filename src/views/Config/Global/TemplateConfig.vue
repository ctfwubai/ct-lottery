<script setup lang='ts'>
import useStore from '@/store'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const globalConfig = useStore().globalConfig
const personConfig = useStore().personConfig
const prizeConfig = useStore().prizeConfig

const saveToast = ref(0) // 0是不显示，1是成功，2是失败
const loadToast = ref(0)
const templateName = ref('')
const projectTemplates = ref<Array<{ name: string, fileName: string, createdAt: string, size: number }>>([])

// 收集当前所有配置
function collectConfigData(name: string) {
  return {
    version: '1.0',
    name: name.trim(),
    createdAt: new Date().toISOString(),
    globalConfig: globalConfig.$state.globalConfig,
    personConfig: personConfig.$state.personConfig,
    prizeConfig: prizeConfig.$state.prizeConfig,
  }
}

// 恢复配置数据
function restoreConfigData(configData: any) {
  // 恢复全局配置
  globalConfig.$patch({
    globalConfig: configData.globalConfig,
  })

  // 恢复人员配置
  if (configData.personConfig) {
    personConfig.$patch({
      personConfig: configData.personConfig,
    })
  }

  // 恢复奖品配置
  if (configData.prizeConfig) {
    prizeConfig.$patch({
      prizeConfig: configData.prizeConfig,
    })
  }
}

// 1. 快速保存：保存到项目文件夹 public/templates
async function quickSaveTemplate() {
  const defaultName = '快速保存'
  const timestamp = new Date().toISOString().slice(0, 10)
  const name = `${defaultName}-${timestamp}`

  try {
    const configData = collectConfigData(name)

    const response = await fetch('http://localhost:3001/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, data: configData }),
    })

    if (response.ok) {
      saveToast.value = 1
      await loadProjectTemplates() // 刷新模板列表
    } else {
      throw new Error('Save failed')
    }
  } catch (error) {
    console.error('Quick save failed:', error)
    saveToast.value = 2
  }

  setTimeout(() => {
    saveToast.value = 0
  }, 3000)
}

// 2. 另存为：弹出文件选择对话框保存到本地
async function saveAsTemplate() {
  if (!templateName.value.trim()) {
    alert(t('config.enterTemplateName'))
    return
  }

  try {
    const configData = collectConfigData(templateName.value)

    // 创建 Blob 并触发下载
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `template-${templateName.value.trim()}-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    saveToast.value = 1
  } catch (error) {
    console.error('Save as failed:', error)
    saveToast.value = 2
  }

  setTimeout(() => {
    saveToast.value = 0
  }, 3000)
}

// 3. 导入本地模板文件
function importLocalTemplate(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const content = e.target?.result as string
      const configData = JSON.parse(content)

      // 验证数据格式
      if (!configData.version || !configData.globalConfig) {
        alert(t('config.invalidTemplate'))
        return
      }

      // 确认导入
      if (!confirm(t('config.confirmImport').replace('{name}', configData.name || t('config.template')))) {
        return
      }

      restoreConfigData(configData)
      loadToast.value = 1
      alert(t('config.importSuccess').replace('{name}', configData.name || t('config.template')))
    } catch (error) {
      console.error('Import failed:', error)
      loadToast.value = 2
      alert(t('config.importFailed'))
    }
  }

  reader.readAsText(file)
  input.value = '' // 重置 input

  setTimeout(() => {
    loadToast.value = 0
  }, 3000)
}

// 加载项目模板列表
async function loadProjectTemplates() {
  try {
    const response = await fetch('http://localhost:3001/api/templates')

    if (response.ok) {
      const data = await response.json()
      if (data.templates && Array.isArray(data.templates)) {
        projectTemplates.value = data.templates
      }
    }
  } catch (error) {
    console.error('Failed to load templates:', error)
    projectTemplates.value = []
  }
}

// 使用项目模板
async function applyProjectTemplate(fileName: string) {
  try {
    const response = await fetch(`http://localhost:3001/api/templates/${fileName}`)

    if (response.ok) {
      const configData = await response.json()

      // 确认导入
      if (!confirm(t('config.confirmImport').replace('{name}', configData.name || t('config.template')))) {
        return
      }

      restoreConfigData(configData)
      loadToast.value = 1
      alert(t('config.importSuccess').replace('{name}', configData.name || t('config.template')))
    }
  } catch (error) {
    console.error('Failed to load template:', error)
    loadToast.value = 2
    alert(t('config.importFailed'))
  }

  setTimeout(() => {
    loadToast.value = 0
  }, 3000)
}

// 删除项目模板
async function deleteProjectTemplate(fileName: string) {
  if (!confirm(t('config.confirmDeleteTemplate'))) {
    return
  }

  try {
    const response = await fetch(`http://localhost:3001/api/templates/${fileName}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      await loadProjectTemplates() // 刷新列表
      saveToast.value = 1
    }
  } catch (error) {
    console.error('Failed to delete template:', error)
    saveToast.value = 2
  }

  setTimeout(() => {
    saveToast.value = 0
  }, 3000)
}

// 4. 恢复初始化（重置为默认配置）
function resetToDefault() {
  if (!confirm(t('config.confirmReset'))) {
    return
  }

  try {
    // 清空所有配置
    globalConfig.$reset()
    personConfig.$reset()
    prizeConfig.$reset()

    loadToast.value = 1
    alert(t('config.resetSuccess'))
  } catch (error) {
    console.error('Reset failed:', error)
    loadToast.value = 2
  }

  setTimeout(() => {
    loadToast.value = 0
  }, 3000)
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 格式化时间
function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadProjectTemplates()
})
</script>

<template>
  <div class="flex flex-col w-full gap-4 p-6 templateConfig">
    <div class="p-4 border rounded-lg border-base-300">
      <h3 class="mb-4 text-lg font-bold">{{ t('config.templateManage') }}</h3>

      <!-- 快速保存和另存为 -->
      <div class="mb-6">
        <h4 class="mb-3 font-semibold">{{ t('config.exportTemplate') }}</h4>
        <p class="mb-3 text-sm text-gray-600">{{ t('config.exportTemplateDesc') }}</p>

        <div class="flex flex-wrap gap-3">
          <button class="btn btn-primary btn-sm" @click="quickSaveTemplate">
            {{ t('config.quickSave') }}
          </button>
          <div class="flex gap-2">
            <input
              v-model="templateName"
              type="text"
              class="input input-bordered input-sm w-48"
              :placeholder="t('config.templateNamePlaceholder')"
            >
            <button class="btn btn-outline btn-sm" @click="saveAsTemplate">
              {{ t('config.saveAs') }}
            </button>
          </div>
        </div>

        <div class="mt-3 p-3 bg-base-200 rounded-lg">
          <div class="text-sm">
            <span class="font-semibold text-primary">💡 提示：</span>
            <span class="text-gray-600">
              <strong>{{ t('config.quickSave') }}</strong>：自动保存到 <code>public/templates/</code> 文件夹<br>
              <strong>{{ t('config.saveAs') }}</strong>：保存到您选择的本地路径
            </span>
          </div>
        </div>

        <div v-if="saveToast === 1" class="mt-3 alert alert-success alert-sm">
          <span>{{ t('config.saveSuccess') }}</span>
        </div>
        <div v-if="saveToast === 2" class="mt-3 alert alert-error alert-sm">
          <span>{{ t('config.saveFailed') }}</span>
        </div>
      </div>

      <hr class="my-4 border-gray-300">

      <!-- 项目模板列表 -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-semibold">{{ t('config.projectTemplates') }}</h4>
          <button class="btn btn-xs btn-outline btn-secondary" @click="loadProjectTemplates">
            {{ t('button.refresh') }}
          </button>
        </div>
        <p class="mb-3 text-sm text-gray-600">
          存储路径：<code>public/templates/</code>
        </p>

        <div v-if="projectTemplates.length > 0" class="space-y-2">
          <div
            v-for="template in projectTemplates"
            :key="template.fileName"
            class="flex items-center justify-between p-3 border rounded-lg border-base-300 bg-base-100"
          >
            <div class="flex-1">
              <div class="font-medium">{{ template.name }}</div>
              <div class="text-xs text-gray-500">
                {{ formatTime(template.createdAt) }} · {{ formatFileSize(template.size) }}
              </div>
            </div>
            <div class="flex gap-2">
              <button
                class="btn btn-xs btn-primary"
                @click="applyProjectTemplate(template.fileName)"
              >
                {{ t('button.apply') }}
              </button>
              <button
                class="btn btn-xs btn-error btn-outline"
                @click="deleteProjectTemplate(template.fileName)"
              >
                {{ t('button.delete') }}
              </button>
            </div>
          </div>
        </div>
        <div v-else class="p-8 text-center text-gray-500 border rounded-lg border-base-300 bg-base-100">
          {{ t('config.noTemplate') }}
        </div>
      </div>

      <hr class="my-4 border-gray-300">

      <!-- 导入本地模板 -->
      <div class="mb-6">
        <h4 class="mb-3 font-semibold">{{ t('config.importLocalTemplate') }}</h4>
        <p class="mb-3 text-sm text-gray-600">{{ t('config.importLocalTemplateDesc') }}</p>

        <div class="flex items-center gap-3">
          <label for="templateImport">
            <input
              id="templateImport"
              type="file"
              accept=".json"
              style="display: none"
              @change="importLocalTemplate"
            >
            <span class="btn btn-secondary btn-sm">{{ t('config.selectTemplate') }}</span>
          </label>
          <span class="text-sm text-gray-500">{{ t('config.templateFileSupport') }}: .json</span>
        </div>

        <div v-if="loadToast === 1" class="mt-3 alert alert-success alert-sm">
          <span>{{ t('config.importSuccessMsg') }}</span>
        </div>
        <div v-if="loadToast === 2" class="mt-3 alert alert-error alert-sm">
          <span>{{ t('config.importFailedMsg') }}</span>
        </div>
      </div>

      <hr class="my-4 border-gray-300">

      <!-- 恢复初始化 -->
      <div>
        <h4 class="mb-3 font-semibold text-error">{{ t('config.resetConfig') }}</h4>
        <p class="mb-3 text-sm text-gray-600">{{ t('config.resetConfigDesc') }}</p>

        <button class="btn btn-error btn-sm" @click="resetToDefault">
          {{ t('config.resetToDefault') }}
        </button>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="p-4 border rounded-lg border-base-300 bg-base-200">
      <h4 class="mb-2 font-semibold">{{ t('config.templateUsage') }}</h4>
      <ul class="pl-5 text-sm space-y-1 list-disc">
        <li><strong>{{ t('config.quickSave') }}</strong>：自动保存到项目文件夹，在任何系统服务器上都可用</li>
        <li><strong>{{ t('config.saveAs') }}</strong>：弹出对话框选择本地路径保存</li>
        <li><strong>{{ t('config.importLocalTemplate') }}</strong>：从本地选择模板文件导入</li>
        <li><strong>{{ t('config.resetConfig') }}</strong>：恢复所有配置到初始状态</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.templateConfig {
  max-height: 80vh;
  overflow-y: auto;
}
</style>
