"""Rule-based document field extraction — international labels, no paid APIs."""

from __future__ import annotations

import re
from dataclasses import dataclass

from schemas import SalarySlipFields

_MONTHS = (
    r"january|february|march|april|may|june|july|august|"
    r"september|october|november|december|"
    r"jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec"
)

_CURRENCY_PATTERNS: tuple[tuple[str, str], ...] = (
    (r"₹|Rs\.?|INR", "INR"),
    (r"\$|USD|US\s*\$", "USD"),
    (r"€|EUR", "EUR"),
    (r"£|GBP", "GBP"),
    (r"AED|د\.إ", "AED"),
    (r"SAR|SR", "SAR"),
    (r"SGD|S\$", "SGD"),
    (r"CAD|C\$", "CAD"),
    (r"AUD|A\$", "AUD"),
    (r"MYR|RM", "MYR"),
    (r"PHP|₱", "PHP"),
    (r"ZAR|R\b", "ZAR"),
    (r"NGN|₦", "NGN"),
)

_AMOUNT = (
    r"(?:₹|Rs\.?|INR|\$|USD|US\s*\$|€|EUR|£|GBP|AED|SAR|SGD|CAD|AUD|MYR|PHP|₱|ZAR|NGN|₦)?"
    r"\s*([\d,]+(?:\.\d{1,2})?)"
)

_COMPANY_MARKERS = re.compile(
    r"\b(PVT\.?|PRIVATE|LTD\.?|LIMITED|LLP|INC\.?|CORP\.?|GMBH|PLC|SA|S\.?A\.?|"
    r"TECHNOLOGIES|SOLUTIONS|GROUP|HOLDINGS|ENTERPRISES|SERVICES|LLC)\b",
    re.I,
)


@dataclass(frozen=True)
class _LabelRule:
    field: str
    patterns: tuple[str, ...]
    is_amount: bool = False


_RULES: tuple[_LabelRule, ...] = (
    _LabelRule(
        "employee_name",
        (
            r"employee\s*name",
            r"emp(?:loyee)?\s*name",
            r"name\s*of\s*employee",
            r"staff\s*name",
            r"worker\s*name",
            r"full\s*name",
        ),
        False,
    ),
    _LabelRule(
        "employee_id",
        (
            r"employee\s*(?:id|code|no\.?|#|number)",
            r"emp(?:loyee)?\s*(?:id|code|no\.?|#|number)",
            r"staff\s*(?:id|code|no\.?)",
            r"personnel\s*(?:id|no\.?)",
            r"ec\s*no\.?",
            r"badge\s*(?:id|no\.?)",
        ),
        False,
    ),
    _LabelRule(
        "designation",
        (
            r"designation",
            r"desig\.?",
            r"position",
            r"job\s*title",
            r"role",
            r"grade",
            r"department",
            r"job\s*class",
        ),
        False,
    ),
    _LabelRule(
        "company_name",
        (
            r"company\s*name",
            r"organisation",
            r"organization",
            r"employer",
            r"business\s*name",
            r"legal\s*entity",
        ),
        False,
    ),
    _LabelRule(
        "pay_period",
        (
            r"pay\s*period",
            r"salary\s*for",
            r"for\s*the\s*month\s*of",
            r"pay\s*date",
            r"payment\s*period",
            r"period\s*ending",
            r"payroll\s*period",
        ),
        False,
    ),
    _LabelRule(
        "basic_salary",
        (
            r"basic(?:\s*pay|\s*salary|\s*wage)?",
            r"base\s*(?:pay|salary|wage)",
            r"basic\s*da",
            r"regular\s*pay",
        ),
        True,
    ),
    _LabelRule(
        "hra",
        (
            r"\bhra\b",
            r"house\s*rent(?:\s*allowance)?",
            r"housing\s*allowance",
            r"rent\s*allowance",
            r"accommodation\s*allowance",
        ),
        True,
    ),
    _LabelRule(
        "gross_salary",
        (
            r"gross(?:\s*pay|\s*salary|\s*earning|\s*income|\s*wage)?",
            r"total\s*earning",
            r"total\s*income",
            r"total\s*gross",
            r"earnings\s*total",
        ),
        True,
    ),
    _LabelRule(
        "total_deductions",
        (
            r"total\s*deduction",
            r"deductions?\s*total",
            r"total\s*deduct",
            r"deductions?\s*summary",
            r"total\s*withholdings?",
        ),
        True,
    ),
    _LabelRule(
        "net_pay",
        (
            r"net\s*(?:pay|salary|amount|wage|income)",
            r"take\s*home",
            r"in\s*hand",
            r"nett?\s*pay",
            r"amount\s*paid",
            r"pay\s*after\s*deduction",
            r"total\s*net",
            r"home\s*pay",
        ),
        True,
    ),
)


def _normalize(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _lines(text: str) -> list[str]:
    return [ln.strip() for ln in text.split("\n") if ln.strip()]


def _detect_currency(text: str) -> str:
    scores: dict[str, int] = {}
    for pattern, code in _CURRENCY_PATTERNS:
        count = len(re.findall(pattern, text, re.I))
        if count:
            scores[code] = scores.get(code, 0) + count
    if not scores:
        return "USD"
    return max(scores, key=scores.get)


def _parse_amount(raw: str) -> float | None:
    m = re.search(_AMOUNT, raw, re.I)
    if not m:
        return None
    try:
        return float(m.group(1).replace(",", ""))
    except ValueError:
        return None


def _clean_text_value(raw: str) -> str | None:
    v = re.sub(r"^[:\-\s|]+", "", raw).strip()
    v = re.sub(r"\s{2,}", " ", v)
    if not v or re.fullmatch(r"[\d,.\s₹$€£RsINRUSDGBPEURAED]+", v, re.I):
        return None
    if len(v) > 80:
        v = v[:80].strip()
    return v


def _value_after_label(line: str, pattern: str, is_amount: bool) -> str | float | None:
    m = re.search(pattern + r"\s*[:\-|]?\s*(.+)$", line, re.I)
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
    for j in range(max(0, idx - 1), idx):
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


def _parse_table_rows(lines: list[str], found: dict[str, object]) -> None:
    for line in lines:
        if "|" not in line:
            continue
        cells = [c.strip() for c in line.split("|") if c.strip()]
        if len(cells) < 2:
            continue
        label = cells[0]
        amount_tail = cells[-1]
        for rule in _RULES:
            if rule.field in found and found[rule.field] is not None:
                continue
            if not rule.is_amount:
                continue
            for pattern in rule.patterns:
                if re.search(pattern, label, re.I):
                    amt = _parse_amount(amount_tail)
                    if amt is not None:
                        found[rule.field] = amt
                    break


def _guess_company(lines: list[str]) -> str | None:
    for line in lines[:25]:
        if _COMPANY_MARKERS.search(line) and not re.search(
            r"employee|emp\s*id|designation|department", line, re.I
        ):
            cleaned = _clean_text_value(line)
            if cleaned and len(cleaned) > 4:
                return cleaned
    return None


def _guess_pay_period(text: str) -> str | None:
    m = re.search(rf"\b({_MONTHS})\s+(\d{{4}})\b", text, re.I)
    if m:
        return f"{m.group(1).title()} {m.group(2)}"
    m = re.search(rf"\b(\d{{1,2}})\s+({_MONTHS})\s+(\d{{4}})\b", text, re.I)
    if m:
        return f"{m.group(2).title()} {m.group(3)}"
    m = re.search(r"(\d{1,2})[/-](\d{4})", text)
    if m:
        return m.group(0)
    m = re.search(r"(\d{4})[/-](\d{1,2})", text)
    if m:
        return m.group(0)
    return None


def _guess_employee_name(lines: list[str], found: dict[str, object]) -> str | None:
    if found.get("employee_name"):
        return None
    for i, line in enumerate(lines):
        if re.search(r"^(?:mr\.?|ms\.?|mrs\.?|dr\.?)\s", line, re.I):
            val = _clean_text_value(line)
            if val:
                return val
        if re.search(r"name\s*[:\-]", line, re.I) and not re.search(
            r"company|bank|branch|employer", line, re.I
        ):
            val = _value_after_label(line, r"name", False)
            if isinstance(val, str):
                return val
            nxt = _find_text_near(lines, i + 1)
            if nxt:
                return nxt
    return None


def _sanity_check(fields: SalarySlipFields) -> str | None:
    gross = fields.gross_salary
    ded = fields.total_deductions
    net = fields.net_pay
    if gross is not None and ded is not None and net is not None:
        expected = gross - ded
        if abs(expected - net) > max(1.0, gross * 0.02):
            return "Gross minus deductions doesn't match net pay — please verify amounts."
    return None


def _build_confidence(found: SalarySlipFields) -> str | None:
    sanity = _sanity_check(found)
    missing: list[str] = []
    labels = {
        "employee_name": "name",
        "employee_id": "ID",
        "company_name": "company",
        "designation": "role",
        "basic_salary": "basic pay",
        "hra": "housing allowance",
        "gross_salary": "gross pay",
        "total_deductions": "deductions",
        "net_pay": "net pay",
        "pay_period": "pay period",
    }
    for key, label in labels.items():
        if getattr(found, key) is None:
            missing.append(label)
    parts: list[str] = []
    if len(missing) >= 6:
        parts.append("Could not read most fields — try a clearer scan or edit manually.")
    elif missing:
        parts.append(f"Please double-check: {', '.join(missing)}.")
    if sanity:
        parts.append(sanity)
    return " ".join(parts) if parts else None


def extract_fields(raw_text: str) -> SalarySlipFields:
    text = _normalize(raw_text)
    lines = _lines(text)
    flat = "\n".join(lines)
    found: dict[str, object] = {}
    currency = _detect_currency(flat)

    _parse_table_rows(lines, found)

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

    if not found.get("net_pay"):
        amounts = [_parse_amount(ln) for ln in lines[-15:]]
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
        currency=currency,
        confidence_notes=None,
    )
    fields.confidence_notes = _build_confidence(fields)
    return fields
