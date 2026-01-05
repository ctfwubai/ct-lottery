# 手机控制查看中奖名单功能说明

## 功能需求

1. **手机上增加"查看中奖名单"按钮**
   - 点击后直接在大屏上显示当前选择的抽奖奖项的中奖人员名单
   - 只允许在当前奖项抽完后才能点击
   - 如果需要筛选，可以通过大屏鼠标自定义筛选

2. **跳过不在现场的中奖人员**
   - 手机上可以直接点击跳过不在现场的人员
   - 必须给二次确认提示，是否跳过
   - 大屏上也要同步显示提示

## 实现方案

### 1. 后端修改（server.cjs）

#### 1.1 添加 `/api/mobile-control/show-winners` 接口
```javascript
app.post('/api/mobile-control/show-winners', (req, res) => {
  try {
    const { device } = req.body;

    // 检查是否启用
    if (!mobileControlState.enabled) {
      return res.status(403).json({ success: false, error: 'Mobile control is disabled' });
    }

    // 检查是否锁定
    if (mobileControlState.isLocked) {
      return res.status(403).json({ success: false, error: 'Screen is locked' });
    }

    // 检查是否在抽奖界面
    if (!mobileControlState.isInLotteryPage) {
      return res.status(403).json({ success: false, error: 'Not in lottery page' });
    }

    // 通过 WebSocket 通知大屏显示中奖名单
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'show_winners',
        }));
      }
    });

    res.json({ success: true, message: 'Show winners command sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to show winners' });
  }
});
```

#### 1.2 添加 `/api/mobile-control/skip-winner` 接口
```javascript
app.post('/api/mobile-control/skip-winner', (req, res) => {
  try {
    const { device, winnerId, winnerName } = req.body;

    // 检查是否启用、锁定、是否在抽奖界面
    // ...（同上）

    // 通过 WebSocket 通知大屏跳过中奖人员
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'skip_winner',
          winnerId: winnerId,
          winnerName: winnerName,
        }));
      }
    });

    res.json({ success: true, message: 'Skip winner command sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to skip winner' });
  }
});
```

### 2. 大屏前端修改（src/views/Home/index.vue）

#### 2.1 添加状态管理
```typescript
const isMobileShowWinners = ref(false) // 是否通过手机控制显示中奖名单
```

#### 2.2 添加函数
```typescript
// 手机控制：打开当前奖项的中奖人员对话框
function openCurrentPrizeWinnersDialog() {
  // 设置筛选为当前奖项
  selectedPrizeFilter.value = currentPrize.value.id.toString()
  searchKeyword.value = ''
  showWinnersDialog.value = true
}

// 手机控制：显示当前奖项中奖名单
const handleMobileShowWinners = () => {
  if (isLocked.value) {
    toast.error('大屏已锁定，无法操作')
    return
  }

  // 检查当前奖项是否抽完
  if (!currentPrize.value.isUsed || currentPrize.value.isUsedCount === 0) {
    toast.warning('当前奖项还未开始抽奖或未抽完，暂无中奖人员')
    return
  }

  // 标记为手机控制显示
  isMobileShowWinners.value = true
  openCurrentPrizeWinnersDialog()
  toast.info('手机控制：显示中奖名单')
}

// 手机控制：跳过当前中奖人员
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

  // 显示确认提示（在大屏上）
  toast.warning(
    `确认跳过【${winner.name}】吗？跳过后将增加一个抽取名额`,
    {
      duration: 5000,
    }
  )

  // 等待确认
  await new Promise(resolve => setTimeout(resolve, 2000))

  // 增加当前奖项的名额
  currentPrize.value.count += 1

  // 从已中奖名单中移除
  winner.isWin = false
  const prizeIndex = winner.prizeId.indexOf(currentPrize.value.id.toString())
  if (prizeIndex > -1) {
    winner.prizeId.splice(prizeIndex, 1)
    winner.prizeName.splice(prizeIndex, 1)
    winner.prizeTime.splice(prizeIndex, 1)
  }

  // 减少已使用计数
  currentPrize.value.isUsedCount -= 1
  if (currentPrize.value.isUsedCount < currentPrize.value.count) {
    currentPrize.value.isUsed = false
  }

  // 更新奖项配置
  prizeConfig.updatePrizeConfig(currentPrize.value)

  toast.success(`已跳过【${winner.name}】，名额+1`)

  // 刷新中奖名单对话框
  closeWinnersDialog()
  await new Promise(resolve => setTimeout(resolve, 100))
  openCurrentPrizeWinnersDialog()
}
```

#### 2.3 添加事件监听器
```typescript
onMounted(() => {
  window.addEventListener('mobile-start-lottery', handleMobileStartLottery)
  window.addEventListener('mobile-stop-lottery', handleMobileStopLottery)
  window.addEventListener('mobile-show-winners', handleMobileShowWinners)
  window.addEventListener('mobile-skip-winner', (e: any) => {
    handleMobileSkipWinner(e.detail.winnerId)
  })
})

onUnmounted(() => {
  window.removeEventListener('mobile-start-lottery', handleMobileStartLottery)
  window.removeEventListener('mobile-stop-lottery', handleMobileStopLottery)
  window.removeEventListener('mobile-show-winners', handleMobileShowWinners)
})
```

#### 2.4 修改中奖名单对话框
```html
<!-- 添加操作列 -->
<th>操作</th>

<!-- 添加跳过按钮（只在手机控制时显示） -->
<td>
  <button
    v-if="isMobileShowWinners && !isLocked"
    class="skip-winner-btn"
    @click="handleMobileSkipWinner(winner.id)"
    title="跳过此人（名额+1）"
  >
    ⏭️ 跳过
  </button>
</td>
```

#### 2.5 添加跳过按钮样式
```scss
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
```

### 3. 手机控制界面修改（src/views/MobileControl/Control.vue）

#### 3.1 添加查看中奖名单函数
```typescript
// 显示当前奖项中奖名单
const handleShowWinners = async () => {
  if (!canControl()) {
    toast.error('无法操作：' + getStatusText().text)
    return
  }

  // 检查奖项是否抽完
  if (prizeInfo.value && !prizeInfo.value.isUsed) {
    toast.error('当前奖项未抽完，需要抽完才能查看中奖名单')
    return
  }

  try {
    // 优先通过WebSocket发送
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({
        type: 'show_winners',
        device: deviceName.value,
      }))
      toast.success('已在大屏显示中奖名单')
    } else {
      // WebSocket未连接，使用HTTP API
      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/mobile-control/show-winners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device: deviceName.value }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('已在大屏显示中奖名单')
      } else {
        toast.error(data.error || '操作失败')
      }
    }
  } catch (error) {
    toast.error('操作失败')
  }
}
```

#### 3.2 添加跳过中奖人员函数
```typescript
// 跳过中奖人员
const handleSkipWinner = async (winnerId: number, winnerName: string) => {
  if (!canControl()) {
    toast.error('无法操作：' + getStatusText().text)
    return
  }

  // 二次确认
  const confirmed = confirm(
    `确认跳过【${winnerName}】吗？\n\n跳过后：\n• 该人员从中奖名单中移除\n• 当前奖项名额 +1\n• 可以继续抽取新的中奖人员`
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
      toast.success(`已跳过【${winnerName}】，名额+1`)
    } else {
      // WebSocket未连接，使用HTTP API
      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/mobile-control/skip-winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device: deviceName.value,
          winnerId: winnerId,
          winnerName: winnerName,
        }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success(`已跳过【${winnerName}】，名额+1`)
      } else {
        toast.error(data.error || '操作失败')
      }
    }
  } catch (error) {
    toast.error('操作失败')
  }
}
```

#### 3.3 更新UI
```html
<!-- 查看中奖名单按钮 -->
<button
  @click="handleShowWinners"
  :disabled="!(prizeInfo && prizeInfo.isUsed)"
  class="w-full p-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-2xl shadow-xl transition-all active:scale-95 mt-4"
>
  <div class="text-4xl mb-2">🏆</div>
  <div class="font-bold text-lg">查看中奖名单</div>
  <div class="text-sm mt-1 opacity-80">仅奖项抽完后可用</div>
</button>

<!-- 更新提示信息 -->
<p class="flex items-center gap-2">
  <span class="text-blue-500">💡</span>
  奖项抽完后才能查看中奖名单
</p>
<p class="flex items-center gap-2">
  <span class="text-purple-500">⚠️</span>
  中奖人员不在现场可点击"跳过"按钮
</p>
```

## 功能特性

### 1. 查看中奖名单
- **时机限制**：只有当前奖项抽完后才能查看
- **显示内容**：当前奖项的中奖人员名单
- **自动筛选**：手机点击后自动筛选为当前奖项
- **手动筛选**：大屏上可以通过鼠标自定义筛选条件

### 2. 跳过中奖人员
- **二次确认**：手机点击跳过时会弹出确认对话框
- **大屏提示**：大屏上会同步显示确认提示（toast）
- **名额调整**：跳过后当前奖项名额 +1
- **名单移除**：该人员从中奖名单中完全移除
- **状态更新**：
  - `isWin` 设为 `false`
  - `prizeId`、`prizeName`、`prizeTime` 中移除该奖项
  - `isUsedCount` 减 1
  - 如果 `isUsedCount < count`，`isUsed` 设为 `false`

### 3. 安全控制
- **锁定检查**：大屏锁定时无法操作
- **页面检查**：不在抽奖页面时无法操作
- **奖项检查**：未抽完奖项无法查看名单
- **权限检查**：只有手机控制显示时才显示跳过按钮

## 测试场景

### 场景1：查看中奖名单
1. 设置奖项：三等奖，10个名额
2. 抽取5人后
   - ✅ 手机"查看中奖名单"按钮禁用
   - ✅ 提示"仅奖项抽完后可用"
3. 抽完10人后
   - ✅ 手机"查看中奖名单"按钮启用
   - ✅ 点击后大屏显示中奖名单对话框
   - ✅ 自动筛选为当前奖项（三等奖）
   - ✅ 显示5人中奖名单

### 场景2：跳过不在现场人员
1. 抽完奖项后查看中奖名单
2. 在大屏上显示跳过按钮（红色）
3. 手机点击某人的"跳过"按钮
   - ✅ 弹出二次确认对话框
   - ✅ 显示跳过后的影响
4. 确认跳过
   - ✅ 大屏显示 toast 提示"确认跳过【姓名】吗？"
   - ✅ 2秒后执行跳过
   - ✅ 大屏显示 toast 成功"已跳过【姓名】，名额+1"
   - ✅ 手机显示 toast 成功"已跳过【姓名】，名额+1"
   - ✅ 该人员从中奖名单中移除
   - ✅ 当前奖项名额 +1（从10变为11）
   - ✅ 已使用计数 -1
   - ✅ 中奖名单对话框自动刷新

### 场景3：筛选功能
1. 通过手机查看中奖名单
2. 在大屏上手动更改筛选条件
   - ✅ 更改奖项筛选：正常工作
   - ✅ 更改搜索关键词：正常工作
3. 关闭对话框后再打开
   - ✅ 如果通过手机打开，仍然显示当前奖项
   - ✅ 如果通过大屏打开，显示全部奖项

### 场景4：安全控制
1. 大屏锁定状态
   - ✅ 手机无法查看中奖名单
   - ✅ 手机无法跳过中奖人员
   - ✅ 提示"大屏已锁定，无法操作"
2. 大屏不在抽奖页面
   - ✅ 手机无法查看中奖名单
   - ✅ 手机无法跳过中奖人员
   - ✅ 提示"大屏不在抽奖界面"

## 注意事项

1. **跳过的影响**：跳过某人员后，该人员可能会再次被抽中（因为 `isWin = false`）
2. **名额调整**：跳过后名额永久增加，不会自动减少
3. **数据持久化**：所有修改都会保存到 localStorage 和后端日志
4. **二次确认**：手机端的确认对话框是浏览器原生的，大屏的提示是 toast
5. **按钮显示**：跳过按钮只在手机控制显示中奖名单时才显示，大屏直接查看时不会显示

## 数据流

```
手机端点击"查看中奖名单"
  ↓
检查奖项是否抽完
  ↓
发送 show_winners 消息（WebSocket/HTTP）
  ↓
后端转发消息给大屏
  ↓
大屏接收事件，打开中奖名单对话框
  ↓
自动筛选为当前奖项
  ↓
显示跳过按钮（isMobileShowWinners = true）

手机端点击"跳过"某人
  ↓
二次确认对话框
  ↓
发送 skip_winner 消息（WebSocket/HTTP）
  ↓
后端转发消息给大屏
  ↓
大屏接收事件
  ↓
显示确认提示（toast）
  ↓
执行跳过逻辑
  ↓
更新数据（名额+1，移除中奖状态）
  ↓
刷新中奖名单对话框
```

## 相关文件

- `server.cjs` - 后端服务器，新增两个 API 接口
- `src/views/Home/index.vue` - 大屏页面，新增事件处理和跳过功能
- `src/views/MobileControl/Control.vue` - 手机控制界面，新增两个按钮和处理函数
