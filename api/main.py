"""DocuMint API — free OCR + rule-based document parsing + live lounge."""

from __future__ import annotations

import json

from fastapi import FastAPI, File, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from config import settings
from schemas import DetectedLanguage, ExtractResponse, HealthResponse, NewsHeadline, NewsResponse, PlatformStats, SalarySlipFields
from services.excel_export import build_workbook
from services.extraction import extract_fields
from services.language import detect_language
from services.lounge import lounge
from services.news import get_headlines
from services.ocr import extract_text, tesseract_available

app = FastAPI(
    title="DocuMint API",
    version="1.1.0",
    description="Upload any document → free OCR → smart parsing → Excel export",
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


@app.get("/stats", response_model=PlatformStats)
def platform_stats() -> PlatformStats:
    return PlatformStats(**lounge.stats())


@app.get("/news", response_model=NewsResponse)
def news_feed() -> NewsResponse:
    raw = get_headlines()
    return NewsResponse(headlines=[NewsHeadline(**h) for h in raw])


@app.post("/extract", response_model=ExtractResponse)
async def extract_document(file: UploadFile = File(...)) -> ExtractResponse:
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

    lang_code, lang_name, lang_conf = detect_language(raw_text)
    lounge.record_document(lang_code)
    await lounge._broadcast_stats()

    preview = raw_text[:500] + ("…" if len(raw_text) > 500 else "")
    return ExtractResponse(
        fields=fields,
        raw_text_preview=preview,
        ocr_method=method,
        detected_language=DetectedLanguage(code=lang_code, name=lang_name, confidence=lang_conf),
    )


@app.post("/export")
def export_excel(payload: SalarySlipFields) -> Response:
    try:
        xlsx = build_workbook(payload)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Excel export failed: {exc}") from exc

    return Response(
        content=xlsx,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="documint-export.xlsx"'},
    )


@app.websocket("/ws/lounge")
async def lounge_ws(websocket: WebSocket) -> None:
    session_id: str | None = None
    try:
        await websocket.accept()
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = data.get("type")

            if msg_type == "join":
                session_id = await lounge.connect(
                    websocket,
                    data.get("session_id"),
                    data.get("name", ""),
                    data.get("email", ""),
                )
            elif msg_type == "ping" and session_id:
                await lounge.heartbeat(session_id)
            elif msg_type == "chat" and session_id:
                await lounge.handle_chat(session_id, data.get("body", ""))
    except WebSocketDisconnect:
        pass
    finally:
        if session_id:
            await lounge.disconnect(session_id)


def _mount_static_ui() -> None:
    from pathlib import Path

    from fastapi.staticfiles import StaticFiles

    static_dir = Path(__file__).resolve().parent / "static"
    if not static_dir.is_dir():
        return
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")


if settings.serve_static:
    _mount_static_ui()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=settings.api_host, port=settings.api_port, reload=True)
