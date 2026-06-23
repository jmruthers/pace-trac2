# SLICE-10 — Master Plan — Requirements

**Document status:** Draft — rebuild implementation contract.  
**Companion authority:** `trac-project-brief.md`, `trac-architecture.md`.

**Withdrawn (2026-06):** Master plan route and SLICE-10 implementation removed from pace-trac2. Prototype **Full plan** mode remains the layout reference only; TRAC v1 delivers itinerary schedule views at `/itinerary` only.

---

## Orchestration metadata (canonical)

| Field | Value |
|--------|--------|
| **Slice ID** | SLICE-10 |
| **Name** | Master plan |
| **Bounded context** | Composite — Master Plan |
| **Owning routes** | `/masterplan` |
| **Depends on** | SLICE-01; **upstream domains** (contacts, planning, assignments, itinerary, costs — per explicit composite contract) |
| **Blocks** | — |
| **Implementation order** | 10 of 10 (**last** — highest cross-domain dependency) |
| **High-risk** | Yes — large composite + **print** + cross-domain consistency |
| **Cross-cutting** | Consumes read models from SLICE-03…09; **must not** duplicate write logic |

---

## Overview

**Operational summary** at `/masterplan`: the explicit **v1 composite contract** from `trac-architecture.md`, delivered with **pace-core2** refreshed layout. Includes header (title, event name, date range, logo), **JourneyMap** when transport has dep/arr coordinates, **ContactsList**, cost summary using the **shared SLICE-07 rollup** and **event base currency**, detailed itinerary using the SLICE-05 day-entry model plus **timezone disclaimer**, and **print** via `window.print()` with print-friendly CSS. **Permissions:** **`masterplan`** page key (`read:page.masterplan`) once the required TRAC page registration / permission seeding prerequisite is present on dev-db.

- Prototype reference: `MasterPlanDoc` in `pace-prototype/apps/pace-trac/pages/MasterPlanPage.jsx`; surfaced as Itinerary **Master plan** mode at `#/events/:code/itinerary/full` (and legacy `#/master-plan` redirect).

---

## Rebuild target

- **Gating:** Event-scoped route behind pace-core2 **`ProtectedRoute requireEvent`** with one approved TRAC no-event fallback; once the route is entered, section loading/error states are handled in-page.
- **Print:** Master Plan print retained; risks print is **SLICE-09** (separate route).
- **Map:** Uses transport coordinates from **snapshots**; same empty messaging pattern when no coords.
- **Costs:** Intro copy that refers to overall event participants uses the **approved application count** for the active event. Detailed listings or resource-specific summaries use the **assigned participant count** for the referenced resource. **Currency from event**; use **shared rollup** from SLICE-07.
- **Itinerary:** Detailed itinerary list using the SLICE-05 day-entry model; timezone disclaimer alert.
- **Contacts:** Full list for event.
- **Person-awareness:** Copy and counts respect assignment-aware participant data where required by the explicit v1 composite contract (participant count from event/assignment data per SLICE-04/07 contracts).
- **Partial failure:** Hybrid policy. Route/event gating failures are handled at the route/shell level by the shared TRAC no-event fallback. After route access is established, required event identity/header data is critical: if it cannot load, show a page-level error state. After header identity is established, sections degrade independently. A costs failure, for example, does not suppress contacts or itinerary. Empty states are not errors.
- **Do not** re-implement CRUD — read-only aggregate surface.

**Suggested sub-phases:** layout shell → map → costs → itinerary list → contacts → print CSS.

---

## pace-core2 delta (vs legacy)

| Area | Rebuild |
|------|---------|
| Components | pace-core2 composites + TRAC-specific read widgets |
| Currency | Event base currency |
| Assignments | Counts use the explicit approved-overall vs assigned-detail participant rules from the architecture contract |

---

## pace-core2 imports (expected)

| Need | Import path (expected) |
|------|------------------------|
| RBAC | `@solvera/pace-core/rbac` — `PagePermissionGuard` for **`masterplan`** page key |
| Layout / typography | `@solvera/pace-core/components`, `@solvera/pace-core/theming` |
| Providers | `@solvera/pace-core/providers` |
| File display | Platform authenticated file/image display contract (`FileDisplay` / `useFileDisplay` or approved successor) for the event logo |

---

## Data and schema references

| Source | Notes |
|--------|--------|
| `trac_transport`, etc. | Map + itinerary list reads |
| `trac_contacts` | Full list |
| Costs rollup | SLICE-07 helper |
| `core_events` | Logo, name, base currency |
| **Supabase MCP (dev-db)** | Validate any new columns used for parity |

---

## Acceptance criteria

1. With event selected and permission, all sections render per the architecture master plan contract (header, map, contacts, costs, itinerary).
2. Print invokes without error; print layout hides irrelevant chrome.
3. Cost summary matches SLICE-07 rollup for same event fixture.
4. No hard-coded currency strings.
5. Timezone disclaimer present near itinerary section.
6. No writes to domain tables from this page.
7. A section-level upstream failure does not blank the whole page.

### Layout (prototype parity targets — `MasterPlanDoc`)

- [ ] Header band: event glyph/logo, **Master plan · {code}**, event name, tagline; KV grid (dates, organisation, participants, base currency).
- [ ] **Journey map** section: transport legs list with mode glyph, route name/number, place line, datetime + status.
- [ ] **Contact list** section: read-only pace-core `DataTable` (name, role, phone, email) with count in heading; no CRUD toolbar (print-friendly).
- [ ] **Cost summary** section: per-type amounts, per participant, hero cells for total, accommodation, transport.
- [ ] **Itinerary** section: day blocks with day number + heading; journey-leg rows per entry (time, resource, place).
- [ ] Print button triggers `window.print()`; print CSS variables for title/event/app name.
- [ ] Legacy hash `#/events/:code/master-plan` resolves to Itinerary full mode with `MasterPlanDoc` (same as `#/itinerary/full`), not a separate master-plan page shell.

---

## API / Contract

- **Read-only** composition of queries or shared hooks from upstream slices.
- **Contract:** Import read models/services from SLICE-03–09 packages/modules — **no** second copy of Supabase query logic for the same aggregate (allow thin composition wrappers).

---

## Visual specification

### Document structure (`MasterPlanDoc` / `mp-doc`)

Single scrollable document (`mp-doc`) suitable for print — prototype embeds inside Itinerary **Master plan** view; production may use standalone `/masterplan` page with same sections.

**1. Header band (`mp-header-band`)**

- Horizontal band: `mp-logo` glyph tile, title block (`label-mono` eyebrow, `h1`, muted tagline), `mp-kv` grid (Dates, Organisation, Participants, Base currency).

**2. Journey map (`mp-section`)**

- Section title **Journey map** with leg count.
- `journey` list: each transport leg — mode glyph, route name (+ number), start → end places, date/time stack, status badge.
- Empty when no transport legs (explicit empty copy in pass 2).

**3. Contact list**

- Section title **Contact list** with contact count.
- `ds-table is-mini`: Name, Role, Phone, Email columns.
- Production: read-only `DataTable` with all interactive features disabled (equivalent to prototype `ds-table is-mini`; no Card wrapper).

**4. Cost summary**

- Section title **Cost summary** with base currency in header.
- KV rows: each resource type amount, **Per participant**.
- `cost-hero` row: **Total event cost**, highlighted accommodation and transport cells with sublabels.
- Uses SLICE-07 shared rollup; display event base currency (prototype demo uses AUD formatting).

**5. Itinerary**

- Section `h2`: **Itinerary** + `span.mp-num` `{dayCount} days · all times {event.timezone}` (prototype inline disclaimer; no separate alert in doc body).
- For each day: **Day N** + `fmtDayHeading`; `div.journey` of `journey-leg` rows (mode/resource glyph, name + kind, type/place, time).
- Architecture `Alert` timezone disclaimer is a **pass-2 production addition** when not embedded in itinerary header copy.

### Prototype routing authority

- **Primary surface:** `ItineraryPage` at `#/events/:code/itinerary/full` (`mode === "full"`).
- **Legacy redirect:** `#/events/:code/master-plan` → same `ItineraryPage` full mode (see `app.jsx` `parseRoute`).
- `MasterPlanPage` component exists for back-compat export only; prototype app does **not** navigate to it.

### Itinerary-embedded full mode chrome (prototype)

Inside `div.page-body`:

1. `PageHeader` — breadcrumb Events → event code → Itinerary; title **Itinerary**; subtitle printable-document copy; `right`: primary **Print master plan** (`window.print()`)
2. `div.itin-viewswitch` — three-way `role-toggle` (Planner view | Participant view | **Master plan** active); footer caption **Printable single-document plan**
3. `MasterPlanDoc` (`div.mp-doc`) — no BackLink, no separate print bar above doc

Master plan mode does **not** hide the view switch; all three toggles remain operable; selecting Planner/Participant navigates back to `#/itinerary` and restores schedule layout. Schedule rows (`itin-day` / `ItinRow`) are **not** rendered in master mode.

### Page chrome when standalone (`MasterPlanPage` — production pass 2 only)

- `BackLink` → itinerary schedule view.
- Top bar: **Print master plan** primary button (`window.print()`).
- Then `MasterPlanDoc` body.

### Itinerary integration (prototype)

- Prototype reference: `MasterPlanDoc` in `pages/MasterPlanPage.jsx`; full-mode host: `pages/ItineraryPage.jsx` (`mode=full`); legacy redirect in `app.jsx`.

### Print behaviour

- Set CSS custom properties: `--print-title`, `--print-event-name`, `--print-app-name`.
- `@media print`: hide app chrome; single-column; page-break hints between major `mp-section` blocks.

### Implementation delta (pass 2)

- Prototype: master plan is **Itinerary full mode** + legacy `#/master-plan` redirect; production: dedicated **`/masterplan`** route per architecture (both should render same section stack).
- Prototype journey map is list-based (not interactive map widget); production **JourneyMap** may add map when coordinates exist — list remains fallback.
- Prototype shares `buildEntries`/`groupByDay` with itinerary schedule; production must use **CR25** helper for day grouping parity with SLICE-05.
- Costs section must import SLICE-07 rollup — no duplicate maths.

---

## Verification

- Compare section presence to architecture checklist.
- Print preview manual test.
- Cross-check cost numbers vs `/costs` for same event.

---

## Testing requirements

| # | Scenario | Type |
|---|----------|------|
| 1 | **Happy path:** Planner opens Master Plan; all sections populated from mocks | Integration |
| 2 | **Validation / domain failure:** Partial upstream failure (e.g. costs error) — section degrades with message, page stable | Integration |
| 3 | **Auth / permission failure:** No masterplan read — AccessDenied | Integration |

Unit: date range line formatting (single day vs range) — pure.

---

## Open questions

*(None — **`masterplan`** page key per architecture; required TRAC page registration / permission seeding is treated as a pre-build prerequisite.)*

---

## Do not

- Do not duplicate SLICE-07 cost logic.
- Do not write risks, logistics, or journal from Master Plan.
- Do not hard-code currency.

---

## References

| Document | Role |
|----------|------|
| `trac-architecture.md` | Master Plan composite contract, high-risk, implementation order |
| `trac-project-brief.md` | Functional capability definition |
| SLICE-02, SLICE-07 | Aggregate consistency |
| SLICE-03–06, SLICE-08–09 | Data sources |
