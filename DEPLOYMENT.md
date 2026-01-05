# 抽奖系统部署指南

> 📝 本指南提供 Windows 和 Ubuntu 两个平台的完整部署方案

---

## 🚀 快速开始

### 环境要求
- **Node.js** >= 16.0.0
- **pnpm** >= 7.0.0 (推荐) 或 npm/yarn
- **操作系统**: Windows 10+ 或 Ubuntu 18.04+

### 安装依赖
```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm（如果遇到依赖冲突，使用 --legacy-peer-deps）
npm install --legacy-peer-deps

# 或使用 yarn
yarn install
```

### 开发环境运行（带后端服务器）

#### Windows
```bash
# 双击 start.bat 文件，或在命令行运行：
start.bat
```

#### Ubuntu/Linux
```bash
# 启动后端服务器（端口 3001）
node server.cjs &

# 启动前端服务器（端口 5173）
npm run dev:fe
```

访问地址：
- 前端：http://localhost:5173
- 后端API：http://localhost:3001

### 生产环境构建
```bash
# 构建生产版本
pnpm build

# 或
npm run build
```

构建完成后，`dist` 目录包含所有生产文件。

---

## 📋 部署方案对比

| 功能 | Windows | Ubuntu |
|------|---------|---------|
| 开发模式 | 双击 `start.bat` | 手动运行命令 |
| 生产部署 | IIS / Nginx | Nginx (推荐) |
| 进程管理 | PM2 / NSSM | PM2 (推荐) |
| 后端端口 | 3001 | 3001 |
| 前端端口 | 5173 (开发) / 80 (生产) | 5173 (开发) / 80 (生产) |
| 配置文件 | `server.cjs` | `server.cjs` |

---

## 💻 Windows 部署指南

### 方式一：开发模式运行

**适用于：开发和测试阶段**

1. **安装依赖**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **启动服务**
   - 双击 `start.bat` 文件
   - 或在命令行运行：
   ```bash
   start.bat
   ```

3. **访问地址**
   - 前端：http://localhost:5173
   - 后端API：http://localhost:3001

---

### 方式二：生产部署（IIS）

**适用于：Windows Server 部署**

#### 步骤 1：构建项目
```bash
npm run build
```

#### 步骤 2：安装 IIS 和 URL Rewrite
- 打开"控制面板" → "程序和功能" → "启用或关闭 Windows 功能"
- 勾选"Internet Information Services (IIS)"
- 安装 [URL Rewrite Module](https://www.iis.net/downloads/microsoft/url-rewrite)

#### 步骤 3：部署到 IIS
1. 打开 IIS 管理器
2. 添加网站：
   - 物理路径：指向 `dist` 文件夹
   - 端口：80 或其他端口
3. 在网站根目录创建 `web.config`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Vue Router" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".ttf" mimeType="application/font-sfnt" />
    </staticContent>
  </system.webServer>
</configuration>
```

#### 步骤 4：部署后端服务器
```bash
# 使用 PM2 管理进程
npm install -g pm2
pm2 start server.cjs --name log-lottery-backend
pm2 save
pm2 startup
```

---

### 方式三：生产部署（Nginx for Windows）

#### 步骤 1：下载 Nginx
- 访问 http://nginx.org/en/download.html
- 下载 Windows 版本并解压

#### 步骤 2：配置 nginx.conf
```nginx
server {
    listen       80;
    server_name  localhost;

    # 前端
    location / {
        root   D:/path/to/dist;
        index  index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://localhost:3001;
    }
}
```

#### 步骤 3：启动服务
```bash
nginx.exe
```

---

### Windows 常见问题

#### 1. 端口被占用
```bash
# 检查端口
netstat -ano | findstr :3001

# 结束进程
taskkill /PID <PID> /F
```

#### 2. 权限问题
- 以管理员身份运行命令行

#### 3. 防火墙设置
- Windows 设置 → 更新和安全 → Windows 安全中心 → 防火墙和网络保护
- 允许应用通过防火墙，添加 Node.js 和 Nginx

---

## 🐧 Ubuntu 部署指南

### 方式一：开发模式运行

1. **安装环境**
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm
   
   # 安装 Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # 验证安装
   node -v
   npm -v
   ```

2. **安装依赖**
   ```bash
   cd /path/to/log-lottery-main
   npm install --legacy-peer-deps
   ```

3. **启动服务**
   ```bash
   # 启动后端（端口 3001）
   node server.cjs &

   # 启动前端（端口 5173）
   npm run dev:fe
   ```

---

### 方式二：生产部署（Nginx + PM2）

**推荐方案，完整生产环境部署**

#### 步骤 1：安装环境
```bash
# 更新系统
sudo apt update
sudo apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

#### 步骤 2：构建项目
```bash
cd /path/to/log-lottery-main

# 安装依赖
npm install --legacy-peer-deps

# 构建项目
npm run build
```

#### 步骤 3：安装 Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 步骤 4：配置 Nginx
```bash
sudo nano /etc/nginx/sites-available/log-lottery
```

粘贴以下配置：
```nginx
server {
    listen 80;
    server_name _;  # 或你的域名

    # 前端
    location / {
        root /var/www/log-lottery;
        index index.html;
        try_files $uri $uri/ /index.html;

        # Gzip 压缩
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 字体和模板文件
    location ~ ^/(fonts|templates)/ {
        root /var/www/log-lottery;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

保存并退出（Ctrl+X，Y，Enter）

#### 步骤 5：部署前端文件
```bash
# 创建部署目录
sudo mkdir -p /var/www/log-lottery

# 复制构建文件
sudo cp -r dist/* /var/www/log-lottery/

# 复制 public 文件夹（包含 fonts 和 templates）
sudo cp -r public/fonts /var/www/log-lottery/
sudo cp -r public/templates /var/www/log-lottery/

# 设置权限
sudo chown -R www-data:www-data /var/www/log-lottery
sudo chmod -R 755 /var/www/log-lottery

# 验证文件
ls -la /var/www/log-lottery/
```

#### 步骤 6：部署后端服务器
```bash
# 安装 PM2
npm install -g pm2

# 启动后端服务
pm2 start server.cjs --name log-lottery-backend

# 查看状态
pm2 status

# 查看日志
pm2 logs log-lottery-backend

# 设置开机自启
pm2 startup
pm2 save
```

#### 步骤 7：启用 Nginx 配置
```bash
# 删除默认配置
sudo rm /etc/nginx/sites-enabled/default

# 启用配置
sudo ln -s /etc/nginx/sites-available/log-lottery /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 查看 Nginx 状态
sudo systemctl status nginx
```

#### 步骤 8：配置防火墙
```bash
# 检查防火墙状态
sudo ufw status

# 开放端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow OpenSSH
sudo ufw enable

# 验证规则
sudo ufw status
```

#### 步骤 9：访问测试
在浏览器访问：`http://你的服务器IP`

---

### 方式三：配置 HTTPS（可选但推荐）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书（替换为你的域名）
sudo certbot --nginx -d your-domain.com

# 按提示输入：
# - 电子邮件地址
# - 同意服务条款
# - 选择是否重定向 HTTP 到 HTTPS（建议选择 2，自动重定向）

# 测试证书续期
sudo certbot renew --dry-run

# 查看自动续期状态
sudo systemctl status certbot.timer
```

---

### Ubuntu 常见问题

#### 1. 端口被占用
```bash
# 查看占用端口的进程
sudo lsof -i :3001

# 结束进程
sudo kill -9 <PID>
```

#### 2. 权限问题
```bash
# 重新设置权限
sudo chown -R www-data:www-data /var/www/log-lottery
sudo chmod -R 755 /var/www/log-lottery
```

#### 3. 查看日志
```bash
# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# PM2 日志
pm2 logs log-lottery-backend
```

#### 4. 服务管理
```bash
# 重启 Nginx
sudo systemctl restart nginx

# 重新加载 Nginx 配置（不中断服务）
sudo systemctl reload nginx

# PM2 重启后端
pm2 restart log-lottery-backend

# PM2 停止后端
pm2 stop log-lottery-backend

# PM2 删除后端
pm2 delete log-lottery-backend
```

---

## 🔄 更新部署

### Windows 更新
```bash
# 1. 拉取最新代码
git pull

# 2. 安装新依赖
npm install --legacy-peer-deps

# 3. 重新构建
npm run build

# 4. 复制新文件到部署目录
# 手动复制 dist 文件夹内容到 IIS 或 Nginx 根目录

# 5. 重启后端（如果使用 PM2）
pm2 restart log-lottery-backend
```

### Ubuntu 更新
```bash
# 1. 进入项目目录
cd /path/to/log-lottery-main

# 2. 拉取最新代码
git pull

# 3. 安装新依赖
npm install --legacy-peer-deps

# 4. 重新构建
npm run build

# 5. 复制新文件
sudo cp -r dist/* /var/www/log-lottery/
sudo cp -r public/* /var/www/log-lottery/

# 6. 重新设置权限
sudo chown -R www-data:www-data /var/www/log-lottery
sudo chmod -R 755 /var/www/log-lottery

# 7. 重启后端
pm2 restart log-lottery-backend

# 8. 重新加载 Nginx（可选）
sudo systemctl reload nginx
```

---

## 📁 重要文件位置

### Windows
| 文件/目录 | 位置 |
|-----------|------|
| 项目源码 | `D:\ftp\choujiang\log-lottery-main` |
| 构建文件 | `dist` 文件夹 |
| 后端服务器 | `server.cjs` |
| IIS 配置 | 网站根目录下的 `web.config` |
| Nginx 配置 | `conf/nginx.conf` |

### Ubuntu
| 文件/目录 | 位置 |
|-----------|------|
| 项目源码 | `/home/username/log-lottery-main` |
| 部署文件 | `/var/www/log-lottery` |
| 字体文件夹 | `/var/www/log-lottery/fonts` |
| 模板文件夹 | `/var/www/log-lottery/templates` |
| Nginx 配置 | `/etc/nginx/sites-available/log-lottery` |
| Nginx 访问日志 | `/var/log/nginx/access.log` |
| Nginx 错误日志 | `/var/log/nginx/error.log` |

---

## 🔍 监控和维护

### 查看实时日志
```bash
# Ubuntu Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Ubuntu Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# PM2 日志
pm2 logs log-lottery-backend

# Windows 查看 PM2 日志
pm2 logs log-lottery-backend
```

### 健康检查
```bash
# 检查后端服务
curl http://localhost:3001/api/fonts

# 检查前端服务
curl http://localhost/

# 检查 PM2 状态
pm2 status

# 检查 Nginx 状态
sudo systemctl status nginx
```

---

## ⚠️ 部署注意事项

### Windows
1. **防火墙设置**：确保 Windows 防火墙允许相应端口访问
2. **权限问题**：确保运行账户对项目文件夹有读取权限
3. **路径分隔符**：配置文件中使用 `/` 而非 `\`
4. **URL Rewrite**：IIS 部署必须安装 URL Rewrite 模块
5. **端口占用**：确保端口未被其他程序占用
6. **中文路径**：避免项目路径包含中文字符

### Ubuntu
1. **权限问题**：确保对 `/var/www` 目录有正确的读写权限
2. **防火墙**：确保防火墙开放 80/443 端口
3. **SELinux**：如果启用了 SELinux，需要设置正确的上下文
4. **Node.js 版本**：确保使用支持的 Node.js 版本（>=16.0.0）
5. **内存限制**：对于大流量网站，可能需要调整 Nginx 的内存配置
6. **定期备份**：建议定期备份 `public/templates` 和 `public/fonts` 文件夹

---

## 📞 技术支持

如遇到问题，请检查：

1. **控制台错误信息**
2. **浏览器兼容性**（推荐 Chrome 或 Edge 最新版）
3. **网络连接状态**
4. **Node.js 和依赖版本**
5. **防火墙设置**
6. **端口占用情况**

---

**版本**: v2.0.0
**更新时间**: 2024年12月30日
**技术栈**: Vue 3 + TypeScript + Vite + DaisyUI + Pinia + Express