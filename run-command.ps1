# Figma to React Native Converter - PowerShell Script
Write-Host "🎨 Figma to React Native Converter" -ForegroundColor Cyan
Write-Host "=========================================="

# Set parameters from environment variable
$TOKEN = $env:FIGMA_TOKEN
$URL = "https://www.figma.com/design/Wa0Oa4oeMTy5H2Tk32ooqb/CSM?node-id=13995-19114&m=dev"
$OUTPUT = "figma"
$NAME = "CustomView"

# Check if token is provided
if ([string]::IsNullOrEmpty($TOKEN)) {
    Write-Host "❌ ERROR: FIGMA_TOKEN environment variable is not set" -ForegroundColor Red
    Write-Host "   Please set FIGMA_TOKEN in your environment or .env file" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Token: provided" -ForegroundColor Green
Write-Host "   URL: provided" -ForegroundColor Green
Write-Host "   Output: '$OUTPUT'" -ForegroundColor Green
Write-Host "   Name: '$NAME'" -ForegroundColor Green

# Change to script directory
Set-Location -Path $PSScriptRoot

# Clean old files
Write-Host "`n🧹 Cleaning old files..." -ForegroundColor Yellow
if (Test-Path "figma\CustomView.tsx") { Remove-Item "figma\CustomView.tsx" -Force }
if (Test-Path "components\CustomView.tsx") { Remove-Item "components\CustomView.tsx" -Force }

# Build command
$Command = @(
    'npm', 'run', 'cli', '--', 'generate',
    "--token=$TOKEN",
    "--url=$URL",
    "--output=$OUTPUT",
    "--name=$NAME"
)

Write-Host "`n🚀 Running converter..." -ForegroundColor Yellow
Write-Host "Command: $($Command -join ' ')" -ForegroundColor Gray

try {
    # Execute command
    & $Command[0] $Command[1..($Command.Length-1)]

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Conversion completed successfully!" -ForegroundColor Green

        # Check if file was created
        $ExpectedFile = Join-Path $OUTPUT "CustomView.tsx"
        if (Test-Path $ExpectedFile) {
            Write-Host "📄 Generated file: $(Resolve-Path $ExpectedFile)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Warning: Expected file not found at $ExpectedFile" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n❌ Conversion failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error occurred: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=========================================="
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
