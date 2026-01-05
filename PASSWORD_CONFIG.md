# 密码配置说明

## 系统密码汇总

### 1. 重置功能密码
- **用途**: 重置所有抽奖数据（清除所有中奖记录）
- **默认密码**: `admin888`
- **使用位置**: 右上角重置按钮 (↺)
- **代码位置**: `src/views/Home/index.vue` 中的 `RESET_PASSWORD` 常量

### 2. 解锁手机控制密码
- **用途**: 解锁大屏的手机控制功能
- **默认密码**: 与登录管理员密码相同
- **获取方式**: 从 `localStorage.getItem('adminPassword')` 读取
- **使用位置**: 大屏右上角锁图标 (🔒) → 输入管理员密码
- **代码位置**: `src/views/Home/index.vue` 中的 `handleUnlock` 函数
- **重要**: 必须先登录系统，解锁密码才能使用。如果提示"请先登录管理员账户"，请：
  1. 点击右上角菜单
  2. 选择"退出登录"
  3. 重新登录系统
  4. 使用登录时的密码进行解锁

### 3. 系统配置密码
- **用途**: 特殊奖项配置和高级设置
- **默认密码**: `admin888`
- **自定义密码**: 可从 `localStorage.getItem('lottery_system_password')` 读取
- **使用位置**: 配置页面 → 特殊奖项设置
- **代码位置**: `src/views/Config/Special/index.vue` 中的 `SYSTEM_PASSWORD` 常量

### 4. 移动端控制验证码
- **用途**: 手机端登录控制面板
- **默认验证码**: `123456`
- **修改位置**: 配置页面 → 移动端控制设置
- **代码位置**: `server.cjs` 中的 `mobileVerificationCode` 配置

### 5. 管理员登录密码
- **用途**: 系统登录，同时也是解锁功能和更新验证码的密码
- **账号**: 默认为 `admin`（可通过环境变量 `VITE_AUTH_USERNAME` 修改）
- **密码**: 默认为 `admin123`（可通过环境变量 `VITE_AUTH_PASSWORD` 修改）
- **存储位置**: 
  - `localStorage.isLoggedIn` - 登录状态标记
  - `localStorage.adminPassword` - 密码（登录后同步保存）
  - `localStorage.lottery_login_username` - 自定义用户名
  - `localStorage.lottery_login_password` - 自定义密码
- **使用位置**: 登录页面、解锁功能、更新验证码
- **代码位置**: `src/views/Login/index.vue`

## 密码修改指南

### 修改重置功能密码
编辑 `src/views/Home/index.vue` 文件，找到第 42 行：
```javascript
const RESET_PASSWORD = 'admin888'  // 修改这里的密码
```

### 修改系统配置密码
编辑 `src/views/Config/Special/index.vue` 文件，找到第 15 行：
```javascript
const SYSTEM_PASSWORD = 'admin888'  // 修改这里的密码
```

### 修改移动端验证码
方式一：通过配置页面修改
1. 进入配置页面
2. 找到"移动端控制设置"
3. 修改验证码并保存

方式二：直接编辑配置文件
编辑 `server.cjs` 文件，找到 `mobileVerificationCode` 配置项并修改

### 修改管理员登录密码
方式一：通过配置页面修改
1. 进入配置页面 → 特殊设置
2. 找到"修改主页登录账号密码"选项
3. 输入当前账号密码、新账号密码
4. 点击保存

方式二：通过环境变量修改
在 `.env` 文件中添加：
```bash
VITE_AUTH_USERNAME=your_username
VITE_AUTH_PASSWORD=your_password
```

方式三：通过浏览器控制台临时修改
```javascript
localStorage.setItem('lottery_login_username', '新账号')
localStorage.setItem('lottery_login_password', '新密码')
localStorage.setItem('adminPassword', '新密码')
```

## 安全建议

1. **生产环境务必修改默认密码**
   - 所有默认密码都应修改为强密码
   - 建议包含大小写字母、数字和特殊字符
   - 密码长度不少于 8 位

2. **定期更换密码**
   - 建议每 3-6 个月更换一次密码
   - 重要操作后及时更换密码

3. **密码管理**
   - 不要在代码中硬编码密码
   - 使用环境变量或配置管理工具
   - 不要将密码提交到版本控制系统

4. **访问控制**
   - 限制配置页面的访问权限
   - 记录密码输入失败的尝试
   - 考虑添加验证码或双因素认证

## 密码验证逻辑

### 重置功能验证
```javascript
if (resetPasswordInput.value === RESET_PASSWORD) {
  // 密码正确，执行重置
  resetToInitialEffect()
} else {
  // 密码错误，提示用户
  toast.error('密码错误!')
}
```

### 解锁手机控制验证
```javascript
const adminPassword = localStorage.getItem('adminPassword')
if (unlockPassword.value === adminPassword) {
  // 密码正确，解锁
  mobileControlStore.setLocked(false)
} else {
  // 密码错误
  toast.error('管理员密码错误')
}
```

### 系统配置验证
```javascript
const getSystemPassword = () => {
  const customPassword = localStorage.getItem('lottery_system_password')
  if (customPassword) {
    return customPassword  // 使用自定义密码
  }
  return SYSTEM_PASSWORD  // 使用默认密码
}
```

## 相关文件

- `src/views/Home/index.vue` - 重置和解锁密码
- `src/views/Config/Special/index.vue` - 系统配置密码、账号密码修改
- `src/views/Login/index.vue` - 登录页面
- `server.cjs` - 移动端验证码配置
- `src/views/Config/Global/MobileControlConfig.vue` - 移动端配置界面
- `src/store/mobileControl.ts` - 手机控制状态管理

## 快速密码参考表

| 功能 | 默认账号 | 默认密码 | 存储位置 |
|------|---------|---------|---------|
| 系统登录 | admin | admin123 | localStorage |
| 重置功能 | - | admin888 | 代码常量 |
| 解锁大屏 | - | 与登录密码相同 | localStorage.adminPassword |
| 系统配置 | - | admin888 | localStorage.lottery_system_password |
| 移动端验证码 | - | 123456 | server.cjs |

**重要提示**：您使用的登录账号密码是 **admin888 / admin123**，但系统默认是 **admin / admin123**。如果您想要使用 admin888 作为账号，需要：
1. 通过配置页面修改账号为 admin888
2. 或者直接在浏览器控制台执行：
   ```javascript
   localStorage.setItem('lottery_login_username', 'admin888')
   ```

## 注意事项

1. 所有密码验证都在前端进行，生产环境应考虑后端验证
2. localStorage 中的密码明文存储，存在安全风险
3. 移动端验证码默认为 123456，强烈建议修改
4. 管理员密码与解锁密码共享，修改一处即可

## 常见问题

### Q: 忘记重置密码怎么办？
A: 编辑源代码修改 `RESET_PASSWORD` 常量的值

### Q: 忘记管理员密码怎么办？
A: 在浏览器控制台执行 `localStorage.setItem('adminPassword', '新密码')`

### Q: 如何设置所有密码相同？
A: 将所有密码常量设置为相同的值

### Q: 密码验证失败怎么办？
A: 检查密码是否正确，注意大小写和空格

### Q: 点击"更新验证码"或"解锁"提示"请登录管理员账户"？
A: 这个问题是因为登录成功后没有同步保存 adminPassword。已修复该问题，请重新登录系统即可。如果仍有问题，可在浏览器控制台执行：
```javascript
localStorage.setItem('adminPassword', '你的登录密码')
```
