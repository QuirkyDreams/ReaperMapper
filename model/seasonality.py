"""Seasonality tools for held-out ReaperMapper backtests."""
from collections import Counter


def monthly_counts(records):
    counts = Counter(r.month for r in records if 1 <= r.month <= 12)
    return [counts[m] for m in range(1, 13)]


def monthly_weights(*year_counts):
    """Pool training-year monthly counts and normalize to annual shares."""
    pooled = [sum(year[m] for year in year_counts) for m in range(12)]
    total = sum(pooled)
    if total <= 0:
        raise ValueError("Training deaths must be positive")
    return [x / total for x in pooled]


def allocate_annual_total(annual_total, weights):
    """Allocate an annual forecast across months while preserving the total."""
    raw = [annual_total * w for w in weights]
    base = [int(x) for x in raw]
    remainder = int(round(annual_total - sum(base)))
    order = sorted(range(len(raw)), key=lambda i: raw[i] - base[i], reverse=True)
    for i in order[:remainder]:
        base[i] += 1
    return base


def monthly_mape(predicted, actual):
    pairs = [(p, a) for p, a in zip(predicted, actual) if a > 0]
    return sum(abs(p-a)/a for p,a in pairs) / len(pairs)
