@echo off
echo ========================================
echo   自动更新字体列表
echo ========================================
echo.

echo 正在生成字体列表...
node scripts\generate-fonts-list.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ 字体列表更新成功！
    echo.
    echo 请刷新浏览器页面查看字体。
) else (
    echo.
    echo ❌ 字体列表更新失败，请检查错误信息。
)

echo.
pause
