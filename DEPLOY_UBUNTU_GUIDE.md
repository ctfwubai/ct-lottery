# Ubuntu 20.04 抽奖系统部署指南

> 📝 本指南将帮助你从零开始在 Ubuntu 20.04 服务器上成功部署 log-lottery 抽奖系统

---

## 🚀 一键部署脚本 (推荐)

如果你想快速完成部署,可以使用以下一键脚本:

```bash
# 下载部署脚本
curl -fsSL https://raw.githubusercontent.com/LOG1997/log-lottery/main/deploy-ubuntu.sh -o deploy-ubuntu.sh

# 添加执行权限
chmod +x deploy-ubuntu.sh

# 运行部署脚本
sudo ./deploy-ubuntu.sh
```

脚本会自动完成以下操作:
- ✅ 安装 Node.js 18.x
- ✅ 安装 Nginx
- ✅ 克隆项目
- ✅ 安装依赖
- ✅ 构建项目
- ✅ 配置 Nginx
- ✅ 启动服务

---

## 📋 详细手动部署步骤

### 第一步: 系统准备和更新

```bash
# 更新系统包
sudo apt update
sudo apt upgrade -y

# 安装必要的工具
sudo apt install -y git curl wget build-essential
```

### 第二步: 安装 Node.js 18.x

```bash
# 使用 NodeSource 官方仓库安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 安装 Node.js
sudo apt-get install -y nodejs

# 验证安装
node -v  # 应该显示 v18.x.x
npm -v   # 应该显示 v9.x.x 或更高
```

### 第三步: 安装项目依赖工具

```bash
# 安装 pnpm (推荐,速度更快)
npm install -g pnpm

# 验证 pnpm 安装
pnpm -v
```

### 第四步: 克隆项目到服务器

#### 方法 A: 如果你已经复制了项目文件

```bash
# 假设你的项目在 /home/username/log-lottery-main
cd /home/username/log-lottery-main

# 或者直接在当前目录工作
cd /path/to/your/log-lottery-main
```

#### 方法 B: 从 GitHub 克隆 (推荐)

```bash
# 克隆项目
cd /home
git clone https://github.com/LOG1997/log-lottery.git

# 进入项目目录
cd log-lottery
```

### 第五步: 安装项目依赖

```bash
# 进入项目目录 (如果还没进入)
cd /home/log-lottery  # 或你的项目路径

# 使用 pnpm 安装依赖 (推荐)
pnpm install

# 如果 pnpm 失败,使用 npm
# npm install
```

⏱️ **安装时间**: 大约 2-5 分钟,取决于网络速度

### 第六步: 构建项目

```bash
# 构建生产版本
pnpm build

# 或使用 npm
# npm run build
```

⏱️ **构建时间**: 大约 1-3 分钟

构建成功后,会显示:
```
dist/index.html                  0.46 kB
dist/assets/index-xxx.js        540.67 kB
...
build completed in 3.21s
```

### 第七步: 准备部署目录

```bash
# 创建 Nginx 网站目录
sudo mkdir -p /var/www/log-lottery

# 复制构建文件到网站目录
sudo cp -r dist/* /var/www/log-lottery/

# 设置正确的权限
sudo chown -R www-data:www-data /var/www/log-lottery
sudo chmod -R 755 /var/www/log-lottery

# 验证文件复制
ls -la /var/www/log-lottery/
# 应该看到 index.html 和 assets 文件夹
```

### 第八步: 配置 Nginx

#### 8.1 安装 Nginx

```bash
# 安装 Nginx
sudo apt install -y nginx

# 启动 Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 验证状态
sudo systemctl status nginx
```

#### 8.2 创建 Nginx 配置文件

```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/log-lottery
```

**复制以下内容到配置文件:**

```nginx
server {
    listen 80;
    server_name _;  # 使用服务器 IP 或你的域名

    root /var/www/log-lottery;
    index index.html;

    # 日志配置
    access_log /var/log/nginx/log-lottery-access.log;
    error_log /var/log/nginx/log-lottery-error.log;

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

    # Vue Router 单页应用配置
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

**保存并退出:**
- 按 `Ctrl + X`
- 输入 `Y`
- 按 `Enter`

#### 8.3 启用配置

```bash
# 删除默认配置
sudo rm /etc/nginx/sites-enabled/default

# 创建软链接启用配置
sudo ln -s /etc/nginx/sites-available/log-lottery /etc/nginx/sites-enabled/

# 测试 Nginx 配置
sudo nginx -t

# 如果显示 "syntax is ok" 和 "test is successful",则配置正确
# 重启 Nginx
sudo systemctl restart nginx
```

### 第九步: 配置防火墙

```bash
# 检查防火墙状态
sudo ufw status

# 如果防火墙未启用,启用它
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# 如果防火墙已启用,只添加 Nginx 规则
sudo ufw allow 'Nginx Full'

# 验证规则
sudo ufw status
```

### 第十步: 验证部署

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 查看端口监听
sudo netstat -tlnp | grep :80
# 应该看到 nginx 正在监听 80 端口

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/log-lottery-error.log
```

**在浏览器中访问:**
- `http://你的服务器IP`
- 例如: `http://192.168.1.100` 或 `http://your-domain.com`

---

## 🔧 配置 HTTPS (可选但推荐)

### 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书 (替换为你的域名)
sudo certbot --nginx -d your-domain.com

# 按提示输入:
# - 电子邮件地址
# - 同意服务条款
# - 选择是否重定向 HTTP 到 HTTPS (建议选择 2,自动重定向)
```

### 自动续期证书

```bash
# 测试续期
sudo certbot renew --dry-run

# 添加自动续期任务 (已自动添加)
sudo systemctl status certbot.timer
```

---

## 🛠️ 常见问题排查

### 问题 1: 端口 80 被占用

```bash
# 查看占用 80 端口的进程
sudo lsof -i :80

# 如果是 Apache 占用
sudo systemctl stop apache2
sudo systemctl disable apache2

# 重启 Nginx
sudo systemctl restart nginx
```

### 问题 2: 权限错误

```bash
# 重新设置权限
sudo chown -R www-data:www-data /var/www/log-lottery
sudo chmod -R 755 /var/www/log-lottery
```

### 问题 3: 构建失败

```bash
# 清理并重新安装
rm -rf node_modules package-lock.json pnpm-lock.yaml
pnpm install
pnpm build

# 如果还是失败,使用 npm
npm install
npm run build
```

### 问题 4: 页面 404

```bash
# 检查文件是否存在
ls -la /var/www/log-lottery/

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/log-lottery-error.log
```

### 问题 5: 刷新页面后 404

这是 Vue Router 单页应用的正常现象,确保 Nginx 配置中有:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 📊 部署后检查清单

- [ ] Node.js 版本 >= 18.x
- [ ] pnpm/npm 正常工作
- [ ] 项目依赖安装成功
- [ ] 项目构建成功 (dist 目录生成)
- [ ] 文件复制到 /var/www/log-lottery
- [ ] 文件权限正确 (www-data:www-data)
- [ ] Nginx 配置正确且语法测试通过
- [ ] Nginx 服务运行正常
- [ ] 防火墙允许 80 端口
- [ ] 浏览器可以访问网站
- [ ] 页面功能正常
- [ ] (可选) HTTPS 配置成功

---

## 🔄 更新部署

当需要更新项目时:

```bash
# 1. 进入项目目录
cd /home/log-lottery

# 2. 拉取最新代码
git pull

# 3. 安装新依赖 (如果有)
pnpm install

# 4. 重新构建
pnpm build

# 5. 复制新文件
sudo cp -r dist/* /var/www/log-lottery/

# 6. 重新设置权限
sudo chown -R www-data:www-data /var/www/log-lottery
sudo chmod -R 755 /var/www/log-lottery

# 7. 重启 Nginx (通常不需要,但可以确保)
sudo systemctl reload nginx
```

---

## 📁 重要文件位置

| 文件/目录 | 位置 |
|-----------|------|
| 项目源码 | `/home/log-lottery` |
| 部署文件 | `/var/www/log-lottery` |
| Nginx 配置 | `/etc/nginx/sites-available/log-lottery` |
| Nginx 访问日志 | `/var/log/nginx/log-lottery-access.log` |
| Nginx 错误日志 | `/var/log/nginx/log-lottery-error.log` |

---

## 🔍 监控和维护

### 查看实时日志

```bash
# Nginx 访问日志
sudo tail -f /var/log/nginx/log-lottery-access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/log-lottery-error.log

# 系统日志
sudo journalctl -u nginx -f
```

### 重启服务

```bash
# 重启 Nginx
sudo systemctl restart nginx

# 重新加载配置 (不中断服务)
sudo systemctl reload nginx

# 停止 Nginx
sudo systemctl stop nginx

# 启动 Nginx
sudo systemctl start nginx
```

---

## 🎯 快速测试命令

```bash
# 一键测试所有服务
#!/bin/bash
echo "=== 检查 Node.js ==="
node -v && npm -v

echo -e "\n=== 检查 Nginx ==="
sudo systemctl status nginx --no-pager | head -n 5

echo -e "\n=== 检查端口 ==="
sudo netstat -tlnp | grep :80

echo -e "\n=== 检查文件 ==="
ls -la /var/www/log-lottery/index.html

echo -e "\n=== 测试 Nginx 配置 ==="
sudo nginx -t

echo -e "\n=== 检查防火墙 ==="
sudo ufw status | head -n 10
```

保存为 `test-deployment.sh`,运行:

```bash
chmod +x test-deployment.sh
./test-deployment.sh
```

---

## 💡 优化建议

### 1. 启用 HTTP/2

修改 Nginx 配置,在 `listen 80` 后添加:

```nginx
listen 443 ssl http2;
```

### 2. 增加上传文件大小限制

```nginx
# 在 http 块或 server 块中添加
client_max_body_size 10M;
```

### 3. 启用 Brotli 压缩

```bash
# 安装 Brotli 模块
sudo apt install -y nginx-extras
```

在 Nginx 配置中添加:

```nginx
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css text/xml text/javascript application/json application/javascript application/x-javascript application/xml+rss;
```

---

## 📞 获取帮助

如果遇到问题:

1. 检查日志: `sudo tail -f /var/log/nginx/log-lottery-error.log`
2. 验证配置: `sudo nginx -t`
3. 检查权限: `ls -la /var/www/log-lottery`
4. 查看端口: `sudo netstat -tlnp | grep :80`
5. 重启服务: `sudo systemctl restart nginx`

---

**祝你部署成功! 🎉**
