"""Detect document language from extracted text."""

from __future__ import annotations

_LANG_NAMES: dict[str, str] = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "pt": "Portuguese",
    "it": "Italian",
    "nl": "Dutch",
    "ru": "Russian",
    "ar": "Arabic",
    "hi": "Hindi",
    "zh-cn": "Chinese",
    "zh-tw": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "tr": "Turkish",
    "pl": "Polish",
    "sv": "Swedish",
    "da": "Danish",
    "fi": "Finnish",
    "no": "Norwegian",
    "th": "Thai",
    "vi": "Vietnamese",
    "id": "Indonesian",
    "ms": "Malay",
    "tl": "Filipino",
    "bn": "Bengali",
    "ta": "Tamil",
    "te": "Telugu",
    "mr": "Marathi",
    "ur": "Urdu",
    "fa": "Persian",
    "he": "Hebrew",
    "uk": "Ukrainian",
    "cs": "Czech",
    "ro": "Romanian",
    "hu": "Hungarian",
    "el": "Greek",
}


def detect_language(text: str) -> tuple[str, str, float]:
    """Returns (code, display_name, confidence 0–1)."""
    sample = text.strip()[:2000]
    if len(sample) < 20:
        return "unknown", "Unknown", 0.0

    try:
        from langdetect import DetectorFactory, detect_langs

        DetectorFactory.seed = 0
        hits = detect_langs(sample)
        if not hits:
            return "unknown", "Unknown", 0.0
        top = hits[0]
        code = top.lang.lower()
        name = _LANG_NAMES.get(code, code.upper())
        return code, name, round(float(top.prob), 2)
    except Exception:
        return "unknown", "Unknown", 0.0
