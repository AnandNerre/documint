export interface SalarySlipFields {
  employee_name: string | null
  employee_id: string | null
  company_name: string | null
  designation: string | null
  basic_salary: number | null
  hra: number | null
  gross_salary: number | null
  total_deductions: number | null
  net_pay: number | null
  pay_period: string | null
  currency: string | null
  confidence_notes: string | null
}

export interface DetectedLanguage {
  code: string
  name: string
  confidence: number
}

export interface ExtractResponse {
  fields: SalarySlipFields
  raw_text_preview: string
  ocr_method: string
  detected_language: DetectedLanguage
}

export interface HealthResponse {
  status: string
  tesseract_available: boolean
  parser: string
  pdf_text_available: boolean
}

export interface PlatformStats {
  active_users: number
  documents_parsed: number
  languages_seen: number
  messages_today: number
}

export interface NewsHeadline {
  title: string
  source: string
  url: string
}

export interface NewsResponse {
  headlines: NewsHeadline[]
  updated_live: boolean
}

export interface LoungeUser {
  session_id: string
  name: string
  online: boolean
}

export interface ChatMessage {
  id: string
  name: string
  body: string
  created_at: number
}

export interface LoungeSession {
  sessionId: string
  name: string
  email: string
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham' },
  { code: 'SAR', symbol: 'SAR', label: 'Saudi Riyal' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱', label: 'Philippine Peso' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand' },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira' },
] as const

export function currencySymbol(code: string | null | undefined): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? '$'
}

export const EMPTY_FIELDS: SalarySlipFields = {
  employee_name: null,
  employee_id: null,
  company_name: null,
  designation: null,
  basic_salary: null,
  hra: null,
  gross_salary: null,
  total_deductions: null,
  net_pay: null,
  pay_period: null,
  currency: 'USD',
  confidence_notes: null,
}

const SESSION_KEY = 'documint-lounge-session'

export function loadLoungeSession(): LoungeSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as LoungeSession
  } catch {
    return null
  }
}

export function saveLoungeSession(session: LoungeSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearLoungeSession(): void {
  localStorage.removeItem(SESSION_KEY)
}
