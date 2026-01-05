# 快速启动指南

## Windows 用户

### 方式一：双击启动（推荐）
1. 双击 `start.bat`
2. 等待两个窗口打开
3. 浏览器访问：http://localhost:5173

### 方式二：命令行启动
```bash
# 终端1：启动后端
node server.js

# 终端2：启动前端
npm run dev:fe
```

### 方式三：开发模式
```bash
# 需要先安装 concurrently
npm install -g concurrently
npm run dev:all
```

## Ubuntu/Linux 用户

### 启动方式
```bash
# 添加执行权限
chmod +x start.sh

# 启动（前端+后端）
./start.sh
```

### 或手动启动
```bash
# 终端1：启动后端
node server.js

# 终端2：启动前端
npm run dev:fe
```

## 验证启动

1. 检查后端是否启动：访问 http://localhost:3001/api/fonts
2. 检查前端是否启动：访问 http://localhost:5173

## 使用字体功能

1. 将字体文件复制到 `public/fonts/` 文件夹
2. 在浏览器打开字体管理页面
3. 点击"刷新字体列表"按钮
4. 或者直接点击"上传字体"按钮上传新字体

## 生产环境部署

### Windows
```bash
npm install
npm run build
node server.js
```

### Ubuntu
```bash
npm install
npm run build
NODE_ENV=production node server.js
```

## 端口说明

- 前端：5173
- 后端 API：3001

如果端口冲突，可以在 `server.js` 中修改：
```javascript
const PORT = process.env.PORT || 3001;
```

## 故障排查

### 端口被占用
```bash
# Windows
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Ubuntu
lsof -i :3001
lsof -i :5173
```

### 找不到后端
1. 检查 `server.js` 是否运行
2. 检查端口 3001 是否被占用
3. 浏览器控制台查看错误（F12）

### 字体无法刷新
1. 确保后端服务器正在运行
2. 确保字体文件在 `public/fonts/` 文件夹
3. 检查服务器日志
