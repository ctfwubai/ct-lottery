# 后端服务器说明

## 快速启动

### Windows
```bash
npm run dev
```
这会同时启动：
- 前端开发服务器（端口 5173）
- 后端 API 服务器（端口 3001）

### 分别启动
```bash
# 只启动前端
npm run dev:fe

# 只启动后端
npm run dev:be
```

### Ubuntu 部署
```bash
# 安装依赖
npm install

# 启动（前端+后端）
npm run dev

# 或者生产环境
npm run build
node server.js
```

## API 接口

### 字体管理

#### 获取字体列表
```http
GET http://localhost:3001/api/fonts
```

#### 上传字体
```http
POST http://localhost:3001/api/fonts/upload
Content-Type: application/octet-stream
X-File-Name: font-name.ttf
Body: <binary font data>
```

#### 删除字体
```http
DELETE http://localhost:3001/api/fonts/font-name.ttf
```

### 模板管理

#### 获取模板列表
```http
GET http://localhost:3001/api/templates
```

#### 保存模板
```http
POST http://localhost:3001/api/templates
Content-Type: application/json

{
  "name": "模板名称",
  "data": { ... }
}
```

#### 加载模板
```http
GET http://localhost:3001/api/templates/template-name
```

#### 删除模板
```http
DELETE http://localhost:3001/api/templates/template-name
```

## 使用说明

1. 将字体文件复制到 `public/fonts/` 文件夹
2. 在浏览器字体管理页面点击"刷新字体列表"按钮
3. 可以直接在浏览器中上传新字体（会保存到服务器）
4. 可以直接在浏览器中删除字体（从服务器删除）
5. 无需手动刷新或运行脚本

## 部署注意事项

### Windows 部署
1. 直接复制整个项目文件夹
2. 运行 `npm install`
3. 运行 `npm run dev` 或 `npm run build && node server.js`

### Ubuntu 部署
1. 安装 Node.js 和 npm
2. 复制项目文件夹
3. 运行 `npm install`
4. 运行 `npm run dev` 或 `npm run build && node server.js`

### Docker 部署（可选）
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "server.js"]
```

## 文件夹结构

```
public/
├── fonts/          # 字体文件（自动扫描）
│   ├── font1.ttf
│   ├── font2.ttf
│   └── ...
└── templates/       # 配置模板
    ├── template1.json
    ├── template2.json
    └── ...
```
