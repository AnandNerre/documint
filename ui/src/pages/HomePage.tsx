import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Languages,
  Loader2,
  RefreshCw,
  ScanText,
  Shield,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react'

import { UploadZone } from '@/components/UploadZone'
import { ResultsForm } from '@/components/ResultsForm'
import { extractDocument, downloadExcel } from '@/lib/api'
import type { DetectedLanguage, ExtractResponse, HealthResponse, PlatformStats, SalarySlipFields } from '@/types'
import { EMPTY_FIELDS } from '@/types'
import type { useLounge } from '@/hooks/useLounge'

type Step = 'upload' | 'processing' | 'review'

const PROCESS_STEPS = [
  'Scanning document…',
  'Detecting language…',
  'Extracting fields…',
]

type OutletCtx = {
  health: HealthResponse | null
  lounge: ReturnType<typeof useLounge>
}

export function HomePage() {
  const { health, lounge } = useOutletContext<OutletCtx>()
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [fields, setFields] = useState<SalarySlipFields>(EMPTY_FIELDS)
  const [meta, setMeta] = useState<Pick<ExtractResponse, 'ocr_method' | 'raw_text_preview' | 'detected_language'> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [processLabel, setProcessLabel] = useState(PROCESS_STEPS[0])

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
    <>
      <StepIndicator current={step} />

      {error && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800 animate-fade-up">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 'upload' && (
        <section className="animate-fade-up mx-auto max-w-3xl" id="how">
          <Hero stats={lounge.stats} />
          <UploadZone onFile={processFile} disabled={health?.status === 'offline'} onError={setError} />
          <FeatureGrid health={health} />
          <SetupHints health={health} />
        </section>
      )}

      {step === 'processing' && (
        <section className="animate-fade-up mx-auto max-w-2xl premium-card flex flex-col items-center justify-center rounded-3xl px-8 py-28">
          <div className="relative">
            <div className="absolute inset-0 scale-150 rounded-full bg-violet-400/20 blur-2xl" />
            <Loader2 className="relative h-14 w-14 animate-spin text-violet-600" />
          </div>
          <p className="mt-8 text-2xl font-bold tracking-tight">{processLabel}</p>
          <p className="mt-2 text-sm text-slate-500">Private OCR · runs securely in your session</p>
          {file && (
            <p className="mt-6 rounded-full bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{file.name}</p>
          )}
          <div className="relative mt-10 h-2 w-56 overflow-hidden rounded-full bg-slate-100">
            <div className="progress-shimmer absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
          </div>
        </section>
      )}

      {step === 'review' && (
        <section className="animate-fade-up mx-auto max-w-4xl space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Extracted data</h2>
              <p className="mt-1 text-sm text-slate-500">Review, edit, then export.</p>
              {meta?.detected_language && <LanguageBadge lang={meta.detected_language} />}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={reset} className="btn-secondary">
                <RefreshCw className="h-4 w-4" /> New upload
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
              <summary className="cursor-pointer font-semibold text-slate-500">Source preview · {meta.ocr_method}</summary>
              <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">{meta.raw_text_preview}</pre>
            </details>
          )}
        </section>
      )}
    </>
  )
}

function Hero({ stats }: { stats: PlatformStats }) {
  return (
    <div className="mb-8 text-center sm:mb-10">
      <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-500/25">
        <Sparkles className="h-3.5 w-3.5" />
        Any document · any language
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl sm:leading-[1.1]">
        Turn documents into <span className="hero-glow">clean data</span>
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-500">
        Upload on the left. Chat and live headlines on the right. Free, fast, and private.
      </p>
      <div className="mx-auto mt-8 flex max-w-lg justify-center gap-6 sm:gap-10">
        <Stat label="Docs parsed" value={stats.documents_parsed} />
        <Stat label="Languages" value={stats.languages_seen} />
        <Stat label="Online" value={stats.active_users} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-extrabold tabular-nums text-slate-900">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  )
}

function FeatureGrid({ health }: { health: HealthResponse | null }) {
  const items = [
    { icon: Languages, title: 'Auto language', desc: 'Detects your document language instantly.' },
    { icon: Eye, title: 'Smart parsing', desc: 'PDFs, scans, photos, and tables.' },
    { icon: Shield, title: 'Private & secure', desc: 'Files processed securely, never stored.' },
    { icon: Zap, title: 'Excel export', desc: 'One-click polished spreadsheet.' },
  ]
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {items.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="feature-tile rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-600 ring-1 ring-violet-100">
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
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 ${
              active ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30'
                : done ? 'bg-violet-100 text-violet-700' : 'bg-white text-slate-400 ring-1 ring-slate-200'
            }`}>
              {done && s.id !== current ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </span>
            <span className={`hidden text-sm font-semibold sm:inline ${active ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</span>
            {i < steps.length - 1 && <span className="mx-1 hidden h-px w-8 bg-slate-200 sm:block" />}
          </li>
        )
      })}
    </ol>
  )
}

function SetupHints({ health }: { health: HealthResponse | null }) {
  if (!health || health.status === 'ok') return null
  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
      <p className="font-bold">Start DocuMint locally</p>
      <p className="mt-1 text-amber-900/90">Run <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-xs">.\start-dev.ps1</code></p>
    </div>
  )
}
