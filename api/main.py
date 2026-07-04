"""Payleaf API — free OCR + rule-based payslip parsing."""

from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from config import settings
from schemas import ExtractResponse, HealthResponse, SalarySlipFields
from services.excel_export import build_workbook
from services.extraction import extract_fields
from services.ocr import extract_text, tesseract_available

app = FastAPI(
    title="Payleaf API",
    version="1.0.0",
    description="Upload a payslip → free OCR → smart parsing → Excel export",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_MAX_BYTES = 15 * 1024 * 1024


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        tesseract_available=tesseract_available(),
        parser="rule-based",
        pdf_text_available=True,
    )


@app.post("/extract", response_model=ExtractResponse)
async def extract_salary_slip(file: UploadFile = File(...)) -> ExtractResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(data) > _MAX_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 15 MB).")

    try:
        raw_text, method = extract_text(file.filename, data)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="No readable text found in this file.")

    try:
        fields = extract_fields(raw_text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {exc}") from exc

    preview = raw_text[:500] + ("…" if len(raw_text) > 500 else "")
    return ExtractResponse(fields=fields, raw_text_preview=preview, ocr_method=method)


@app.post("/export")
def export_excel(payload: SalarySlipFields) -> Response:
    try:
        xlsx = build_workbook(payload)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Excel export failed: {exc}") from exc

    return Response(
        content=xlsx,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="payleaf-payslip.xlsx"'},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=settings.api_host, port=settings.api_port, reload=True)
