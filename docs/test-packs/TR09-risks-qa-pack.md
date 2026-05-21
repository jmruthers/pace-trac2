# SLICE-09 QA Pack

## Slice metadata

- slice_id: SLICE-09
- app: trac
- requirement_path: docs/requirements/TR09-risks-requirements.md

## Manual frontend scenarios

| scenario_ref | route_or_screen | steps | expected_result | result | notes |
|---|---|---|---|---|---|
| S-01 · AC1 | `/risks` | Create or edit a risk with valid likelihood and consequence enums; save and reload. | Risk saves; generated impact values display after refetch. | - | Planner with risks permission |
| S-02 · AC2 | `/risks` | Inspect risk detail after save; confirm impact fields are read-only in UI. | Impact columns display from generated values; client does not offer editable impact-before/impact-after writes. | - | - |
| S-03 · AC3 | `/risks` | Create or edit a risk; select responsible contact from picker. | Contact linkage works using contacts from SLICE-06. | - | Contacts exist on fixture event |
| S-04 · AC4 | `/risks` | Use print action on risks register. | Print completes without throw; print layout is readable with side nav hidden. | - | Browser print preview |
| S-05 · AC5 | `/risks` | Open `/risks` without risks page permission. | Access denied; cannot read or mutate risks. | - | - |

## Test run summary

- overall result: [Not run]
- failed scenarios: -
- defect links: N/A
- retest needed: [TBD]
