#!/bin/bash

echo "========================================"
echo "  启动抽奖系统（前端+后端）"
echo "========================================"
echo ""

echo "[1] 正在启动后端服务器..."
node server.cjs &
BACKEND_PID=$!

echo ""
echo "[2] 等待 2 秒后启动前端..."
sleep 2

echo "[3] 正在启动前端服务器..."
npm run dev:fe

# 清理后台进程
trap "kill $BACKEND_PID" EXIT
