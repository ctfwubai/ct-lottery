# CTF-lottery 抽奖程序部署(windows)说明

>windows 系统上测试调试运行 (以下测试环境运行，成功是有条件的，在这里不多解释。)
>
>后端：D:\ftp\choujiang\ct-lottery-main>node server.cjs 
>
>前端：D:\ftp\choujiang\ct-lottery-main>start.bat 



### 📦 第一部分：Windows 服务器部署

### 一、准备阶段

##### 1.1 检查环境

**确保您的 Windows 服务器已安装：**

- Node.js >= 16.0.0
- npm 或 pnpm

###### 验证安装：

```
node -v
npm -v
```



如果没有安装，请从 [https://nodejs.org](https://nodejs.org/) 下载并安装。

----

### 二、下载和安装 Nginx（Windows）

#### 2.1 下载 Nginx

访问：http://nginx.org/en/download.html

下载最新稳定版（Stable version）的 Windows 版本，例如：`nginx/Windows-x.x.x.zip`

#### 2.2 解压 Nginx

将下载的 zip 文件解压到：

```
C:\nginx\
```

解压后的目录结构：

```
C:\nginx\
├── conf\
│   └── nginx.conf
├── html\
├── logs\
├── nginx.exe
└── ...

```

#### 2.3 启动 Nginx

打开 **命令提示符（以管理员身份运行）**：

```
# 测试配置
nginx -t

# 在浏览器访问
http://localhost
```

如果看到 "Welcome to nginx!" 页面，说明安装成功。

#### 2.4 常用 Nginx 命令

```
# 停止 Nginx
nginx -s stop

# 重新加载配置
nginx -s reload

# 退出
nginx -s quit

# 强制停止（如果无法正常停止）
taskkill /F /IM nginx.exe
```

### 三、部署抽奖系统到 Windows

#### 3.1 准备项目文件

将项目文件夹复制到 Windows 服务器，例如：

```
D:\webapps\ct-lottery\
```

```
D:\webapps\ct-lottery\
├── server.cjs
├── public\
│   ├── fonts\
│   └── templates\
├── src\
├── package.json
└── ...

```

#### 3.2 安装依赖

打开命令提示符，进入项目目录：

```
cd D:\webapps\ct-lottery
npm install  --legacy-peer-deps   # npm install --force 强制安装依赖，特殊时用这个
```

#### 3.3 构建前端项目

```
npm run build
```

构建成功后，会在项目根目录生成 dist 文件夹：

```
D:\webapps\lottery\
├── dist\
│   ├── index.html
│   ├── assets\
│   ├── fonts\
│   └── js\
└── ...

```

#### 3.4 部署前端文件

创建部署目录：

```
mkdir C:\wwwroot\ct-lottery
```

复制构建文件：

```
xcopy /E /I /Y D:\webapps\ct-lottery\dist\* C:\wwwroot\ct-lottery\
```

复制必要的资源文件：

```
xcopy /E /I /Y D:\webapps\ct-lottery\public\fonts C:\wwwroot\ct-lottery\fonts
xcopy /E /I /Y D:\webapps\ct-lottery\public\templates C:\wwwroot\ct-lottery\templates
```

#### 3.5 安装 PM2（进程管理器）

```
npm install -g pm2
npm install -g pm2-windows-startup
pm2-startup install
```

### 3.6 启动后端服务

```
cd D:\webapps\ct-lottery
pm2 start server.cjs --name lottery-backend
pm2 save
```

验证后端运行：

```
pm2 status
pm2 logs lottery-backend
```

在浏览器测试后端：

```
http://localhost:3001/api/fonts
```

### 四、配置 Nginx（Windows）

#### 4.1 编辑 Nginx 配置文件

用文本编辑器（如 Notepad++）打开：

```
C:\nginx\conf\nginx.conf
```

#### 4.2 完整配置内容

将 `nginx.conf` 替换为以下内容：

```
# 工作进程数（建议设置为 CPU 核心数）
worker_processes  2;

events {
    # 每个工作进程的最大连接数
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    # 日志格式
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  logs/access.log  main;

    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout  65;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/x-javascript
        application/xml+rss;

    # 抽奖系统服务器配置
    server {
        listen       80;
        server_name  localhost;

        # 字符集
        charset utf-8;

        # 前端根目录
        root   C:/wwwroot/lottery;
        index  index.html;

        # 前端页面
        location / {
            # Vue Router 单页应用配置
            try_files $uri $uri/ /index.html;
        }

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }

        # 字体文件
        location /fonts/ {
            alias C:/wwwroot/lottery/fonts/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # 模板文件
        location /templates/ {
            alias C:/wwwroot/lottery/templates/;
        }

        # 后端 API 代理
        location /api/ {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_cache_bypass $http_upgrade;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # WebSocket 代理（手机控制功能）
        location /ws/ {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_read_timeout 86400;
        }

        # 禁止访问隐藏文件
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }

        # 错误页面
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
```

#### 4.3 测试 Nginx 配置

```
cd C:\nginx
nginx -t
```

应该显示：

```
nginx: the configuration file C:\nginx/conf/nginx.conf syntax is ok
nginx: configuration file C:\nginx/conf/nginx.conf test is successful
```

#### 4.4 重新加载 Nginx

```
nginx -s reload
```

### 五、Windows 防火墙配置

#### 5.1 添加入站规则

**方法一：通过图形界面**

1. 打开 **Windows Defender 防火墙**
2. 点击 **高级设置**
3. 点击 **入站规则** → **新建规则**
4. 选择 **端口** → **TCP** → 特定本地端口：`80`
5. 选择 **允许连接**
6. 勾选所有网络（域、专用、公用）
7. 输入名称：`Nginx HTTP`
8. 完成

### 六、测试部署

#### 6.1 本地测试

在服务器浏览器访问：

```
http://localhost
```

#### 6.2 外网测试

在其他设备浏览器访问：

```
http://服务器IP地址
```

---

## 🔍 故障排查

### Windows 常见问题

#### 1. 端口被占用

```
# 查看占用端口
netstat -ano | findstr :80
netstat -ano | findstr :3001

# 结束进程
taskkill /PID 进程号 /F

```

#### 2. Nginx 无法启动

```
# 查看错误日志
type C:\nginx\logs\error.log

# 测试配置
cd C:\nginx
nginx -t

```

#### 3. PM2 服务未启动

```
# 查看状态
pm2 status

# 启动服务
pm2 start server.cjs --name lottery-backend

```

## 📊 监控和维护

### Windows 监控

```
# PM2 监控
pm2 monit

# 查看日志
pm2 logs lottery-backend

# 重启服务
pm2 restart lottery-backend

# 重新加载 Nginx
cd C:\nginx
nginx -s reload

```

## 🔄 更新部署

### Windows 更新

```
# 1. 拉取最新代码或上传新文件
# 2. 进入项目目录
cd D:\webapps\lottery

# 3. 安装新依赖
npm install --legacy-peer-deps

# 4. 重新构建
npm run build

# 5. 复制新文件
xcopy /E /I /Y D:\webapps\lottery\dist\* C:\wwwroot\lottery\

# 6. 重启后端
pm2 restart lottery-backend

# 7. 重新加载 Nginx
cd C:\nginx
nginx -s reload

```

## 📁 重要文件位置

### Windows

| 文件/目录  | 位置                               |
| ---------- | ---------------------------------- |
| 项目源码   | `D:\webapps\lottery`               |
| 部署文件   | `C:\wwwroot\lottery`               |
| Nginx 配置 | `C:\nginx\conf\nginx.conf`         |
| Nginx 日志 | `C:\nginx\logs\`                   |
| PM2 配置   | 项目目录下的 `ecosystem.config.js` |

## 🎯 快速参考

### 端口说明

| 服务                | 端口 | 说明                                    |
| ------------------- | ---- | --------------------------------------- |
| 前端（Nginx）       | 80   | HTTP 访问                               |
| 前端（Nginx HTTPS） | 443  | HTTPS 访问                              |
| 后端 API            | 3001 | 内部使用，不对外暴露                    |
| WebSocket           | 3001 | 与后端同端口，路径 `/ws/mobile-control` |

### 常用命令速查

**Windows：**

```
# Nginx
nginx -t          # 测试配置
nginx -s reload   # 重新加载
nginx -s stop     # 停止

# PM2
pm2 status        # 查看状态
pm2 logs          # 查看日志
pm2 restart       # 重启服务

```

---

1. 登录系统（使用默认账号 `admin` / 密码 `admin123`）
2. 手机扫码，验证码默认：123456
3. 点击齿轮图标 ⚙️ 进入高级设置
4. 输入高级设置密码（默认：`admin888`）

