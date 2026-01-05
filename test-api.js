/**
 * 移动端控制功能 API 测试脚本
 * 使用方法：node test-api.js
 */

const BASE_URL = 'http://localhost:3001';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) { log('✓ ' + message, 'green'); }
function error(message) { log('✗ ' + message, 'red'); }
function info(message) { log('ℹ ' + message, 'blue'); }
function warn(message) { log('⚠ ' + message, 'yellow'); }

// 测试结果
let testsPassed = 0;
let testsFailed = 0;

async function test(name, fn) {
  try {
    await fn();
    success(name);
    testsPassed++;
  } catch (err) {
    error(`${name}: ${err.message}`);
    testsFailed++;
  }
}

// HTTP 请求辅助函数
async function request(method, path, body = null) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  
  return data;
}

// 测试用例
async function runTests() {
  log('\n=== 移动端控制功能 API 测试 ===\n', 'blue');

  // 1. 获取总开关状态
  await test('获取总开关状态', async () => {
    const data = await request('GET', '/api/mobile-control/enabled');
    if (data.success && typeof data.enabled === 'boolean') {
      info(`功能状态: ${data.enabled ? '已启用' : '已禁用'}`);
    } else {
      throw new Error('返回数据格式不正确');
    }
  });

  await new Promise(r => setTimeout(r, 200));

  // 2. 获取验证码
  await test('获取验证码', async () => {
    const data = await request('GET', '/api/mobile-control/code');
    if (data.success && data.code) {
      info(`验证码: ${data.code}`);
    } else {
      throw new Error('获取验证码失败');
    }
  });

  await new Promise(r => setTimeout(r, 200));

  // 3. 验证验证码（正确）
  await test('验证验证码（正确）', async () => {
    const data = await request('POST', '/api/mobile-control/verify', {
      code: '123456',
      device: 'TEST-DEVICE-001'
    });
    if (data.success) {
      info('验证成功');
    } else {
      throw new Error('验证失败');
    }
  });

  await new Promise(r => setTimeout(r, 200));

  // 4. 验证验证码（错误）
  await test('验证验证码（错误）', async () => {
    try {
      await request('POST', '/api/mobile-control/verify', {
        code: '000000',
        device: 'TEST-DEVICE-001'
      });
      throw new Error('应该拒绝错误的验证码');
    } catch (err) {
      if (err.message.includes('Invalid')) {
        info('正确拒绝了错误的验证码');
      } else {
        throw err;
      }
    }
  });

  await new Promise(r => setTimeout(r, 200));

  // 5. 获取大屏状态
  await test('获取大屏状态', async () => {
    const data = await request('GET', '/api/mobile-control/status');
    if (data.success) {
      info(`启用: ${data.enabled}, 锁定: ${data.locked}, 抽奖页面: ${data.inLotteryPage}`);
    } else {
      throw new Error('获取状态失败');
    }
  });

  await new Promise(r => setTimeout(r, 200));

  // 6. 开始抽奖（未锁定）
  await test('开始抽奖（未锁定）', async () => {
    try {
      const data = await request('POST', '/api/mobile-control/start', {
        device: 'TEST-DEVICE-001'
      });
      if (data.success) {
        info('指令已发送');
      } else {
        warn('可能不在抽奖页面或大屏未连接');
      }
    } catch (err) {
      if (err.message.includes('Not in lottery page') || 
          err.message.includes('Screen is locked')) {
        info('状态检查正常: ' + err.message);
      } else {
        throw err;
      }
    }
  });

  await new Promise(r => setTimeout(r, 200));

  // 7. 停止抽奖
  await test('停止抽奖', async () => {
    try {
      const data = await request('POST', '/api/mobile-control/stop', {
        device: 'TEST-DEVICE-001'
      });
      if (data.success) {
        info('指令已发送');
      } else {
        warn('可能不在抽奖页面或大屏未连接');
      }
    } catch (err) {
      if (err.message.includes('Not in lottery page') || 
          err.message.includes('Screen is locked')) {
        info('状态检查正常: ' + err.message);
      } else {
        throw err;
      }
    }
  });

  await new Promise(r => setTimeout(r, 200));

  // 8. 获取操作日志
  await test('获取操作日志', async () => {
    const data = await request('GET', '/api/mobile-control/logs?limit=10');
    if (data.success && Array.isArray(data.logs)) {
      info(`日志条数: ${data.logs.length}`);
      if (data.logs.length > 0) {
        info(`最新日志: ${data.logs[0]}`);
      }
    } else {
      throw new Error('获取日志失败');
    }
  });

  await new Promise(r => setTimeout(r, 200));

  // 9. 更新验证码（需要管理员密码）
  await test('更新验证码（需要管理员密码）', async () => {
    try {
      await request('PUT', '/api/mobile-control/code', {
        password: 'wrong_password',
        newCode: '654321'
      });
      throw new Error('应该拒绝错误的密码');
    } catch (err) {
      if (err.message.includes('Invalid') || err.message.includes('admin')) {
        info('正确拒绝了错误的密码');
      } else {
        throw err;
      }
    }
  });

  await new Promise(r => setTimeout(r, 200));

  // 10. 切换总开关（需要管理员密码）
  await test('切换总开关（需要管理员密码）', async () => {
    try {
      await request('PUT', '/api/mobile-control/enabled', {
        password: 'wrong_password',
        enabled: false
      });
      throw new Error('应该拒绝错误的密码');
    } catch (err) {
      if (err.message.includes('Invalid') || err.message.includes('admin')) {
        info('正确拒绝了错误的密码');
      } else {
        throw err;
      }
    }
  });

  // 测试总结
  log('\n=== 测试总结 ===\n', 'blue');
  success(`通过: ${testsPassed}`);
  if (testsFailed > 0) {
    error(`失败: ${testsFailed}`);
  } else {
    success(`失败: ${testsFailed}`);
  }
  
  const total = testsPassed + testsFailed;
  const percentage = ((testsPassed / total) * 100).toFixed(1);
  info(`通过率: ${percentage}%`);

  if (testsFailed === 0) {
    log('\n🎉 所有测试通过！\n', 'green');
  } else {
    log('\n⚠️ 部分测试失败，请检查。\n', 'yellow');
  }
}

// 运行测试
runTests().catch(err => {
  error('测试运行失败: ' + err.message);
  process.exit(1);
});
