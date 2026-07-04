import type { SalarySlipFields } from '@/types'
import { CURRENCIES, currencySymbol } from '@/types'

type TextKey = 'employee_name' | 'employee_id' | 'company_name' | 'designation' | 'pay_period' | 'confidence_notes'
type NumKey = 'basic_salary' | 'hra' | 'gross_salary' | 'total_deductions' | 'net_pay'

const TEXT_FIELDS: { key: TextKey; label: string; placeholder: string }[] = [
  { key: 'employee_name', label: 'Employee name', placeholder: 'e.g. Alex Johnson' },
  { key: 'employee_id', label: 'Employee ID', placeholder: 'e.g. EMP-20481' },
  { key: 'company_name', label: 'Company', placeholder: 'e.g. Acme Technologies Ltd' },
  { key: 'designation', label: 'Role / designation', placeholder: 'e.g. Senior Analyst' },
  { key: 'pay_period', label: 'Pay period', placeholder: 'e.g. June 2026' },
]

const MONEY_FIELDS: { key: NumKey; label: string }[] = [
  { key: 'basic_salary', label: 'Basic salary' },
  { key: 'hra', label: 'Housing allowance' },
  { key: 'gross_salary', label: 'Gross salary' },
  { key: 'total_deductions', label: 'Total deductions' },
  { key: 'net_pay', label: 'Net pay' },
]

interface ResultsFormProps {
  fields: SalarySlipFields
  onChange: (fields: SalarySlipFields) => void
}

function formatMoney(n: number | null, currency: string | null): string {
  if (n === null || Number.isNaN(n)) return ''
  const locale = currency === 'INR' ? 'en-IN' : 'en-US'
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n)
}

function parseMoney(s: string): number | null {
  const cleaned = s.replace(/[₹$€£,\s]/g, '')
  if (!cleaned) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

export function ResultsForm({ fields, onChange }: ResultsFormProps) {
  const sym = currencySymbol(fields.currency)

  const setText = (key: TextKey, value: string) => {
    onChange({ ...fields, [key]: value || null })
  }

  const setNum = (key: NumKey, value: string) => {
    onChange({ ...fields, [key]: parseMoney(value) })
  }

  const setCurrency = (code: string) => {
    onChange({ ...fields, currency: code })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="premium-card rounded-2xl p-6">
        <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-500)]" />
          Key details
        </h3>
        <div className="space-y-4">
          {TEXT_FIELDS.map(({ key, label, placeholder }) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-sm font-medium">{label}</span>
              <input
                type="text"
                value={fields[key] ?? ''}
                placeholder={placeholder}
                onChange={(e) => setText(key, e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-sm outline-none transition-shadow focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-100)]"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="premium-card rounded-2xl p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-500)]" />
            Extracted amounts
          </h3>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-muted)]">Currency</span>
            <select
              value={fields.currency ?? 'USD'}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-sm font-medium outline-none focus:border-[var(--color-brand-500)]"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="space-y-4">
          {MONEY_FIELDS.map(({ key, label }) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-sm font-medium">{label}</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--color-muted)]">
                  {sym}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formatMoney(fields[key], fields.currency)}
                  placeholder="0"
                  onChange={(e) => setNum(key, e.target.value)}
                  className={`w-full rounded-xl border border-[var(--color-border)] bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none transition-shadow focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-100)] ${
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
  const sym = currencySymbol(fields.currency)

  if (gross == null && net == null) return null

  const fmt = (n: number) => formatMoney(n, fields.currency)

  return (
    <div className="mt-6 rounded-xl border border-[var(--color-brand-100)] bg-gradient-to-br from-[var(--color-brand-50)] to-white px-4 py-4 text-sm">
      <div className="flex justify-between text-[var(--color-muted)]">
        <span>Gross</span>
        <span>{gross != null ? `${sym}${fmt(gross)}` : '—'}</span>
      </div>
      <div className="mt-1.5 flex justify-between text-[var(--color-muted)]">
        <span>Deductions</span>
        <span>{ded != null ? `− ${sym}${fmt(ded)}` : '—'}</span>
      </div>
      <div className="mt-3 flex justify-between border-t border-[var(--color-brand-200)] pt-3 text-base font-semibold text-[var(--color-brand-700)]">
        <span>Net pay</span>
        <span>{net != null ? `${sym}${fmt(net)}` : '—'}</span>
      </div>
    </div>
  )
}
