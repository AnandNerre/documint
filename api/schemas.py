from pydantic import BaseModel, Field


class SalarySlipFields(BaseModel):
    employee_name: str | None = None
    employee_id: str | None = None
    company_name: str | None = None
    designation: str | None = None
    basic_salary: float | None = None
    hra: float | None = None
    gross_salary: float | None = None
    total_deductions: float | None = None
    net_pay: float | None = None
    pay_period: str | None = None
    confidence_notes: str | None = None


class ExtractResponse(BaseModel):
    fields: SalarySlipFields
    raw_text_preview: str = Field(description="First ~500 chars of OCR text for debugging")
    ocr_method: str


class HealthResponse(BaseModel):
    status: str
    tesseract_available: bool
    parser: str = "rule-based"
    pdf_text_available: bool = True


class ErrorResponse(BaseModel):
    detail: str
    hint: str | None = None
