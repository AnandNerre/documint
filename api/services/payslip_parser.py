"""Rule-based Indian payslip field extraction from OCR text — no paid APIs."""

from __future__ import annotations

import re
from dataclasses import dataclass

from schemas import SalarySlipFields

_MONTHS = (
    "january|february|march|april|may|june|july|august|"
    "september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec"
)
_AMOUNT = r"(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)"
_COMPANY_MARKERS = re.compile(r"\b(PVT\.?|PRIVATE|LTD\.?|LIMITED|LLP|INC\.?|CORP\.?|TECHNOLOGIES|SOLUTIONS)\b", re.I)


@dataclass(frozen=True)
class _LabelRule:
    field: str
    patterns: tuple[str, ...]
    is_amount: bool = False


_RULES: tuple[_LabelRule, ...] = (
    _LabelRule("employee_name", (r"employee\s*name", r"emp(?:loyee)?\s*name", r"name\s*of\s*employee", r"staff\s*name"), False),
    _LabelRule("employee_id", (r"employee\s*(?:id|code|no\.?)", r"emp(?:loyee)?\s*(?:id|code|no\.?)", r"staff\s*(?:id|code)", r"ec\s*no\.?"), False),
    _LabelRule("designation", (r"designation", r"desig\.?", r"position", r"job\s*title", r"role", r"grade"), False),
    _LabelRule("company_name", (r"company\s*name", r"organisation", r"organization", r"employer"), False),
    _LabelRule("pay_period", (r"pay\s*period", r"salary\s*for", r"for\s*the\s*month\s*of"), False),
    _LabelRule("basic_salary", (r"basic(?:\s*pay|\s*salary)?", r"basic\s*da"), True),
    _LabelRule("hra", (r"\bhra\b", r"house\s*rent(?:\s*allowance)?"), True),
    _LabelRule("gross_salary", (r"gross(?:\s*pay|\s*salary|\s*earning)?", r"total\s*earning", r"total\s*income"), True),
    _LabelRule("total_deductions", (r"total\s*deduction", r"deductions?\s*total", r"total\s*deduct"), True),
    _LabelRule("net_pay", (r"net\s*(?:pay|salary|amount)", r"take\s*home", r"in\s*hand", r"nett?\s*pay", r"amount\s*paid"), True),
)


def _normalize(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _lines(text: str) -> list[str]:
    return [ln.strip() for ln in text.split("\n") if ln.strip()]


def _parse_amount(raw: str) -> float | None:
    m = re.search(_AMOUNT, raw, re.I)
    if not m:
        return None
    try:
        return float(m.group(1).replace(",", ""))
    except ValueError:
        return None


def _clean_text_value(raw: str) -> str | None:
    v = re.sub(r"^[:\-\s]+", "", raw).strip()
    v = re.sub(r"\s{2,}", " ", v)
    if not v or re.fullmatch(r"[\d,.\s₹RsINR]+", v, re.I):
        return None
    if len(v) > 80:
        v = v[:80].strip()
    return v


def _value_after_label(line: str, pattern: str, is_amount: bool) -> str | float | None:
    m = re.search(pattern + r"\s*[:\-]?\s*(.+)$", line, re.I)
    if not m:
        m = re.search(pattern + r"\s+(.+)$", line, re.I)
    if not m:
        return None
    tail = m.group(1).strip()
    if is_amount:
        return _parse_amount(tail)
    return _clean_text_value(tail)


def _find_amount_near(lines: list[str], idx: int) -> float | None:
    for j in range(idx, min(idx + 3, len(lines))):
        amt = _parse_amount(lines[j])
        if amt is not None:
            return amt
    return None


def _find_text_near(lines: list[str], idx: int) -> str | None:
    for j in range(idx, min(idx + 2, len(lines))):
        if re.search(r"[A-Za-z]{2,}", lines[j]):
            val = _clean_text_value(lines[j])
            if val:
                return val
    return None


def _guess_company(lines: list[str]) -> str | None:
    for line in lines[:20]:
        if _COMPANY_MARKERS.search(line) and not re.search(r"employee|emp\s*id|designation", line, re.I):
            cleaned = _clean_text_value(line)
            if cleaned and len(cleaned) > 4:
                return cleaned
    return None


def _guess_pay_period(text: str) -> str | None:
    m = re.search(rf"\b({_MONTHS})\s+(\d{{4}})\b", text, re.I)
    if m:
        return f"{m.group(1).title()} {m.group(2)}"
    m = re.search(r"(\d{1,2})[/-](\d{4})", text)
    if m:
        return m.group(0)
    return None


def _guess_employee_name(lines: list[str], found: dict[str, object]) -> str | None:
    if found.get("employee_name"):
        return None
    for i, line in enumerate(lines):
        if re.search(r"^(?:mr\.?|ms\.?|mrs\.?)\s", line, re.I):
            val = _clean_text_value(line)
            if val:
                return val
        if re.search(r"name\s*[:\-]", line, re.I) and not re.search(r"company|bank|branch", line, re.I):
            val = _value_after_label(line, r"name", False)
            if isinstance(val, str):
                return val
            nxt = _find_text_near(lines, i + 1)
            if nxt:
                return nxt
    return None


def _build_confidence(found: SalarySlipFields) -> str | None:
    missing: list[str] = []
    labels = {
        "employee_name": "name",
        "employee_id": "ID",
        "company_name": "company",
        "designation": "designation",
        "basic_salary": "basic salary",
        "hra": "HRA",
        "gross_salary": "gross pay",
        "total_deductions": "deductions",
        "net_pay": "net pay",
        "pay_period": "pay period",
    }
    for key, label in labels.items():
        if getattr(found, key) is None:
            missing.append(label)
    if not missing:
        return None
    if len(missing) >= 6:
        return "Could not read most fields — try a clearer scan or edit manually."
    return f"Please double-check: {', '.join(missing)}."


def extract_fields(raw_text: str) -> SalarySlipFields:
    text = _normalize(raw_text)
    lines = _lines(text)
    flat = "\n".join(lines)
    found: dict[str, object] = {}

    for rule in _RULES:
        if rule.field in found and found[rule.field] is not None:
            continue
        for pattern in rule.patterns:
            if rule.field == "pay_period":
                continue

            for i, line in enumerate(lines):
                if not re.search(pattern, line, re.I):
                    continue
                val = _value_after_label(line, pattern, rule.is_amount)
                if val is None and rule.is_amount:
                    val = _find_amount_near(lines, i + 1)
                elif val is None and not rule.is_amount:
                    val = _find_text_near(lines, i + 1)
                if val is not None:
                    found[rule.field] = val
                    break
            if rule.field in found:
                break

    if not found.get("company_name"):
        company = _guess_company(lines)
        if company:
            found["company_name"] = company

    if not found.get("pay_period"):
        period = _guess_pay_period(flat)
        if period:
            found["pay_period"] = period

    if not found.get("employee_name"):
        name = _guess_employee_name(lines, found)
        if name:
            found["employee_name"] = name

    # Net pay fallback: largest amount near bottom if label missed
    if not found.get("net_pay"):
        amounts = [_parse_amount(ln) for ln in lines[-12:]]
        amounts = [a for a in amounts if a is not None and a > 0]
        if amounts:
            found["net_pay"] = max(amounts)

    fields = SalarySlipFields(
        employee_name=found.get("employee_name"),  # type: ignore[arg-type]
        employee_id=found.get("employee_id"),  # type: ignore[arg-type]
        company_name=found.get("company_name"),  # type: ignore[arg-type]
        designation=found.get("designation"),  # type: ignore[arg-type]
        basic_salary=found.get("basic_salary"),  # type: ignore[arg-type]
        hra=found.get("hra"),  # type: ignore[arg-type]
        gross_salary=found.get("gross_salary"),  # type: ignore[arg-type]
        total_deductions=found.get("total_deductions"),  # type: ignore[arg-type]
        net_pay=found.get("net_pay"),  # type: ignore[arg-type]
        pay_period=found.get("pay_period"),  # type: ignore[arg-type]
        confidence_notes=None,
    )
    fields.confidence_notes = _build_confidence(fields)
    return fields
