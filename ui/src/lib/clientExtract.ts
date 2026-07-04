import * as pdfjs from 'pdfjs-dist'
import { createWorker } from 'tesseract.js'

import { detectLanguage, extractFields } from '@/lib/parser'
import type { ExtractResponse } from '@/types'

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const MAX_PAGES = 8
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp', 'image/tiff'])

async function extractPdfText(data: ArrayBuffer): Promise<string> {
  const doc = await pdfjs.getDocument({ data }).promise
  const parts: string[] = []
  const limit = Math.min(doc.numPages, MAX_PAGES)
  for (let p = 1; p <= limit; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    if (pageText.trim()) parts.push(pageText)
  }
  if (parts.join('').trim()) return parts.join('\n\n')

  // Scanned PDF — OCR first pages as images (simplified: render page 1)
  const page = await doc.getPage(1)
  const viewport = page.getViewport({ scale: 2 })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not render PDF for OCR.')
  await page.render({ canvasContext: ctx, viewport }).promise
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PDF render failed'))), 'image/png')
  })
  return ocrImageBlob(blob)
}

async function ocrImageBlob(blob: Blob): Promise<string> {
  const worker = await createWorker('eng', 1, {
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core-simd-lstm.wasm.js',
    langPath: 'https://tessdata.projectnaptha.com/4.0.0',
  })
  try {
    const { data } = await worker.recognize(blob)
    return data.text
  } finally {
    await worker.terminate()
  }
}

async function extractImageText(file: File): Promise<string> {
  return ocrImageBlob(file)
}

function extOf(name: string): string {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i + 1).toLowerCase() : ''
}

export async function clientExtractDocument(file: File): Promise<ExtractResponse> {
  const ext = extOf(file.name)
  const buf = await file.arrayBuffer()

  let rawText: string
  let method: string

  if (ext === 'pdf' || file.type === 'application/pdf') {
    rawText = await extractPdfText(buf)
    method = rawText.trim() ? 'pdf-text (browser)' : 'ocr (browser)'
  } else if (IMAGE_TYPES.has(file.type) || ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tif', 'tiff'].includes(ext)) {
    rawText = await extractImageText(file)
    method = 'ocr (browser)'
  } else {
    throw new Error('Unsupported file type. Use PDF or an image (PNG, JPG, WebP).')
  }

  if (!rawText.trim()) throw new Error('No readable text found in this file.')

  const fields = extractFields(rawText)
  const detected_language = detectLanguage(rawText)
  const preview = rawText.slice(0, 500) + (rawText.length > 500 ? '…' : '')

  const count = parseInt(localStorage.getItem('documint-parsed-count') ?? '0', 10) + 1
  localStorage.setItem('documint-parsed-count', String(count))

  return { fields, raw_text_preview: preview, ocr_method: method, detected_language }
}
