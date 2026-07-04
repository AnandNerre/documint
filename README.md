# Payleaf

**Payleaf** — a free, private payslip reader for India.

Upload a payslip (PDF or image) → open-source OCR reads the text → smart pattern matching pulls out fields → review on screen → download Excel.

No API keys. No login. No cloud AI. Files are never stored.

**Standalone project** — not related to FinanceAI Mortgage or asc-dataai-fin-mortgage.

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
| Text PDFs | pdfplumber | Free |
| Images / scans | Tesseract OCR | Free |
| Field extraction | Rule-based parser (regex + labels) | Free |
| Excel export | openpyxl | Free |

## Optional: Tesseract (for photos & scanned PDFs)

Text-based PDFs work out of the box. For images or scanned slips, install [Tesseract](https://github.com/UB-Mannheim/tesseract/wiki):

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

**How you use it:** run `start-dev.ps1` → open http://127.0.0.1:5180 → upload payslip → download Excel.

## Project structure

```
payleaf/
├── api/          FastAPI backend (OCR + parsing + Excel)
├── ui/           React + Vite + Tailwind frontend
└── start-dev.ps1 Local dev launcher
```

## Limits (v1)

- Indian payslip layouts (English labels)
- Single file at a time
- Unusual formats may need manual edits — that's expected without paid AI
