import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Leaf,
  Loader2,
  RefreshCw,
  ScanText,
  Upload,
} from 'lucide-react'

import { UploadZone } from '@/components/UploadZone'
import { ResultsForm } from '@/components/ResultsForm'
import { extractSalarySlip, fetchHealth, downloadExcel } from '@/lib/api'
import type { ExtractResponse, HealthResponse, SalarySlipFields } from '@/types'
import { EMPTY_FIELDS } from '@/types'

type Step = 'upload' | 'processing' | 'review'

export default function App() {
  const [step, setStep] = useState<Step>('upload')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fields, setFields] = useState<SalarySlipFields>(EMPTY_FIELDS)
  const [meta, setMeta] = useState<Pick<ExtractResponse, 'ocr_method' | 'raw_text_preview'> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

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

  const processFile = useCallback(async (selected: File) => {
    setFile(selected)
    setError(null)
    setStep('processing')
    try {
      const result = await extractSalarySlip(selected)
      setFields(result.fields)
      setMeta({ ocr_method: result.ocr_method, raw_text_preview: result.raw_text_preview })
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
    <div className="min-h-screen">
      <header className="border-b border-[var(--color-border)] bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-500)] text-white shadow-sm">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                Payleaf
              </h1>
              <p className="text-xs text-[var(--color-muted)]">
                Payslip → spreadsheet · 100% free &amp; private
              </p>
            </div>
          </div>
          <StatusPill health={health} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <StepIndicator current={step} />

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 animate-fade-up"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'upload' && (
          <section className="animate-fade-up">
            <Hero />
            <UploadZone onFile={processFile} disabled={health?.status === 'offline'} />
            <SetupHints health={health} />
          </section>
        )}

        {step === 'processing' && (
          <section className="animate-fade-up flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white px-6 py-20 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--color-brand-500)]" />
            <p className="mt-4 text-lg font-medium">Reading your payslip…</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              OCR + smart field matching — no cloud AI needed
            </p>
            {file && (
              <p className="mt-4 rounded-full bg-[var(--color-surface)] px-4 py-1 text-xs text-[var(--color-muted)]">
                {file.name}
              </p>
            )}
          </section>
        )}

        {step === 'review' && (
          <section className="animate-fade-up space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Review your payslip</h2>
                <p className="text-sm text-[var(--color-muted)]">
                  Tweak anything that looks off, then export to Excel.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--color-surface)]"
                >
                  <RefreshCw className="h-4 w-4" />
                  New upload
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-500)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-brand-600)] disabled:opacity-60"
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download Excel
                </button>
              </div>
            </div>

            {fields.confidence_notes && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <ScanText className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{fields.confidence_notes}</span>
              </div>
            )}

            <ResultsForm fields={fields} onChange={setFields} />

            {meta && (
              <details className="rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm">
                <summary className="cursor-pointer font-medium text-[var(--color-muted)]">
                  Raw text preview (via {meta.ocr_method})
                </summary>
                <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--color-surface)] p-3 text-xs text-[var(--color-muted)]">
                  {meta.raw_text_preview}
                </pre>
              </details>
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-[var(--color-border)] bg-white/60 py-6 text-center text-xs text-[var(--color-muted)]">
        100% free · Tesseract + pdfplumber · No API keys · Files never stored
      </footer>
    </div>
  )
}

function Hero() {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Your payslip, turned into a spreadsheet
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-[var(--color-muted)]">
        Upload any Indian payslip — PDF or photo. Payleaf reads it locally,
        pulls out the numbers, and lets you download Excel. No signup, no API keys.
      </p>
    </div>
  )
}

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'processing', label: 'Read', icon: ScanText },
    { id: 'review', label: 'Export', icon: Download },
  ] as const

  const index = steps.findIndex((s) => s.id === current)

  return (
    <ol className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((s, i) => {
        const Icon = s.icon
        const done = i < index || (current === 'review' && s.id !== 'processing')
        const active = s.id === current || (current === 'processing' && s.id === 'processing')
        return (
          <li key={s.id} className="flex items-center gap-2">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                active
                  ? 'bg-[var(--color-brand-500)] text-white'
                  : done
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white border border-[var(--color-border)] text-[var(--color-muted)]'
              }`}
            >
              {done && s.id !== current ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </span>
            <span
              className={`hidden text-sm sm:inline ${active ? 'font-medium' : 'text-[var(--color-muted)]'}`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span className="mx-1 hidden h-px w-8 bg-[var(--color-border)] sm:block" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function StatusPill({ health }: { health: HealthResponse | null }) {
  if (!health) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-muted)]">
        <span className="h-2 w-2 rounded-full bg-gray-300 animate-pulse-soft" />
        Checking…
      </span>
    )
  }

  const ok = health.status === 'ok'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${
        ok ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-900'
      }`}
      title={ok ? 'Payleaf API is running' : 'Start the API with start-dev.ps1'}
    >
      <span className={`h-2 w-2 rounded-full ${ok ? 'bg-green-500' : 'bg-amber-500'}`} />
      {ok ? 'Ready' : 'Offline'}
    </span>
  )
}

function SetupHints({ health }: { health: HealthResponse | null }) {
  if (!health || health.status === 'ok') return null

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-amber-950">
      <p className="font-medium">Start Payleaf locally</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-amber-900/90">
        <li>
          Run <code className="rounded bg-white/70 px-1">.\start-dev.ps1</code> from the payleaf folder
        </li>
        {!health.tesseract_available && (
          <li>
            Optional: install Tesseract for photo/scanned PDFs (text PDFs work without it)
          </li>
        )}
      </ul>
    </div>
  )
}
