import { useCallback, useRef, useState } from 'react'
import { FileUp, Lock, ShieldCheck, Sparkles } from 'lucide-react'

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.bmp,.tiff'
const MAX_MB = 15

interface UploadZoneProps {
  onFile: (file: File) => void
  disabled?: boolean
  onError?: (message: string) => void
}

export function UploadZone({ onFile, disabled, onError }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = useCallback(
    (list: FileList | null) => {
      const file = list?.[0]
      if (!file) return
      if (file.size > MAX_MB * 1024 * 1024) {
        onError?.(`File must be under ${MAX_MB} MB`)
        return
      }
      onFile(file)
    },
    [onFile, onError],
  )

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        if (!disabled) handleFiles(e.dataTransfer.files)
      }}
      className={`group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed premium-card px-8 py-20 text-center transition-all duration-300 ${
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/10'
      } ${dragOver ? 'border-emerald-400 bg-emerald-50/50 scale-[1.005]' : 'border-slate-200'}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl" />

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-xl shadow-emerald-500/30 transition-transform duration-300 group-hover:scale-110">
        <FileUp className="h-9 w-9" />
      </div>

      <p className="relative mt-6 text-2xl font-bold tracking-tight text-slate-900">
        Drop any document
      </p>
      <p className="relative mt-2 text-sm text-slate-500">
        PDF or image · any language · up to {MAX_MB} MB
      </p>

      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/5 px-4 py-2 font-semibold text-slate-600 ring-1 ring-slate-200">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          Auto-detects language
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/5 px-4 py-2 font-semibold text-slate-600 ring-1 ring-slate-200">
          <Lock className="h-3.5 w-3.5 text-emerald-500" />
          Stays on your device
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/5 px-4 py-2 font-semibold text-slate-600 ring-1 ring-slate-200">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Never stored
        </span>
      </div>
    </div>
  )
}
