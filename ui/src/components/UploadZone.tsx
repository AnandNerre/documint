import { useCallback, useRef, useState } from 'react'
import { FileUp, ImageIcon } from 'lucide-react'

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.bmp,.tiff'
const MAX_MB = 15

interface UploadZoneProps {
  onFile: (file: File) => void
  disabled?: boolean
}

export function UploadZone({ onFile, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = useCallback(
    (list: FileList | null) => {
      const file = list?.[0]
      if (!file) return
      if (file.size > MAX_MB * 1024 * 1024) {
        alert(`File must be under ${MAX_MB} MB`)
        return
      }
      onFile(file)
    },
    [onFile],
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
      className={`group relative cursor-pointer rounded-2xl border-2 border-dashed bg-white px-6 py-16 text-center shadow-sm transition-all ${
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-[var(--color-brand-500)] hover:shadow-md'
      } ${dragOver ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)]' : 'border-[var(--color-border)]'}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-brand-50)] text-[var(--color-brand-500)] transition-transform group-hover:scale-105">
        <FileUp className="h-7 w-7" />
      </div>

      <p className="mt-4 text-lg font-medium">
        Drop your salary slip here
      </p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        or click to browse · PDF, PNG, JPG up to {MAX_MB} MB
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--color-muted)]">
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface)] px-3 py-1">
          <ImageIcon className="h-3.5 w-3.5" />
          Any company layout
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface)] px-3 py-1">
          Private — not stored
        </span>
      </div>
    </div>
  )
}
