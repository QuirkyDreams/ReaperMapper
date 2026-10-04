"""Parser for selected fields in recent NCHS fixed-width mortality records.

Positions are 1-based in NCHS documentation and converted to Python slices here.
The parser intentionally extracts only fields needed by Model Lab 0.1.
"""
from dataclasses import dataclass

@dataclass(frozen=True)
class MortalityRecord:
    resident_status: int
    month: int
    sex: str
    weekday: int
    year: int
    underlying_cause: str

    @property
    def is_us_resident(self):
        # U.S.-occurrence file: 1=in-state/county, 2=intrastate,
        # 3=interstate; 4=foreign resident.
        return self.resident_status in (1, 2, 3)

def _field(line,start,end):
    return line[start-1:end].strip()

def parse_recent_record(line):
    if len(line)<149: raise ValueError("record is too short for the expected NCHS layout")
    status=int(_field(line,20,20)); month=int(_field(line,65,66)); sex=_field(line,69,69)
    weekday=int(_field(line,85,85)); year=int(_field(line,102,105)); underlying=_field(line,146,149)
    if status not in (1,2,3,4): raise ValueError(f"invalid resident status: {status}")
    if not 1<=month<=12: raise ValueError(f"invalid month: {month}")
    if weekday not in range(1,10): raise ValueError(f"invalid weekday code: {weekday}")
    return MortalityRecord(status,month,sex,weekday,year,underlying)
