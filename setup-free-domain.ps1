# DocuMint — free live URL from India (no US phone)
# Usage: .\setup-free-domain.ps1

$AppUrl = "documint.onrender.com"
$WixSite = "yaworldu.wixsite.com/documint"

Write-Host "`n=== DocuMint — India-friendly setup ===" -ForegroundColor Cyan
Write-Host "No US phone needed. No paid .com.`n" -ForegroundColor Green

Write-Host @"
YOUR FREE URLS
  App:     https://$AppUrl     (Render — use GitHub to sign up)
  Company: https://$WixSite    (Wix — use +91 Indian mobile)

STEP 1 — Deploy on Render
  1. Run: .\deploy-free.ps1 -GitHubUser YOUR_GITHUB_USERNAME
  2. Or open Render → New → Blueprint → connect GitHub repo
  3. Live in ~10 min at https://$AppUrl

STEP 2 — Wix (optional)
  1. wix.com → sign up with Indian +91 number
  2. Button "Launch DocuMint" → https://$AppUrl

STEP 3 — Your email
  Edit ui/src/lib/site.ts → email: 'yourname@gmail.com'

SKIP DigitalPlat if it asks for US (+1) phone — Render URL is enough.

"@ -ForegroundColor White

$open = Read-Host "Open Render dashboard? (Y/n)"
if ($open -ne "n" -and $open -ne "N") {
    Start-Process "https://dashboard.render.com/blueprints"
}

Write-Host "`nShare your app: https://$AppUrl" -ForegroundColor Green
