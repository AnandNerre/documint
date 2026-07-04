"""OCR pipeline: PDF text + tables → image preprocessing → multi-page OCR fallback."""

from __future__ import annotations

import io
import shutil
from pathlib import Path

import pdfplumber
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from pypdf import PdfReader
from pypdf.errors import PdfReadError

from config import settings

_IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".tif"}
_PDF_SUFFIX = ".pdf"
_MIN_TEXT_CHARS = 30
_OCR_DPI = 250
_TESSERACT_CONFIG = "--psm 6 --oem 3"


def _configure_tesseract() -> None:
    if settings.tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd


def tesseract_available() -> bool:
    _configure_tesseract()
    return shutil.which(pytesseract.pytesseract.tesseract_cmd or "tesseract") is not None


def _check_pdf_encryption(data: bytes) -> None:
    try:
        reader = PdfReader(io.BytesIO(data))
        if reader.is_encrypted:
            try:
                if reader.decrypt("") == 0:
                    raise ValueError(
                        "This PDF is password-protected. Remove the password and upload again."
                    )
            except Exception:
                raise ValueError(
                    "This PDF is password-protected. Remove the password and upload again."
                ) from None
    except PdfReadError as exc:
        raise ValueError(f"Could not read PDF: {exc}") from exc


def _preprocess_image(image: Image.Image) -> Image.Image:
    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")
    gray = ImageOps.grayscale(image)
    enhanced = ImageEnhance.Contrast(gray).enhance(1.6)
    sharpened = enhanced.filter(ImageFilter.SHARPEN)
    return sharpened


def _ocr_image(image: Image.Image) -> str:
    _configure_tesseract()
    processed = _preprocess_image(image)
    return pytesseract.image_to_string(processed, config=_TESSERACT_CONFIG).strip()


def _pypdf_text(data: bytes) -> str:
    reader = PdfReader(io.BytesIO(data))
    parts: list[str] = []
    for page in reader.pages:
        parts.append(page.extract_text() or "")
    return "\n".join(parts).strip()


def _pdf_tables_text(pdf: pdfplumber.PDF) -> str:
    rows: list[str] = []
    for page in pdf.pages:
        for table in page.extract_tables() or []:
            for row in table:
                if not row:
                    continue
                cells = [str(c).strip() if c else "" for c in row]
                if any(cells):
                    rows.append(" | ".join(cells))
    return "\n".join(rows).strip()


def _pdf_text_with_pdfplumber(data: bytes) -> tuple[str, int]:
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        page_count = len(pdf.pages)
        page_text = [page.extract_text() or "" for page in pdf.pages]
        table_text = _pdf_tables_text(pdf)

    body = "\n".join(page_text).strip()
    if table_text:
        body = f"{body}\n\n{table_text}".strip() if body else table_text
    return body, page_count


def _text_quality_score(text: str) -> int:
    if not text:
        return 0
    letters = sum(1 for c in text if c.isalpha())
    digits = sum(1 for c in text if c.isdigit())
    return letters + digits


def _pdf_all_pages_images(data: bytes, page_count: int) -> list[Image.Image]:
    from pdf2image import convert_from_bytes

    kwargs: dict = {"dpi": _OCR_DPI}
    if settings.poppler_path:
        kwargs["poppler_path"] = settings.poppler_path
    if page_count > 0:
        kwargs["first_page"] = 1
        kwargs["last_page"] = min(page_count, 8)
    images = convert_from_bytes(data, **kwargs)
    if not images:
        raise ValueError("Could not render PDF pages to images.")
    return images


def extract_text(filename: str, data: bytes) -> tuple[str, str]:
    """
    Returns (text, method).
    method is one of: pdfplumber | pypdf | tesseract_pdf | tesseract_image
    """
    suffix = Path(filename).suffix.lower()

    if suffix == _PDF_SUFFIX:
        _check_pdf_encryption(data)

        text, page_count = _pdf_text_with_pdfplumber(data)
        if _text_quality_score(text) >= _MIN_TEXT_CHARS:
            return text, "pdfplumber"

        fallback = _pypdf_text(data)
        if _text_quality_score(fallback) > _text_quality_score(text):
            text = fallback
            if _text_quality_score(text) >= _MIN_TEXT_CHARS:
                return text, "pypdf"

        if not tesseract_available():
            raise RuntimeError(
                "PDF has no embedded text and Tesseract is not installed. "
                "Install Tesseract OCR or upload a clearer image."
            )

        images = _pdf_all_pages_images(data, page_count or 1)
        ocr_parts = [_ocr_image(img) for img in images]
        ocr_text = "\n\n".join(p for p in ocr_parts if p).strip()
        if not ocr_text:
            raise ValueError("OCR returned empty text. Try a higher-resolution scan.")
        return ocr_text, "tesseract_pdf"

    if suffix in _IMAGE_SUFFIXES:
        if not tesseract_available():
            raise RuntimeError(
                "Tesseract OCR is not installed. Install it to process image uploads."
            )
        image = Image.open(io.BytesIO(data))
        ocr_text = _ocr_image(image)
        if not ocr_text:
            raise ValueError("OCR returned empty text. The image may be too blurry.")
        return ocr_text, "tesseract_image"

    raise ValueError(f"Unsupported file type '{suffix}'. Upload PDF, PNG, or JPG.")
