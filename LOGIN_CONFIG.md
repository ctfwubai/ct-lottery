# 登录认证配置说明

## 📝 功能说明

为了保护抽奖系统的安全，现在访问系统时需要登录认证。

## 🔐 默认账号密码

系统默认账号密码：
- **账号**: `admin`
- **密码**: `admin123`

⚠️ **重要提示**: 首次部署后请立即修改默认密码！

## 🛠️ 修改账号密码

### 方法 1: 通过系统设置页面修改（推荐）✨

这是最简单的方法，无需重新构建项目！

**步骤**:

1. 使用默认账号密码登录系统
2. 进入【配置】页面
3. 点击页面底部的齿轮图标 ⚙️
4. 输入高级设置密码（默认: `admin888`）
5. 点击右上角的 **🔑 修改登录密码** 按钮
6. 在弹出的对话框中：
   - 输入当前密码
   - 输入新密码（至少6位）
   - 再次输入新密码确认
7. 点击【确认修改】
8. 修改成功后，下次登录需要使用新密码

**注意事项**:
- 新密码至少需要 6 位字符
- 新密码会保存在浏览器的 localStorage 中
- 如果清除浏览器缓存，密码会恢复到默认值
- 建议定期修改密码以确保安全

### 方法 2: 通过环境变量配置（适用于批量部署）

适用于需要在构建时就预设密码的场景。

1. 编辑 `.env` 文件（开发环境）：
```bash
# 登录认证配置
VITE_AUTH_USERNAME=your_username
VITE_AUTH_PASSWORD=your_strong_password
```

2. 编辑 `.env.production` 文件（生产环境）：
```bash
# 生产环境登录认证配置
VITE_AUTH_USERNAME=your_username
VITE_AUTH_PASSWORD=your_strong_password
```

3. 重新构建项目：
```bash
# 开发环境
pnpm dev

# 生产构建
pnpm build
```

### 方法 3: 直接修改代码（不推荐，仅紧急情况使用）

编辑 `src/views/Login/index.vue` 文件，找到以下代码：

```typescript
const AUTH_USERNAME = import.meta.env.VITE_AUTH_USERNAME || 'admin'
const AUTH_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD || 'admin123'
```

修改默认值即可，但**不推荐**这样做，因为密码会明文存储在代码中。

## 🔒 登录会话管理

- **会话时长**: 24小时
- **存储方式**: localStorage
- **自动过期**: 超过24小时后需要重新登录
- **手动退出**: 点击右上角的登出按钮（🚪）
- **密码优先级**: localStorage 自定义密码 > 环境变量密码 > 默认密码

## 📋 路由保护

所有需要登录才能访问的页面都配置了路由守卫：
- `/log-lottery/*` - 需要登录
- `/log-lottery/home` - 需要登录
- `/log-lottery/config/*` - 需要登录

公开页面（无需登录）：
- `/login` - 登录页面

## 🔧 部署注意事项

### 1. 修改默认密码（二选一）

**方式 A - 通过系统设置修改（推荐）**：
- 部署后登录系统
- 通过系统设置页面修改密码
- 优点：无需重新构建，简单快捷

**方式 B - 通过环境变量修改**：
- 在部署前修改 `.env.production` 文件
- 重新构建项目
- 优点：密码硬编码，适合批量部署

```bash
VITE_AUTH_USERNAME=your_secure_username
VITE_AUTH_PASSWORD=your_secure_password_123!@#
```

### 2. 重新构建（如果使用方式 B）

修改环境变量后需要重新构建：

```bash
pnpm build
```

### 3. 清除浏览器缓存

部署后，用户需要清除浏览器缓存或使用 Ctrl+F5 强制刷新，以确保加载最新版本。

## 🚫 安全建议

1. **使用强密码**: 至少8位，包含大小写字母、数字和特殊字符
2. **定期更换密码**: 建议每3个月更换一次
3. **不要使用默认密码**: 首次部署后立即修改
4. **保护环境变量文件**: 不要将包含敏感信息的 `.env` 文件提交到 Git
5. **限制访问**: 在服务器层面限制访问 IP（可选）

## 🌐 服务器部署示例

### Ubuntu/Nginx 部署

1. 修改 `.env.production` 文件
2. 重新构建：
```bash
pnpm build --mode file
```
3. 部署到 Nginx：
```bash
sudo cp -r dist/* /var/www/log-lottery/
```
4. 重启 Nginx：
```bash
sudo systemctl restart nginx
```

## ❓ 常见问题

### Q: 忘记密码怎么办？

A: 如果忘记密码，可以通过以下方式重置：
1. 清除浏览器 localStorage（F12 → Application → Local Storage → Clear）
2. 这样会恢复到默认密码（admin/admin123）
3. 然后重新登录并修改密码

### Q: 修改密码后其他浏览器无法登录？

A: 这是因为修改的密码保存在当前浏览器的 localStorage 中。解决方案：
- 在每个浏览器中分别修改密码
- 或使用环境变量配置密码（推荐）

### Q: 登录后多久会过期？

A: 登录会话有效期为 24 小时，过期后需要重新登录。

### Q: 可以设置多个账号吗？

A: 当前版本仅支持单一账号密码认证。如需多用户管理，可以考虑后续升级为后端认证系统。

### Q: 如何禁用登录功能？

A: 如果需要禁用登录功能，可以：
1. 修改路由配置 `src/router/index.ts`，移除路由守卫
2. 或将路由的 `requiresAuth` 设置为 `false`

## 📞 技术支持

如有问题，请查看项目 README.md 或提交 Issue。
