# SLICE-07 QA Pack

## Slice metadata

- slice_id: SLICE-07
- app: trac
- requirement_path: docs/requirements/TR07-costs-and-currency-requirements.md

## Manual frontend scenarios

| scenario_ref | route_or_screen | steps | expected_result | result | notes |
|---|---|---|---|---|---|
| S-01 · AC1 | `/costs` | Open costs for a fixture event with rates and logistics costs. | Event total and per-participant figures match manual calculation for the fixture using line-level rounding then sum. | - | Planner with costs read; fixture event |
| S-02 · AC2 | `/costs` | Inspect currency labels and formatting on `/costs`. | Display uses event base currency metadata. | - | - |
| S-03 · AC3 | `/currency-rates` | Open `/currency-rates` without permission; repeat with authorised user. Edit a rate with invalid input. | Unauthorised user denied via page guard; authorised user can manage rates; invalid rate input rejected with message. `/costs` remains read/aggregate only. | - | - |
| S-04 · AC4 | `/costs` | Review per-participant table and row totals for assigned and unassigned logistics rows. | Per-participant figure follows R2 allocation; row event totals follow documented formula; NULL/zero money fields handled as specified. | - | Fixture with mixed assignment counts |
| S-05 · AC5 | `/` and `/masterplan` | Compare cost figures on dashboard and master plan with `/costs` for the same event. | Same rollup totals shown (no divergent copy-paste totals). | - | Requires SLICE-02 and SLICE-10 routes |

## Test run summary

- overall result: [Not run]
- failed scenarios: -
- defect links: N/A
- retest needed: [TBD]
