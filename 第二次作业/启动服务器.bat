@echo off
echo ========================================
echo    AI Agent 本地服务器启动工具
echo ========================================
echo.
echo 正在启动服务器...
echo 启动后请访问: http://localhost:8000
echo.
echo 提示: 按 Ctrl+C 可以停止服务器
echo ========================================
echo.

python -m http.server 8000

pause
