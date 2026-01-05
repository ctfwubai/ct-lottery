### 项目说明
本项目基于开源项目 log-lottery（[原项目地址](https://github.com/LOG1997/log-lottery)）进行二次开发，核心代码源自 LOG1997 大佬 2025 年 12 月初的版本。
原项目是一款基于 Vue3 + Three.js 构建的炫酷 3D 球体抽奖应用，开箱即用、可高度定制，适用于年会等各类抽奖场景，支持奖品配置、人员管理、界面自定义等核心功能。
本二次开发版本在原项目稳定架构的基础上，针对实际使用场景补充了个性化功能适配，保持了原项目的核心体验与技术优势，同时优化了部分使用细节，感谢 LOG1997 大佬的开源贡献！

### 1.打开大屏主页

- ##### 登录账号：admin  密码：admin123

- ##### 右侧按钮介绍

  - 点击锁定

  >1.锁定大屏手机是无法操作抽奖的。解锁后正常

  - 重置按钮

  > 1.初始化所有数据 （需要输入管理密码:admin888）

<img width="1891" height="959" alt="image" src="https://github.com/user-attachments/assets/281ae84f-f0f3-4766-aaff-dbc90b375b2d" />


  - 恢复飘舞按钮

  > 1.打散人员名单卡片排序
<img width="1909" height="1045" alt="image" src="https://github.com/user-attachments/assets/922f55fa-067c-43a7-894c-11ec85390d9e" />


- 查看中奖人员名单按钮

> 1.可查看和筛选中奖的人员名单，展示作用。
>
> 2.可选指定人员，从中奖名单中跳过。这是避免中奖的人员不在现场，重新把机会留给现场人员。

<img width="1899" height="1054" alt="image" src="https://github.com/user-attachments/assets/a3fdac48-1bc4-466f-ad39-13eea0ae5cc7" />


<img width="1797" height="1009" alt="image" src="https://github.com/user-attachments/assets/1377f5d0-f305-40d3-914c-3945c870a1ab" />

- 退出按钮

> 1.退出当前登录页面

<img width="1898" height="1069" alt="image" src="https://github.com/user-attachments/assets/bcb2a623-f0c0-4345-8752-e4265d2f1415" />



---

### 以下我只介绍我增加的功能

##### 1.人员配置-人员列表

> 1.增加导出
>
> 2.增加手工添加人员信息

<img width="1902" height="1078" alt="image" src="https://github.com/user-attachments/assets/6c472253-25d5-421f-8502-6386d796c550" />

<img width="1712" height="991" alt="image" src="https://github.com/user-attachments/assets/2aeb68df-a895-4c17-9158-09baa1a32af2" />




##### 2.人员配置-中奖人员

> 1.增加导出中奖人员名单为excel格式，方便整理，和签字，提交给财务报账。
>
> 2.移入未中奖名单，相当如把人员信息重新投入奖池。

<img width="1904" height="960" alt="image" src="https://github.com/user-attachments/assets/6a676997-48d3-439a-8c78-4dd52e3bf4fc" />


##### 1.奖品配置

> 1.优化了单词抽取个数。可以自己手动自定义输入。

<img width="1907" height="1012" alt="image" src="https://github.com/user-attachments/assets/c66203a4-8f81-4168-a7c5-8625c9c37779" />

<img width="1920" height="1047" alt="image" src="https://github.com/user-attachments/assets/ff780d4b-014a-47d6-9707-8f2b3823831b" />



##### 4.全局配置-界面设置

> 1.增加了标题字体大小配置
>
> 2.增加了标题字体颜色修改


<img width="1508" height="723" alt="image" src="https://github.com/user-attachments/assets/1e94d83a-5840-4cca-8986-b38ee9e24187" />


##### 5.全局配置-字体管理

> 1.增加了上传字体 和预览配置的选项，主要针对首页主题的，但好像是没什么用，就没有继续去处理这个问题了。后续有时间再看了。

<img width="1899" height="893" alt="image" src="https://github.com/user-attachments/assets/f18467ba-d017-4e89-8350-2aa0b11b2dec" />


##### 6.全局配置-配置模板

> 1.增加了配置模板页：主要目的是当你配置了一些参数信息，可以支持导出和保存，下次需要使用的时候可以快速导入和应用。

<img width="1903" height="920" alt="image" src="https://github.com/user-attachments/assets/757cbf87-51b7-44f1-90f6-58105d5d7ec3" />




##### 7.全局配置-手机控制

> 1.启用手机控制开关，关闭后，抽奖首页，鼠标滑过按钮的时候不会显示二维码。开启就会显示。
>
> 2.当你的电脑有多快网卡的时候，你希望手机扫码后，直接跳转到指定的IP地址或者域名。这里都可以自定义的。
>
> 3.手机扫码跳转到手机控制页面，需要输入密码才能登录，此处就是修改和指定验证码的。默认验证码是：123456
>
> **注意：手机网络和应用网络必须要能够互相访问**
>
> 4.手机连接状态
>
> 5.手机连接后的操作日志。

<img width="1891" height="927" alt="image" src="https://github.com/user-attachments/assets/82d0ac64-a668-4574-bcd7-9fd6090da291" />

<img width="1661" height="583" alt="image" src="https://github.com/user-attachments/assets/1ce02c76-8e8d-4ef0-a414-d7c1c8d661de" />

<img width="1697" height="1033" alt="image" src="https://github.com/user-attachments/assets/8d0799cf-98f4-4929-bb7f-fb48a517754f" />


##### 8..系统设置

> 此处就看各位自己去探究了，但绝对是大家想要的

<img width="1893" height="777" alt="image" src="https://github.com/user-attachments/assets/e2075617-17d5-4d6b-bb7f-0e9949642432" />

<img width="1623" height="1032" alt="image" src="https://github.com/user-attachments/assets/2e395b12-942a-4f6e-89f7-49217176e17d" />


##### 9..操作说明

> 懒得优化，也懒得修复。



##### 10.手机端操作。

> 1.当当前奖项抽取完成后，手机的开始抽奖功能会变成灰色，无法操作。
>
> 2.查看中奖名单，可以调出大屏上的中奖名单，但有前提条件，必须当前奖项全部抽取完毕可以使用。否则只支持大屏鼠标点击使用
<img width="1921" height="938" alt="image" src="https://github.com/user-attachments/assets/0ed95841-64d6-4891-b4a9-70335e65e795" />



<img width="464" height="947" alt="image" src="https://github.com/user-attachments/assets/aeb6dfa3-59b1-4aa2-939d-daf261282e70" />

<img width="487" height="957" alt="image" src="https://github.com/user-attachments/assets/1c1ccc9c-a4a4-4994-9fb3-99e6b19ee8c5" />

-------------------------------------------------------------------------------------------------------------------------------------------------------
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

<img width="625" height="137" alt="image" src="https://github.com/user-attachments/assets/e8cf9159-a4ca-4fd3-80ce-5d5e91b6d501" />


提示：权限问题！vue-tsc 没有执行权限。

## 解决方案

```
# 方法一：修复 node_modules 权限（推荐）
chmod +x node_modules/.bin/vue-tsc
chmod +x node_modules/.bin/vite

# 重新构建

npm run build

```

提示这个：

<img width="717" height="230" alt="image" src="https://github.com/user-attachments/assets/d12b0f1d-836c-4b44-8d11-9fc3777aae1c" />


那就用这个命令：

```
npm install --legacy-peer-deps
npx vite build
```

<img width="712" height="748" alt="image" src="https://github.com/user-attachments/assets/e7bad165-fc8f-4aec-9382-f931de33f086" />




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
<img width="756" height="518" alt="image" src="https://github.com/user-attachments/assets/7a3b48c6-0fc5-4a08-bd02-746129e8e32d" />


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


<img width="1684" height="465" alt="image" src="https://github.com/user-attachments/assets/52bb75c9-95bf-4161-89b1-1098e8b32785" />




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
<img width="722" height="310" alt="image" src="https://github.com/user-attachments/assets/e5364f82-d957-47f9-9499-8323a9e67dd3" />


##### 验证服务

```
# 查看服务状态
sudo systemctl status lottery-backend

# 测试后端 API
curl http://localhost:3001/api/fonts

```

<img width="730" height="61" alt="image" src="https://github.com/user-attachments/assets/d4b825a5-bef3-475b-90ec-a7a07b2bb1fd" />


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

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=ctfwubai/ct-lottery&type=date&legend=top-left)](https://www.star-history.com/#ctfwubai/ct-lottery&type=date&legend=top-left)

