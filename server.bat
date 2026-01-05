@echo off
chcp 65001 >nul
REM 抽奖系统 - 前后端服务管理脚本 (Windows)
REM 作者: Auto
REM 日期: 2024-12-30

setlocal enabledelayedexpansion

set PROJECT_DIR=D:\ftp\choujiang\log-lottery-main
set BACKEND_NAME=log-lottery-backend

REM 颜色定义
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

:MAIN
echo %BLUE%==========================================%NC%
echo %GREEN%抽奖系统服务管理 (Windows)%NC%
echo %BLUE%==========================================%NC%
echo.
echo 1) 启动服务
echo 2) 停止服务
echo 3) 重启服务
echo 4) 查看状态
echo 5) 查看日志
echo 6) 构建并部署
echo 7) 退出
echo.

set /p choice="请选择 (1-7): "

if "%choice%"=="1" goto START_SERVICES
if "%choice%"=="2" goto STOP_SERVICES
if "%choice%"=="3" goto RESTART_SERVICES
if "%choice%"=="4" goto CHECK_STATUS
if "%choice%"=="5" goto VIEW_LOGS
if "%choice%"=="6" goto REDEPLOY
if "%choice%"=="7" goto EXIT

echo %RED%无效选择，请重新输入%NC%
timeout /t 2 >nul
goto MAIN

:START_SERVICES
echo %GREEN%==========================================%NC%
echo %GREEN%启动前后端服务%NC%
echo %GREEN%==========================================%NC%

REM 启动后端服务
echo %YELLOW%启动后端服务...%NC%
cd /d %PROJECT_DIR%
node server.cjs
if %errorlevel% equ 0 (
    echo %GREEN%✓ 后端服务启动成功%NC%
) else (
    echo %RED%✗ 后端服务启动失败%NC%
)

echo.
echo %GREEN%==========================================%NC%
echo %GREEN%后端服务已启动！%NC%
echo %GREEN%==========================================%NC%
echo %YELLOW%前端访问地址: http://localhost:6719%NC%
echo %YELLOW%后端API地址:  http://localhost:3001%NC%
echo %GREEN%==========================================%NC%

pause
goto MAIN

:STOP_SERVICES
echo %RED%==========================================%NC%
echo %RED%停止后端服务%NC%
echo %RED%==========================================%NC%

REM 检查是否使用 PM2
where pm2 >nul 2>&1
if %errorlevel% equ 0 (
    echo %YELLOW%停止 PM2 后端服务...%NC%
    pm2 stop %BACKEND_NAME%
    if %errorlevel% equ 0 (
        echo %GREEN%✓ 后端服务已停止%NC%
    ) else (
        echo %YELLOW%⚠ 后端服务可能未运行或未使用PM2%NC%
    )
) else (
    echo %YELLOW%停止 node 进程...%NC%
    for /f "tokens=2" %%i in ('tasklist ^| findstr "node.exe"') do (
        taskkill /PID %%i /F >nul 2>&1
    )
    echo %GREEN%✓ 已尝试停止所有 node 进程%NC%
)

pause
goto MAIN

:RESTART_SERVICES
echo %BLUE%==========================================%NC%
echo %BLUE%重启前后端服务%NC%
echo %BLUE%==========================================%NC%

call :STOP_SERVICES
timeout /t 2 >nul
call :START_SERVICES

pause
goto MAIN

:CHECK_STATUS
echo %BLUE%==========================================%NC%
echo %BLUE%检查服务状态%NC%
echo %BLUE%==========================================%NC%

REM 检查 PM2 状态
where pm2 >nul 2>&1
if %errorlevel% equ 0 (
    echo %YELLOW%后端服务状态 (PM2):%NC%
    pm2 status %BACKEND_NAME%
) else (
    echo %YELLOW%后端进程状态:%NC%
    tasklist | findstr "node.exe"
)

REM 检查端口占用
echo.
echo %YELLOW%端口占用情况:%NC%
echo %YELLOW%前端 (6719):%NC%
netstat -ano | findstr ":6719" >nul 2>&1
if %errorlevel% equ 0 (
    echo %GREEN%✓ 端口 6719 正在监听%NC%
) else (
    echo %RED%✗ 端口 6719 未监听%NC%
)

echo %YELLOW%后端 (3001):%NC%
netstat -ano | findstr ":3001" >nul 2>&1
if %errorlevel% equ 0 (
    echo %GREEN%✓ 端口 3001 正在监听%NC%
) else (
    echo %RED%✗ 端口 3001 未监听%NC%
)

echo %BLUE%==========================================%NC%

pause
goto MAIN

:VIEW_LOGS
echo %BLUE%==========================================%NC%
echo %BLUE%查看日志%NC%
echo %BLUE%==========================================%NC%
echo.
echo 选择要查看的日志:
echo 1) PM2 后端日志
echo 2) PM2 错误日志
echo 3) 返回
echo.

set /p log_choice="请选择 (1-3): "

if "%log_choice%"=="1" (
    echo %YELLOW%PM2 后端日志:%NC%
    where pm2 >nul 2>&1
    if %errorlevel% equ 0 (
        pm2 logs %BACKEND_NAME% --lines 50 --nostream
    ) else (
        echo %RED%PM2 未安装%NC%
    )
) else if "%log_choice%"=="2" (
    echo %YELLOW%PM2 错误日志:%NC%
    where pm2 >nul 2>&1
    if %errorlevel% equ 0 (
        pm2 logs %BACKEND_NAME% --err --lines 50 --nostream
    ) else (
        echo %RED%PM2 未安装%NC%
    )
) else if "%log_choice%"=="3" (
    goto MAIN
) else (
    echo %RED%无效选择%NC%
)

pause
goto MAIN

:REDEPLOY
echo %BLUE%==========================================%NC%
echo %BLUE%构建并部署%NC%
echo %BLUE%==========================================%NC%

cd /d %PROJECT_DIR%

echo %YELLOW%安装依赖...%NC%
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo %RED%✗ 依赖安装失败%NC%
    pause
    goto MAIN
)
echo %GREEN%✓ 依赖安装成功%NC%

echo.
echo %YELLOW%构建项目...%NC%
call npm run build
if %errorlevel% neq 0 (
    echo %RED%✗ 构建失败%NC%
    pause
    goto MAIN
)
echo %GREEN%✓ 构建成功%NC%

echo.
echo %GREEN%==========================================%NC%
echo %GREEN%构建完成！%NC%
echo %GREEN%==========================================%NC%

echo %YELLOW%现在运行: npm run dev 启动开发服务器%NC%
echo %YELLOW%或运行: node server.cjs 启动后端服务器%NC%

pause
goto MAIN

:EXIT
echo %GREEN%再见！%NC%
exit /b 0

REM 帮助信息
:HELP
echo %BLUE%==========================================%NC%
echo %BLUE%抽奖系统服务管理脚本 (Windows)%NC%
echo %BLUE%==========================================%NC%
echo.
echo 用法: server.bat [选项]
echo.
echo 选项:
echo   start      启动后端服务
echo   stop       停止后端服务
echo   restart    重启后端服务
echo   status     查看服务状态
echo   logs       查看日志
echo   build      构建项目
echo   help       显示帮助信息
echo.
echo 示例:
echo   server.bat start      # 启动服务
echo   server.bat status     # 查看状态
echo   server.bat logs       # 查看日志
echo.
echo %BLUE%==========================================%NC%

if "%1"=="help" goto EXIT
if "%1"=="--help" goto EXIT
if "%1"=="-h" goto EXIT
goto MAIN
