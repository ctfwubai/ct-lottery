<!-- eslint-disable vue/no-parsing-error -->
<script setup lang='ts'>
import type { IPersonConfig } from '@/types/storeType'
import DaiysuiTable from '@/components/DaiysuiTable/index.vue'
import i18n from '@/locales/i18n'
import useStore from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as XLSX from 'xlsx'

const { t } = useI18n()
const personConfig = useStore().personConfig

const { getAlreadyPersonList: alreadyPersonList, getAlreadyPersonDetail: alreadyPersonDetail } = storeToRefs(personConfig)

// 导出中奖人员明细到Excel
function exportWinnerDetailToExcel() {
  const data = JSON.parse(JSON.stringify(alreadyPersonDetail.value))

  // 格式化数据
  for (let i = 0; i < data.length; i++) {
    // 格式化数组
    data[i].prizeName = data[i].prizeName.join(', ')
    data[i].prizeTime = data[i].prizeTime.join(', ')

    // 排除不需要导出的字段
    delete data[i].x
    delete data[i].y
    delete data[i].id
    delete data[i].createTime
    delete data[i].updateTime
    delete data[i].prizeId
    delete data[i].isWin
  }

  // 重新构建数据，使用中文列名
  const exportData = data.map((item: any, index: number) => ({
    '序号': index + 1,
    '工号': item.uid,
    '姓名': item.name,
    '部门': item.department || '-',
    '职位': item.identity || '-',
    '头像': item.avatar || '-',
    '中奖奖项': item.prizeName,
    '中奖时间': item.prizeTime
  }))

  // 创建工作表
  const worksheet = XLSX.utils.json_to_sheet(exportData)

  // 设置列宽
  const colWidths = [
    { wch: 6 },   // 序号
    { wch: 15 },  // 工号
    { wch: 12 },  // 姓名
    { wch: 20 },  // 部门
    { wch: 15 },  // 职位
    { wch: 30 },  // 头像
    { wch: 30 },  // 中奖奖项
    { wch: 40 },  // 中奖时间
  ]
  worksheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '中奖明细')

  // 下载文件
  XLSX.writeFile(workbook, `中奖人员明细_${new Date().toLocaleDateString()}.xlsx`)
}
// const personList = ref<any[]>(
//     alreadyPersonList
// )

// const deleteAll = () => {
//     personConfig.deleteAllPerson()
// }

const isDetail = ref(false)
function handleMoveNotPerson(row: IPersonConfig) {
  personConfig.moveAlreadyToNot(row)
}

const tableColumnsList = [
  {
    label: i18n.global.t('data.number'),
    props: 'uid',
    sort: true,
  },
  {
    label: i18n.global.t('data.name'),
    props: 'name',
  },
  {
    label: i18n.global.t('data.avatar'),
    props: 'avatar',
    formatValue(row: any) {
       return row.avatar ? `<img src="${row.avatar}" alt="avatar" style="width: 50px; height: 50px;"/>` : '-';
    }
  },
  {
    label: i18n.global.t('data.department'),
    props: 'department',
  },
  {
    label: i18n.global.t('data.identity'),
    props: 'identity',
  },
  {
    label: i18n.global.t('data.prizeName'),
    props: 'prizeName',
    sort: true,
  },
  {
    label: i18n.global.t('data.operation'),
    actions: [
      {
        label: i18n.global.t('data.removePerson'),
        type: 'btn-info',
        onClick: (row: IPersonConfig) => {
          handleMoveNotPerson(row)
        },
      },
    ],
  },
]
const tableColumnsDetail = [
  {
    label: i18n.global.t('data.number'),
    props: 'uid',
    sort: true,
  },
  {
    label: i18n.global.t('data.number'),
    props: 'name',
  },
  {
    label: i18n.global.t('data.avatar'),
    props: 'avatar',
    formatValue(row: any) {
       return row.avatar ? `<img src="${row.avatar}" alt="avatar" style="width: 50px; height: 50px;"/>` : '-';
    }
  },
  {
    label: i18n.global.t('data.department'),
    props: 'department',
  },
  {
    label: i18n.global.t('data.identity'),
    props: 'identity',
  },
  {
    label: i18n.global.t('data.prizeName'),
    props: 'prizeName',
    sort: true,
  },
  {
    label: i18n.global.t('data.prizeTime'),
    props: 'prizeTime',

  },
  {
    label: i18n.global.t('data.operation'),
    actions: [
      {
        label: i18n.global.t('data.removePerson'),
        type: 'btn-info',
        onClick: (row: IPersonConfig) => {
          handleMoveNotPerson(row)
        },
      },

    ],
  },
]
</script>

<template>
  <div class="overflow-y-auto">
    <h2>{{ t('viewTitle.winnerManagement') }}</h2>
    <div class="flex items-center justify-start gap-10">
      <div>
        <span>{{ t('table.luckyPeopleNumber') }}：</span>
        <span>{{ alreadyPersonList.length }}</span>
      </div>
      <div class="flex flex-col">
        <div class="form-control">
          <label class="cursor-pointer label">
            <span class="label-text">{{ t('table.detail') }}:</span>
            <input v-model="isDetail" type="checkbox" class="border-solid toggle toggle-primary border-1">
          </label>
        </div>
      </div>
      <button class="btn btn-success btn-sm" @click="exportWinnerDetailToExcel">
        导出中奖明细
      </button>
    </div>
    <DaiysuiTable v-if="!isDetail" :table-columns="tableColumnsList" :data="alreadyPersonList" />

    <DaiysuiTable v-if="isDetail" :table-columns="tableColumnsDetail" :data="alreadyPersonDetail" />
  </div>
</template>

<style lang='scss' scoped></style>
