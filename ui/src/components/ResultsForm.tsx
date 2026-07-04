import type { SalarySlipFields } from '@/types'

type TextKey = 'employee_name' | 'employee_id' | 'company_name' | 'designation' | 'pay_period' | 'confidence_notes'
type NumKey = 'basic_salary' | 'hra' | 'gross_salary' | 'total_deductions' | 'net_pay'

const TEXT_FIELDS: { key: TextKey; label: string; placeholder: string }[] = [
  { key: 'employee_name', label: 'Employee name', placeholder: 'e.g. Ravi Kumar' },
  { key: 'employee_id', label: 'Employee ID', placeholder: 'e.g. TN2024103' },
  { key: 'company_name', label: 'Company', placeholder: 'e.g. TechNova Solutions Pvt Ltd' },
  { key: 'designation', label: 'Designation', placeholder: 'e.g. Software Engineer' },
  { key: 'pay_period', label: 'Pay period', placeholder: 'e.g. June 2026' },
]

const MONEY_FIELDS: { key: NumKey; label: string }[] = [
  { key: 'basic_salary', label: 'Basic salary' },
  { key: 'hra', label: 'HRA' },
  { key: 'gross_salary', label: 'Gross salary' },
  { key: 'total_deductions', label: 'Total deductions' },
  { key: 'net_pay', label: 'Net pay' },
]

interface ResultsFormProps {
  fields: SalarySlipFields
  onChange: (fields: SalarySlipFields) => void
}

function formatInr(n: number | null): string {
  if (n === null || Number.isNaN(n)) return ''
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)
}

function parseInr(s: string): number | null {
  const cleaned = s.replace(/[₹,\s]/g, '')
  if (!cleaned) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

export function ResultsForm({ fields, onChange }: ResultsFormProps) {
  const setText = (key: TextKey, value: string) => {
    onChange({ ...fields, [key]: value || null })
  }

  const setNum = (key: NumKey, value: string) => {
    onChange({ ...fields, [key]: parseInr(value) })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Employee details
        </h3>
        <div className="space-y-4">
          {TEXT_FIELDS.map(({ key, label, placeholder }) => (
            <label key={key} className="block">
              <span className="mb-1 block text-sm font-medium">{label}</span>
              <input
                type="text"
                value={fields[key] ?? ''}
                placeholder={placeholder}
                onChange={(e) => setText(key, e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-100)]"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Pay breakdown (₹)
        </h3>
        <div className="space-y-4">
          {MONEY_FIELDS.map(({ key, label }) => (
            <label key={key} className="block">
              <span className="mb-1 block text-sm font-medium">{label}</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-muted)]">
                  ₹
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formatInr(fields[key])}
                  placeholder="0"
                  onChange={(e) => setNum(key, e.target.value)}
                  className={`w-full rounded-lg border border-[var(--color-border)] py-2 pl-7 pr-3 text-sm outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-100)] ${
                    key === 'net_pay' ? 'font-semibold text-[var(--color-brand-700)]' : ''
                  }`}
                />
              </div>
            </label>
          ))}
        </div>

        <NetPaySummary fields={fields} />
      </div>
    </div>
  )
}

function NetPaySummary({ fields }: { fields: SalarySlipFields }) {
  const gross = fields.gross_salary
  const ded = fields.total_deductions
  const net = fields.net_pay

  if (gross == null && net == null) return null

  return (
    <div className="mt-6 rounded-xl bg-[var(--color-brand-50)] px-4 py-3 text-sm">
      <div className="flex justify-between text-[var(--color-muted)]">
        <span>Gross</span>
        <span>{gross != null ? `₹${formatInr(gross)}` : '—'}</span>
      </div>
      <div className="mt-1 flex justify-between text-[var(--color-muted)]">
        <span>Deductions</span>
        <span>{ded != null ? `− ₹${formatInr(ded)}` : '—'}</span>
      </div>
      <div className="mt-2 flex justify-between border-t border-[var(--color-brand-100)] pt-2 font-semibold text-[var(--color-brand-700)]">
        <span>Net pay</span>
        <span>{net != null ? `₹${formatInr(net)}` : '—'}</span>
      </div>
    </div>
  )
}
