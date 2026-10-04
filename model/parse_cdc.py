"""Parser for selected fields in recent NCHS fixed-width mortality records.

Positions are 1-based in NCHS documentation and converted to Python slices here.
The parser intentionally extracts only fields needed by Model Lab 0.1.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class MortalityRecord:
    month: int
    sex: str
    weekday: int
    year: int
    underlying_cause: str


def _field(line: str, start: int, end: int) -> str:
    return line[start - 1:end].strip()


def parse_recent_record(line: str) -> MortalityRecord:
    """Parse selected fields using the 2024 NCHS public-use layout."""
    if len(line) < 149:
        raise ValueError("record is too short for the expected NCHS layout")
    month = int(_field(line, 65, 66))
    sex = _field(line, 69, 69)
    weekday = int(_field(line, 85, 85))
    year = int(_field(line, 102, 105))
    underlying = _field(line, 146, 149)
    if not 1 <= month <= 12:
        raise ValueError(f"invalid month: {month}")
    if weekday not in range(1, 10):
        raise ValueError(f"invalid weekday code: {weekday}")
    return MortalityRecord(month, sex, weekday, year, underlying)
