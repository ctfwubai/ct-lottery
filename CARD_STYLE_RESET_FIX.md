# 中奖卡片样式恢复修复说明

## 问题描述

在抽奖过程中，中奖人员的卡片会显示黄色并放大。但如果再次点击"开始抽奖"，之前中奖的卡片会继续保持黄色放大的样式显示在3D球体中，这不符合预期。

## 期望行为

1. 再次点击"开始抽奖"时，之前中奖的卡片应该恢复正常样式（不再是黄色放大）
2. 中奖人员不应再参与后续抽奖
3. 球体可以继续组合旋转

## 解决方案

在 `startLottery()` 函数开始时，添加代码来恢复之前中奖卡片的样式：

```typescript
// 清空之前的抽奖目标
luckyTargets.value = []

// 恢复之前中奖卡片的样式
if (luckyCardList.value.length) {
  luckyCardList.value.forEach((cardIndex: any) => {
    const item = objects.value[cardIndex]
    if (item) {
      useElementStyle(item.element, {} as any, i, patternList.value, patternColor.value, cardSize.value, cardSize.value, textSize.value, 'sphere')
    }
  })
  luckyCardList.value = []
}
```

## 修改的文件

- `src/views/Home/index.vue`

## 修改位置

在 `startLottery()` 函数中，位于第 644-656 行之间。

## 工作原理

1. **清空中奖目标**：`luckyTargets.value = []` - 清空当前中奖人员列表
2. **恢复卡片样式**：遍历 `luckyCardList` 中的卡片索引，使用 `useElementStyle()` 将卡片样式恢复为正常的球体样式
3. **清空中奖卡片列表**：`luckyCardList.value = []` - 清空中奖卡片索引列表
4. **防止重复中奖**：抽奖池（`personPool`）只包含 `notPersonList`（未中奖人员列表），确保已中奖人员不会再被抽中

## 测试场景

### 场景 1：正常抽奖流程
1. 点击"开始抽奖"
2. 点击"停止抽奖"，显示中奖人员卡片（黄色放大）
3. 点击"继续抽奖"，记录中奖人员
4. 再次点击"开始抽奖"
   - ✅ 之前中奖的卡片恢复为正常样式
   - ✅ 之前中奖的人员不再参与抽奖
   - ✅ 球体继续组合旋转

### 场景 2：手机控制流程
1. 扫码登录手机控制
2. 在手机上点击"开始抽奖"
3. 在手机上点击"停止抽奖"，显示中奖人员卡片
4. 系统自动记录中奖人员
5. 再次点击"开始抽奖"
   - ✅ 之前中奖的卡片恢复为正常样式
   - ✅ 之前中奖的人员不再参与抽奖

### 场景 3：连续抽奖
1. 抽取第一轮中奖人员（如10人）
2. 记录中奖
3. 直接点击"开始抽奖"抽取第二轮
   - ✅ 第一轮中奖卡片恢复为正常样式
   - ✅ 第一轮中奖人员不在第二轮抽奖池中
   - ✅ 第二轮抽取的是新的未中奖人员

## 注意事项

1. **样式恢复时机**：样式恢复在点击"开始抽奖"时立即执行，不会等到停止抽奖
2. **中奖人员排除**：系统使用 `notPersonList`（未中奖人员列表）作为抽奖池，确保已中奖人员不会被再次抽中
3. **手机控制兼容**：手机控制使用相同的 `startLottery()` 函数，因此修复对手机控制同样有效
4. **球体旋转**：样式恢复不会影响球体的旋转动画，球体会继续正常组合旋转

## 相关逻辑说明

### 抽奖池构建
```typescript
// 普通模式：从未中奖人员中抽奖
personPool.value = currentPrize.value.isAll ? notThisPrizePersonList.value : notPersonList.value
```

- `notPersonList.value`：所有未中奖人员列表
- `notThisPrizePersonList.value`：未中奖当前奖项的人员列表（针对"所有奖项各抽一次"模式）

### 中奖人员标记
```typescript
// 标记中奖人员
personConfig.addAlreadyPersonList(luckyTargets.value, currentPrize.value)
```

中奖人员会被添加到 `alreadyPersonList`（已中奖人员列表），并从 `notPersonList` 中移除。

## 验证方法

1. 启动抽奖系统
2. 添加测试人员（至少20人）
3. 创建一个奖项（如三等奖，10个名额）
4. 点击"开始抽奖" → "停止抽奖"
5. 观察中奖卡片是否为黄色放大
6. 点击"继续抽奖"记录中奖
7. 再次点击"开始抽奖"
8. 观察之前中奖的卡片是否恢复正常样式
9. 确认之前中奖的人员不会再次被抽中
10. 确认球体正常旋转组合
