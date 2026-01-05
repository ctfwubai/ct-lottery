@echo off
chcp 65001 >nul
echo ========================================
echo   启动抽奖系统（前端+后端）
echo ========================================
echo.

echo [1] 正在启动后端服务器（端口 3001）...
start "后端服务器" cmd /k "node server.cjs"

echo.
echo [2] 等待 3 秒后启动前端...
timeout /t 3 /nobreak >nul

echo [3] 正在启动前端服务器（端口 5173）...
npm run dev:fe

echo.
echo ========================================
echo   启动完成！
echo ========================================
echo.
echo 访问地址：
echo   前端: http://localhost:5173
echo   后端 API: http://localhost:3001
echo.
pause
