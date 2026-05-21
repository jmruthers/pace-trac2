# SLICE-04 QA Pack

## Slice metadata

- slice_id: SLICE-04
- app: trac
- requirement_path: docs/requirements/TR04-assignments-requirements.md

## Manual frontend scenarios

| scenario_ref | route_or_screen | steps | expected_result | result | notes |
|---|---|---|---|---|---|
| S-01 · AC1 | `/assignments` | Create, update, and delete an assignment for an allowed resource type on the active event. | Assignment row appears, updates, and removes; headcount reflects changes. | - | Planner with planning permission |
| S-02 · AC2 | `/assignments` | Attempt to assign to a non-existent or wrong-type `resource_id`. | Save rejected with actionable error message. | - | - |
| S-03 · AC3 | `/assignments` | Assign participants until headcount exceeds non-null capacity; confirm save. | Over-capacity warning shown; save requires explicit confirmation before persisting. | - | Resource with capacity set |
| S-04 · AC4 | `/assignments` | Open participant picker when adding an assignment. | Only approved applications for the active event are listed. | - | - |
| S-05 · AC5 | `/assignments` | Open `/assignments` without planning read/write permission. | Access denied or no save; assignments not manageable. | - | - |
| S-06 · AC6 | `/planning` | Inspect planning UI for assignment mutations. | No assignment create, update, or delete on `/planning`. | - | - |

## Test run summary

- overall result: [Not run]
- failed scenarios: -
- defect links: N/A
- retest needed: [TBD]
