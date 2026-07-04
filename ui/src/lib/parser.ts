import type { SalarySlipFields } from '@/types'

const MONTHS =
  'january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec'

const CURRENCY_PATTERNS: [RegExp, string][] = [
  [/₹|Rs\.?|INR/gi, 'INR'],
  [/\$|USD|US\s*\$/gi, 'USD'],
  [/€|EUR/gi, 'EUR'],
  [/£|GBP/gi, 'GBP'],
  [/AED|د\.إ/gi, 'AED'],
  [/SAR|SR/gi, 'SAR'],
  [/SGD|S\$/gi, 'SGD'],
  [/CAD|C\$/gi, 'CAD'],
  [/AUD|A\$/gi, 'AUD'],
  [/MYR|RM/gi, 'MYR'],
  [/PHP|₱/gi, 'PHP'],
  [/ZAR|R\b/gi, 'ZAR'],
  [/NGN|₦/gi, 'NGN'],
]

const AMOUNT =
  /(?:₹|Rs\.?|INR|\$|USD|US\s*\$|€|EUR|£|GBP|AED|SAR|SGD|CAD|AUD|MYR|PHP|₱|ZAR|NGN|₦)?\s*([\d,]+(?:\.\d{1,2})?)/i

const COMPANY_MARKERS =
  /\b(PVT\.?|PRIVATE|LTD\.?|LIMITED|LLP|INC\.?|CORP\.?|GMBH|PLC|SA|S\.?A\.?|TECHNOLOGIES|SOLUTIONS|GROUP|HOLDINGS|ENTERPRISES|SERVICES|LLC)\b/i

interface LabelRule {
  field: keyof SalarySlipFields
  patterns: RegExp[]
  isAmount: boolean
}

const RULES: LabelRule[] = [
  { field: 'employee_name', patterns: [/employee\s*name/i, /emp(?:loyee)?\s*name/i, /name\s*of\s*employee/i, /staff\s*name/i, /full\s*name/i], isAmount: false },
  { field: 'employee_id', patterns: [/employee\s*(?:id|code|no\.?|#|number)/i, /emp(?:loyee)?\s*(?:id|code|no\.?)/i, /staff\s*(?:id|code)/i, /badge\s*(?:id|no\.?)/i], isAmount: false },
  { field: 'designation', patterns: [/designation/i, /position/i, /job\s*title/i, /role/i, /department/i], isAmount: false },
  { field: 'company_name', patterns: [/company\s*name/i, /organisation/i, /organization/i, /employer/i], isAmount: false },
  { field: 'pay_period', patterns: [/pay\s*period/i, /salary\s*for/i, /for\s*the\s*month\s*of/i, /payroll\s*period/i], isAmount: false },
  { field: 'basic_salary', patterns: [/basic(?:\s*pay|\s*salary|\s*wage)?/i, /base\s*(?:pay|salary)/i], isAmount: true },
  { field: 'hra', patterns: [/\bhra\b/i, /house\s*rent/i, /housing\s*allowance/i], isAmount: true },
  { field: 'gross_salary', patterns: [/gross(?:\s*pay|\s*salary|\s*earning)?/i, /total\s*earning/i, /total\s*gross/i], isAmount: true },
  { field: 'total_deductions', patterns: [/total\s*deduction/i, /deductions?\s*total/i], isAmount: true },
  { field: 'net_pay', patterns: [/net\s*(?:pay|salary|amount)/i, /take\s*home/i, /in\s*hand/i, /amount\s*paid/i], isAmount: true },
]

function normalize(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function lines(text: string): string[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean)
}

function detectCurrency(text: string): string {
  const scores: Record<string, number> = {}
  for (const [re, code] of CURRENCY_PATTERNS) {
    const count = (text.match(re) ?? []).length
    if (count) scores[code] = (scores[code] ?? 0) + count
  }
  const keys = Object.keys(scores)
  if (!keys.length) return 'INR'
  return keys.reduce((a, b) => (scores[a] >= scores[b] ? a : b))
}

function parseAmount(raw: string): number | null {
  const m = raw.match(AMOUNT)
  if (!m) return null
  const n = parseFloat(m[1].replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

function cleanTextValue(raw: string): string | null {
  let v = raw.replace(/^[:|\-\s]+/, '').trim().replace(/\s{2,}/g, ' ')
  if (!v || /^[\d,.\s₹$€£RsINRUSDGBPEURAED]+$/i.test(v)) return null
  return v.length > 80 ? v.slice(0, 80).trim() : v
}

function valueAfterLabel(line: string, pattern: RegExp, isAmount: boolean): string | number | null {
  const m = line.match(new RegExp(pattern.source + String.raw`\s*[:\-|]?\s*(.+)$`, pattern.flags)) ??
    line.match(new RegExp(pattern.source + String.raw`\s+(.+)$`, pattern.flags))
  if (!m) return null
  const tail = m[1].trim()
  return isAmount ? parseAmount(tail) : cleanTextValue(tail)
}

function findAmountNear(lineList: string[], idx: number): number | null {
  for (let j = idx; j < Math.min(idx + 3, lineList.length); j++) {
    const amt = parseAmount(lineList[j])
    if (amt !== null) return amt
  }
  return null
}

function findTextNear(lineList: string[], idx: number): string | null {
  for (let j = idx; j < Math.min(idx + 2, lineList.length); j++) {
    if (/[A-Za-z]{2,}/.test(lineList[j])) {
      const val = cleanTextValue(lineList[j])
      if (val) return val
    }
  }
  return null
}

function guessCompany(lineList: string[]): string | null {
  for (const line of lineList.slice(0, 25)) {
    if (COMPANY_MARKERS.test(line) && !/employee|emp\s*id|designation/i.test(line)) {
      const cleaned = cleanTextValue(line)
      if (cleaned && cleaned.length > 4) return cleaned
    }
  }
  return null
}

function guessPayPeriod(text: string): string | null {
  const monthRe = new RegExp(`\\b(${MONTHS})\\s+(\\d{4})\\b`, 'i')
  let m = text.match(monthRe)
  if (m) return `${m[1].charAt(0).toUpperCase()}${m[1].slice(1).toLowerCase()} ${m[2]}`
  m = text.match(new RegExp(`\\b(\\d{1,2})\\s+(${MONTHS})\\s+(\\d{4})\\b`, 'i'))
  if (m) return `${m[2]} ${m[3]}`
  m = text.match(/(\d{1,2})[/-](\d{4})/)
  if (m) return m[0]
  return null
}

function buildConfidence(fields: SalarySlipFields): string | null {
  const missing: string[] = []
  const labels: [keyof SalarySlipFields, string][] = [
    ['employee_name', 'name'],
    ['net_pay', 'net pay'],
    ['gross_salary', 'gross pay'],
  ]
  for (const [key, label] of labels) {
    if (fields[key] == null) missing.push(label)
  }
  if (missing.length >= 2) return `Please double-check: ${missing.join(', ')}.`
  return null
}

export function extractFields(rawText: string): SalarySlipFields {
  const text = normalize(rawText)
  const lineList = lines(text)
  const flat = lineList.join('\n')
  const found: Partial<Record<keyof SalarySlipFields, string | number | null>> = {}
  const currency = detectCurrency(flat)

  for (const rule of RULES) {
    if (found[rule.field] != null) continue
    if (rule.field === 'pay_period') continue
    for (const pattern of rule.patterns) {
      for (let i = 0; i < lineList.length; i++) {
        if (!pattern.test(lineList[i])) continue
        let val = valueAfterLabel(lineList[i], pattern, rule.isAmount)
        if (val == null && rule.isAmount) val = findAmountNear(lineList, i + 1)
        else if (val == null && !rule.isAmount) val = findTextNear(lineList, i + 1)
        if (val != null) {
          found[rule.field] = val as string | number
          break
        }
      }
      if (found[rule.field] != null) break
    }
  }

  if (!found.company_name) {
    const company = guessCompany(lineList)
    if (company) found.company_name = company
  }
  if (!found.pay_period) {
    const period = guessPayPeriod(flat)
    if (period) found.pay_period = period
  }
  if (!found.net_pay) {
    const amounts = lineList.slice(-15).map(parseAmount).filter((a): a is number => a != null && a > 0)
    if (amounts.length) found.net_pay = Math.max(...amounts)
  }

  const fields: SalarySlipFields = {
    employee_name: (found.employee_name as string) ?? null,
    employee_id: (found.employee_id as string) ?? null,
    company_name: (found.company_name as string) ?? null,
    designation: (found.designation as string) ?? null,
    basic_salary: (found.basic_salary as number) ?? null,
    hra: (found.hra as number) ?? null,
    gross_salary: (found.gross_salary as number) ?? null,
    total_deductions: (found.total_deductions as number) ?? null,
    net_pay: (found.net_pay as number) ?? null,
    pay_period: (found.pay_period as string) ?? null,
    currency,
    confidence_notes: null,
  }
  fields.confidence_notes = buildConfidence(fields)
  return fields
}

export function detectLanguage(text: string): { code: string; name: string; confidence: number } {
  const sample = text.slice(0, 800)
  if (/[\u0900-\u097F]/.test(sample)) return { code: 'hi', name: 'Hindi', confidence: 0.85 }
  if (/[\u0C00-\u0C7F]/.test(sample)) return { code: 'te', name: 'Telugu', confidence: 0.85 }
  if (/[\u0B80-\u0BFF]/.test(sample)) return { code: 'ta', name: 'Tamil', confidence: 0.85 }
  if (/[\u0980-\u09FF]/.test(sample)) return { code: 'bn', name: 'Bengali', confidence: 0.85 }
  if (/[\u0600-\u06FF]/.test(sample)) return { code: 'ar', name: 'Arabic', confidence: 0.8 }
  return { code: 'en', name: 'English', confidence: 0.75 }
}
