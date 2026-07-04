# Deploy DocuMint free (GitHub + Render)
# Usage: .\deploy-free.ps1 -GitHubUser YOUR_GITHUB_USERNAME

param(
    [Parameter(Mandatory = $true)]
    [string]$GitHubUser,

    [string]$RepoName = "documint"
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

Write-Host "`n=== DocuMint Free Deploy ===" -ForegroundColor Cyan
Write-Host "Step 1: Push to GitHub" -ForegroundColor Yellow

$remoteUrl = "https://github.com/$GitHubUser/$RepoName.git"

# Commit any pending changes
Push-Location $Root
$status = git status --porcelain
if ($status) {
    git add -A
    git commit -m "Prepare DocuMint for deploy"
}

# Set remote
$existing = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote add origin $remoteUrl
    Write-Host "Added remote: $remoteUrl" -ForegroundColor Green
} else {
    Write-Host "Remote already set: $existing" -ForegroundColor Gray
}

# Ensure main branch
git branch -M main

Write-Host @"

BEFORE pushing — create the repo on GitHub:
  1. Open https://github.com/new
  2. Repository name: $RepoName
  3. Public
  4. Do NOT add README (we already have one)
  5. Click Create repository

"@ -ForegroundColor White

$confirm = Read-Host "Created the repo? Press Enter to push (or type N to cancel)"
if ($confirm -eq "N" -or $confirm -eq "n") {
    Write-Host "Cancelled. Create repo first, then run this script again." -ForegroundColor Yellow
    exit 0
}

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nPush failed. Common fixes:" -ForegroundColor Red
    Write-Host "  - Create the repo at https://github.com/new" -ForegroundColor Red
    Write-Host "  - Sign in: git credential manager or GitHub CLI" -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 2: Deploy on Render (free)" -ForegroundColor Yellow
Write-Host @"

  1. Open https://dashboard.render.com
  2. Sign up / log in (free — connect GitHub)
  3. Click New + → Blueprint
  4. Connect repo: $GitHubUser/$RepoName
  5. Click Apply — wait 5-10 minutes

Your live app will be at:
  https://documint.onrender.com
  (or similar URL shown in Render dashboard)

"@ -ForegroundColor Green

Start-Process "https://dashboard.render.com/blueprints"

Write-Host "Done! Render dashboard opened in browser." -ForegroundColor Cyan
