# Payleaf — local document reader
$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

Write-Host "`n=== Payleaf ===" -ForegroundColor Green

# API venv
$venv = Join-Path $Root "api\.venv"
if (-not (Test-Path $venv)) {
    Write-Host "Creating Python venv..." -ForegroundColor Yellow
    python -m venv $venv
}

$pip = Join-Path $venv "Scripts\pip.exe"
$python = Join-Path $venv "Scripts\python.exe"

Write-Host "Installing API dependencies..." -ForegroundColor Yellow
& $pip install -q -r (Join-Path $Root "api\requirements.txt")

if (-not (Test-Path (Join-Path $Root "api\.env"))) {
    Copy-Item (Join-Path $Root "api\.env.example") (Join-Path $Root "api\.env")
}

# UI deps
$ui = Join-Path $Root "ui"
if (-not (Test-Path (Join-Path $ui "node_modules"))) {
    Write-Host "Installing UI dependencies..." -ForegroundColor Yellow
    Push-Location $ui
    npm install
    Pop-Location
}

Write-Host "`nStarting API on http://127.0.0.1:8010" -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$Root\api'; & '$python' -m uvicorn main:app --host 127.0.0.1 --port 8010 --reload"
) | Out-Null

Start-Sleep -Seconds 2

Write-Host "Starting UI on http://127.0.0.1:5180" -ForegroundColor Green
Push-Location $ui
npm run dev
