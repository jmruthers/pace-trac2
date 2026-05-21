# SLICE-02 — Dashboard — Completion record

**Authority:** [TR02-dashboard-requirements.md](../requirements/TR02-dashboard-requirements.md)  
**Completed (implementation):** 2026-05-21  
**Compliance review:** 2026-05-21  
**Remediation:** [TR02-remediation-plan.md](./TR02-remediation-plan.md) (P0 manual sign-off open)  
**Quality gate:** `npm run validate` — PASS (6/6) after compliance remediation

---

## Acceptance criteria (TR02 § Acceptance criteria)

| # | Criterion | Code | Tests | Sign-off |
|---|-----------|------|-------|----------|
| 1 | Summary cards show correct aggregates (planning, itinerary, costs, contacts) | [x] | [x] integration (mocked upstream) | [ ] P0 manual dev-db — [TR02-remediation-plan](./TR02-remediation-plan.md) |
| 2 | Planning confirmed/total uses `trac_status` only | [x] | [x] unit + integration | [x] |
| 3 | Costs use event base currency (no hard-coded AUD) | [x] | [x] `useCostRollupData` + integration | [ ] P0 manual dev-db — [TR02-remediation-plan](./TR02-remediation-plan.md) |
| 4 | No second no-event pattern (shell fallback only) | [x] | [x] TR01 routes | [x] |
| 5 | User without dashboard read cannot access metrics | [x] | [x] integration | [x] |
| 6 | Lightweight `/assignments` link (no assignment aggregate) | [x] | [x] integration | [x] |
| 7 | One failed card does not blank whole dashboard | [x] | [x] `DashboardCard` + integration (per-card failure) | [x] |

**Summary:** AC 2, 4, 5, 6, 7 — signed off (code + tests). AC 1, 3 — implemented in code; sign-off pending P0 manual verification on dev-db.

---

## Rebuild target (TR02 § Rebuild target)

| Item | Status | Evidence |
|------|--------|----------|
| Event gating via `ProtectedRoute requireEvent` | [x] | [`authenticated-routes.tsx`](../../src/app/routes/authenticated-routes.tsx) |
| Header: title, logo, tagline | [x] | [`useDashboardEventHeader.ts`](../../src/features/dashboard/hooks/useDashboardEventHeader.ts) — `core_events.event_name`, `description` / `participant_blurb`, `logo_id` → `FileDisplay` |
| Planning card: confirmed/total per kind | [x] | [`PlanningSummaryCard.tsx`](../../src/features/dashboard/components/PlanningSummaryCard.tsx) + [`planning-status-summary.ts`](../../src/features/dashboard/planning-status-summary.ts) |
| Itinerary card: date range or empty | [x] | [`ItinerarySummaryCard.tsx`](../../src/features/dashboard/components/ItinerarySummaryCard.tsx) + SLICE-05 `buildItineraryModel` |
| Costs card: SLICE-07 rollup + per-participant | [x] | [`CostsSummaryCard.tsx`](../../src/features/dashboard/components/CostsSummaryCard.tsx) + `useCostRollupData` |
| Contacts card: count | [x] | [`ContactsSummaryCard.tsx`](../../src/features/dashboard/components/ContactsSummaryCard.tsx) |
| Assignments link only | [x] | [`AssignmentsLinkCard.tsx`](../../src/features/dashboard/components/AssignmentsLinkCard.tsx) |
| Hybrid partial failure | [x] | [`DashboardContent.tsx`](../../src/features/dashboard/DashboardContent.tsx) + [`DashboardCard.tsx`](../../src/features/dashboard/components/DashboardCard.tsx) |
| `PagePermissionGuard` `dashboard` read | [x] | [`DashboardPage.tsx`](../../src/app/pages/DashboardPage.tsx) |
| Person-aware costs (SLICE-04/07 paths) | [x] | `useCostRollupData` — no duplicate rollup rules |
| Not in primary nav | [x] | [`trac-nav-definitions.ts`](../../src/app/navigation/trac-nav-definitions.ts) |

---

## pace-core2 imports (TR02 § pace-core2 imports)

| Need | Status | Actual import |
|------|--------|---------------|
| Guards | [x] | `@solvera/pace-core/rbac` — `PagePermissionGuard`, `useSecureSupabase` |
| Layout / cards | [x] | `@solvera/pace-core/components` — `Card`, `Alert`, `Button`, `LoadingSpinner`, `FileDisplay` |
| Event context | [x] | `@solvera/pace-core/hooks` — `useEvents`, `usePaceMain` |
| Auth | [~] | Not required on dashboard page (shell handles session) |
| Theming | [~] | App shell `useContextTheme` in [`authenticated-routes.tsx`](../../src/app/routes/authenticated-routes.tsx) |
| File types | [x] | `@solvera/pace-core/types` — `FileReference` |
| Currency utils | [x] | `@solvera/pace-core/utils` — `SupabaseClientLike` (header `FileDisplay`) |

---

## API / Contract (TR02 § API / Contract)

| Rule | Status | Evidence |
|------|--------|----------|
| Read-only aggregates | [x] | No mutations in `src/features/dashboard/` |
| Event-scoped queries | [x] | Header `eq('event_id', eventId)`; cards use `usePlanningScope` / `useEvents` / `useContacts` |
| Secure Supabase client | [x] | `useSecureSupabase` + `asDashboardReadClient` |
| RLS applies (server) | [x] | Same paths as upstream slices |
| No direct writes from dashboard | [x] | — |
| Cost rollup aligns with SLICE-07 | [x] | `useCostRollupData` only; no copied `computeCostRollup` |

---

## Visual specification (TR02 § Visual specification)

| Item | Status | Notes |
|------|--------|-------|
| Responsive grid of cards | [x] | `sm:grid-cols-2 lg:grid-cols-3` on summary section |
| pace-core Card / Button patterns | [x] | `DashboardCard`, footer retry on errors |
| Loading: skeletons or inline | [x] | `LoadingSpinner` per card and page shell |
| Empty: explicit copy | [x] | Itinerary, contacts, costs empty messages |
| Event logo via platform file display | [x] | `FileDisplay` inline variant in `DashboardHeader` |

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `DashboardPage` | Home; not in primary nav |
| `/dashboard` | `DashboardPage` | Alias |

Registered in [`TRAC_REGISTERED_ROUTE_PATHS`](../../src/app/navigation/trac-nav.ts). Shell route permissions still exclude `/` and `/dashboard` (TR01).

---

## Testing requirements (TR02 § Testing requirements)

| # | Scenario | Type | Status | Evidence |
|---|----------|------|--------|----------|
| 1 | Happy path: cards + links | Integration | [x] | [`dashboard.integration.test.tsx`](../../src/features/dashboard/dashboard.integration.test.tsx) |
| 2 | Invalid enum: no crash; sane log | Integration + unit | [x] | `planning-status-summary.test.ts`, integration |
| 3 | Auth: no dashboard read → denial | Integration | [x] | `dashboard.integration.test.tsx` |
| — | Per-card failure does not blank siblings | Integration | [x] | `dashboard.integration.test.tsx` (AC7) |
| — | Unit: count summaries, date range label | Unit | [x] | `planning-status-summary.test.ts`, `format-itinerary-range.test.ts` |
| — | Page smoke | Unit | [x] | [`DashboardPage.test.tsx`](../../src/app/pages/DashboardPage.test.tsx) |

---

## Verification (TR02 § Verification)

| Check | Status |
|-------|--------|
| Spot-check aggregates vs SQL on dev-db | [ ] P0 — [TR02-remediation-plan.md](./TR02-remediation-plan.md) |
| Permission denial without `read:page.dashboard` | [ ] P0 live session — integration covers guard; live RLS confirm recommended |

---

## Explicit exclusions (TR02 § Do not)

| Rule | Status |
|------|--------|
| No hard-coded currency labels | [x] |
| No duplicate SLICE-07 rollup logic | [x] |
| No dashboard primary nav item | [x] |
| No second no-event pattern in dashboard | [x] |
| Built after SLICE-03–07 data paths | [x] |

---

## Automated verification

| Check | Result |
|-------|--------|
| `npm run validate` | PASS (6/6) |
| Tests | See latest `npm run test` (dashboard + suite) |

---

## Manual verification (sign-off)

See [TR02-remediation-plan.md](./TR02-remediation-plan.md) P0 checklist.

- [ ] Planner with event: spot-check card counts vs raw SQL on dev-db for one fixture event (AC1, AC3)
- [ ] User without `read:page.dashboard` sees AccessDenied on `/` and `/dashboard` (live session)

---

## Downstream

- **SLICE-10** Master Plan may reuse header/logo patterns and cost rollup from `@/features/costs`.
- **SLICE-07** F-07-06: SLICE-02 consumes shared rollup via `useCostRollupData` (see [TR07-slice-completion.md](./TR07-slice-completion.md)).
- Invalidation: `TRAC_DASHBOARD_QUERY_PREFIX` wired from planning/assignments invalidation (existing).
