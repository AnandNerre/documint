import * as XLSX from 'xlsx'

import type { SalarySlipFields } from '@/types'

const ROWS: [keyof SalarySlipFields, string][] = [
  ['employee_name', 'Employee Name'],
  ['employee_id', 'Employee ID'],
  ['company_name', 'Company'],
  ['designation', 'Designation'],
  ['pay_period', 'Pay Period'],
  ['currency', 'Currency'],
  ['basic_salary', 'Basic Salary'],
  ['hra', 'Housing Allowance'],
  ['gross_salary', 'Gross Salary'],
  ['total_deductions', 'Total Deductions'],
  ['net_pay', 'Net Pay'],
  ['confidence_notes', 'Notes'],
]

export function downloadExcelClient(fields: SalarySlipFields): void {
  const exported = new Date().toLocaleString()
  const data: (string | number | null)[][] = [
    ['DocuMint — Export', ''],
    ['Exported', exported],
    [],
    ...ROWS.map(([key, label]) => [label, fields[key] ?? '']),
  ]

  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [{ wch: 22 }, { wch: 36 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data')
  XLSX.writeFile(wb, 'documint-export.xlsx')
}
