# ReaperMapper daily estimator - Model 0.1

The public-facing daily number is a modeled estimate, never a live registry count.

## Inputs
1. Annual forecast: previous final U.S.-resident annual death total.
2. Seasonal shape: immediately preceding final year's monthly distribution.

## Daily conversion
The annual forecast is allocated into 12 months using the previous year's final monthly shares. Each predicted month is divided evenly by the actual number of calendar days in that target month. Leap years are handled explicitly.

We do not infer exact day-of-month patterns because public NCHS mortality data do not expose exact death dates. Weekday adjustment is a separate candidate feature and will only be added if held-out testing shows improvement.

## Display contract
Every daily estimate must be displayed with the approximation symbol and modeled status. UI copy must make clear that this is not a live death registry and does not represent individually observed deaths.

An animated intraday counter, if used, is interpolation of the modeled daily expectation. A visual tick must never be described as an observed death occurring at that moment.
