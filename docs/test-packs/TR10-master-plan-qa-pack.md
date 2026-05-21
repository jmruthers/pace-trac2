# SLICE-10 QA Pack

## Slice metadata

- slice_id: SLICE-10
- app: trac
- requirement_path: docs/requirements/TR10-master-plan-requirements.md

## Manual frontend scenarios

| scenario_ref | route_or_screen | steps | expected_result | result | notes |
|---|---|---|---|---|---|
| S-01 · AC1 | `/masterplan` | Select event; open Master Plan with `masterplan` read permission. | Header, map, contacts, costs, and itinerary sections render per architecture master plan contract. | - | Planner role; fixture event |
| S-02 · AC2 | `/masterplan` | Invoke print from Master Plan. | Print runs without error; print layout hides irrelevant chrome. | - | Browser print preview |
| S-03 · AC3 | `/masterplan` and `/costs` | Compare cost summary on Master Plan with `/costs` for the same event. | Cost summary on Master Plan matches `/costs` rollup for the fixture event. | - | - |
| S-04 · AC4 | `/masterplan` | Inspect currency labels on Master Plan cost section. | No hard-coded currency strings; uses event base currency metadata. | - | - |
| S-05 · AC5 | `/masterplan` | Locate timezone disclaimer near itinerary section. | Timezone disclaimer present near itinerary content. | - | - |
| S-06 · AC6 | `/masterplan` | Inspect Master Plan for domain write actions. | No writes to logistics, assignments, risks, journal, or contacts from this page. | - | - |
| S-07 · AC7 | `/masterplan` | Use a fixture where one upstream section fails while others succeed. | Failed section shows degradation message; page remains stable; other sections still render. | - | May require controlled failure fixture |
| S-08 · Verification | `/masterplan` | Walk architecture checklist for section presence on screen. | All contract sections (header, map when coords exist, contacts, costs, itinerary) are present when upstream data exists. | - | - |

## Test run summary

- overall result: [Not run]
- failed scenarios: -
- defect links: N/A
- retest needed: [TBD]
