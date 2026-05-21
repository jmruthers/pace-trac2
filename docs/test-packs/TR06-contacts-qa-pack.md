# SLICE-06 QA Pack

## Slice metadata

- slice_id: SLICE-06
- app: trac
- requirement_path: docs/requirements/TR06-contacts-requirements.md

## Manual frontend scenarios

| scenario_ref | route_or_screen | steps | expected_result | result | notes |
|---|---|---|---|---|---|
| S-01 · AC1 | `/contacts` | Add, edit, and remove a contact for the active event. | Contact CRUD succeeds per RLS for authorised user; list updates accordingly. | - | Planner with contacts permission |
| S-02 · AC2 | `/contacts` | Create a contact; note its ID in the list after refresh. | Contact remains in event list with stable identity for downstream picker consumption. | - | Full picker flow is SLICE-09 |
| S-03 · AC3 | `/contacts` | Submit create or edit with missing required fields or invalid format. | Validation errors map to UI with blocking messages. | - | - |
| S-04 · AC4 | `/contacts` | Open `/contacts` without contacts read or write permission. | Access denied; cannot read or mutate contacts. | - | - |
| S-05 · AC5 | `/contacts` | Attempt to delete a contact linked to risks (if applicable on fixture). | Actionable guidance on FK delete failure; inactive/archive picker exclusion N/A when schema has no inactive columns. | - | - |

## Test run summary

- overall result: [Not run]
- failed scenarios: -
- defect links: N/A
- retest needed: [TBD]
