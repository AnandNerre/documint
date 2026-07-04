import type { ExtractResponse, HealthResponse, NewsResponse, PlatformStats, SalarySlipFields } from '@/types'

const BASE = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '')

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

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(apiUrl('/health'))
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function fetchStats(): Promise<PlatformStats> {
  const res = await fetch(apiUrl('/stats'))
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function fetchNews(): Promise<NewsResponse> {
  const res = await fetch(apiUrl('/news'))
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function extractDocument(file: File): Promise<ExtractResponse> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(apiUrl('/extract'), { method: 'POST', body: form })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function downloadExcel(fields: SalarySlipFields): Promise<void> {
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
  a.download = 'payleaf-export.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}

export function loungeWsUrl(): string {
  const override = import.meta.env.VITE_WS_URL as string | undefined
  if (override) return override

  const wsPath = (import.meta.env.VITE_WS_PATH as string | undefined) ?? `${BASE}/ws/lounge`
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}${wsPath}`
}
