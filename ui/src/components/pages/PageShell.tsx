import type { ReactNode } from 'react'

interface PageShellProps {
  title: string
  subtitle?: string
  badge?: string
  children: ReactNode
}

export function PageShell({ title, subtitle, badge, children }: PageShellProps) {
  return (
    <div className="animate-fade-up mx-auto max-w-3xl pb-12">
      {badge && (
        <span className="mb-4 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-700">
          {badge}
        </span>
      )}
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 text-lg text-slate-500">{subtitle}</p>}
      <div className="prose-custom mt-8">{children}</div>
    </div>
  )
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base">{children}</div>
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`premium-card rounded-2xl p-6 ${className}`}>{children}</div>
  )
}

export function ComingSoonBanner({ label }: { label: string }) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-violet-200 bg-violet-50/50 px-4 py-3 text-center text-sm font-medium text-violet-700">
      {label} — more content launching soon on {label.toLowerCase().includes('press') ? 'our press page' : 'this page'}
    </div>
  )
}
