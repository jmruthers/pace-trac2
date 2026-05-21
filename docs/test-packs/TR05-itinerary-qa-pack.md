# SLICE-05 QA Pack

## Slice metadata

- slice_id: SLICE-05
- app: trac
- requirement_path: docs/requirements/TR05-itinerary-requirements.md

## Manual frontend scenarios

| scenario_ref | route_or_screen | steps | expected_result | result | notes |
|---|---|---|---|---|---|
| S-01 · AC1 | `/itinerary` | Open itinerary as planner with coordinates on transport rows. | Full event itinerary list and map (when coords present) display in correct time order. | - | Planner role |
| S-02 · AC2 | `/itinerary` | Open itinerary as two different participants with distinct assignments. | Each participant sees only their assigned logistics rows; no other participants' logistics visible. | - | Two participant accounts |
| S-03 · AC3 | `/itinerary` | Open itinerary as day visitor or user without `base_application`. | Explanatory state shown; not a silent empty screen. | - | Day visitor / no application |
| S-04 · AC4 | `/itinerary` | Inspect itinerary UI for logistics or assignment edit actions. | No mutation affordances for logistics or assignments on this route. | - | - |
| S-05 · AC5 | `/itinerary` | Review itinerary and master-plan-adjacent timezone copy on screen. | Timezone disclaimer or per-row timezone display consistent with Master Plan intent. | - | - |
| S-06 · AC6 | `/itinerary` | View multi-day transport, activity, and accommodation rows. | Day grouping and in-day ordering follow documented multi-day rules without unstable ordering. | - | Fixture with multi-day rows |
| S-07 · AC7 | `/itinerary` | Compare visible day range and grouping for participant with assignments against expected CR25-derived layout. | Participant narrowing, day entries, timezone precedence, and ordering match shared CR25 helper behaviour (UI observable). | - | - |
| S-08 · Verification | `/itinerary` | Open itinerary when logistics rows lack coordinates. | Map shows empty state; list still presents key itinerary information. | - | - |

## Test run summary

- overall result: [Not run]
- failed scenarios: -
- defect links: N/A
- retest needed: [TBD]
