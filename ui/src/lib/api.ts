import type { ExtractResponse, HealthResponse, NewsResponse, PlatformStats, SalarySlipFields } from '@/types'
import { clientExtractDocument } from '@/lib/clientExtract'
import { downloadExcelClient } from '@/lib/excelExport'

const BASE = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '')

export function isClientOnly(): boolean {
  return import.meta.env.VITE_CLIENT_ONLY === 'true'
}

function apiUrl(path: string): string {
  return `${BASE}${path}`
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json()
    if (typeof body?.detail === 'string') return body.detail
    if (Array.isArray(body?.detail)) return body.detail.map((d: { msg?: string }) => d.msg).join(', ')
  } catch {
    /* ignore */
  }
  return res.statusText || 'Request failed'
}

const FALLBACK_NEWS: NewsResponse = {
  updated_live: false,
  headlines: [
    { title: 'DocuMint runs 100% in your browser on GitHub Pages', source: 'DocuMint', url: '#' },
    { title: 'Upload any PDF or photo — nothing leaves your device', source: 'DocuMint', url: '#' },
    { title: 'Auto language detection and Excel export', source: 'DocuMint', url: '#' },
    { title: 'Free forever at yourname.github.io/documint', source: 'DocuMint', url: '#' },
  ],
}

export async function fetchHealth(): Promise<HealthResponse> {
  if (isClientOnly()) {
    return {
      status: 'ok',
      tesseract_available: true,
      parser: 'browser',
      pdf_text_available: true,
    }
  }
  const res = await fetch(apiUrl('/health'))
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function fetchStats(): Promise<PlatformStats> {
  if (isClientOnly()) {
    const parsed = parseInt(localStorage.getItem('documint-parsed-count') ?? '0', 10)
    return {
      active_users: 1,
      documents_parsed: parsed,
      languages_seen: 1,
      messages_today: 0,
    }
  }
  const res = await fetch(apiUrl('/stats'))
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function fetchNews(): Promise<NewsResponse> {
  if (isClientOnly()) return FALLBACK_NEWS
  const res = await fetch(apiUrl('/news'))
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function extractDocument(file: File): Promise<ExtractResponse> {
  if (isClientOnly()) return clientExtractDocument(file)
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(apiUrl('/extract'), { method: 'POST', body: form })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function downloadExcel(fields: SalarySlipFields): Promise<void> {
  if (isClientOnly()) {
    downloadExcelClient(fields)
    return
  }
  const res = await fetch(apiUrl('/export'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  })
  if (!res.ok) throw new Error(await parseError(res))

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'documint-export.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}

export function loungeWsUrl(): string {
  if (isClientOnly()) return ''
  const override = import.meta.env.VITE_WS_URL as string | undefined
  if (override) return override

  const wsPath = (import.meta.env.VITE_WS_PATH as string | undefined) ?? `${BASE}/ws/lounge`
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}${wsPath}`
}
