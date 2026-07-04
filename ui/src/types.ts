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
  confidence_notes: string | null
}

export interface ExtractResponse {
  fields: SalarySlipFields
  raw_text_preview: string
  ocr_method: string
}

export interface HealthResponse {
  status: string
  tesseract_available: boolean
  parser: string
  pdf_text_available: boolean
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
  confidence_notes: null,
}
