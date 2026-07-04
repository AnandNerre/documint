# Payleaf — single-container deploy (UI + API + OCR)
# Free hosting: Render.com, Fly.io, Railway (Docker)

FROM node:22-alpine AS ui-build
WORKDIR /build/ui
COPY ui/package.json ui/package-lock.json ./
RUN npm ci
COPY ui/ ./
ENV VITE_API_BASE=
ENV VITE_WS_PATH=/ws/lounge
RUN npm run build

FROM python:3.12-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api/ .
COPY --from=ui-build /build/ui/dist ./static

ENV PYTHONUNBUFFERED=1
ENV API_HOST=0.0.0.0
ENV SERVE_STATIC=true

EXPOSE 8000

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
