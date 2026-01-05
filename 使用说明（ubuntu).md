# CTF-lottery 抽奖程序部署(Ubuntu)说明

>windows 系统上测试调试运行 (以下测试环境运行，成功是有条件的，在这里不多解释。)
>
>后端：D:\ftp\choujiang\ct-lottery-main>node server.cjs 
>
>前端：D:\ftp\choujiang\ct-lottery-main>start.bat 

### 一、准备阶段

#### 1.1 连接到 Ubuntu 服务器

```
# 使用 SSH 连接
ssh username@your-server-ip
# 例如：ssh root@192.168.1.100
```

#### 1.2 更新系统

```
sudo apt update
sudo apt upgrade -y
```

#### 1.3 安装必要工具

```
sudo apt install -y git curl wget build-essential unzip
```

### 二、安装 Node.js 18.x

```
# 使用 NodeSource 官方仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 安装 Node.js
sudo apt-get install -y nodejs

# 验证安装
node -v  # 应显示 v18.x.x
npm -v   # 应显示 v9.x.x 或更高
```

### 三、安装和配置 Nginx

```sudo apt install -y nginx
# 启动 Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 验证状态
sudo systemctl status nginx
```

#### 3.2 验证 Nginx

```
# 测试配置
sudo nginx -t

# 在浏览器访问
http://服务器IP
```

### 四、部署抽奖系统

#### 4.1 上传文件

```
# 上传压缩包到 /opt目录，解压
root@u-208:/opt#7z x ct-lottery-main.7z 

#cd /opt/ct-lottery-main

```

### 4.2 创建项目目录

```
# 创建部署目录
sudo mkdir -p /var/www/ct-lottery-main

# 设置所有者（将 username 替换为您的用户名）
sudo chown -R $root:$root /opt/ct-lottery-main
sudo chown -R $root:$root /var/www/ct-lottery
```



#### 4.3 安装依赖

```
cd /opt/ct-lottery-main

# 使用 npm（推荐）
npm install --legacy-peer-deps

# 或使用 pnpm
# npm install -g pnpm
# pnpm install
```

#### 4.4 构建项目

```npm run build
npm run build
```

<img width="625" height="137" alt="image" src="https://github.com/user-attachments/assets/a0df23f7-e6c4-46f1-89b5-03d570d965f1" />


提示：权限问题！vue-tsc 没有执行权限。

## 解决方案

```
# 方法一：修复 node_modules 权限（推荐）
chmod +x node_modules/.bin/vue-tsc
chmod +x node_modules/.bin/vite

# 重新构建

npm run build

```

或者

```
npm install --legacy-peer-deps
npx vite build
```

<img width="712" height="748" alt="image" src="https://github.com/user-attachments/assets/c3709b51-98d5-4f78-aecd-4cf3325c7bcd" />





构建成功后会生成 `dist` 文件夹。

### 五、部署前端文件

```
# 复制构建文件到部署目录
sudo cp -r dist/* /var/www/ct-lottery/

# 复制必要的资源文件
sudo cp -r public/fonts /var/www/ct-lottery/
sudo cp -r public/templates /var/www/ct-lottery/

# 设置正确的权限
sudo chown -R www-data:www-data /var/www/ct-lottery
sudo chmod -R 755 /var/www/ct-lottery

# 验证文件
ls -la /var/www/ct-lottery/
```
<img width="756" height="518" alt="image" src="https://github.com/user-attachments/assets/24a68a3e-d3cf-42d9-926a-a0deefb2f4bc" />


-------------

### 六、创建 systemd 服务文件

```
sudo vim /etc/systemd/system/lottery-backend.service
```

注意问题点：

###### 1. 先检查 Node.js 实际路径

```
which node
```

记下返回的路径。

###### 2. 检查 server.cjs 是否存在

```
ls -la /opt/ct-lottery-main/server.cjs
```



```
修改 ExecStart 行，将 /usr/bin/node 替换为实际的 Node.js 路径。

例如，如果 which node 返回 /root/.nvm/versions/node/v20.19.0/bin/node，则改为：

ExecStart=/root/.nvm/versions/node/v20.19.0/bin/node /opt/ct-lottery-main/server.cjs
```


<img width="1684" height="465" alt="image" src="https://github.com/user-attachments/assets/a1748a3e-f78b-481e-8f35-44e9edc5935b" />




粘贴以下内容：

```
[Unit]
Description=Lottery Backend Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/ct-lottery-main
Environment=NODE_ENV=production
Environment=PORT=3001
ExecStart=/usr/bin/node /opt/ct-lottery-main/server.cjs
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=lottery-backend

[Install]
WantedBy=multi-user.target

```

##### 启动和管理服务

```
# 重载 systemd 配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start lottery-backend

# 查看服务状态
sudo systemctl status lottery-backend

# 设置开机自启
sudo systemctl enable lottery-backend

# 查看服务日志
sudo journalctl -u lottery-backend -f

# 停止服务
sudo systemctl stop lottery-backend

# 重启服务
sudo systemctl restart lottery-backend

```
<img width="722" height="310" alt="image" src="https://github.com/user-attachments/assets/4c36d805-5df7-4b83-b334-89d72eaa93e8" />


##### 验证服务

```
# 查看服务状态
sudo systemctl status lottery-backend

# 测试后端 API
curl http://localhost:3001/api/fonts

```

<img width="730" height="61" alt="image" src="https://github.com/user-attachments/assets/c2e8ab03-138b-4b09-85f1-eabd55042730" />


----

### 七、配置 Nginx

#### 7.1 创建 Nginx 配置文件

```
sudo vim /etc/nginx/sites-available/ct-lottery
```

粘贴以下内容：

```
server {
    listen 80;
    server_name _;

    charset utf-8;

    root /var/www/ct-lottery;
    index index.html;

    access_log /var/log/nginx/ct-lottery-access.log;
    error_log /var/log/nginx/ct-lottery-error.log;

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

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location /fonts/ {
        alias /var/www/ct-lottery/fonts/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /templates/ {
        alias /var/www/ct-lottery/templates/;
    }

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

    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}

```

#### 7.2 启用配置

```
# 删除默认配置
sudo rm /etc/nginx/sites-enabled/default

# 创建软链接
sudo ln -s /etc/nginx/sites-available/ct-lottery /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 如果显示 "syntax is ok" 和 "test is successful"，重启 Nginx
sudo systemctl restart nginx

# 查看 Nginx 状态
sudo systemctl status nginx

```

### 八、测试部署

#### 8.1 本地测试

```
# 测试前端
curl http://localhost

# 测试后端 API
curl http://localhost:3001/api/fonts

# 测试 Nginx 代理
curl http://localhost/api/fonts

```

#### 8.2 外网测试

在浏览器访问：

```
http://服务器IP
# 或
https://your-domain.com
```

---

### Ubuntu 常见问题

#### 1. 端口被占用

```
# 查看占用端口的进程
sudo lsof -i :80
sudo lsof -i :3001

# 结束进程
sudo kill -9 PID

```

#### 2. 权限问题

```
# 重新设置权限
sudo chown -R www-data:www-data /var/www/lottery
sudo chmod -R 755 /var/www/lottery
```

#### 3. 查看日志

```
# Nginx 访问日志
sudo tail -f /var/log/nginx/lottery-access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/lottery-error.log

# PM2 日志
pm2 logs lottery-backend

# 系统日志
sudo journalctl -u nginx -f

```

#### 4. 构建失败

```
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

---

### Ubuntu 更新

```
# 1. 进入项目目录
cd /home/lottery

# 2. 拉取最新代码
git pull

# 3. 安装新依赖
npm install --legacy-peer-deps

# 4. 重新构建
npm run build

# 5. 复制新文件
sudo cp -r dist/* /var/www/lottery/
sudo cp -r public/* /var/www/lottery/

# 6. 重新设置权限
sudo chown -R www-data:www-data /var/www/lottery
sudo chmod -R 755 /var/www/lottery

# 7. 重启后端
pm2 restart lottery-backend

# 8. 重新加载 Nginx
sudo systemctl reload nginx

```





## 📁 重要文件位置 Ubuntu

| 文件/目录      | 位置                                 |
| -------------- | ------------------------------------ |
| 项目源码       | `/home/lottery`                      |
| 部署文件       | `/var/www/lottery`                   |
| Nginx 配置     | `/etc/nginx/sites-available/lottery` |
| Nginx 访问日志 | `/var/log/nginx/lottery-access.log`  |
| Nginx 错误日志 | `/var/log/nginx/lottery-error.log`   |
| PM2 配置       | `/home/lottery/ecosystem.config.js`  |

## 🎯 快速参考

### 端口说明

| 服务                | 端口 | 说明                                    |
| ------------------- | ---- | --------------------------------------- |
| 前端（Nginx）       | 80   | HTTP 访问                               |
| 前端（Nginx HTTPS） | 443  | HTTPS 访问                              |
| 后端 API            | 3001 | 内部使用，不对外暴露                    |
| WebSocket           | 3001 | 与后端同端口，路径 `/ws/mobile-control` |

**Ubuntu：**

```
# Nginx
sudo nginx -t                    # 测试配置
sudo systemctl reload nginx     # 重新加载
sudo systemctl restart nginx    # 重启

# PM2
pm2 status                      # 查看状态
pm2 logs                        # 查看日志
pm2 restart lottery-backend     # 重启服务

# 防火墙
sudo ufw status                 # 查看状态

```



1. 登录系统（使用默认账号 `admin` / 密码 `admin123`）
2. 手机扫码，验证码默认：123456
3. 点击齿轮图标 ⚙️ 进入高级设置
4. 输入高级设置密码（默认：`admin888`）

