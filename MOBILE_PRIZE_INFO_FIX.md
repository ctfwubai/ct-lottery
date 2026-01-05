# 手机控制奖项信息同步与抽完检测

## 问题描述

### 问题1：奖项抽完后提示不准确
当手机操作抽奖时，如果当前奖项已经抽完，点击开始抽奖时应该手机提示"当前奖项已经抽完"，而不是提示"开始抽奖"。

### 问题2：奖项信息不同步
大屏上正在抽的是几等奖、一共多少个、一次抽取多少个、还剩下多少个等信息没有同步到手机抽奖界面。

## 解决方案

### 1. 后端修改（server.cjs）

#### 1.1 修改 `/api/mobile-control/start` 接口
添加奖项抽完检测逻辑：

```javascript
// 检查奖项是否已抽完
try {
  const prizeConfig = JSON.parse(req.body.prizeConfig || '{}');
  const currentPrize = prizeConfig.prizeConfig?.currentPrize;
  if (currentPrize && currentPrize.isUsed) {
    logMobileControl('mobile_start_lottery', device || req.ip, 'failed', { reason: 'prize_used', prizeName: currentPrize.name });
    return res.status(403).json({ success: false, error: `当前奖项【${currentPrize.name}】已抽完，请切换到下一个奖项` });
  }
} catch (parseError) {
  console.warn('[MobileControl] Failed to parse prize config, skipping prize check:', parseError);
}
```

#### 1.2 修改 `/api/mobile-control/status` 接口
返回奖项信息：

```javascript
// 尝试从请求头获取奖项配置信息
let prizeInfo = null;
try {
  const prizeConfigHeader = req.headers['x-prize-config'];
  if (prizeConfigHeader) {
    const prizeConfig = JSON.parse(prizeConfigHeader);
    const currentPrize = prizeConfig.prizeConfig?.currentPrize;
    if (currentPrize) {
      prizeInfo = {
        name: currentPrize.name,
        totalCount: currentPrize.count,
        usedCount: currentPrize.isUsedCount || 0,
        remainingCount: currentPrize.count - (currentPrize.isUsedCount || 0),
        isUsed: currentPrize.isUsed,
        separateCount: currentPrize.separateCount
      };
    }
  }
} catch (parseError) {
  console.warn('[MobileControl] Failed to parse prize config header:', parseError);
}

res.json({
  success: true,
  enabled: mobileControlState.enabled,
  locked: mobileControlState.isLocked,
  inLotteryPage: mobileControlState.isInLotteryPage,
  connected: mobileControlState.connectedDevice !== null,
  prizeInfo: prizeInfo
});
```

### 2. 前端修改（src/views/MobileControl/Control.vue）

#### 2.1 添加奖项信息状态
```typescript
const prizeInfo = ref<any>(null)
```

#### 2.2 添加获取奖项配置方法
```typescript
const getPrizeConfig = () => {
  try {
    const prizeConfigStr = localStorage.getItem('prizeConfig')
    return prizeConfigStr ? JSON.parse(prizeConfigStr) : null
  } catch (error) {
    console.error('[MobileControl] Failed to get prize config:', error)
    return null
  }
}
```

#### 2.3 修改状态请求方法
```typescript
const requestStatus = async () => {
  try {
    const apiUrl = getApiBaseUrl()
    const prizeConfig = getPrizeConfig()

    const headers: Record<string, string> = {}
    if (prizeConfig) {
      headers['X-Prize-Config'] = JSON.stringify(prizeConfig)
    }

    const response = await fetch(`${apiUrl}/api/mobile-control/status`, { headers })
    const data = await response.json()

    if (data.success) {
      mobileControlStore.isLocked = data.locked
      mobileControlStore.isInLotteryPage = data.inLotteryPage
      prizeInfo.value = data.prizeInfo || null
    }
  } catch (error) {
    console.error('[MobileControl] Failed to request status:', error)
  }
}
```

#### 2.4 修改控制检查逻辑
```typescript
const canControl = () => {
  if (isLocked.value) {
    return false
  }
  if (!isInLotteryPage.value) {
    return false
  }
  // 检查奖项是否已抽完
  if (prizeInfo.value && prizeInfo.value.isUsed) {
    return false
  }
  return true
}
```

#### 2.5 修改状态文本
```typescript
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
```

#### 2.6 修改开始抽奖方法
```typescript
const handleStartLottery = async () => {
  if (!canControl()) {
    toast.error('无法操作：' + getStatusText().text)
    return
  }

  try {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({
        type: 'start_lottery',
        device: deviceName.value,
      }))
      toast.success('开始抽奖')
    } else {
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
```

#### 2.7 更新UI模板
添加奖项信息显示卡片，包含：
- 奖项名称（蓝色卡片）
- 总名额（紫色卡片）
- 已抽取（绿色卡片）
- 剩余名额（橙色卡片）
- 进度条（蓝紫渐变）
- 单次抽取人数（如有配置）

## 功能特性

### 1. 奖项抽完检测
- 当奖项全部抽完（`isUsed = true`）时，手机会显示"【奖项名称】已抽完"
- 点击"开始抽奖"按钮会提示"无法操作：【奖项名称】已抽完"
- 按钮会被禁用，无法点击

### 2. 奖项信息展示
- **奖项名称**：显示当前正在抽奖的奖项
- **总名额**：该奖项的总中奖人数
- **已抽取**：已经抽取的中奖人数
- **剩余名额**：还可以抽取的人数
- **进度条**：直观显示抽取进度
- **单次抽取人数**：显示每次抽奖抽取的人数（如配置）

### 3. UI设计
- 采用渐变色卡片设计，美观大方
- 信息分类清晰，一目了然
- 实时更新进度，动态效果
- 响应式设计，适配各种手机屏幕

## 测试场景

### 场景1：奖项抽完检测
1. 设置一个奖项（如三等奖，10个名额）
2. 抽完10个中奖人员
3. 手机端点击"开始抽奖"
   - ✅ 提示"当前奖项【三等奖】已抽完，请切换到下一个奖项"
   - ✅ 按钮被禁用
   - ✅ 状态显示"【三等奖】已抽完"

### 场景2：奖项信息显示
1. 设置奖项：三等奖，总名额20人，单次抽取5人
2. 抽取5人后查看手机
   - ✅ 显示奖项名称：三等奖
   - ✅ 显示总名额：20人
   - ✅ 显示已抽取：5人
   - ✅ 显示剩余：15人
   - ✅ 进度条：25%
   - ✅ 显示单次抽取：5人

### 场景3：实时更新
1. 在大屏上抽取几人
2. 查看手机端奖项信息
   - ✅ 已抽取人数自动更新
   - ✅ 剩余人数自动更新
   - ✅ 进度条自动更新
   - ✅ 状态实时同步

### 场景4：切换奖项
1. 抽完三等奖后
2. 切换到二等奖
3. 查看手机端
   - ✅ 奖项名称更新为"二等奖"
   - ✅ 信息更新为二等奖的配置
   - ✅ 进度重置为0%
   - ✅ 按钮恢复可用

## 数据流

```
手机端
  ↓ 获取 localStorage 中的 prizeConfig
  ↓ 通过 X-Prize-Config 请求头发送给后端
  ↓
后端 (/api/mobile-control/status)
  ↓ 解析奖项配置
  ↓ 提取当前奖项信息
  ↓ 返回 prizeInfo
  ↓
手机端接收并显示
  ↓ 点击开始抽奖
  ↓ 通过 prizeConfig body 发送给后端
  ↓
后端 (/api/mobile-control/start)
  ↓ 检查奖项是否已抽完
  ↓ 如果抽完，返回错误
  ↓ 如果未抽完，通知大屏
  ↓
手机端显示提示
```

## 注意事项

1. **localStorage 同步**：奖项配置存储在大屏的 localStorage 中，手机端通过相同的 key 获取
2. **状态实时更新**：每次抽奖后需要调用 `requestStatus()` 刷新状态
3. **WebSocket 兼容**：优先使用 WebSocket，降级到 HTTP API
4. **错误处理**：如果解析奖项配置失败，跳过奖项检查（向后兼容）
5. **性能优化**：奖项信息只在请求状态时获取，不会频繁刷新

## 相关文件

- `server.cjs` - 后端服务器，修改了 start 和 status 接口
- `src/views/MobileControl/Control.vue` - 手机控制界面，添加了奖项信息显示
- `src/store/prizeConfig.ts` - 奖项配置 store，存储在 localStorage
