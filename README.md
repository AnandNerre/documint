# DocuMint

**DocuMint** by **Yaworldu** — read any document, any language. Private OCR, smart parsing, Excel export.

Upload any document (PDF or image) → open-source OCR reads the text → smart pattern matching pulls out fields → review on screen → download Excel.

No API keys. No login. No cloud AI. Files are never stored.

## Quick start

```powershell
cd payleaf
.\start-dev.ps1
```

- **App:** http://127.0.0.1:5180  
- **API:** http://127.0.0.1:8010/docs  

## How it works (all free)

| Step | Library | Cost |
|------|---------|------|
| Text PDFs | pdfplumber + pypdf | Free |
| Table layouts | pdfplumber tables | Free |
| Images / scans | Tesseract OCR (multi-page) | Free |
| Image cleanup | Pillow preprocessing | Free |
| Field extraction | Rule-based parser (regex + labels) | Free |
| Excel export | openpyxl | Free |

## Optional: Tesseract (for photos & scanned PDFs)

Text-based PDFs work out of the box. For images or scanned documents, install [Tesseract](https://github.com/UB-Mannheim/tesseract/wiki):

```env
# api/.env
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
POPPLER_PATH=C:\path\to\poppler\Library\bin
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service status |
| POST | `/extract` | Upload file → JSON fields |
| POST | `/export` | JSON → `.xlsx` download |

## What is DocuMint?

DocuMint is a **local web app** — you open it in your browser on your own computer.

| What it is | What it is NOT (yet) |
|------------|----------------------|
| Website UI in the browser | Mobile app (Play Store / App Store) |
| Python backend on your PC | Cloud service you log into |
| Free, private, no API keys | Desktop `.exe` installer |

**How you use it locally:** run `start-dev.ps1` → browser opens at `http://127.0.0.1:5180` → upload a document → download Excel.

## Deploy online for free ($0)

| What | Where | Cost |
|------|-------|------|
| **Yaworldu site** (About, Careers) | [Wix](https://wix.com) free | $0 |
| **DocuMint app** (OCR, chat, news) | [Render](https://render.com) free | $0 |
| Code | Your personal GitHub account | $0 |

- **Wix guide:** [WIX.md](WIX.md) — Yaworldu company pages
- **App deploy:** [DEPLOY.md](DEPLOY.md) — push to GitHub, deploy on Render

## Supported documents

- **Types:** payroll slips, invoices, tax forms, bank statements, receipts, letters
- **Currencies:** USD, EUR, GBP, INR, AED, SAR, SGD, CAD, AUD, MYR, PHP, ZAR, NGN and more
- **Labels:** names, dates, amounts, deductions (English labels)
- **Files:** PDF (text or scanned), PNG, JPG, WEBP, TIFF
- **Security:** password-protected PDFs are detected with a clear error message

## Limits (v1)

- English-label document layouts
- Single file at a time
- Unusual formats may need manual edits — that's expected without paid AI
