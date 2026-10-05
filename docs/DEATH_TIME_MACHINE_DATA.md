# Death Time Machine — Data Contract 0.1

## Scope

DTM 0.1 covers final all-cause U.S. mortality from 1968 through 2024.

For each year it will store:
- national final resident death count
- national final age-adjusted all-cause death rate
- state/DC final resident death counts
- state/DC final age-adjusted all-cause death rates
- source dataset / ICD era
- provenance status

Today's Model 0.2 estimate is NOT part of the historical series. The UI crosses a provenance boundary from final history to ≈ TODAY.

## Required rate standard

All historical age-adjusted rates MUST use the **2000 U.S. standard population** and be expressed per 100,000.

Never mix rates standardized to the 1940 or 1970 populations into the DTM series.

Reason: older NCHS publications commonly used earlier standard populations. The same historical year can therefore have a very different published age-adjusted rate depending on the standard population. CDC WONDER supports 1940, 1970 and 2000 standards; DTM uses 2000 consistently.

## Source eras

- 1968–1978: NCHS Compressed Mortality File, ICD-8
- 1979–1998: NCHS Compressed Mortality File, ICD-9
- 1999–2016: NCHS Compressed Mortality / Underlying Cause, ICD-10
- 2017–2020: NCHS Underlying Cause, ICD-10
- 2021–2024: NCHS final annual mortality / Underlying Cause, ICD-10

ICD boundaries matter primarily for future cause-specific DTM features. DTM 0.1 is all-cause mortality.

## Historical raw-data verification

CDC's public-use 1968–1978 mortality file is fixed-width, 23 bytes:
- 1–2: FIPS state
- 3–5: FIPS county
- 6–9: year
- 10: race/sex
- 11–12: age group
- 13–16: underlying ICD code
- 17–19: cause recode
- 20–23: death count

The 1968–1988 public-use files can be used as an independent check of early WONDER aggregates.

Special case: 1972 mortality is based on a 50% sample weighted by 2 in the CMF.

## Validation gates

No year enters data/history.json until:

1. State/DC death counts sum to the expected national resident total, or any documented difference is explained.
2. Age-adjusted rates are confirmed to use the 2000 U.S. standard population.
3. At least three states are spot-checked against an official NCHS/WONDER result.
4. Overlap years are compared when switching source datasets.
5. 2024 reproduces the existing ReaperMapper controls:
   - U.S.: 3,072,666 deaths; 722.1 age-adjusted rate
   - California: 288,143; 612.6
   - Colorado: 44,524; 673.4
6. Source metadata is retained; historical values are never silently revised.

## Initial 1968 controls

Published historical sources support:
- U.S. final deaths: 1,930,082
- U.S. age-adjusted all-cause rate using the 2000 standard: approximately 1,304.5 per 100,000

Do NOT substitute the historically published 743.8 rate: that figure uses the older 1940 standard population and is not comparable to ReaperMapper's modern age-adjusted series.

The complete 1968 state matrix must still be obtained/verified before it is used in production.

## Proposed normalized record

```json
{
  "year": 1968,
  "status": "final",
  "rate_standard": "2000_US",
  "source": "NCHS_CMF_ICD8",
  "national": {
    "deaths": 1930082,
    "age_adjusted_rate": 1304.5
  },
  "states": {
    "01": {
      "name": "Alabama",
      "deaths": null,
      "age_adjusted_rate": null
    }
  }
}
```

Nulls are deliberate until official values pass validation.

## UI provenance

Historical mode:
- ● FINAL
- actual annual death counts
- final age-adjusted rates

Present mode:
- P provisional annual input where applicable
- ≈ modeled daily estimate
- never described as an observed live death count

## Easter egg

The DTM play routine may be named `rhythmIsGonnaGetYou()`.

Scientific dignity is otherwise preserved.
