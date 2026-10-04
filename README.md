# ReaperMapper

Mapping mortality across America using transparent, data-driven estimates based on official U.S. mortality statistics.

## Model Lab 0.1

ReaperMapper is **not a live death registry**. Current-day values will be modeled estimates. The first engineering milestone is to test whether a reproducible mortality model can predict held-out historical data better than simple baselines.

### First backtest

1. Use only information available through 2023.
2. Predict 2024 mortality.
3. Compare predictions with final 2024 CDC/NCHS mortality data.
4. Reject added model complexity unless it improves out-of-sample accuracy.

### Data integrity rules

- Official CDC/NCHS and U.S. Census sources are preferred.
- Final, provisional, and modeled values must never be presented as equivalent.
- Raw large source files are not committed to Git; provenance is recorded in data/sources.json.
- Historical revisions and model-version changes must be auditable.
- State/county geography is not inferred from post-2005 public mortality microdata; NCHS restricts that geography in public-use files.

### Repository layout

- data/ — provenance and processed compact data
- model/ — parsers and mortality models
- tests/ — validation and backtests
- output/ — compact model artifacts consumed by the future site

The public-facing ReaperMapper site will be built only after the model and its uncertainty are defensible.
