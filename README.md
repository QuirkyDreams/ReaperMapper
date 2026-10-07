# ReaperMapper

ReaperMapper is an interactive U.S. mortality map built from official CDC/NCHS mortality statistics.

**Live site:** https://reapermapper.com/

ReaperMapper is **not a live death registry**. The current-day national and state death counts are modeled expectations derived from published mortality data. The site distinguishes modeled, provisional, and final values so estimates are not presented as observed deaths.

## Model 0.2

Model 0.2 combines newer provisional national mortality data with final historical data:

1. **National baseline** — CDC/NCHS 2025 provisional mortality: **3,094,593 U.S. deaths**.
2. **Seasonality** — The annual baseline is distributed using the monthly mortality pattern from final 2024 data. The expected total for the viewer's current month is divided by the number of calendar days in that month to produce the displayed daily expectation.
3. **State allocation** — The national daily estimate is allocated among the 50 states and District of Columbia using each state's share of final 2024 U.S.-resident deaths. Integer allocation preserves the displayed national total.
4. **Mortality-rate view** — States are compared using final 2024 age-adjusted all-cause death rates per 100,000.
5. **Estimated-deaths view** — States are colored by their Model 0.2 estimated daily death counts.

The displayed daily values are therefore **derived estimates, not values published by CDC and not reports of deaths occurring in real time**.

## Why estimate “today”?

There is no national system that reports every U.S. death the moment it occurs. Death certificates take time to be reported and processed, and recent provisional data can be revised.

ReaperMapper uses official mortality statistics to answer a narrower question: given the latest credible annual mortality picture and observed historical seasonality, approximately how many deaths would be expected on a day in the current month?

## Data provenance

ReaperMapper prioritizes official CDC/NCHS sources and keeps the status of each input visible:

- **P — Provisional:** newer mortality data that can still be revised.
- **● — Final:** finalized CDC/NCHS mortality statistics.
- **≈ — Modeled:** values derived by ReaperMapper rather than published by CDC.

Primary public sources are linked directly from the live site's **Sources & Data** section.

## Data integrity rules

- Official CDC/NCHS and U.S. Census sources are preferred.
- Final, provisional, and modeled values must never be presented as equivalent.
- Modeled estimates must not be described as observed deaths.
- Raw large source files are not committed to Git; provenance is recorded with the processed data.
- Historical revisions and model-version changes should remain auditable.
- Added model complexity should be justified by validation rather than by appearance.

## Repository layout

- `data/` — provenance and compact processed data used by the site
- `model/` — parsers and mortality-model code
- `tests/` — validation and backtests
- `output/` — model artifacts
- `index.html`, `app.js`, `styles.css` — public ReaperMapper site

## Current limitations

ReaperMapper does not identify individual deaths, predict who will die, or claim that a death occurred when the displayed estimate changes. State daily counts are allocated estimates. Provisional national mortality data may be revised as additional death certificates are received and processed.

The project favors transparent assumptions over false real-time precision.
