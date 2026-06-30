# SLICE-10 — Master Plan — Completion record

**Authority:** [TR10-master-plan-requirements.md](../requirements/TR10-master-plan-requirements.md)  
**Completed (implementation):** 2026-06-30 (standalone `/masterplan` route)  
**Remediation (compliance):** 2026-05-21 — section order, print-friendly cost summary, delivery docs  
**Sign-off:** Pending manual dev-db + print verification (see [TR10-remediation-plan.md](./TR10-remediation-plan.md))  
**Quality gate:** `npm run validate` — PASS (6/6)

---

## Acceptance criteria (TR10 § Acceptance criteria)

| # | Criterion | Code | Tests | Sign-off |
|---|-----------|------|-------|----------|
| 1 | With event + permission, all sections per architecture contract (header, map, contacts, costs, itinerary) | [x] | [x] integration | [ ] manual dev-db |
| 2 | Browser print layout; no in-page print button | [x] | [ ] optional print smoke | [ ] manual print preview |
| 3 | Cost summary matches SLICE-07 rollup for same event fixture | [x] | [x] shared `useCostRollupData` | [ ] cross-check vs `/costs` on dev-db |
| 4 | No hard-coded currency strings | [x] | [x] unit/integration fixtures | [x] |
| 5 | Timezone disclaimer near itinerary | [x] | [x] integration | [x] |
| 6 | No writes to domain tables from this page | [x] | [x] read-only hooks only | [x] |
| 7 | Section-level upstream failure does not blank whole page | [x] | [x] partial-failure integration | [x] |

**Summary:** All seven acceptance criteria are **implemented in application code**. AC1–3 **sign-off** depends on manual dev-db and print verification (P0 in remediation plan).

---

## Rebuild target (TR10 § Rebuild target)

| Item | Status | Evidence |
|------|--------|----------|
| `ProtectedRoute requireEvent` + TRAC no-event fallback | [x] | [`authenticated-routes.tsx`](../../src/app/routes/authenticated-routes.tsx) |
| In-page section loading/errors | [x] | [`MasterPlanSectionShell.tsx`](../../src/features/master-plan/components/MasterPlanSectionShell.tsx) |
| Print via pace-core print shell CSS (no in-page button) | [x] | [`MasterPlanContent.tsx`](../../src/features/master-plan/MasterPlanContent.tsx) `usePaceMain` |
| Map: interactive Google map via `ItineraryMapPanel`; empty messaging | [x] | [`collect-map-points.ts`](../../src/features/itinerary/collect-map-points.ts), [`MasterPlanJourneyMap.tsx`](../../src/features/master-plan/components/MasterPlanJourneyMap.tsx) |
| Organisation display name in header KV | [x] | [`useMasterPlanEventHeader.ts`](../../src/features/master-plan/hooks/useMasterPlanEventHeader.ts) `display_name` |
| Costs: single consolidated grid; shared rollup + base currency | [x] | [`MasterPlanCostSummary.tsx`](../../src/features/master-plan/components/MasterPlanCostSummary.tsx), [`useCostRollupData`](../../src/features/costs/hooks/useCostRollupData.ts) |
| Itinerary: SLICE-05 entries via `ItineraryEntryRow` + timezone disclaimer | [x] | [`MasterPlanItinerarySection.tsx`](../../src/features/master-plan/components/MasterPlanItinerarySection.tsx) |
| Contacts: full event list | [x] | [`MasterPlanContactsList.tsx`](../../src/features/master-plan/components/MasterPlanContactsList.tsx) |
| Person-awareness in counts/copy | [x] | Rollup + breakdown; SLICE-04/07 contracts |
| Partial failure (hybrid) | [x] | Header critical; independent section errors |
| Read-only (no CRUD) | [x] | No mutations on master plan surface |
| Section order: header → map → contacts → costs → itinerary | [x] | [`MasterPlanContent.tsx`](../../src/features/master-plan/MasterPlanContent.tsx) (post-remediation) |

---

## pace-core2 imports (TR10 § pace-core2 imports)

| Need | Status | Notes |
|------|--------|-------|
| RBAC — `PagePermissionGuard` | [x] | [`MasterPlanPage.tsx`](../../src/app/pages/MasterPlanPage.tsx) `pageName="masterplan"` |
| Components | [x] | `Alert`, `LoadingSpinner`, `DataTable`, `HeroLogo`, `PageHeader`; itinerary `ItineraryMapPanel`, `ItineraryEntryRow` |
| Providers | [x] | App shell / `useEvents`; `GoogleMapsPlanningProvider` via `ItineraryMapPanel` |
| File display | [x] | `HeroLogo` + `useFileDisplay` in [`MasterPlanHeader.tsx`](../../src/features/master-plan/components/MasterPlanHeader.tsx) |

---

## API / Contract (TR10 § API / Contract)

| Rule | Status | Evidence |
|------|--------|----------|
| Read-only composition via upstream hooks | [x] | `useCostRollupData`, `useContacts`, `useMasterPlanViewModel`, planning logistics lists |
| No duplicate Supabase logic for same aggregate | [x] | Thin [`useMasterPlanEventHeader`](../../src/features/master-plan/hooks/useMasterPlanEventHeader.ts) only (`TRAC_MASTERPLAN_QUERY_PREFIX`) |
| SLICE-07 rollup not duplicated | [x] | Shared costs hook |

---

## Visual specification (TR10 § Visual specification)

| Item | Status | Notes |
|------|--------|-------|
| Print-first single column; page-break hints | [x] | `grid gap-8`; `break-after-page` on costs |
| Journey map: Google map panel (no leg cards) | [x] | `MasterPlanJourneyMap` + `ItineraryMapPanel` |
| No Back / Print toolbar on standalone page | [x] | Shell nav + browser print only |
| Cost summary: single `dl` grid (no duplicate Cards) | [x] | `MasterPlanCostSummary` |
| Itinerary cards: shared entry row with TZ + detail lines | [x] | `ItineraryEntryRow` in master plan section |

---

## Testing requirements (TR10 § Testing requirements)

| # | Scenario | Type | Status | Evidence |
|---|----------|------|--------|----------|
| 1 | Happy path: all sections populated from mocks | Integration | [x] | [`master-plan.integration.test.tsx`](../../src/features/master-plan/master-plan.integration.test.tsx) |
| 2 | Partial failure: costs error; page stable | Integration | [x] | Same file |
| 3 | Auth: no masterplan read → AccessDenied | Integration | [x] | Same file |
| — | Unit: date range single day vs range | Unit | [x] | [`format-event-date-range.test.ts`](../../src/features/master-plan/format-event-date-range.test.ts) |

---

## Verification (TR10 § Verification)

| Check | Status |
|-------|--------|
| Section presence vs architecture checklist | [x] code — [ ] manual walkthrough |
| Print preview manual test | [ ] P0 — see [TR10-remediation-plan.md](./TR10-remediation-plan.md) |
| Cost numbers vs `/costs` for same event | [ ] P0 — same `useCostRollupData` path; manual cross-check |
| `masterplan` in `rbac_app_pages` on dev-db | [ ] prerequisite — human confirm |

---

## Feature list F-10-01 … F-10-09

| ID | Status | Evidence |
|----|--------|----------|
| F-10-01 | [x] | `MasterPlanHeader` — title, event name, date range, logo |
| F-10-02 | [x] | `MasterPlanJourneyMap` + `ItineraryMapPanel` / `collectMapData` |
| F-10-03 | [x] | `MasterPlanContactsList` — read-only `DataTable` (TR10 contact columns) |
| F-10-04 | [x] | `MasterPlanCostSummary` + `useCostRollupData` |
| F-10-05 | [x] | `MasterPlanItinerarySection` + `ItineraryTimezoneNotice` |
| F-10-06 | [x] code / [ ] manual print | pace-core print CSS; no in-page print button |
| F-10-07 | [x] | Per-section loading; route-level no-event |
| F-10-08 | [x] | No domain writes |
| F-10-09 | [x] | `PagePermissionGuard` + integration test |

---

## Explicit exclusions (TR10 § Do not)

| Rule | Status |
|------|--------|
| No duplicate SLICE-07 cost logic | [x] |
| No writes to risks, logistics, journal from Master Plan | [x] |
| No hard-coded currency | [x] |

---

## Routes and navigation

| Item | Path / detail |
|------|----------------|
| Route | `/masterplan` in [authenticated-routes.tsx](../../src/app/routes/authenticated-routes.tsx) |
| Nav | `/masterplan` registered in [trac-nav.ts](../../src/app/navigation/trac-nav.ts); **not** in primary nav (deep-link + dashboard launcher only) |
| RBAC read | `masterplan` page key — `read:page.masterplan` |

---

## Manual verification checklist

- [ ] Sign in on **dev-db** with role that has `read:page.masterplan` and a selected event.
- [ ] Open `/masterplan`: header (title, event name, date range, logo when configured), journey map, contacts, costs, detailed itinerary with timezone notice.
- [ ] Section order: map → contacts → costs → itinerary (architecture contract).
- [ ] Compare **Total cost** on Master Plan vs `/costs` for the same event (should match).
- [ ] Click **Print** — no console error; preview shows readable content; shell nav/toolbar not dominant.
- [ ] User without masterplan read sees **AccessDenied** on `/masterplan`.
- [ ] Simulate or observe one section failure (e.g. costs) — other sections still visible.

---

## Automated verification

| Check | Result |
|-------|--------|
| `npm run validate` | PASS (6/6) — post-remediation |
| Master plan tests | `format-event-date-range.test.ts`, `collect-transport-journey-map.test.ts`, `master-plan.integration.test.tsx`, `MasterPlanPage.test.tsx` |
| Nav | `trac-nav.test.ts` — `/masterplan` registered, excluded from primary nav labels |
| Dashboard | `dashboard.integration.test.tsx` — Open master plan launcher |
