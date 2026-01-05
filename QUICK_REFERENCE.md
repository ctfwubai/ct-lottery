# 📱 移动端控制功能 - 快速参考

## 🚀 快速启动

```bash
# 终端1：启动后端
node server.cjs

# 终端2：启动前端
npm run dev:fe
```

## 🔗 访问地址

| 页面 | 地址 | 说明 |
|------|------|------|
| 大屏首页 | http://localhost:5173 | 主抽奖界面 |
| 移动端登录 | http://localhost:5173/mobile-control | 手机登录页 |
| 移动端控制 | http://localhost:5173/mobile-control/control | 控制面板 |
| 配置页面 | http://localhost:5173 → 配置 → 手机控制 | 管理配置 |

## 🔑 默认配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| 验证码 | `123456` | 移动端登录验证码 |
| 管理员密码 | 见 `LOGIN_CONFIG.md` | 用于修改配置和解锁 |
| 后端端口 | `3001` | API 和 WebSocket 端口 |
| 前端端口 | `5173` | Web 界面端口 |

## 📋 核心功能

### 1. 大屏端功能
- 🔓 锁图标：点击锁定/解锁
- 📱 二维码：悬停在"开始抽奖"按钮显示
- 🔐 锁定保护：需要密码解锁
- 🔄 自动重连：断线后3秒自动重连

### 2. 移动端功能
- 🔐 验证码登录：4-8位数字
- 🎮 控制面板：开始/停止抽奖
- 📊 状态显示：实时同步大屏状态
- 🔴 状态限制：锁定或不在抽奖页面时禁用

### 3. 配置页面功能
- 🎛️ 总开关：启用/禁用移动端控制
- 🔢 验证码：修改移动端验证码
- 📝 操作日志：查看所有操作记录
- 🔒 权限控制：需要管理员密码

## 🧪 测试工具

### HTML 自动化测试
```bash
# 浏览器中打开
http://localhost:5173/test-mobile-control.html
```

### Node.js API 测试
```bash
node test-api.js
```

### 手动测试
- 详细清单：`TEST_CHECKLIST.md`
- 测试指南：`TESTING_GUIDE.md`

## 📝 常见问题

### Q: 验证码是什么？
**A:** 默认是 `123456`，可以在配置页面修改。

### Q: 管理员密码是什么？
**A:** 查看项目根目录的 `LOGIN_CONFIG.md` 文件。

### Q: 移动端无法连接？
**A:** 检查：
1. 服务器是否运行
2. 总开关是否开启
3. 验证码是否正确
4. 是否在同一网络

### Q: 大屏已锁定怎么解锁？
**A:** 点击右上角 🔒 图标，输入管理员密码解锁。

### Q: 显示"大屏不在抽奖界面"？
**A:** 在大屏页面点击"进入抽奖"按钮进入抽奖准备状态。

### Q: 如何查看操作日志？
**A:** 进入配置页面 → 手机控制 → 查看日志。

## 🎯 使用流程

### 标准流程
1. **大屏准备**：进入抽奖页面，确保未锁定
2. **手机扫码**：扫描大屏显示的二维码
3. **输入验证码**：输入验证码登录
4. **开始抽奖**：点击"开始抽奖"按钮
5. **停止抽奖**：点击"停止抽奖"按钮
6. **退出登录**：完成控制后退出

### 锁定流程
1. **锁定大屏**：点击大屏 🔓 图标锁定
2. **手机禁用**：移动端显示已锁定，按钮禁用
3. **解锁大屏**：点击大屏 🔒 图标，输入密码解锁
4. **恢复控制**：移动端恢复可用

## 📊 API 端点

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/mobile-control/enabled` | 获取总开关状态 |
| PUT | `/api/mobile-control/enabled` | 切换总开关 |
| GET | `/api/mobile-control/code` | 获取验证码 |
| PUT | `/api/mobile-control/code` | 更新验证码 |
| POST | `/api/mobile-control/verify` | 验证验证码 |
| GET | `/api/mobile-control/status` | 获取大屏状态 |
| POST | `/api/mobile-control/start` | 开始抽奖 |
| POST | `/api/mobile-control/stop` | 停止抽奖 |
| POST | `/api/mobile-control/lock` | 锁定/解锁大屏 |
| GET | `/api/mobile-control/logs` | 获取操作日志 |
| DELETE | `/api/mobile-control/logs` | 清空操作日志 |

## 🔒 安全机制

1. **单设备限制**：同时只能一个设备连接
2. **密码验证**：所有修改操作需要管理员密码
3. **状态验证**：锁定、页面、开关多重验证
4. **日志审计**：记录所有操作
5. **输入验证**：严格的格式验证

## 📁 重要文件

| 文件 | 说明 |
|------|------|
| `server.cjs` | 后端服务器 |
| `src/store/mobileControl.ts` | 状态管理 |
| `src/views/Home/index.vue` | 大屏页面 |
| `src/views/MobileControl/Login.vue` | 登录页面 |
| `src/views/MobileControl/Control.vue` | 控制面板 |
| `src/views/Config/Global/MobileControlConfig.vue` | 配置页面 |

## 📖 文档索引

| 文档 | 说明 |
|------|------|
| `MOBILE_CONTROL_GUIDE.md` | 完整使用指南 |
| `TEST_CHECKLIST.md` | 测试清单（52项） |
| `TESTING_GUIDE.md` | 详细测试指南 |
| `TEST_REPORT.md` | 测试报告模板 |
| `TESTING_SUMMARY.md` | 测试总结 |

## ⚡ 快捷命令

```bash
# 检查端口占用
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# 查看日志
type logs\mobile-control.log

# 清空日志
type nul > logs\mobile-control.log

# 测试 API
curl http://localhost:3001/api/mobile-control/status
```

## 🎨 状态图标

| 图标 | 含义 |
|------|------|
| 🔓 | 大屏未锁定，可以控制 |
| 🔒 | 大屏已锁定，无法控制 |
| 🟢 | 状态正常，可以控制 |
| 🔴 | 状态异常，无法控制 |

## 💡 提示

- ✅ 确保大屏和手机在同一网络
- ✅ 使用 HTTPS 提高安全性
- ✅ 定期修改验证码
- ✅ 监控操作日志
- ✅ 及时更新管理员密码

---

**版本**：1.0
**更新时间**：2026-01-03
