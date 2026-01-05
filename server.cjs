const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3001;

// 创建 HTTP 服务器
const server = http.createServer(app);

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ server, path: '/ws/mobile-control' });

// 中间件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 启用 CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-File-Name, Authorization');
  next();
});

// 字体文件夹路径
const fontsDir = path.join(__dirname, 'public', 'fonts');

// 确保字体文件夹存在
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// 手机控制日志文件路径
const logsDir = path.join(__dirname, 'logs');
const mobileControlLogFile = path.join(logsDir, 'mobile-control.log');

// 确保日志文件夹存在
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 如果日志文件不存在,创建并添加CSV表头
if (!fs.existsSync(mobileControlLogFile)) {
  const csvHeader = '"时间","设备名","IP地址","操作类型","结果","额外信息"\n';
  fs.writeFileSync(mobileControlLogFile, csvHeader, 'utf8');
}

// 手机控制状态文件路径
const mobileControlStateFile = path.join(logsDir, 'mobile-control-state.json');

// 加载手机控制状态（从文件持久化）
function loadMobileControlState() {
  try {
    if (fs.existsSync(mobileControlStateFile)) {
      const data = fs.readFileSync(mobileControlStateFile, 'utf8');
      const state = JSON.parse(data);
      return {
        enabled: state.enabled !== undefined ? state.enabled : true,
        verifyCode: state.verifyCode || '123456',
        isLocked: state.isLocked || false,
        isInLotteryPage: state.isInLotteryPage || false,
      };
    }
  } catch (error) {
    console.warn('[MobileControl] Failed to load state, using defaults:', error.message);
  }
  // 默认状态
  return {
    enabled: true,
    verifyCode: '123456',
    isLocked: false,
    isInLotteryPage: false,
  };
}

// 保存手机控制状态到文件
function saveMobileControlState() {
  try {
    fs.writeFileSync(mobileControlStateFile, JSON.stringify(mobileControlState, null, 2));
    console.log('[MobileControl] State saved to file');
  } catch (error) {
    console.error('[MobileControl] Failed to save state:', error);
  }
}

// 手机控制状态（内存存储，初始化时从文件加载）
const mobileControlState = loadMobileControlState();

// 管理员密码（从 LOGIN_CONFIG.md 读取）
let adminPassword = 'admin'; // 默认密码

// 读取管理员密码
try {
  const loginConfigPath = path.join(__dirname, 'LOGIN_CONFIG.md');
  if (fs.existsSync(loginConfigPath)) {
    const loginConfig = fs.readFileSync(loginConfigPath, 'utf8');
    // 尝试多种匹配方式
    let passwordMatch = loginConfig.match(/密码[`\s:：]+([^\s\*]+)/);
    if (!passwordMatch) {
      passwordMatch = loginConfig.match(/password[`\s:：]+([^\s\*]+)/i);
    }
    if (!passwordMatch) {
      passwordMatch = loginConfig.match(/\*\*密码\*\*[:\s]+`([^\s]+)`/);
    }
    if (passwordMatch && passwordMatch[1]) {
      adminPassword = passwordMatch[1].replace(/[`'"`]/g, '').trim();
      console.log('[MobileControl] Admin password loaded:', '*'.repeat(adminPassword.length));
    }
  }
} catch (error) {
  console.warn('[MobileControl] Failed to read admin password, using default');
}

// 记录日志
function logMobileControl(action, device, result, extra = {}) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const actionMap = {
    'device_connect': '设备连接',
    'device_disconnect': '设备断开',
    'mobile_start_lottery': '开始抽奖',
    'mobile_stop_lottery': '停止抽奖',
    'mobile_continue_lottery': '继续抽奖',
    'mobile_show_winners': '查看中奖名单',
    'mobile_skip_winner': '跳过中奖人员',
    'lock_control': '锁定控制',
    'toggle_enabled': '切换功能开关',
    'update_code': '更新验证码',
    'verify_code': '验证码验证',
    'clear_logs': '清空日志',
  };

  const actionText = actionMap[action] || action;
  const deviceInfo = device || '未知设备';

  // 从设备信息中提取设备名和IP
  const deviceNameMatch = deviceInfo.match(/^(.+?)\s*\(IP:\s*(.+?)\)$/);
  const deviceName = deviceNameMatch ? deviceNameMatch[1] : deviceInfo;
  const deviceIP = deviceNameMatch ? deviceNameMatch[2] : '';

  // 格式化额外信息
  let extraText = '';
  if (Object.keys(extra).length > 0) {
    extraText = JSON.stringify(extra, (key, value) => {
      if (key === 'action' && typeof value === 'string') {
        return ''; // 不显示action字段,因为已经有actionText了
      }
      return value;
    }).replace(/^{|}$/g, '').replace(/:/g, ': ').replace(/,/g, ', ');
  }
  extraText = extraText.trim();

  // CSV格式: 时间,设备名,IP地址,操作类型,结果,额外信息
  const logLine = `"${timestamp}","${deviceName}","${deviceIP}","${actionText}","${result}","${extraText}"\n`;
  fs.appendFileSync(mobileControlLogFile, logLine, 'utf8');
  console.log('[MobileControl]', logLine.trim());
}

// 获取所有字体文件
app.get('/api/fonts', (req, res) => {
  try {
    const files = fs.readdirSync(fontsDir);
    const fontFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.ttf', '.otf', '.woff', '.woff2'].includes(ext);
    });

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

    res.json({ fonts });
  } catch (error) {
    console.error('Error reading fonts:', error);
    res.status(500).json({ error: 'Failed to read fonts' });
  }
});

// 上传字体文件
app.post('/api/fonts/upload', express.raw({ type: '*/*', limit: '50mb' }), (req, res) => {
  try {
    const fileName = req.headers['x-file-name'] || `font-${Date.now()}.ttf`;
    const filePath = path.join(fontsDir, fileName);

    // 保存文件
    fs.writeFileSync(filePath, req.body);

    res.json({ success: true, fileName, url: `/fonts/${fileName}` });
  } catch (error) {
    console.error('Error uploading font:', error);
    res.status(500).json({ error: 'Failed to upload font' });
  }
});

// 删除字体文件
app.delete('/api/fonts/:fileName', (req, res) => {
  try {
    const fileName = decodeURIComponent(req.params.fileName);
    const filePath = path.join(fontsDir, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error deleting font:', error);
    res.status(500).json({ error: 'Failed to delete font' });
  }
});

// 获取模板文件列表
app.get('/api/templates', (req, res) => {
  try {
    const templatesDir = path.join(__dirname, 'public', 'templates');
    if (!fs.existsSync(templatesDir)) {
      return res.json({ templates: [] });
    }

    const files = fs.readdirSync(templatesDir);
    const templateFiles = files.filter(file => path.extname(file) === '.json');

    const templates = templateFiles.map(file => {
      const filePath = path.join(templatesDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file.replace('.json', ''),
        fileName: file,
        createdAt: stats.mtime.toISOString(),
        size: stats.size
      };
    });

    res.json({ templates });
  } catch (error) {
    console.error('Error reading templates:', error);
    res.status(500).json({ error: 'Failed to read templates' });
  }
});

// 保存模板
app.post('/api/templates', (req, res) => {
  try {
    const { name, data } = req.body;
    const templatesDir = path.join(__dirname, 'public', 'templates');

    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    const fileName = `${name}.json`;
    const filePath = path.join(templatesDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

    res.json({ success: true, fileName });
  } catch (error) {
    console.error('Error saving template:', error);
    res.status(500).json({ error: 'Failed to save template' });
  }
});

// 加载模板
app.get('/api/templates/:fileName', (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'public', 'templates', `${fileName}.json`);

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      res.json(JSON.parse(content));
    } else {
      res.status(404).json({ error: 'Template not found' });
    }
  } catch (error) {
    console.error('Error loading template:', error);
    res.status(500).json({ error: 'Failed to load template' });
  }
});

// 删除模板
app.delete('/api/templates/:fileName', (req, res) => {
  try {
    const fileName = decodeURIComponent(req.params.fileName);
    const filePath = path.join(__dirname, 'public', 'templates', `${fileName}.json`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Template not found' });
    }
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// ========================================
// 手机控制 API
// ========================================

// 验证管理员密码
const verifyAdminPassword = (password) => {
  const isValid = password === adminPassword;
  console.log('[MobileControl] Password verification:', {
    inputLength: password ? password.length : 0,
    expectedLength: adminPassword.length,
    isValid
  });
  return isValid;
};

// 获取验证码
app.get('/api/mobile-control/code', (req, res) => {
  try {
    res.json({
      success: true,
      code: '●'.repeat(mobileControlState.verifyCode.length),
      enabled: mobileControlState.enabled,
    });
  } catch (error) {
    console.error('[MobileControl] Error getting code:', error);
    res.status(500).json({ success: false, error: 'Failed to get code' });
  }
});

// 更新验证码
app.put('/api/mobile-control/code', (req, res) => {
  try {
    const { newCode } = req.body;

    // 验证验证码格式（4-8位数字）
    if (!/^\d{4,8}$/.test(newCode)) {
      return res.status(400).json({ success: false, error: 'Code must be 4-8 digits' });
    }

    mobileControlState.verifyCode = newCode;
    saveMobileControlState(); // 保存状态到文件
    logMobileControl('update_code', req.ip, 'success', { newCodeLength: newCode.length });
    res.json({ success: true });
  } catch (error) {
    console.error('[MobileControl] Error updating code:', error);
    res.status(500).json({ success: false, error: 'Failed to update code' });
  }
});

// 验证码验证
app.post('/api/mobile-control/verify', (req, res) => {
  try {
    const { code, device } = req.body;

    // 检查是否启用
    if (!mobileControlState.enabled) {
      logMobileControl('verify_code', device || req.ip, 'failed', { reason: 'feature_disabled' });
      return res.status(403).json({ success: false, error: 'Mobile control is disabled' });
    }

    // 验证码
    if (code === mobileControlState.verifyCode) {
      logMobileControl('verify_code', device || req.ip, 'success');
      res.json({ success: true, message: 'Verification successful' });
    } else {
      logMobileControl('verify_code', device || req.ip, 'failed', { reason: 'invalid_code' });
      res.status(401).json({ success: false, error: 'Invalid verification code' });
    }
  } catch (error) {
    console.error('[MobileControl] Error verifying code:', error);
    res.status(500).json({ success: false, error: 'Failed to verify code' });
  }
});

// 手机控制 - 开始抽奖
app.post('/api/mobile-control/start', (req, res) => {
  try {
    const { device } = req.body;

    // 检查是否启用
    if (!mobileControlState.enabled) {
      logMobileControl('mobile_start_lottery', device || req.ip, 'failed', { reason: 'feature_disabled' });
      return res.status(403).json({ success: false, error: 'Mobile control is disabled' });
    }

    // 检查是否锁定
    if (mobileControlState.isLocked) {
      logMobileControl('mobile_start_lottery', device || req.ip, 'failed', { reason: 'locked' });
      return res.status(403).json({ success: false, error: 'Screen is locked' });
    }

    // 检查是否在抽奖界面
    if (!mobileControlState.isInLotteryPage) {
      logMobileControl('mobile_start_lottery', device || req.ip, 'failed', { reason: 'not_in_lottery_page' });
      return res.status(403).json({ success: false, error: 'Not in lottery page' });
    }

    // 检查奖项是否已抽完
    try {
      const prizeConfig = JSON.parse(req.body.prizeConfig || '{}');
      const currentPrize = prizeConfig.prizeConfig?.currentPrize;
      if (currentPrize && currentPrize.isUsed) {
        logMobileControl('mobile_start_lottery', device || req.ip, 'failed', { reason: 'prize_used', prizeName: currentPrize.name });
        return res.status(403).json({ success: false, error: `当前奖项【${currentPrize.name}】已抽完，请切换到下一个奖项` });
      }
    } catch (parseError) {
      console.warn('[MobileControl] Failed to parse prize config, skipping prize check:', parseError);
    }

    logMobileControl('mobile_start_lottery', device || req.ip, 'success');

    // 通过 WebSocket 通知大屏开始抽奖
    if (screenClient && screenClient.readyState === WebSocket.OPEN) {
      screenClient.send(JSON.stringify({
        type: 'start_lottery',
      }));
    }

    res.json({ success: true, message: 'Start lottery command sent' });
  } catch (error) {
    console.error('[MobileControl] Error starting lottery:', error);
    res.status(500).json({ success: false, error: 'Failed to start lottery' });
  }
});

// 手机控制 - 停止抽奖
app.post('/api/mobile-control/stop', (req, res) => {
  try {
    const { device } = req.body;

    // 检查是否启用
    if (!mobileControlState.enabled) {
      logMobileControl('mobile_stop_lottery', device || req.ip, 'failed', { reason: 'feature_disabled' });
      return res.status(403).json({ success: false, error: 'Mobile control is disabled' });
    }

    // 检查是否锁定
    if (mobileControlState.isLocked) {
      logMobileControl('mobile_stop_lottery', device || req.ip, 'failed', { reason: 'locked' });
      return res.status(403).json({ success: false, error: 'Screen is locked' });
    }

    // 检查是否在抽奖界面
    if (!mobileControlState.isInLotteryPage) {
      logMobileControl('mobile_stop_lottery', device || req.ip, 'failed', { reason: 'not_in_lottery_page' });
      return res.status(403).json({ success: false, error: 'Not in lottery page' });
    }

    logMobileControl('mobile_stop_lottery', device || req.ip, 'success');

    // 通过 WebSocket 通知大屏停止抽奖
    if (screenClient && screenClient.readyState === WebSocket.OPEN) {
      screenClient.send(JSON.stringify({
        type: 'stop_lottery',
      }));
    }

    res.json({ success: true, message: 'Stop lottery command sent' });
  } catch (error) {
    console.error('[MobileControl] Error stopping lottery:', error);
    res.status(500).json({ success: false, error: 'Failed to stop lottery' });
  }
});

// 手机控制 - 显示中奖名单
app.post('/api/mobile-control/show-winners', (req, res) => {
  try {
    const { device } = req.body;

    console.log('[MobileControl] show-winners API called');
    console.log('[MobileControl] Request body:', req.body);
    console.log('[MobileControl] mobileControlState:', mobileControlState);
    console.log('[MobileControl] screenClient exists:', !!screenClient);
    console.log('[MobileControl] screenClient ready:', screenClient ? screenClient.readyState : 'N/A');

    // 检查是否启用
    if (!mobileControlState.enabled) {
      logMobileControl('mobile_show_winners', device || req.ip, 'failed', { reason: 'feature_disabled' });
      console.error('[MobileControl] Feature disabled');
      return res.status(403).json({ success: false, error: 'Mobile control is disabled' });
    }

    // 检查是否锁定
    if (mobileControlState.isLocked) {
      logMobileControl('mobile_show_winners', device || req.ip, 'failed', { reason: 'locked' });
      console.error('[MobileControl] Screen is locked');
      return res.status(403).json({ success: false, error: 'Screen is locked' });
    }

    // 检查是否在抽奖界面
    if (!mobileControlState.isInLotteryPage) {
      logMobileControl('mobile_show_winners', device || req.ip, 'failed', { reason: 'not_in_lottery_page' });
      console.error('[MobileControl] Not in lottery page');
      return res.status(403).json({ success: false, error: 'Not in lottery page' });
    }

    logMobileControl('mobile_show_winners', device || req.ip, 'success');

    // 通过 WebSocket 通知大屏显示中奖名单
    console.log('[MobileControl] Sending show_winners to screenClient');
    if (screenClient && screenClient.readyState === WebSocket.OPEN) {
      screenClient.send(JSON.stringify({
        type: 'show_winners',
      }));
      console.log('[MobileControl] show_winners message sent successfully');
    } else {
      console.warn('[MobileControl] No screen client connected or ready');
    }

    res.json({ success: true, message: 'Show winners command sent' });
  } catch (error) {
    console.error('[MobileControl] Error showing winners:', error);
    res.status(500).json({ success: false, error: 'Failed to show winners' });
  }
});

// 手机控制 - 跳过中奖人员
app.post('/api/mobile-control/skip-winner', (req, res) => {
  try {
    const { device, winnerId, winnerName } = req.body;

    // 检查是否启用
    if (!mobileControlState.enabled) {
      logMobileControl('mobile_skip_winner', device || req.ip, 'failed', { reason: 'feature_disabled', winnerId, winnerName });
      return res.status(403).json({ success: false, error: 'Mobile control is disabled' });
    }

    // 检查是否锁定
    if (mobileControlState.isLocked) {
      logMobileControl('mobile_skip_winner', device || req.ip, 'failed', { reason: 'locked', winnerId, winnerName });
      return res.status(403).json({ success: false, error: 'Screen is locked' });
    }

    // 检查是否在抽奖界面
    if (!mobileControlState.isInLotteryPage) {
      logMobileControl('mobile_skip_winner', device || req.ip, 'failed', { reason: 'not_in_lottery_page', winnerId, winnerName });
      return res.status(403).json({ success: false, error: 'Not in lottery page' });
    }

    logMobileControl('mobile_skip_winner', device || req.ip, 'success', { winnerId, winnerName });

    // 通过 WebSocket 通知大屏跳过中奖人员
    if (screenClient && screenClient.readyState === WebSocket.OPEN) {
      screenClient.send(JSON.stringify({
        type: 'skip_winner',
        winnerId: winnerId,
        winnerName: winnerName,
      }));
    }

    res.json({ success: true, message: 'Skip winner command sent' });
  } catch (error) {
    console.error('[MobileControl] Error skipping winner:', error);
    res.status(500).json({ success: false, error: 'Failed to skip winner' });
  }
});

// 获取大屏状态
app.get('/api/mobile-control/status', (req, res) => {
  try {
    res.json({
      success: true,
      enabled: mobileControlState.enabled,
      locked: mobileControlState.isLocked,
      inLotteryPage: mobileControlState.isInLotteryPage,
      connected: mobileControlState.connectedDevice !== null,
      prizeInfo: mobileControlState.prizeInfo
    });
  } catch (error) {
    console.error('[MobileControl] Error getting status:', error);
    res.status(500).json({ success: false, error: 'Failed to get status' });
  }
});

// 锁定/解锁大屏（需要管理员密码）
app.post('/api/mobile-control/lock', (req, res) => {
  try {
    const { password, action } = req.body;

    // 验证管理员密码
    if (!verifyAdminPassword(password)) {
      logMobileControl('lock_control', req.ip, 'failed', { reason: 'invalid_admin_password', action });
      return res.status(401).json({ success: false, error: 'Invalid admin password' });
    }

    if (action === 'unlock') {
      mobileControlState.isLocked = false;
      saveMobileControlState(); // 保存状态到文件
      logMobileControl('lock_control', req.ip, 'success', { action: 'unlock' });
      res.json({ success: true, locked: false });
    } else if (action === 'lock') {
      mobileControlState.isLocked = true;
      saveMobileControlState(); // 保存状态到文件
      logMobileControl('lock_control', req.ip, 'success', { action: 'lock' });
      res.json({ success: true, locked: true });
    } else {
      res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('[MobileControl] Error changing lock state:', error);
    res.status(500).json({ success: false, error: 'Failed to change lock state' });
  }
});

// 获取/设置总开关状态
app.get('/api/mobile-control/enabled', (req, res) => {
  try {
    res.json({ success: true, enabled: mobileControlState.enabled });
  } catch (error) {
    console.error('[MobileControl] Error getting enabled state:', error);
    res.status(500).json({ success: false, error: 'Failed to get enabled state' });
  }
});

app.put('/api/mobile-control/enabled', (req, res) => {
  try {
    const { enabled } = req.body;

    mobileControlState.enabled = enabled;
    saveMobileControlState(); // 保存状态到文件
    logMobileControl('toggle_enabled', req.ip, 'success', { enabled });
    res.json({ success: true, enabled: mobileControlState.enabled });
  } catch (error) {
    console.error('[MobileControl] Error toggling enabled state:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle enabled state' });
  }
});

// 获取日志
app.get('/api/mobile-control/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    if (!fs.existsSync(mobileControlLogFile)) {
      return res.json({ success: true, logs: [] });
    }

    const logContent = fs.readFileSync(mobileControlLogFile, 'utf8');
    const lines = logContent.trim().split('\n').filter(Boolean);
    const recentLogs = lines.slice(-limit).reverse();

    res.json({ success: true, logs: recentLogs });
  } catch (error) {
    console.error('[MobileControl] Error reading logs:', error);
    res.status(500).json({ success: false, error: 'Failed to read logs' });
  }
});

// 清空日志
app.delete('/api/mobile-control/logs', (req, res) => {
  try {
    // 添加CSV表头
    const csvHeader = '"时间","设备名","IP地址","操作类型","结果","额外信息"\n';
    fs.writeFileSync(mobileControlLogFile, csvHeader, 'utf8');
    logMobileControl('clear_logs', req.ip, 'success');
    res.json({ success: true, message: 'Logs cleared' });
  } catch (error) {
    console.error('[MobileControl] Error clearing logs:', error);
    res.status(500).json({ success: false, error: 'Failed to clear logs' });
  }
});

// ========================================
// WebSocket 服务器
// ========================================
let screenClient = null; // 大屏客户端
let mobileClients = new Set(); // 手机客户端集合

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log('[WebSocket] New connection from:', clientIp);

  // 心跳检测
  let isAlive = true;
  ws.on('pong', () => {
    isAlive = true;
  });

  // 心跳定时器
  const heartbeatInterval = setInterval(() => {
    if (!isAlive) {
      console.log('[WebSocket] Client timeout, disconnecting:', clientIp);
      ws.terminate();
      return;
    }
    isAlive = false;
    ws.ping();
  }, 30000);

  // 欢迎消息
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to mobile control',
  }));

  // 发送当前状态给新连接的客户端
  broadcastStatus(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('[WebSocket] Received from', clientIp, ':', data);

      switch (data.type) {
        case 'screen_connect':
          // 大屏连接
          if (screenClient && screenClient !== ws) {
            // 已有大屏连接，断开旧的
            screenClient.close();
          }
          screenClient = ws;
          console.log('[WebSocket] Screen connected');
          // 广播当前状态给所有手机端
          broadcastStatusToAllMobileClients();
          break;

        case 'mobile_connect':
          // 手机连接请求
          const deviceName = data.device || '未知设备';
          const deviceInfo = `${deviceName} (IP: ${clientIp})`;
          if (mobileControlState.connectedDevice && mobileControlState.connectedDevice !== data.device) {
            // 已有设备连接，拒绝新连接
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Another device is already connected',
            }));
            ws.close();
            logMobileControl('device_connect', deviceInfo, 'failed', { reason: 'another_device_connected' });
            return;
          }
          mobileClients.add(ws);
          mobileControlState.connectedDevice = data.device;
          logMobileControl('device_connect', deviceInfo, 'success');
          console.log('[WebSocket] Mobile connected:', deviceInfo);
          // 发送当前状态给手机端
          broadcastStatus(ws);
          break;

        case 'mobile_disconnect':
          // 手机断开连接
          logMobileControl('device_disconnect', mobileControlState.connectedDevice || data.device, 'success');
          mobileControlState.connectedDevice = null;
          mobileClients.delete(ws);
          break;

        case 'status':
          // 大屏发送状态更新
          if (data.data) {
            mobileControlState.isLocked = data.data.locked;
            mobileControlState.isInLotteryPage = data.data.inLotteryPage;
            // 更新抽奖状态
            if (data.data.lotteryStatus !== undefined) {
              mobileControlState.lotteryStatus = data.data.lotteryStatus;
            }
            // 缓存奖项信息
            if (data.data.prizeInfo) {
              mobileControlState.prizeInfo = data.data.prizeInfo;
              console.log('[WebSocket] Prize info updated:', data.data.prizeInfo);
            }
            console.log('[WebSocket] Screen status updated:', data.data);
            // 广播状态给所有手机端
            broadcastStatusToAllMobileClients();
          }
          break;

        case 'start_lottery':
          // 手机发送开始抽奖
          logMobileControl('mobile_start_lottery', `${data.device} (${clientIp})`, 'success', { action: '开始抽奖' });
          if (screenClient && screenClient.readyState === WebSocket.OPEN) {
            screenClient.send(JSON.stringify({ type: 'start_lottery' }));
            console.log('[WebSocket] Forwarded start_lottery to screen');
          }
          break;

        case 'stop_lottery':
          // 手机发送停止抽奖
          logMobileControl('mobile_stop_lottery', `${data.device} (${clientIp})`, 'success', { action: '停止抽奖' });
          if (screenClient && screenClient.readyState === WebSocket.OPEN) {
            screenClient.send(JSON.stringify({ type: 'stop_lottery' }));
            console.log('[WebSocket] Forwarded stop_lottery to screen');
          }
          break;

        case 'continue_lottery':
          // 手机发送继续抽奖
          logMobileControl('mobile_continue_lottery', `${data.device} (${clientIp})`, 'success', { action: '继续抽奖' });
          if (screenClient && screenClient.readyState === WebSocket.OPEN) {
            screenClient.send(JSON.stringify({ type: 'continue_lottery' }));
            console.log('[WebSocket] Forwarded continue_lottery to screen');
          }
          break;

        case 'show_winners':
          // 手机发送查看中奖名单
          logMobileControl('mobile_show_winners', `${data.device} (::ffff:${clientIp})`, 'success', { action: '查看中奖名单' });
          console.log('[WebSocket] Forwarded show_winners to screen');
          if (screenClient && screenClient.readyState === WebSocket.OPEN) {
            screenClient.send(JSON.stringify({ type: 'show_winners' }));
            console.log('[WebSocket] show_winners message sent successfully');
          } else {
            console.warn('[WebSocket] No screen client connected or ready');
          }
          break;

        case 'skip_winner':
          // 手机发送跳过中奖人员
          logMobileControl('mobile_skip_winner', `${data.device} (${clientIp})`, 'success', { action: '跳过中奖人员', winnerId: data.winnerId, winnerName: data.winnerName });
          console.log('[WebSocket] Forwarded skip_winner to screen');
          if (screenClient && screenClient.readyState === WebSocket.OPEN) {
            screenClient.send(JSON.stringify({
              type: 'skip_winner',
              winnerId: data.winnerId,
              winnerName: data.winnerName,
            }));
            console.log('[WebSocket] skip_winner message sent successfully');
          } else {
            console.warn('[WebSocket] No screen client connected or ready');
          }
          break;

        default:
          console.warn('[WebSocket] Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('[WebSocket] Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Connection closed:', clientIp);
    clearInterval(heartbeatInterval);

    // 清理连接
    if (screenClient === ws) {
      screenClient = null;
      console.log('[WebSocket] Screen disconnected');
    }
    mobileClients.delete(ws);

    if (mobileControlState.connectedDevice) {
      const deviceInfo = `${mobileControlState.connectedDevice} (IP: ${clientIp})`;
      logMobileControl('device_disconnect', deviceInfo, 'success', { reason: 'connection_closed' });
      mobileControlState.connectedDevice = null;
    }
  });

  ws.on('error', (error) => {
    console.error('[WebSocket] Error:', error);
    logMobileControl('websocket_error', clientIp, 'error', { error: error.message });
  });
});

// 广播状态给指定的客户端
function broadcastStatus(ws) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'status',
      data: {
        enabled: mobileControlState.enabled,
        locked: mobileControlState.isLocked,
        inLotteryPage: mobileControlState.isInLotteryPage,
        lotteryStatus: mobileControlState.lotteryStatus,
        prizeInfo: mobileControlState.prizeInfo,
      },
    }));
  }
}

// 广播状态给所有手机客户端
function broadcastStatusToAllMobileClients() {
  mobileClients.forEach((ws) => {
    broadcastStatus(ws);
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server started: http://localhost:${PORT}`);
  console.log(`✅ Server is listening on all interfaces (0.0.0.0:${PORT})`);
  console.log(`📁 Font directory: ${fontsDir}`);
  console.log(`📝 Template directory: ${path.join(__dirname, 'public', 'templates')}`);
  console.log(`📱 Mobile control: ${mobileControlState.enabled ? 'enabled' : 'disabled'}`);
});
