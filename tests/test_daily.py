from datetime import date
from model.daily import estimate_monthly_totals, daily_estimate, cumulative_estimate, model_metadata

MONTHS = [100] * 12


def test_months_preserve_annual_total():
    assert sum(estimate_monthly_totals(1201, MONTHS)) == 1201


def test_february_respects_leap_year():
    p = [310, 290] + [300] * 10
    assert daily_estimate(date(2024, 2, 1), p) == 10


def test_cumulative_at_year_end_equals_total():
    p = [31,29,31,30,31,30,31,31,30,31,30,31]
    assert cumulative_estimate(date(2024, 12, 31), p) == sum(p)


def test_metadata_never_claims_observed():
    m = model_metadata(date(2026, 10, 4))
    assert m["status"] == "modeled"
    assert "not an observed" in m["precision_note"]
