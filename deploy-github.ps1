# Push DocuMint to GitHub Pages (GitHub only — no Render/Wix)
# Usage: .\deploy-github.ps1 -GitHubUser YOUR_GITHUB_USERNAME

param(
    [Parameter(Mandatory = $true)]
    [string]$GitHubUser,

    [string]$RepoName = "documint"
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$remoteUrl = "https://github.com/$GitHubUser/$RepoName.git"

Write-Host "`n=== DocuMint → GitHub Pages ===" -ForegroundColor Cyan
Write-Host "Live URL: https://$GitHubUser.github.io/$RepoName/`n" -ForegroundColor Green

Push-Location $Root

$status = git status --porcelain
if ($status) {
    git add -A
    git commit -m "Deploy DocuMint on GitHub Pages"
}

git branch -M main

$existing = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote add origin $remoteUrl
} else {
    Write-Host "Remote: $existing" -ForegroundColor Gray
}

Write-Host @"
Create repo first (if needed):
  https://github.com/new
  Name: $RepoName
  Public, no README

Then enable Pages:
  Settings → Pages → Source: GitHub Actions

"@ -ForegroundColor White

$confirm = Read-Host "Ready to push? Press Enter (or N to cancel)"
if ($confirm -eq "N" -or $confirm -eq "n") { exit 0 }

git push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed — create the repo first at https://github.com/new" -ForegroundColor Red
    exit 1
}

Start-Process "https://github.com/$GitHubUser/$RepoName/settings/pages"
Write-Host "`nDone! Enable GitHub Actions as Pages source in Settings → Pages." -ForegroundColor Green
