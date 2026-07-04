import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Layers, Menu, X } from 'lucide-react'

import type { HealthResponse } from '@/types'

const NAV = [
  { to: '/about', label: 'About' },
  { to: '/careers', label: 'Careers' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
] as const

export function SiteHeader({ health }: { health: HealthResponse | null }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const ok = health?.status === 'ok'

  return (
    <header className="relative z-20 border-b border-slate-200/60 bg-white/80 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <Link to="/" className="flex items-center gap-3 transition hover:opacity-90" onClick={() => setOpen(false)}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-extrabold tracking-tight text-slate-900">DocuMint</p>
            <p className="text-xs font-medium text-slate-500">Read · parse · export</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                pathname === to || pathname.startsWith(to)
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-violet-600'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span
            className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold sm:inline-flex ${
              ok ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${ok ? 'bg-violet-500' : 'bg-amber-500'}`} />
            {ok ? 'Live' : 'Offline'}
          </span>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  pathname === to || pathname.startsWith(to)
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
