# CT-Lottery 系统总体架构

## 一、系统架构概览

<img width="1438" height="829" alt="image" src="https://github.com/user-attachments/assets/50c5f1e6-cd57-41da-a1e6-d4f2e9ff2dd1" />





## 二、技术栈

### 前端技术

- **框架**: Vue 3.5.13 (Composition API)
- **构建工具**: Vite 5.4.11
- **状态管理**: Pinia 2.2.6 + pinia-plugin-persist
- **路由**: Vue Router 4.5.0
- **UI组件**: DaisyUI 4.12.14 (基于 Tailwind CSS)
- **国际化**: Vue I18n 10.0.4
- **HTTP客户端**: Axios 1.7.8
- **3D渲染**: Three.js 0.166.0
- **动画**: @tweenjs/tween.js 23.1.2
- **粒子效果**: sparticles 1.3.1
- **礼花效果**: canvas-confetti 1.9.3
- **二维码**: qrcode 1.5.3
- **Excel**: xlsx 0.18.5
- **日期处理**: dayjs 1.11.13
- **本地存储**: localforage 1.10.0
- **Markdown**: markdown-it 14.1.0

### 后端技术

- **运行时**: Node.js 20.19.0
- **Web框架**: Express 5.2.1
- **WebSocket**: ws 8.18.0
- **数据验证**: zod 3.23.8

### 部署技术

- **Web服务器**: Nginx (反向代理 + 静态资源服务)
- **系统服务**: systemd (进程管理)
- **版本控制**: Git + GitHub

### 开发工具

- **语言**: TypeScript 5.5.3
- **代码规范**: ESLint 9.15.0 + @antfu/eslint-config
- **测试**: Vitest 2.1.5 + @vue/test-utils 2.4.6
- **提交规范**: Husky 9.1.7

## 三、核心功能模块

### 1. 用户认证与授权

```typescript
/src/views/Login/index.vue          // 登录页面
/src/utils/auth.ts                   // 认证工具
src/router/index.ts:241-276          // 路由守卫
```

- 密码验证 (从 LOGIN_CONFIG.md 读取)
- 登录状态持久化 (localStorage, 24小时有效期)
- 路由级别权限控制

### 2. 抽奖系统

```typescript
/src/views/Home/index.vue           // 抽奖主页
/src/views/Home/PrizeList.vue       // 奖项列表
/src/store/prizeConfig.ts            // 奖项配置
/src/store/personConfig.ts           // 人员配置
```

- 人员名单管理 (导入、编辑、删除)
- 奖项配置 (数量、图片、描述、分批抽奖)
- 抽奖算法 (随机抽取、去重)
- 中奖记录 (时间、奖项、人员)
- 特殊奖项 (指定中奖人员)

### 3. 配置管理

```typescript
/src/views/Config/index.vue         // 配置中心
/src/views/Config/Person/*          // 人员配置
/src/views/Config/Prize/*           // 奖项配置
/src/views/Config/Global/*          // 全局配置
```

- 人员配置: 名单导入、已中奖名单、重置
- 奖项配置: 奖项列表、当前奖项、临时奖项
- 全局配置: 视图、文字、图片、音乐、字体、模板
- 系统设置: 数据导入导出

### 4. 手机远程控制

```typescript
/src/views/MobileControl/Login.vue  // 手机登录
/src/views/MobileControl/Control.vue // 手机控制面板
server.cjs:310-667                   // 手机控制API
server.cjs:672-857                   // WebSocket服务
```

- 验证码登录 (4-8位数字)
- 实时控制大屏 (开始/停止/继续抽奖)
- 查看中奖名单
- 跳过中奖人员
- 操作日志记录 (CSV格式)
- 大屏锁定/解锁

### 5. 文件管理

```typescript
server.cjs:161-220                   // 字体管理API
server.cjs:222-306                   // 模板管理API
```

- 字体上传/删除/列表
- 模板保存/加载/删除
- 配置导入导出 (JSON格式)

## 四、数据流架构

```
用户操作
   │
   ├── 前端组件 (Vue Component)
   │     │
   │     ├── 用户交互 (点击、输入)
   │     │
   │     ├── Pinia Store (状态管理)
   │     │     ├── personConfig (人员数据)
   │     │     ├── prizeConfig (奖项数据)
   │     │     ├── globalConfig (全局配置)
   │     │     └── system (系统配置)
   │     │
   │     ├── API请求 (Axios)
   │     │     └── baseURL: '/api'
   │     │
   │     └── WebSocket连接
   │           ├── 接收实时指令
   │           └── 发送状态更新
   │
   ├── 网络传输
   │     │
   │     ├── HTTP请求 → Nginx → Express
   │     │
   │     └── WebSocket → Nginx → WebSocket Server
   │
   ├── 后端处理
   │     │
   │     ├── REST API (Express)
   │     │     ├── 字体管理
   │     │     ├── 模板管理
   │     │     └── 手机控制API
   │     │
   │     ├── WebSocket (ws)
   │     │     ├── 大屏连接
   │     │     ├── 手机连接
   │     │     ├── 指令转发
   │     │     └── 状态广播
   │     │
   │     └── 业务逻辑
   │           ├── 权限验证
   │           ├── 状态管理
   │           └── 日志记录
   │
   └── 数据持久化
         │
         ├── 本地文件系统
         │     ├── public/fonts/ (字体)
         │     ├── public/templates/ (模板)
         │     ├── logs/mobile-control.log (日志)
         │     └── logs/mobile-control-state.json (状态)
         │
         ├── LocalStorage
         │     ├── personConfig (人员配置)
         │     ├── prizeConfig (奖项配置)
         │     ├── globalConfig (全局配置)
         │     └── isLoggedIn (登录状态)
         │
         └── 配置文件
               ├── LOGIN_CONFIG.md (管理员密码)
               └── PASSWORD_CONFIG.md (密码配置)
```

## 五、REST API 接口

### 字体管理

- `GET /api/fonts` - 获取字体列表
- `POST /api/fonts/upload` - 上传字体
- `DELETE /api/fonts/:fileName` - 删除字体

### 模板管理

- `GET /api/templates` - 获取模板列表
- `POST /api/templates` - 保存模板
- `GET /api/templates/:fileName` - 加载模板
- `DELETE /api/templates/:fileName` - 删除模板

### 手机控制

- `GET /api/mobile-control/code` - 获取验证码
- `PUT /api/mobile-control/code` - 更新验证码
- `POST /api/mobile-control/verify` - 验证码验证
- `POST /api/mobile-control/start` - 开始抽奖
- `POST /api/mobile-control/stop` - 停止抽奖
- `POST /api/mobile-control/show-winners` - 查看中奖名单
- `POST /api/mobile-control/skip-winner` - 跳过中奖人员
- `GET /api/mobile-control/status` - 获取状态
- `POST /api/mobile-control/lock` - 锁定/解锁大屏
- `GET /api/mobile-control/enabled` - 获取开关状态
- `PUT /api/mobile-control/enabled` - 设置开关状态
- `GET /api/mobile-control/logs` - 获取日志
- `DELETE /api/mobile-control/logs` - 清空日志

## 六、WebSocket 消息类型

### 客户端 → 服务器

- `screen_connect` - 大屏连接
- `mobile_connect` - 手机连接
- `mobile_disconnect` - 手机断开
- `status` - 状态更新 (大屏发送)

### 服务器 → 客户端

- `connected` - 连接成功
- `status` - 状态广播
- `start_lottery` - 开始抽奖
- `stop_lottery` - 停止抽奖
- `continue_lottery` - 继续抽奖
- `show_winners` - 显示中奖名单
- `skip_winner` - 跳过中奖人员

## 七、前端路由结构

```
/ (重定向到 /login)
├── /login (登录页面)
│
├── /mobile-control (手机控制)
│   ├── /mobile-control/control (控制面板)
│
└── /ct-lottery (主应用)
    ├── /ct-lottery/home (抽奖主页)
    ├── /ct-lottery/demo (演示页)
    └── /ct-lottery/config (配置中心)
        ├── /ct-lottery/config/person (人员配置)
        │   ├── /ct-lottery/config/person/all (人员列表)
        │   └── /ct-lottery/config/person/already (中奖名单)
        ├── /ct-lottery/config/prize (奖项配置)
        ├── /ct-lottery/config/global (全局配置)
        │   ├── /ct-lottery/config/global/face (视图设置)
        │   ├── /ct-lottery/config/global/custom (自定义文字)
        │   ├── /ct-lottery/config/global/image (图片管理)
        │   ├── /ct-lottery/config/global/music (音乐管理)
        │   ├── /ct-lottery/config/global/font (字体管理)
        │   ├── /ct-lottery/config/global/template (模板管理)
        │   └── /ct-lottery/config/global/mobile-control (手机控制设置)
        ├── /ct-lottery/config/special (系统设置)
        └── /ct-lottery/config/readme (使用说明)
```

## 八、安全机制

### 1. 身份认证

- 管理员密码存储在 `LOGIN_CONFIG.md`
- 密码不在代码中硬编码
- 登录状态过期时间: 24小时

### 2. 手机控制安全

- 4-8位数字验证码
- 单设备连接限制
- 大屏锁定机制
- 操作日志记录

### 3. 跨域控制

- Express CORS中间件配置
- Nginx CORS配置

### 4. 权限控制

- 路由守卫 (router.beforeEach)
- API接口权限验证
- 管理员密码验证 (lock API)

## 九、部署架构

```
Ubuntu Server (10.8.9.208)
│
├── Nginx
│   ├── 监听端口: 8088
│   ├── 配置文件: /etc/nginx/sites-available/ct-lottery
│   ├── 反向代理: /api/ → http://localhost:3001
│   └── WebSocket代理: /ws/ → ws://localhost:3001
│
├── Node.js (nvm v20.19.0)
│   ├── 应用目录: /opt/ct-lottery-main
│   ├── 监听端口: 3001
│   ├── 服务管理: systemd
│   ├── 服务文件: /etc/systemd/system/lottery-backend.service
│   └── 启动命令: node server.cjs
│
├── 文件系统
│   ├── 字体: public/fonts/
│   ├── 模板: public/templates/
│   ├── 日志: logs/
│   └── 配置: *.md
│
└── Git
    ├── 仓库: github.com:ctfwubai/ct-lottery.git
    └── 同步方式: SSH
```

## 十、系统特点

1. **前后端分离**: Vue3前端 + Express后端
2. **实时通信**: WebSocket双向通信
3. **响应式设计**: 支持大屏、电脑、手机
4. **数据持久化**: LocalStorage + 文件系统
5. **模块化架构**: 组件化开发,易于维护
6. **多语言支持**: Vue I18n国际化
7. **类型安全**: TypeScript全面覆盖
8. **热重载**: Vite开发体验
9. **生产部署**: Nginx + systemd稳定运行

## 十一、开发环境启动

```bash
# 安装依赖
npm install

# 启动开发环境
npm run dev          # 启动后端服务器 (Port 3001)
npm run dev:fe       # 启动前端开发服务器 (Vite)
npm run dev:all      # 同时启动前后端

# 构建生产版本
npm run build        # 构建前端
```

## 十二、生产环境部署

```bash
# 1. 构建前端
npm run build

# 2. 启动后端服务
sudo systemctl start lottery-backend
sudo systemctl enable lottery-backend

# 3. 重启Nginx
sudo systemctl restart nginx
```

## 十三、目录结构

```
ct-lottery-main/
├── public/                 # 静态资源
│   ├── fonts/             # 字体文件
│   ├── templates/         # 模板文件
│   └── *.md               # 说明文档
├── src/                   # 源代码
│   ├── api/               # API封装
│   ├── components/        # 组件
│   ├── layout/            # 布局组件
│   ├── locales/           # 国际化
│   ├── router/            # 路由
│   ├── store/             # 状态管理
│   ├── style/             # 样式
│   ├── types/             # 类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面
│   └── main.ts            # 入口文件
├── logs/                  # 日志文件
├── static/                # 图片资源
├── server.cjs             # 后端服务器
├── vite.config.ts         # Vite配置
├── package.json           # 依赖配置
└── tsconfig.json          # TypeScript配置
```

---

**架构文档版本**: 1.0
**最后更新**: 2025-01-05
