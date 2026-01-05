# 奖项抽完后自动切换功能说明

## 问题描述

在之前的版本中，抽完一个奖项（如三等奖）后，系统会自动切换到下一个奖项（如二等奖、一等奖），导致所有奖项可以连续抽完。但在实际年会场景中，抽完一个奖项后通常会有节目表演，表演结束后才继续抽取下一个奖项。

## 解决方案

新增了"奖项抽完后自动切换"配置选项，用户可以根据实际需求选择：

- **关闭（默认）**：抽完奖项后不会自动切换，需要手动切换到下一个奖项。适合有节目表演的年会场景。
- **开启**：抽完奖项后自动切换到下一个奖项。适合需要连续抽奖的场景。

## 使用方法

1. 进入"配置" → "全局配置" → "外观配置"
2. 找到"抽奖配置"部分
3. 找到"奖项抽完后自动切换"选项
4. 根据需要开启或关闭该选项

## 默认设置

该选项默认为**关闭**状态，即抽完奖项后需要手动切换，符合大多数年会场景的需求。

## 技术实现

### 1. 类型定义

在 `src/types/storeType.ts` 中添加了 `autoSwitchNextPrize` 字段：

```typescript
export interface IGlobalDrawConfig {
  customDrawCount: number;
  enableCustomCount: boolean;
  autoSwitchNextPrize: boolean; // 新增：奖项抽完后是否自动切换
}
```

### 2. 全局配置

在 `src/store/globalConfig.ts` 中设置默认值为 `false`：

```typescript
drawConfig: {
  customDrawCount: 10,
  enableCustomCount: false,
  autoSwitchNextPrize: false, // 默认不自动切换
}
```

### 3. 奖项配置逻辑

修改 `src/store/prizeConfig.ts` 中的 `updatePrizeConfig` 方法，根据配置决定是否自动切换：

```typescript
updatePrizeConfig(prizeConfigItem: IPrizeConfig) {
  const prizeListLength = this.prizeConfig.prizeList.length
  if (prizeConfigItem.isUsed && prizeListLength) {
    // 检查是否启用自动切换到下一个奖项
    const globalConfig = useGlobalConfig()
    const autoSwitch = globalConfig.getDrawConfig?.autoSwitchNextPrize ?? false

    if (autoSwitch) {
      // 启用自动切换：自动切换到下一个未使用的奖项
      for (let i = 0; i < prizeListLength; i++) {
        if (!this.prizeConfig.prizeList[i].isUsed) {
          this.setCurrentPrize(this.prizeConfig.prizeList[i])
          break
        }
      }
    }
    // 关闭时：不自动切换，保持当前奖项状态
  }
  else {
    return
  }
  this.resetTemporaryPrize()
}
```

### 4. 配置界面

在 `src/views/Config/Global/FaceConfig.vue` 中添加了配置UI：

```vue
<div class="mb-6">
  <div class="label">
    <span class="label-text">奖项抽完后自动切换</span>
  </div>
  <input
    type="checkbox"
    :checked="autoSwitchNextPrizeValue"
    @change="autoSwitchNextPrizeValue = !autoSwitchNextPrizeValue"
    class="mt-2 border-solid checkbox checkbox-secondary border-1"
  />
  <div class="text-sm text-gray-500 mt-2">
    开启后，抽完当前奖项会自动切换到下一个奖项。<br>
    关闭后，抽完奖项后需要手动切换到下一个奖项（推荐，方便节目表演）。
  </div>
</div>
```

## 注意事项

1. 该配置会自动保存到 localStorage，下次启动时会自动加载
2. 修改该配置不会影响已经进行的抽奖
3. 手机控制和大屏都遵循这个配置
4. 切换奖项时，系统会自动记录当前奖项的中奖名单

## 常见问题

### Q: 修改配置后，为什么抽奖行为没有立即改变？

A: 配置在每次抽完奖项并记录中奖名单时才会生效。如果您已经抽完某个奖项但还没有记录，建议先点击"继续抽奖"记录中奖，然后新配置就会生效。

### Q: 我已经抽完了一个奖项，现在想切换到下一个奖项，应该怎么做？

A: 如果"奖项抽完后自动切换"是关闭状态，您需要：
1. 点击"继续抽奖"按钮（记录当前中奖）
2. 在奖项列表中手动点击下一个奖项

### Q: 为什么默认是关闭状态？

A: 因为大多数年会场景都需要在奖项之间进行节目表演，关闭自动切换可以给主持人更多控制权。
