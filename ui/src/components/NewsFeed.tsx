import { useEffect, useState } from 'react'
import { Newspaper, Radio } from 'lucide-react'

import { fetchNews } from '@/lib/api'
import type { NewsHeadline } from '@/types'

export function NewsTicker() {
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([])

  useEffect(() => {
    fetchNews()
      .then((r) => setHeadlines(r.headlines))
      .catch(() => setHeadlines([]))
  }, [])

  if (headlines.length === 0) return null

  const loop = [...headlines, ...headlines]

  return (
    <div className="news-ticker relative overflow-hidden border-b border-slate-200/80 bg-slate-900">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          <Radio className="h-3 w-3 animate-pulse-soft" />
          Live
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="news-ticker-track flex gap-10 whitespace-nowrap">
            {loop.map((h, i) => (
              <a
                key={`${h.title}-${i}`}
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-slate-200 transition hover:text-white"
              >
                <span className="font-semibold text-emerald-400">{h.source}</span>
                <span className="text-slate-300">{h.title}</span>
                <span className="text-slate-600">·</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function NewsPanel() {
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
      .then((r) => setHeadlines(r.headlines.slice(0, 8)))
      .catch(() => setHeadlines([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="premium-card h-full rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md">
            <Newspaper className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Trending now</h3>
            <p className="text-[11px] text-slate-500">Fresh headlines while you work</p>
          </div>
        </div>
        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600 ring-1 ring-red-100">
          Live feed
        </span>
      </div>

      <div className="news-scroll max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        )}
        {!loading &&
          headlines.map((h, i) => (
            <a
              key={`${h.title}-${i}`}
              href={h.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-card group block rounded-xl border border-slate-100 bg-gradient-to-r from-white to-slate-50/80 p-3.5 transition hover:border-emerald-200 hover:shadow-md"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">{h.source}</p>
              <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-slate-800 group-hover:text-slate-900">
                {h.title}
              </p>
            </a>
          ))}
      </div>
    </div>
  )
}
