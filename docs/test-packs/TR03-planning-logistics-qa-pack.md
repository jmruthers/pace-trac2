# SLICE-03 QA Pack

## Slice metadata

- slice_id: SLICE-03
- app: trac
- requirement_path: docs/requirements/TR03-planning-logistics-requirements.md

## Manual frontend scenarios

| scenario_ref | route_or_screen | steps | expected_result | result | notes |
|---|---|---|---|---|---|
| S-01 · AC1 | `/planning` | On transport, accommodation, and activity tabs, create, edit, and delete a row for the active event. | CRUD round-trip succeeds for each resource type (subject to RLS). | - | Planner with planning write |
| S-02 · AC2 | `/planning` | Save valid status and transport mode; attempt invalid enum or mode in the form. | Valid enums persist; invalid values rejected with user-visible message (client and server). | - | - |
| S-03 · AC3 | `/planning` | Leave capacity empty; save. Set capacity and enter invalid numeric value. | Null capacity behaves as uncapped; non-null capacity enforces numeric validation. | - | - |
| S-04 · AC4 | `/planning` | Save a logistics row with a place/location. | Snapshot address or name fields appear on the row after save. | - | - |
| S-05 · AC5 | `/planning` | Inspect planning UI for assignment create, update, or delete actions. | No assignment CRUD affordances on `/planning`. | - | - |
| S-06 · AC6 | `/planning` | Open planning as a participant without planning write permission; attempt a mutation. | Mutation blocked by guard or RLS with surfaced error; no silent success. | - | Participant role |
| S-07 · AC7 | `/planning` | Upload, open, and delete a supporting document on a logistics row. | Document lifecycle works; storage or reference cleanup failures show explicit UI error (not silent ignore). | - | - |
| S-08 · AC8 | `/planning` | After a logistics mutation, open `/itinerary`, `/costs`, `/`, and `/masterplan` without manual full reload tricks. | Dependent surfaces reflect the change without relying on delays or custom browser events. | - | - |
| S-09 · Verification | `/planning` | After external cache update for a saved place, view the row without re-saving. | Snapshot fields on the row remain until the user re-saves from planning. | - | - |

## Test run summary

- overall result: [Not run]
- failed scenarios: -
- defect links: N/A
- retest needed: [TBD]
