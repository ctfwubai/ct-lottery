# 自定义扫码链接配置指南

## 功能说明

在多网卡环境或使用域名访问时，系统默认生成的二维码可能无法正常访问。本功能允许您自定义扫码后的访问地址，确保手机能够正确连接到大屏控制。

## 配置位置

**配置页面 → 移动端控制设置 → 自定义扫码链接**

## 使用步骤

### 1. 进入配置页面

1. 点击右上角设置按钮（⚙️）
2. 选择"移动端控制设置"
3. 找到"自定义扫码链接"卡片

### 2. 启用自定义URL

点击"启用自定义URL"开关，展开配置表单

### 3. 配置参数

| 参数 | 说明 | 示例 |
|------|------|------|
| **协议** | 选择 http 或 https | https（如已配置SSL证书） |
| **IP地址或域名** | 输入服务器IP地址或域名 | 192.168.1.100 或 lottery.example.com |
| **端口** | 输入前端服务端口 | 6719（默认） |

### 4. 保存配置

- 点击"保存配置"按钮
- 配置将保存到浏览器本地存储
- 扫码链接会立即更新

## 使用场景

### 场景1：多网卡环境

如果服务器有多个网卡（如同时连接了WiFi和有线网络），系统可能默认使用错误的IP地址。此时需要：

1. 在命令行执行 `ipconfig`（Windows）或 `ifconfig`（Linux/Mac）查看所有IP地址
2. 确定手机能访问的IP地址
3. 在配置页面输入该IP地址

例如：
```
协议: http
IP地址: 192.168.1.100
端口: 6719
```

### 场景2：域名访问

如果已配置域名和SSL证书，使用域名访问更稳定：

1. 确保域名已正确解析到服务器IP
2. 如已配置HTTPS，选择 https 协议
3. 输入域名和端口

例如：
```
协议: https
IP地址: lottery.example.com
端口: 6719
```

### 场景3：局域网访问

如果服务器和手机在同一局域网内：

1. 获取服务器的局域网IP地址
2. 确保手机能ping通该IP
3. 配置自定义URL

例如：
```
协议: http
IP地址: 192.168.0.50
端口: 6719
```

## 获取IP地址的方法

### Windows系统

在命令提示符（CMD）中执行：
```bash
ipconfig
```

查找"无线局域网适配器 WLAN"或"以太网适配器"下的IPv4地址。

### Linux/Mac系统

在终端中执行：
```bash
ifconfig
```

或：
```bash
ip addr show
```

查找 inet 地址。

### 查看所有网络接口

Windows:
```bash
ipconfig /all
```

Linux/Mac:
```bash
ifconfig -a
```

## 网络测试

### 1. 测试IP地址是否可达

在电脑命令行中：
```bash
ping 192.168.1.100
```

在手机浏览器中：
```
http://192.168.1.100:6719/mobile-control
```

### 2. 检查防火墙

确保防火墙允许访问指定端口：
```bash
# Windows防火墙
netsh advfirewall firewall add rule name="Lottery Port" dir=in action=allow protocol=TCP localport=6719

# Linux防火墙（ufw）
sudo ufw allow 6719/tcp

# Linux防火墙（firewalld）
sudo firewall-cmd --permanent --add-port=6719/tcp
sudo firewall-cmd --reload
```

### 3. 检查端口是否被占用

Windows:
```bash
netstat -ano | findstr :6719
```

Linux/Mac:
```bash
lsof -i :6719
```

或：
```bash
netstat -an | grep 6719
```

## 重要：后端服务器配置

### 必须重启后端服务器

如果您修改了后端代码（如 `server.cjs`），**必须重启后端服务器**才能生效：

```bash
# 停止当前运行的服务器（Ctrl+C）
# 然后重新启动
node server.cjs
```

### 后端服务器监听地址

后端服务器已配置为监听所有网络接口（`0.0.0.0:3001`），这意味着：

- ✅ 可以从本地访问：`http://localhost:3001`
- ✅ 可以从局域网访问：`http://192.168.x.x:3001`
- ✅ 可以从外网访问：`http://your-domain.com:3001`（需要配置端口转发）

### 验证后端服务器是否正常运行

1. **检查服务器启动日志**：
   ```
   ✅ Server started: http://localhost:3001
   ✅ Server is listening on all interfaces (0.0.0.0:3001)
   ```

2. **在服务器浏览器中测试**：
   访问 `http://localhost:3001/api/mobile-control/enabled`
   应该返回：
   ```json
   {"success":true,"enabled":true}
   ```

3. **在手机浏览器中测试**：
   访问 `http://192.168.x.x:3001/api/mobile-control/enabled`
   （替换为您的服务器IP）

### 常见后端问题

**问题1：端口被占用**
```
Error: listen EADDRINUSE: address already in use :::3001
```
**解决方法**：
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <进程ID> /F

# Linux/Mac
lsof -i :3001
kill -9 <进程ID>
```

**问题2：手机无法连接**
- 确认后端服务器已启动
- 确认防火墙允许3001端口
- 确认手机和服务器在同一网络
- 在手机浏览器测试API是否可访问

## 注意事项

1. **网络互通性**
   - 确保手机和服务器在同一网络，或服务器IP可被外网访问
   - 不同网络段之间需要路由配置

2. **防火墙设置**
   - 确保防火墙允许访问配置的端口
   - 公网访问需要配置端口转发

3. **HTTPS配置**
   - 使用域名时建议配置SSL证书
   - 选择https协议需要已配置有效的证书

4. **IP地址变化**
   - 如果服务器IP地址经常变化（如DHCP分配），建议：
     - 配置静态IP地址
     - 或使用域名访问

5. **多网卡选择**
   - 服务器有多个网卡时，选择与手机在同一网络的网卡IP
   - 可以通过 `ipconfig` 或 `ifconfig` 查看所有网卡IP

## 配置示例

### 示例1：局域网WiFi访问

```
协议: http
IP地址: 192.168.1.100
端口: 6719
```

生成的链接：
```
http://192.168.1.100:6719/mobile-control
```

### 示例2：公网域名访问

```
协议: https
IP地址: lottery.example.com
端口: 6719
```

生成的链接：
```
https://lottery.example.com:6719/mobile-control
```

### 示例3：本地开发测试

```
协议: http
IP地址: localhost
端口: 6719
```

生成的链接：
```
http://localhost:6719/mobile-control
```

## 常见问题

### Q: 为什么扫码后无法访问？

可能原因：
1. IP地址配置错误
2. 防火墙阻止了端口访问
3. 手机和服务器不在同一网络
4. 前端服务未启动

解决方法：
1. 检查配置的IP地址是否正确
2. 在手机浏览器中手动输入测试
3. 检查防火墙设置
4. 确保前端服务正在运行

### Q: 如何查看当前使用的IP地址？

在配置页面的"当前扫码链接"中会显示实际生成的链接。如果未启用自定义URL，显示的是当前浏览器地址。

### Q: IP地址会变化吗？

DHCP环境下IP地址可能会变化。建议：
1. 在路由器中为服务器配置静态IP
2. 或使用域名访问（推荐）

### Q: 如何在局域网外访问？

1. 配置端口转发（路由器）
2. 使用域名 + DDNS
3. 确保防火墙允许公网访问

### Q: 为什么启用自定义URL后还是用旧地址？

保存配置后，需要重新生成二维码才能生效。刷新页面或重新悬停在开始按钮上即可。

### Q: 支持IPv6地址吗？

支持，但需要注意IPv6地址格式，例如：
```
协议: http
IP地址: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
端口: 6719
```

## 技术细节

### 配置存储位置

配置保存在浏览器 localStorage 中：
```javascript
localStorage.getItem('lottery_custom_url')
```

配置格式：
```json
{
  "enabled": true,
  "protocol": "http",
  "host": "192.168.1.100",
  "port": "6719"
}
```

### 二维码生成逻辑

主页的 `generateQRCode()` 函数会优先读取自定义URL配置：

1. 尝试读取 `localStorage.lottery_custom_url`
2. 如果启用了自定义URL且有配置，使用自定义地址
3. 否则使用 `window.location.origin`

### 相关文件

- `src/views/Config/Global/MobileControlConfig.vue` - 配置界面
- `src/views/Home/index.vue` - 二维码生成逻辑

## 安全建议

1. **不要暴露到公网**
   - 仅在内网使用时，关闭外网访问
   - 确保防火墙正确配置

2. **使用HTTPS**
   - 公网访问必须使用HTTPS
   - 配置有效的SSL证书

3. **定期更换验证码**
   - 确保移动端控制验证码定期更换
   - 不要使用默认的 123456

4. **监控访问日志**
   - 定期检查移动端控制日志
   - 发现异常访问及时处理
