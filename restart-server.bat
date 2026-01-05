@echo off
chcp 65001 >nul
echo Starting backend server...
node server.cjs 2>&1 | tee logs/server-console.log
