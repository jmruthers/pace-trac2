# SLICE-02 — Dashboard — Requirements

**Document status:** Draft — rebuild implementation contract.  
**Companion authority:** `trac-project-brief.md`, `trac-architecture.md`.

---

## Orchestration metadata (canonical)

| Field | Value |
|--------|--------|
| **Slice ID** | SLICE-02 |
| **Name** | Dashboard |
| **Bounded context** | Composite — Dashboard |
| **Owning routes** | `/`, `/dashboard` (home alias) |
| **Depends on** | SLICE-01; **substantive aggregates** after core domains (**minimum SLICE-03–07** implemented or stubbed with real data paths) |
| **Blocks** | — |
| **Implementation order** | 9 of 10 (per architecture — after domains so cards reflect real capability) |
| **High-risk** | Yes — composite: many upstream hooks; wrong build order yields hollow or wrong metrics |
| **Cross-cutting** | Aggregates planning, itinerary, costs, contacts; includes lightweight link to `/assignments` |

---

## Overview

Deliver the **event dashboard** at `/` and `/dashboard`: summary cards that reflect the **explicit v1 dashboard contract** in `trac-architecture.md` — planning counts, itinerary date range, costs, contacts, and lightweight assignments navigation — while using **pace-core2** UI and **`trac_status`** (not free-text status strings). Dashboard is **not** a primary nav item; users reach it via `/`.

---

## Rebuild target

- **Event gating:** Event-scoped route behind pace-core2 **`ProtectedRoute requireEvent`** with one approved TRAC no-event fallback; once the route is entered, card loading/empty/error states are handled in-page.
- **Header:** Event title, logo (`core_events` / org storage per brief), tagline where available.
- **Planning card:** Link to `/planning`; **counts of confirmed vs total** for activities, transport, accommodation (enum-safe).
- **Itinerary card:** Link to `/itinerary`; earliest and latest visible dates from the SLICE-05 derived day-entry model, or explicit empty state.
- **Costs card:** Link to `/costs`; total and **per-participant** cost using **event base currency** (no hard-coded AUD), with the overall participant denominator taken from the **approved application count** for the active event; formatting via shared helpers.
- **Contacts card:** Link to `/contacts`; contact count.
- **Assignments link:** Include a lightweight **link** to **`/assignments`** (no extra assignment aggregate required for v1).
- **Partial failure:** Hybrid policy. Route/event gating failures are handled at the route/shell level by the shared TRAC no-event fallback. After route access is established, required event identity/header data is critical: if it cannot load, show a page-level error state. After header identity is established, cards degrade independently. A failure in one aggregate must not blank the whole dashboard; failed cards show inline error/retry messaging while successful cards still render. Empty states are not errors.
- **Permissions:** Read access gated by **`dashboard`** page key once the required TRAC page registration / permission seeding prerequisite is present on dev-db.
- **Person-aware data:** Where costs or counts depend on assignments/capacity, consume SLICE-04/07 data paths — no duplicate business rules.

---

## pace-core2 delta (vs legacy)

| Area | Rebuild |
|------|---------|
| Package/UI | `@solvera/pace-core` components and layout |
| Status filtering | `trac_status` enum |
| Assignments | Lightweight dashboard link to `/assignments` |
| Currency | Event base currency + `trac_currency_rates` behaviour per architecture |

---

## pace-core2 imports (expected)

| Need | Import path (expected) |
|------|------------------------|
| Guards | `@solvera/pace-core/rbac` — `PagePermissionGuard` for **`dashboard`** page key |
| Layout / cards | `@solvera/pace-core/components` |
| Event / org context | `@solvera/pace-core/providers` |
| Auth | `@solvera/pace-core` — `useUnifiedAuthContext` if needed |
| Theming | `@solvera/pace-core/theming` |

---

## Data and schema references

| Table / topic | Notes |
|---------------|--------|
| `trac_transport`, `trac_accommodation`, `trac_activity` | Counts by `trac_status`; capacity not required on dashboard card but may inform copy later |
| `trac_itinerary_assignment` | Optional future metrics; link to `/assignments` |
| `trac_currency_rates`, cost fields on logistics | For costs card — validate rollups vs brief |
| `core_events`, event logo storage | Header branding |
| **Supabase MCP (dev-db)** | Validate enums and column names before queries |

---

## Acceptance criteria

1. With event selected and permission granted, all summary cards render with **correct aggregates** per the architecture dashboard contract (counts, dates, costs, contacts).
2. Planning confirmed/total counts use **`trac_status`** only.
3. Costs display uses **event base currency** metadata — no literal AUD (or other) unless that is the event’s configured base.
4. Missing-event handling is provided by the shared route-level TRAC no-event fallback; the dashboard itself does not invent a second no-event pattern.
5. User without dashboard read permission cannot access metrics (guard or server denial with UI feedback).
6. Dashboard includes a lightweight `/assignments` link (without introducing new assignment aggregate metrics).
7. One failed aggregate card does not blank the whole dashboard.

---

## API / Contract

- **Read-only** aggregates via pace-core2 secure Supabase client; RLS applies.
- Queries must be **event-scoped** (`event_id` / org context from providers).
- No direct writes from dashboard.
- Cost aggregation contract must align with **SLICE-07** (single source of rollup rules).

---

## Visual specification

- Responsive grid of cards; clear hierarchy; use pace-core2 card/button patterns.
- **Loading:** Skeletons or inline loading; **empty:** explicit copy for “no itinerary”, zero contacts, etc.
- **Event logo:** Consistent with Master Plan / platform file display component.

---

## Verification

- Manual walkthrough with planner role; spot-check numbers against raw SQL on **dev-db** for one fixture event.
- Confirm permission denial for role without dashboard read.

---

## Testing requirements

| # | Scenario | Type |
|---|----------|------|
| 1 | **Happy path:** Planner with event sees cards populated with expected counts and links | Integration (mocked Supabase) |
| 2 | **Validation / domain failure:** Event selected but upstream returns invalid enum — UI handles without crash; logs sane error | Integration |
| 3 | **Auth / permission failure:** User without **`read:page.dashboard`** — guard shows access denied / redirect | Integration |

Unit tests: pure helpers for date range reduction, count summaries (mocked inputs).

---

## Open questions

*(None — key is **`dashboard`**; required TRAC page registration / permission seeding is treated as a pre-build prerequisite per architecture.)*

---

## Do not

- Do not hard-code currency labels.
- Do not duplicate cost rollup logic that SLICE-07 owns — import shared module or service.
- Do not build this slice **before** SLICE-03–07 are far enough along to supply real aggregates (per implementation order).

---

## References

| Document | Role |
|----------|------|
| `trac-architecture.md` | Composite contracts section, IA, SLICE-02 row |
| `trac-project-brief.md` | Quality gates, redesign intent |
