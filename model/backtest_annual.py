"""Annual held-out benchmark for ReaperMapper Model Lab 0.1."""

import json
from pathlib import Path
from model.baseline import carry_forward, population_scaled, absolute_percentage_error

ROOT = Path(__file__).resolve().parents[1]


def run():
    data = json.loads((ROOT / "data/processed/annual_us.json").read_text())
    deaths = {row["year"]: row["deaths"] for row in data["series"]}
    actual = deaths[2024]
    models = {
        "carry_forward_2023": carry_forward(deaths[2023]),
        # Diagnostic only: July 2024 population was not known on Jan 1, 2024.
        "population_scaled_diagnostic": population_scaled(deaths[2023], 336.8, 340.1),
    }
    result = {
        "target_year": 2024,
        "actual_final_deaths": actual,
        "models": {
            name: {
                "predicted_deaths": round(predicted),
                "absolute_error": round(abs(predicted - actual)),
                "absolute_percentage_error_pct": round(absolute_percentage_error(predicted, actual) * 100, 3),
            }
            for name, predicted in models.items()
        },
        "notes": [
            "carry_forward_2023 is the first legitimate simple benchmark.",
            "population_scaled_diagnostic uses July 2024 Census population and is not a valid Jan 1 2024 forecast; it is retained only as a diagnostic.",
        ],
    }
    return result


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
