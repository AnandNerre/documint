import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Languages,
  Leaf,
  Loader2,
  RefreshCw,
  ScanText,
  Shield,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react'

import { LoungeSidebar } from '@/components/LoungeSidebar'
import { NewsPanel, NewsTicker } from '@/components/NewsFeed'
import { UploadZone } from '@/components/UploadZone'
import { ResultsForm } from '@/components/ResultsForm'
import { useLounge } from '@/hooks/useLounge'
import { extractDocument, fetchHealth, downloadExcel } from '@/lib/api'
import type { DetectedLanguage, ExtractResponse, HealthResponse, PlatformStats, SalarySlipFields } from '@/types'
import { EMPTY_FIELDS } from '@/types'

type Step = 'upload' | 'processing' | 'review'

const PROCESS_STEPS = [
  'Scanning document…',
  'Detecting language…',
  'Extracting fields…',
]

export default function App() {
  const lounge = useLounge()
  const [step, setStep] = useState<Step>('upload')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fields, setFields] = useState<SalarySlipFields>(EMPTY_FIELDS)
  const [meta, setMeta] = useState<Pick<ExtractResponse, 'ocr_method' | 'raw_text_preview' | 'detected_language'> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [processLabel, setProcessLabel] = useState(PROCESS_STEPS[0])

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch(() =>
        setHealth({
          status: 'offline',
          tesseract_available: false,
          parser: 'rule-based',
          pdf_text_available: true,
        }),
      )
  }, [])

  useEffect(() => {
    if (step !== 'processing') return
    let i = 0
    setProcessLabel(PROCESS_STEPS[0])
    const timer = setInterval(() => {
      i = (i + 1) % PROCESS_STEPS.length
      setProcessLabel(PROCESS_STEPS[i])
    }, 1600)
    return () => clearInterval(timer)
  }, [step])

  const processFile = useCallback(async (selected: File) => {
    setFile(selected)
    setError(null)
    setStep('processing')
    try {
      const result = await extractDocument(selected)
      setFields(result.fields)
      setMeta({
        ocr_method: result.ocr_method,
        raw_text_preview: result.raw_text_preview,
        detected_language: result.detected_language,
      })
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed')
      setStep('upload')
    }
  }, [])

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    try {
      await downloadExcel(fields)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const reset = () => {
    setStep('upload')
    setFile(null)
    setFields(EMPTY_FIELDS)
    setMeta(null)
    setError(null)
  }

  return (
    <div className="app-shell">
      <div className="main-panel flex min-h-screen min-w-0 flex-1 flex-col">
        <NewsTicker />

        <header className="relative z-10 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-4 px-6 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Payleaf</h1>
                <p className="text-xs font-medium text-slate-500">Document intelligence</p>
              </div>
            </div>
            <StatusPill health={health} />
          </div>
        </header>

        <main className="relative z-10 flex-1 px-6 py-8 lg:px-8 lg:py-10">
          <StepIndicator current={step} />

          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800 animate-fade-up"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'upload' && (
            <section className="animate-fade-up">
              <div className="grid gap-8 xl:grid-cols-12">
                <div className="xl:col-span-7">
                  <Hero stats={lounge.stats} />
                  <UploadZone
                    onFile={processFile}
                    disabled={health?.status === 'offline'}
                    onError={setError}
                  />
                  <FeatureGrid health={health} />
                  <SetupHints health={health} />
                </div>
                <div className="xl:col-span-5">
                  <div className="sticky top-6">
                    <NewsPanel />
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 'processing' && (
            <section className="animate-fade-up mx-auto max-w-2xl premium-card flex flex-col items-center justify-center rounded-3xl px-8 py-28">
              <div className="relative">
                <div className="absolute inset-0 scale-150 rounded-full bg-emerald-400/20 blur-2xl" />
                <Loader2 className="relative h-14 w-14 animate-spin text-emerald-500" />
              </div>
              <p className="mt-8 text-2xl font-bold tracking-tight">{processLabel}</p>
              <p className="mt-2 text-sm text-slate-500">Private OCR on your machine</p>
              {file && (
                <p className="mt-6 rounded-full bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  {file.name}
                </p>
              )}
              <div className="relative mt-10 h-2 w-56 overflow-hidden rounded-full bg-slate-100">
                <div className="progress-shimmer absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
              </div>
            </section>
          )}

          {step === 'review' && (
            <section className="animate-fade-up mx-auto max-w-5xl space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Extracted data</h2>
                  <p className="mt-1 text-sm text-slate-500">Review, edit, then export.</p>
                  {meta?.detected_language && (
                    <LanguageBadge lang={meta.detected_language} />
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={reset} className="btn-secondary">
                    <RefreshCw className="h-4 w-4" />
                    New upload
                  </button>
                  <button type="button" onClick={handleExport} disabled={exporting} className="btn-primary">
                    {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Export Excel
                  </button>
                </div>
              </div>

              {fields.confidence_notes && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3.5 text-sm text-amber-900">
                  <ScanText className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{fields.confidence_notes}</span>
                </div>
              )}

              <ResultsForm fields={fields} onChange={setFields} />

              {meta && (
                <details className="premium-card rounded-2xl p-5 text-sm">
                  <summary className="cursor-pointer font-semibold text-slate-500">
                    Source preview · {meta.ocr_method}
                  </summary>
                  <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
                    {meta.raw_text_preview}
                  </pre>
                </details>
              )}
            </section>
          )}
        </main>
      </div>

      <LoungeSidebar
        connected={lounge.connected}
        sessionName={lounge.session?.name ?? null}
        users={lounge.users}
        messages={lounge.messages}
        stats={lounge.stats}
        onJoin={lounge.join}
        onSend={lounge.sendMessage}
      />

      <style>{`
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 0.875rem;
          background: linear-gradient(135deg, #10b981, #059669);
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
        }
        .btn-primary:disabled { opacity: 0.6; }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 0.875rem;
          border: 1px solid #e2e8f0;
          background: white;
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          box-shadow: 0 1px 2px rgba(15,23,42,0.05);
          transition: background 0.15s;
        }
        .btn-secondary:hover { background: #f8fafc; }
      `}</style>
    </div>
  )
}

function Hero({ stats }: { stats: PlatformStats }) {
  return (
    <div className="mb-8 text-left sm:mb-10">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-lg">
        <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
        Any document · any language
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl sm:leading-[1.1]">
        Turn chaos into{' '}
        <span className="hero-glow">clean data</span>
      </h2>
      <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-500">
        Upload while you browse live headlines. Chat with others on the right.
      </p>
      <div className="mt-6 flex gap-8">
        <div>
          <p className="text-2xl font-extrabold tabular-nums text-slate-900">{stats.documents_parsed}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Docs parsed</p>
        </div>
        <div className="h-10 w-px bg-slate-200" />
        <div>
          <p className="text-2xl font-extrabold tabular-nums text-slate-900">{stats.languages_seen}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Languages</p>
        </div>
        <div className="h-10 w-px bg-slate-200" />
        <div>
          <p className="text-2xl font-extrabold tabular-nums text-slate-900">{stats.active_users}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Online now</p>
        </div>
      </div>
    </div>
  )
}

function FeatureGrid({ health }: { health: HealthResponse | null }) {
  const items = [
    { icon: Languages, title: 'Auto language', desc: 'Detects what your document is written in — no setup needed.' },
    { icon: Eye, title: 'Smart read', desc: 'Text PDFs, scans, photos, tables — handled automatically.' },
    { icon: Shield, title: 'Private', desc: 'Processed on your device. Files are never saved.' },
    { icon: Zap, title: 'Instant export', desc: 'Review fields, download a polished spreadsheet.' },
  ]

  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {items.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="feature-tile rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 ring-1 ring-emerald-100">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{desc}</p>
            </div>
          </div>
        </div>
      ))}
      {health?.status !== 'ok' && (
        <div className="feature-tile rounded-2xl p-5 sm:col-span-2">
          <p className="text-sm font-semibold text-amber-800">Engine offline — run start-dev.ps1</p>
        </div>
      )}
    </div>
  )
}

function LanguageBadge({ lang }: { lang: DetectedLanguage }) {
  if (lang.code === 'unknown') return null
  const pct = Math.round(lang.confidence * 100)
  return (
    <div className="lang-badge mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold">
      <Languages className="h-3.5 w-3.5" />
      Detected {lang.name}
      {pct > 0 && <span className="opacity-70">· {pct}%</span>}
    </div>
  )
}

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'processing', label: 'Read', icon: FileText },
    { id: 'review', label: 'Export', icon: Download },
  ] as const

  const index = steps.findIndex((s) => s.id === current)

  return (
    <ol className="mb-10 flex items-center justify-center gap-3 sm:gap-6">
      {steps.map((s, i) => {
        const Icon = s.icon
        const done = i < index || (current === 'review' && s.id !== 'processing')
        const active = s.id === current || (current === 'processing' && s.id === 'processing')
        return (
          <li key={s.id} className="flex items-center gap-2">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 ${
                active
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : done
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-white text-slate-400 ring-1 ring-slate-200'
              }`}
            >
              {done && s.id !== current ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </span>
            <span className={`hidden text-sm font-semibold sm:inline ${active ? 'text-slate-900' : 'text-slate-400'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && <span className="mx-1 hidden h-px w-8 bg-slate-200 sm:block" />}
          </li>
        )
      })}
    </ol>
  )
}

function StatusPill({ health }: { health: HealthResponse | null }) {
  if (!health) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">
        <span className="h-2 w-2 rounded-full bg-slate-300 animate-pulse-soft" />
        Checking…
      </span>
    )
  }

  const ok = health.status === 'ok'
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
        ok ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${ok ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-amber-500'}`} />
      {ok ? 'Engine live' : 'Offline'}
    </span>
  )
}

function SetupHints({ health }: { health: HealthResponse | null }) {
  if (!health || health.status === 'ok') return null

  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
      <p className="font-bold">Start Payleaf</p>
      <p className="mt-1 text-amber-900/90">
        Run <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-xs">.\start-dev.ps1</code>
      </p>
    </div>
  )
}
