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
    currency: str | None = "USD"
    confidence_notes: str | None = None


class DetectedLanguage(BaseModel):
    code: str = "unknown"
    name: str = "Unknown"
    confidence: float = 0.0


class ExtractResponse(BaseModel):
    fields: SalarySlipFields
    raw_text_preview: str = Field(description="First ~500 chars of OCR text for debugging")
    ocr_method: str
    detected_language: DetectedLanguage = Field(default_factory=DetectedLanguage)


class HealthResponse(BaseModel):
    status: str
    tesseract_available: bool
    parser: str = "rule-based"
    pdf_text_available: bool = True


class PlatformStats(BaseModel):
    active_users: int = 0
    documents_parsed: int = 0
    languages_seen: int = 0
    messages_today: int = 0


class NewsHeadline(BaseModel):
    title: str
    source: str
    url: str = "#"


class NewsResponse(BaseModel):
    headlines: list[NewsHeadline]
    updated_live: bool = True


class ErrorResponse(BaseModel):
    detail: str
    hint: str | None = None
