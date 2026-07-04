"""OCR pipeline: PDF text extraction → image OCR fallback."""

from __future__ import annotations

import io
import shutil
from pathlib import Path

import pdfplumber
import pytesseract
from PIL import Image

from config import settings

_IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".tif"}
_PDF_SUFFIX = ".pdf"


def _configure_tesseract() -> None:
    if settings.tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd


def tesseract_available() -> bool:
    _configure_tesseract()
    return shutil.which(pytesseract.pytesseract.tesseract_cmd or "tesseract") is not None


def _ocr_image(image: Image.Image) -> str:
    _configure_tesseract()
    return pytesseract.image_to_string(image).strip()


def _pdf_text_with_pdfplumber(data: bytes) -> tuple[str, int]:
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        pages = [page.extract_text() or "" for page in pdf.pages]
    text = "\n".join(pages).strip()
    return text, len(pages)


def _pdf_first_page_image(data: bytes) -> Image.Image:
    from pdf2image import convert_from_bytes

    kwargs: dict = {"first_page": 1, "last_page": 1, "dpi": 200}
    if settings.poppler_path:
        kwargs["poppler_path"] = settings.poppler_path
    images = convert_from_bytes(data, **kwargs)
    if not images:
        raise ValueError("Could not render PDF page to image.")
    return images[0]


def extract_text(filename: str, data: bytes) -> tuple[str, str]:
    """
    Returns (text, method).
    method is one of: pdfplumber | tesseract_image | tesseract_pdf
    """
    suffix = Path(filename).suffix.lower()

    if suffix == _PDF_SUFFIX:
        text, page_count = _pdf_text_with_pdfplumber(data)
        if text and len(text) > 40:
            return text, "pdfplumber"

        if not tesseract_available():
            raise RuntimeError(
                "PDF has no embedded text and Tesseract is not installed. "
                "Install Tesseract OCR or upload a clearer image."
            )

        image = _pdf_first_page_image(data)
        ocr_text = _ocr_image(image)
        if not ocr_text:
            raise ValueError("OCR returned empty text. Try a higher-resolution scan.")
        return ocr_text, "tesseract_pdf"

    if suffix in _IMAGE_SUFFIXES:
        if not tesseract_available():
            raise RuntimeError(
                "Tesseract OCR is not installed. Install it to process image uploads."
            )
        image = Image.open(io.BytesIO(data))
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        ocr_text = _ocr_image(image)
        if not ocr_text:
            raise ValueError("OCR returned empty text. The image may be too blurry.")
        return ocr_text, "tesseract_image"

    raise ValueError(f"Unsupported file type '{suffix}'. Upload PDF, PNG, or JPG.")
