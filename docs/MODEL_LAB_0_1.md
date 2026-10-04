# Model Lab 0.1

## Rule
Math has to earn its complexity.

## Annual benchmark
2024 final resident deaths: 3,072,666. The 2023 carry-forward prediction is 3,090,964, an absolute error of 18,298 (0.596%).

## Monthly held-out experiment
The first seasonality test is intentionally strict:

- Training data: final 2022 and 2023 U.S. mortality public-use microdata.
- Target data: final 2024 U.S. mortality public-use microdata.
- Annual 2024 forecast: carry forward the final 2023 total.
- Monthly shape: pooled 2022-2023 month-of-death shares only.
- 2024 data are used only for scoring after predictions are fixed.
- Primary monthly metric: MAPE across the 12 monthly death counts.
- Integrity checks: predicted months must sum to the annual forecast; actual parsed 2024 records must reconcile to the CDC control/final total before results are accepted.

A seasonal model is not promoted merely because it sounds plausible. It must improve useful time-within-year estimates in held-out testing.
