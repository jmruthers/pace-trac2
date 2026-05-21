# SLICE-08 QA Pack

## Slice metadata

- slice_id: SLICE-08
- app: trac
- requirement_path: docs/requirements/TR08-journal-requirements.md

## Manual frontend scenarios

| scenario_ref | route_or_screen | steps | expected_result | result | notes |
|---|---|---|---|---|---|
| S-01 · AC1 | `/journal` | Create, edit, and delete a journal post for the active event. | Post CRUD succeeds for authorised user; feed updates accordingly. | - | User with journal write |
| S-02 · AC2 | `/journal` | Create a post with image; delete post or image; provoke a storage failure if testable. | Images upload and display on the post; delete paths surface storage failures explicitly (not silent success). | - | - |
| S-03 · AC3 | `/journal` | Inspect journal list and network-visible reads in UI. | Posts are event-scoped; images only appear via posts (no bare event image list). | - | UI-level check |
| S-04 · AC4 | `/journal` | Open `/journal` without journal read or write permission. | Access denied; no post or image content visible. | - | - |
| S-05 · AC5 | `/journal` | Exercise journal read and write as permitted and denied roles on the active event. | Behaviour aligns with `journal` page key guards and permission-gated actions. | - | - |
| S-06 · Verification | `/journal` | Trigger upload rollback or failed image delete path if reproducible in UI. | User-visible error shown; incomplete cleanup not presented as success. | - | - |

## Test run summary

- overall result: [Not run]
- failed scenarios: -
- defect links: N/A
- retest needed: [TBD]
