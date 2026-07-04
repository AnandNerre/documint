# Payleaf

**Payleaf** — a free, private document reader and parser.

Upload any document (PDF or image) → open-source OCR reads the text → smart pattern matching pulls out fields → review on screen → download Excel.

Works with payroll slips, invoices, tax forms, bank statements, receipts, and more.

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

## What is Payleaf?

Payleaf is a **local web app** — you open it in your browser (Chrome, Edge, etc.) on your own computer.

| What it is | What it is NOT (yet) |
|------------|----------------------|
| Website UI in the browser | Mobile app (Play Store / App Store) |
| Python backend on your PC | Cloud service you log into |
| Free, private, no API keys | Desktop `.exe` installer |

**How you use it locally:** run `start-dev.ps1` → browser opens at `http://127.0.0.1:5180` → upload a document → download Excel.

## Deploy online for free ($0)

No server, no app store needed. Push to **GitHub** and deploy on **Render.com** (free):

1. Create a GitHub repo and push this project
2. Go to [render.com](https://render.com) → **New Blueprint** → connect repo
3. You get a public URL like `https://payleaf.onrender.com`

Full step-by-step guide: **[DEPLOY.md](DEPLOY.md)**

Also works on **Fly.io** (free tier). GitHub Pages / Netlify static hosting alone won't run the OCR backend — you need Docker hosting (Render or Fly).

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
