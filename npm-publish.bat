@echo off
chcp 65001 >nul
echo ======================================
echo    NPM 一键发布脚本 (Windows)
echo ======================================
echo.

REM 检查 Node.js 和 NPM
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] Node.js 未安装或不在 PATH 中
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] NPM 未安装或不在 PATH 中
    pause
    exit /b 1
)

echo [信息] 检查 Node.js 和 NPM 版本...
node --version
npm --version
echo.

REM 运行发布脚本
echo [信息] 启动 NPM 发布流程...
echo.
node publish-to-npm.js

if %errorLevel% neq 0 (
    echo.
    echo [错误] 发布失败，请查看上面的错误信息
    pause
    exit /b %errorLevel%
)

echo.
echo [成功] 发布完成！
pause