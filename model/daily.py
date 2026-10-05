"""Daily estimator for ReaperMapper Model 0.1.

Public final mortality data provide month and weekday, not exact death date.
Model 0.1 distributes each predicted monthly total evenly across calendar
 days in that month. The result is a modeled estimate, never a live count.
"""
import calendar


def estimate_monthly_totals(annual_forecast, previous_year_month_counts):
    if len(previous_year_month_counts) != 12:
        raise ValueError("need exactly 12 monthly counts")
    total = sum(previous_year_month_counts)
    if total <= 0:
        raise ValueError("historical deaths must be positive")
    raw = [annual_forecast * (x / total) for x in previous_year_month_counts]
    base = [int(x) for x in raw]
    remainder = int(round(annual_forecast - sum(base)))
    order = sorted(range(12), key=lambda i: raw[i] - base[i], reverse=True)
    for i in order[:remainder]:
        base[i] += 1
    return base


def daily_estimate(target_date, predicted_monthly_totals):
    days = calendar.monthrange(target_date.year, target_date.month)[1]
    return predicted_monthly_totals[target_date.month - 1] / days


def cumulative_estimate(target_date, predicted_monthly_totals):
    completed = sum(predicted_monthly_totals[:target_date.month - 1])
    days = calendar.monthrange(target_date.year, target_date.month)[1]
    return completed + predicted_monthly_totals[target_date.month - 1] * (target_date.day / days)


def model_metadata(target_date):
    return {
        "symbol": "approx",
        "status": "modeled",
        "model_version": "0.1",
        "date": target_date.isoformat(),
        "precision_note": "Modeled estimate; not an observed live death count.",
    }
