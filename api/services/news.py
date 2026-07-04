"""Free headline feed from public RSS — no API keys."""

from __future__ import annotations

import time
from dataclasses import dataclass

import httpx

_FEEDS = (
    ("BBC Entertainment", "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml"),
    ("BBC Tech", "https://feeds.bbci.co.uk/news/technology/rss.xml"),
    ("BBC World", "https://feeds.bbci.co.uk/news/world/rss.xml"),
    ("Reuters", "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best"),
)

_CACHE_TTL = 900
_cache: tuple[float, list[dict]] = (0.0, [])

_FALLBACK: list[dict] = [
    {"title": "Payleaf is live — upload any document, get structured data instantly", "source": "Payleaf", "url": "#"},
    {"title": "Auto language detection works on PDFs, scans, and photos", "source": "Payleaf", "url": "#"},
    {"title": "Join the lounge on the right to chat with others in real time", "source": "Payleaf", "url": "#"},
    {"title": "Export clean spreadsheets in one click — 100% free", "source": "Payleaf", "url": "#"},
    {"title": "Your files are processed privately and never stored", "source": "Payleaf", "url": "#"},
]


@dataclass(frozen=True)
class Headline:
    title: str
    source: str
    url: str


def _parse_rss(xml: str, source: str) -> list[Headline]:
    import xml.etree.ElementTree as ET

    items: list[Headline] = []
    try:
        root = ET.fromstring(xml)
    except ET.ParseError:
        return items

    for item in root.iter("item"):
        title_el = item.find("title")
        link_el = item.find("link")
        if title_el is not None and title_el.text:
            title = title_el.text.strip()
            url = (link_el.text or "#").strip() if link_el is not None else "#"
            if len(title) > 12:
                items.append(Headline(title=title[:200], source=source, url=url))
        if len(items) >= 8:
            break
    return items


def _fetch_feed(source: str, url: str) -> list[Headline]:
    try:
        with httpx.Client(timeout=8.0, follow_redirects=True) as client:
            res = client.get(url, headers={"User-Agent": "Payleaf/1.0"})
            if res.status_code == 200 and res.text:
                return _parse_rss(res.text, source)
    except Exception:
        pass
    return []


def get_headlines() -> list[dict]:
    global _cache
    now = time.time()
    if _cache[1] and now - _cache[0] < _CACHE_TTL:
        return _cache[1]

    collected: list[Headline] = []
    for source, url in _FEEDS:
        collected.extend(_fetch_feed(source, url))

    if not collected:
        result = _FALLBACK
    else:
        seen: set[str] = set()
        unique: list[dict] = []
        for h in collected:
            key = h.title.lower()[:60]
            if key in seen:
                continue
            seen.add(key)
            unique.append({"title": h.title, "source": h.source, "url": h.url})
            if len(unique) >= 24:
                break
        result = unique or _FALLBACK

    _cache = (now, result)
    return result
