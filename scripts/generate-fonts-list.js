#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 字体文件夹路径
const fontsDir = path.join(__dirname, 'public', 'fonts');
// 输出文件路径
const outputFile = path.join(fontsDir, 'fonts.json');

try {
  // 检查文件夹是否存在
  if (!fs.existsSync(fontsDir)) {
    console.log('字体文件夹不存在，正在创建...');
    fs.mkdirSync(fontsDir, { recursive: true });
  }

  // 读取文件夹中的所有文件
  const files = fs.readdirSync(fontsDir);

  // 过滤字体文件
  const fontFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.ttf', '.otf', '.woff', '.woff2'].includes(ext);
  });

  // 生成字体列表
  const fonts = fontFiles.map(file => {
    const ext = path.extname(file);
    const name = file.replace(ext, '');

    return {
      id: `project-${file}`,
      name: name,
      url: `/fonts/${file}`,
      fileName: file
    };
  });

  // 写入 JSON 文件
  fs.writeFileSync(outputFile, JSON.stringify({ fonts }, null, 2), 'utf8');

  console.log(`✅ 字体列表已生成！找到 ${fonts.length} 个字体文件：`);
  fonts.forEach(font => {
    console.log(`   - ${font.name} (${font.fileName})`);
  });

} catch (error) {
  console.error('❌ 生成字体列表失败:', error.message);
  process.exit(1);
}
