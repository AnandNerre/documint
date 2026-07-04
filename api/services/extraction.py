"""Field extraction entry point — delegates to open-source document parser."""

from schemas import SalarySlipFields
from services.payslip_parser import extract_fields as parse_payslip

__all__ = ["extract_fields"]


def extract_fields(raw_text: str) -> SalarySlipFields:
    return parse_payslip(raw_text)
