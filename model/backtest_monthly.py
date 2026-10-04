"""Held-out 2024 monthly backtest.

Training: 2022-2023 final mortality microdata only.
Target: 2024 final mortality microdata.
Annual forecast: 2023 carry-forward baseline.
No 2024 observations may be used to fit monthly weights.
"""
import argparse, json
from pathlib import Path
from model.parse_cdc import parse_recent_record
from model.seasonality import monthly_counts, monthly_weights, allocate_annual_total, monthly_mape


def load_records(path):
    with open(path, "r", encoding="latin-1") as f:
        return [r for line in f if line.strip() for r in [parse_recent_record(line)] if r.is_us_resident]


def run(p2022, p2023, p2024):
    c22=monthly_counts(load_records(p2022)); c23=monthly_counts(load_records(p2023)); c24=monthly_counts(load_records(p2024))
    weights=monthly_weights(c22,c23)
    annual_forecast=sum(c23)
    predicted=allocate_annual_total(annual_forecast,weights)
    return {"training_years":[2022,2023],"target_year":2024,"annual_forecast":annual_forecast,
            "training_monthly_counts":{"2022":c22,"2023":c23},"monthly_weights":weights,
            "predicted_2024_monthly":predicted,"actual_2024_monthly":c24,
            "monthly_mape_pct":monthly_mape(predicted,c24)*100,
            "integrity":{"target_used_for_training":False,"prediction_sum":sum(predicted),"actual_sum":sum(c24)}}

if __name__=="__main__":
    ap=argparse.ArgumentParser();
    ap.add_argument("--y2022",required=True); ap.add_argument("--y2023",required=True); ap.add_argument("--y2024",required=True)
    a=ap.parse_args(); print(json.dumps(run(a.y2022,a.y2023,a.y2024),indent=2))
