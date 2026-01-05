const fs = require('fs');
const path = require('path');

// 测试状态保存和加载
const logsDir = path.join(__dirname, 'logs');
const mobileControlStateFile = path.join(logsDir, 'mobile-control-state.json');

// 模拟状态对象
const mobileControlState = {
  enabled: false,
  verifyCode: '123456',
  isLocked: false,
  isInLotteryPage: false,
};

// 保存状态
function saveMobileControlState() {
  try {
    fs.writeFileSync(mobileControlStateFile, JSON.stringify(mobileControlState, null, 2));
    console.log('[MobileControl] State saved to file');
  } catch (error) {
    console.error('[MobileControl] Failed to save state:', error);
  }
}

// 加载状态
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

console.log('Testing state persistence...');
console.log('Current state:', JSON.stringify(mobileControlState, null, 2));

// 保存
saveMobileControlState();

// 读取
const loaded = loadMobileControlState();
console.log('Loaded state:', JSON.stringify(loaded, null, 2));

// 验证
if (loaded.enabled === mobileControlState.enabled) {
  console.log('✅ Test passed: enabled state matches');
} else {
  console.log('❌ Test failed: enabled state mismatch');
}
