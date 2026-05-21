# SLICE-02 QA Pack

## Slice metadata

- slice_id: SLICE-02
- app: trac
- requirement_path: docs/requirements/TR02-dashboard-requirements.md

## Manual frontend scenarios

| scenario_ref | route_or_screen | steps | expected_result | result | notes |
|---|---|---|---|---|---|
| S-01 · AC1 | `/` or `/dashboard` | Select an event; open home with dashboard read permission. | Planning, itinerary, costs, and contacts summary cards render with aggregates and links per dashboard contract. | - | Planner role; fixture event |
| S-02 · AC2 | `/` or `/dashboard` | Inspect planning card confirmed vs total counts. | Counts reflect `trac_status` enum states only (not free-text status). | - | - |
| S-03 · AC3 | `/` or `/dashboard` | Inspect costs card currency labels and formatting. | Costs use event base currency metadata; no hard-coded currency unless configured for the event. | - | - |
| S-04 · AC4 | `/` or `/dashboard` | Clear event selection; attempt to open `/` or `/dashboard`. | Shared route-level TRAC no-event fallback only; dashboard does not show a second competing no-event pattern. | - | - |
| S-05 · AC5 | `/` or `/dashboard` | Open dashboard as a user without dashboard read permission. | Access denied or redirect with UI feedback; metrics not visible. | - | - |
| S-06 · AC6 | `/` or `/dashboard` | Locate assignments entry on the dashboard. | Lightweight link to `/assignments` is present; no new assignment aggregate metrics on the dashboard. | - | - |
| S-07 · AC7 | `/` or `/dashboard` | Simulate or use a fixture where one card upstream fails while others succeed. | Failed card shows inline error or retry; remaining cards still render; page not blank. | - | May require controlled failure fixture |

## Test run summary

- overall result: [Not run]
- failed scenarios: -
- defect links: N/A
- retest needed: [TBD]
