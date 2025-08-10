@echo off
echo Starting Figma to React Native Converter...
echo ==========================================

cd /d "%~dp0"

echo Cleaning old files...
if exist "figma\CustomView.tsx" del "figma\CustomView.tsx"
if exist "components\CustomView.tsx" del "components\CustomView.tsx"

echo Running converter...
if "%FIGMA_TOKEN%"=="" (
    echo ERROR: FIGMA_TOKEN environment variable is not set
    echo Please set FIGMA_TOKEN in your environment or .env file
    pause
    exit /b 1
)
call npm run cli -- generate --token=%FIGMA_TOKEN% --url=https://www.figma.com/design/Wa0Oa4oeMTy5H2Tk32ooqb/CSM?node-id=13995-19114^^^&m=dev --output=figma --name=CustomView

echo.
echo ==========================================
echo Conversion completed!
echo.
pause
