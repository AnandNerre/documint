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
    <div className="news-ticker relative overflow-hidden border-b border-indigo-900/20 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="flex shrink-0 items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
          <Radio className="h-2.5 w-2.5 animate-pulse-soft" />
          Live
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="news-ticker-track flex gap-8 whitespace-nowrap">
            {loop.map((h, i) => (
              <a
                key={`${h.title}-${i}`}
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-white"
              >
                <span className="font-semibold text-violet-300">{h.source}</span>
                <span>{h.title}</span>
                <span className="text-slate-600">·</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function NewsSidebar() {
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
      .then((r) => setHeadlines(r.headlines.slice(0, 10)))
      .catch(() => setHeadlines([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3.5">
        <Newspaper className="h-4 w-4 text-violet-400" />
        <span className="text-sm font-bold text-white">Live Headlines</span>
        <span className="ml-auto rounded-full bg-red-600/20 px-2 py-0.5 text-[9px] font-bold uppercase text-red-300 ring-1 ring-red-500/30">
          Breaking
        </span>
      </div>

      <div className="news-scroll min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {loading &&
          [1, 2, 3].map((n) => (
            <div key={n} className="h-14 animate-pulse rounded-lg bg-white/5" />
          ))}
        {!loading &&
          headlines.map((h, i) => (
            <a
              key={`${h.title}-${i}`}
              href={h.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl bg-white/5 p-3 ring-1 ring-white/5 transition hover:bg-white/10 hover:ring-violet-500/30"
            >
              <p className="text-[9px] font-bold uppercase tracking-wide text-violet-300">{h.source}</p>
              <p className="mt-1 line-clamp-2 text-xs font-medium leading-snug text-slate-200">{h.title}</p>
            </a>
          ))}
      </div>
    </div>
  )
}
