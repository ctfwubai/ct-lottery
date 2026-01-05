# 字体文件夹使用说明

## 放置字体文件

将你的字体文件放在这个 `public/fonts/` 文件夹中。

## 自动识别（推荐）✨

系统会自动读取 `fonts.json` 文件中的字体列表，无需重命名文件！

### 使用步骤

1. **添加新字体文件**：
   - 直接将字体文件（`.ttf`, `.otf`, `.woff`, `.woff2`）复制到这个文件夹
   - 保持原始文件名，无需修改

2. **更新字体列表**：
   ```bash
   # 在项目根目录执行以下命令生成 fonts.json
   node scripts/generate-fonts-list.js
   ```

3. **刷新页面**：
   - 在浏览器中刷新页面
   - 在字体管理页面即可看到所有字体

## 手动编辑 fonts.json

如果你不想运行脚本，也可以直接编辑 `fonts.json` 文件：

```json
{
  "fonts": [
    {
      "id": "project-你的字体名.ttf",
      "name": "你的字体名",
      "url": "/fonts/你的字体名.ttf",
      "fileName": "你的字体名.ttf"
    }
  ]
}
```

### 添加新字体到 fonts.json

当你要添加新字体时：

1. 将字体文件复制到这个文件夹
2. 在 `fonts.json` 中添加对应的条目
3. 保存文件，刷新浏览器页面

### 示例

假设你添加了 `宋体.ttf`：

```json
{
  "fonts": [
    {
      "id": "project-宋体.ttf",
      "name": "宋体",
      "url": "/fonts/宋体.ttf",
      "fileName": "宋体.ttf"
    },
    {
      "id": "project-SourceHanSansCN-Normal.ttf",
      "name": "SourceHanSansCN-Normal",
      "url": "/fonts/SourceHanSansCN-Normal.ttf",
      "fileName": "SourceHanSansCN-Normal.ttf"
    }
  ]
}
```

## 注意事项

1. 支持格式：`.ttf`, `.otf`, `.woff`, `.woff2`
2. 字体文件名可以包含中文，但建议使用英文名称
3. 建议使用 `.ttf` 或 `.woff2` 格式，兼容性最好
4. 修改 `fonts.json` 后需要刷新浏览器页面才能看到

## 故障排查

如果看不到字体：
1. 检查 `fonts.json` 文件是否存在
2. 检查 `fonts.json` 的格式是否正确（JSON 格式）
3. 检查字体文件的路径是否正确
4. 刷新浏览器页面（Ctrl+F5 强制刷新）
5. 打开浏览器开发者工具（F12）查看控制台是否有错误

