# SLICE-05 — Itinerary — Requirements

**Document status:** Draft — rebuild implementation contract.  
**Companion authority:** `trac-project-brief.md`, `trac-architecture.md`.

---

## Orchestration metadata (canonical)

| Field | Value |
|--------|--------|
| **Slice ID** | SLICE-05 |
| **Name** | Itinerary |
| **Bounded context** | Itinerary; Location (partial — map/list consumes snapshots) |
| **Owning routes** | `/itinerary` |
| **Depends on** | SLICE-01, SLICE-03, **SLICE-04**; **pace-core2 DB — logistics `SELECT` RLS Option A** (see `trac-architecture.md`); **pace-core2 CR25 shared itinerary derivation helper** |
| **Blocks** | — |
| **Implementation order** | 5 of 10 |
| **High-risk** | Yes — person-aware views, maps, planner vs participant RLS |
| **Cross-cutting** | Map/read model shared with planning snapshots and executed via the pure **pace-core2 CR25** itinerary helper; participant contract may also be consumed from a portal-hosted member surface; **no** logistics or assignment **mutations** here (read/aggregate + UX) |

**Platform dependency:** Participant `/itinerary` requires **Option A** — extended **`SELECT`** policies on **`trac_transport`**, **`trac_activity`**, **`trac_accommodation`** so applicants can read rows **only** when a matching **`trac_itinerary_assignment`** exists. **Pre-build prerequisite** (see `trac-architecture.md` *Planning stage resolutions*); verify policy state on dev-db when implementing participant views.

---

## Overview

Implement **`/itinerary`** as a **time-ordered**, **person-aware** read experience: **planners** see schedule, map, and signals across the event; **participants** (with `base_application`) see **their** assigned transport/stays/activities per **RLS** on `trac_itinerary_assignment`. **Day visitors / no application:** explain that personalised logistics are unavailable — avoid empty confusing screens. **Dual role:** prefer **one** `/itinerary` with sections/tabs rather than duplicating routes (architecture). Deep links interoperate with **Planning** and **Assignments** without owning their mutations. For member-facing access, the same participant contract may also be surfaced from **pace-portal2** for a participant already scoped there; this does **not** create a second TRAC route.

- Prototype reference: schedule and view modes in `pace-prototype/apps/pace-trac/pages/ItineraryPage.jsx` (`mode` schedule — not `full`; see TR10 for master plan mode).

TRAC remains the **business/source authority** for itinerary rules. The executable pure derivation logic for participant narrowing, day-entry expansion, timezone precedence, in-day ordering, and visible date-range/day grouping is consumed from **pace-core2 CR25** rather than re-implemented locally in TRAC.

---

## Rebuild target

- **Planner view:** Full event itinerary — all relevant logistics rows ordered by the derived day-entry rules below; optional map with legs; links to `/planning` and `/assignments` where helpful.
- **Participant view:** Show **only** logistics the viewer is assigned to — **assumes Option A RLS** (architecture): participants may **`SELECT`** parent logistics rows **only** when linked by **`trac_itinerary_assignment`** and **`base_application_is_applicant`**; they **cannot** enumerate full event logistics without **`read:page.planning`**. Implementation: join or filter assignments → logistics using normal Supabase reads; RLS enforces scope.
- **Portal-hosted participant entry:** A member-facing portal page may expose the same participant view from an event details / event hub link for users already scoped in **pace-portal2**. This is a **portal route**, not a new TRAC route, and it must not depend on granting participants TRAC **`itinerary`** page permission.
- **Route guard:** Use **`itinerary`** page key once the required TRAC page registration / permission seeding prerequisite is present on dev-db.
- **Participant rows:** Clear labelling (“Your transport”, etc.).
- **Day visitor:** Explicit messaging — no fake personalised rows.
- **Map:** Use coordinates from **logistics row snapshots** (DEC-083); do not imply live Places refresh.
- **Derived day-entry model (v1):** implemented through the shared pure **pace-core2 CR25** helper contract while remaining authoritative in TRAC docs.
  - Transport appears on the **departure local day** and on the **arrival local day** when those days differ.
  - Activity appears on the **start local day** and on the **finish local day** when those days differ.
  - Accommodation appears on **every local day from check-in through check-out inclusive**.
  - Each resource row renders **at most once per local day**. If check-in and check-out fall on the same local day, render one accommodation entry for that day and show both details.
- **Timezone precedence for local-day derivation (v1):** implemented through **CR25**; TRAC remains the rule authority.
  - Transport departure-day uses the departure snapshot timezone when present; otherwise event default timezone; otherwise UTC.
  - Transport arrival-day uses the arrival snapshot timezone when present; otherwise departure snapshot timezone; otherwise event default timezone; otherwise UTC.
  - Activity start-day uses the start-location snapshot timezone when present; otherwise event default timezone; otherwise UTC.
  - Activity finish-day uses the finish-location snapshot timezone when present; otherwise start-location snapshot timezone; otherwise event default timezone; otherwise UTC.
  - Accommodation occupied days use the accommodation location snapshot timezone when present; otherwise event default timezone; otherwise UTC.
- **In-day ordering (v1):** implemented through **CR25**; TRAC remains the rule authority.
  - Transport departure-day entries sort by **`departure_time`**.
  - Transport arrival-day entries sort by **`arrival_time`** when they render on a different local day to departure.
  - Activity start-day entries sort by **`start_time`**.
  - Activity finish-day entries sort by **`finish_time`** when they render on a different local day to start.
  - Accommodation check-in day sorts by **`check_in_time`**.
  - Accommodation check-out day sorts by **`check_out_time`** when it renders on a different local day to check-in.
  - Accommodation intermediate occupied days render with **no primary timestamp** and sort **after all timestamped entries for that day**.
  - Final tie-break within a day is **resource type**, then **stable id**.
- **Date range:** The visible date range is derived from the day entries above, not from a second hidden date-expansion rule.
- **Shared helper contract:** The same pure **CR25** helper feeds `/itinerary`, Dashboard date-range summaries, and Master Plan itinerary sections. Downstream consumers must not add secondary filtering rules that change occupancy or day visibility.
- **Cross-app contract:** Any portal-hosted participant itinerary surface must apply the **same** day-entry, timezone-precedence, in-day ordering, and day-visitor rules documented here; it must not invent an alternate participant filter or occupancy model.
- **Loading / empty / denied:** Per role; architecture mandates spelling these out.
- **RLS:** Tests must name roles (planner vs participant vs denied).

**Suggested sub-phases:** read model → list → map → participant mode → polish.

---

## pace-core2 delta (vs legacy)

| Area | Legacy | Rebuild |
|------|--------|---------|
| Person awareness | None | Assignment-driven filtering |
| Data | Event-only resources | Resources ∩ assignments for participants |
| Routes | Single itinerary | Same URL; role-based content |

---

## pace-core2 imports (expected)

| Need | Import path (expected) |
|------|------------------------|
| RBAC | `@solvera/pace-core/rbac` — guards per itinerary page key |
| Providers | `@solvera/pace-core/providers` |
| Map / location | `@solvera/pace-core/location` or app map wrapper |
| Components | `@solvera/pace-core/components` |

---

## Data and schema references

| Table | Notes |
|-------|--------|
| `trac_transport`, `trac_accommodation`, `trac_activity` | Read; display snapshot fields |
| `trac_itinerary_assignment` | Participant filter join; planner may aggregate counts |
| `base_application` | Link user ↔ participant for RLS |
| **Supabase MCP (dev-db)** | Verify **`SELECT`** policies on the three logistics tables in completed **Option A** state (expect planning **or** assigned-applicant path). |

---

## Acceptance criteria

1. Planner sees full event itinerary list and map (when coords present) ordered correctly.
2. Participant sees **only** rows assigned to them; no other participants’ logistics.
3. Day visitor sees explanatory state — not silent empty.
4. No mutation of logistics or assignments on this route.
5. Per-row timezone display uses `formatInTimeZone` and `formatTimezoneLabel` on entry cards; no page-level timezone disclaimer.
6. Multi-day transport, activity, and accommodation rows follow the documented day-entry and in-day ordering rules.
7. TRAC consumes the shared pure **pace-core2 CR25** helper for participant narrowing, day-entry expansion, timezone precedence, in-day ordering, and visible date range/day grouping rather than re-implementing those derivation rules locally.

### Layout (prototype parity targets — schedule modes only)

- [x] `PageHeader` title **Itinerary**; subtitle varies by active view mode.
- [x] View switch: **Planner view** | **Participant view** only (two-way toggle).
- [x] Planner view: **single-day view** with top day navigator (`ItineraryDayNavigator`) — prev/next one calendar day at a time through CR25 `visibleDateRange`; center **Select** jumps to any in-range day; default day is `max(today, firstDayWithEntries)` clamped to range (event timezone when set). Meta row under nav: **Day {n}** badge + item count (`ItineraryDayHeader`).
- [x] Participant view: info alert banner with dynamic title **Participant itinerary — {name}**; **Viewing as** `Select` inside the alert. Planners may pick any approved application with assignments; pure participants see their own scope only (picker hidden).
- [x] Entry rows: pace-core `Card` with large resource mark on the far left; `h5` title; two-line time column using `formatInTimeZone` plus `formatTimezoneLabel` caption; `CardContent` body lines (location, cost, notes); status badge; icon-only **Edit** button (SquarePen) in `CardFooter` bottom-right for planners deep-linking to Planning edit dialog.
- [x] Assignment notes render as info `Badge` inside row meta in participant view only.
- [x] No page-level timezone disclaimer alert or view-switch footer caption.

---

## API / Contract

- **Read-only** queries; event-scoped.
- **Planner:** Direct selects on logistics tables (with **`read:page.planning`**).
- **Participant:** Direct selects on logistics tables **for assigned resources only** — **assumes Option A** RLS permits reads when an assignment ties the row to the viewer’s `base_application` (see `trac-architecture.md`).
- **Shared pure derivation helper:** Consume **pace-core2 CR25** for participant-only narrowing support, day-entry expansion, timezone precedence, in-day ordering, and visible date range/day grouping. This helper operates on already-fetched inputs only and is **not** a data-fetching, RBAC, route-guard, or RLS mechanism.
- **Portal-hosted participant consumption:** Portal may use the same participant-scoped reads under **Option A** for member-facing itinerary viewing; do **not** introduce a TRAC-specific token, public URL, or `SECURITY DEFINER` bypass for this v1 read path.
- **No Edge write** requirement for core read path.

---

## Visual specification

### Page chrome

- `PageHeader`: breadcrumb Events → event → **Itinerary**; dynamic subtitle:
  - Planner: full event schedule grouped by day.
  - Participant: personal schedule — assigned rows only.

### View switch (`itin-viewswitch`)

Two-way toggle:

| Mode | Label |
|------|-------|
| Planner | Planner view |
| Participant | Participant view |

### Planner schedule layout

- **Single-day shell:** only the selected calendar day is visible at a time. A top **`ItineraryDayNavigator`** bar (`nav`, grid `auto | 1fr | auto`) provides **Previous day** / **Next day** icon buttons and a full-width center **Select** showing `formatDayHeading(selectedDayKey)`.
- **Navigation range:** CR25 `visibleDateRange` (`startDayKey` … `endDayKey` inclusive). Prev/next step one calendar day; arrows disable at range ends. Gap days with no entries show the empty-day state.
- **Default day:** `max(todayKey, startDayKey)` clamped to the range, where `todayKey` uses event IANA timezone when available.
- **Meta row:** `ItineraryDayHeader` below the navigator — **Day {n}** badge and right-aligned **{n} item(s)** count only (date heading lives in the navigator).
- **Per-day two-column content:** `grid gap-4 lg:grid-cols-2 lg:items-start` — entry cards in the left column, per-day map in the right column top-aligned with the first card.
- Entry cards: pace-core `Card` with `CardHeader` (resource mark, time range + timezone, `h5` title, status badge), `CardContent` (route/location, booking reference, cost, capacity, notes — uniform body text), and `CardFooter` with bottom-right **Edit** for planners.
- Transport / activity titles: `{Your }{title}` only — no resource-type badge on entry cards.
- Accommodation titles by CR26 `entryKind`:
  - `check-in` → **Check in at {venue}**
  - `check-out` → **Check out from {venue}**
  - `occupied` → **Staying at {venue}**
- Card body fields (each at most once, omit when empty): route/location (no arrival time in transport route line), booking reference, cost, capacity, logistics notes. Venue name is not duplicated in body when already in title.
- Empty day section: pace-core `EmptyState` compact in the left column — **No items scheduled for this day.**; map panel still renders in the right column.
- Empty view (no day groups): `EmptyState` — **No itinerary entries to show for this view yet.**

### pace-core components (schedule modes)

| Component | Use |
|-----------|-----|
| `PageHeader`, `Tabs`, `LoadingSpinner`, `Alert` | Page chrome (existing) |
| `Button`, `Select` | Day navigator prev/next and date jump |
| `Card`, `CardHeader`, `CardContent`, `CardFooter` | Entry rows only (not the map panel) |
| `EmptyState` | No days / empty day section |

### Participant schedule layout

- Single info alert row: explanatory copy + **Viewing as** label + `Select` (planners: approved applications with at least one assignment; pure participants: picker hidden, scoped to viewer application).
- Same single-day navigator, two-column layout, and `Card` entry list as planner; empty copy differs for participant vs planner where noted above.
- Planners in participant view filter CR25 scope by the selected application id (not limited to the planner's own application when dual role).

### Map (pass 2)

- Each day section renders its own map via `collectMapDataForDay(group, displayByResourceKey)` — movements scoped to that day's entries only.
- Map is a bare bordered canvas (`article` with `min-h-64`, `rounded-2xl`, `border-main-300` matching pace-core `Card` layer 0); **no** pace-core `Card`, heading, or explanatory copy when coordinates exist. Top-aligned with the first entry card in the day column (`lg:items-start`, `self-start` on map section).
- When a day has no snapshot coordinates, omit the map column content entirely (`null`).
- Map load failure uses `Alert` only (still no card wrapper).

### Day navigator (pass 2)

- `ItineraryDayNavigator`: `ChevronLeft` / `ChevronRight` outline buttons; center `Select` lists every in-range day (`enumerateDayKeysInRange`); `aria-label="Itinerary day"` on `nav`.
- Omitted when `visibleDateRange` is null (no entries).

### Day meta row (pass 2)

- `ItineraryDayHeader` shows **Day {n}** badge and item count; **no** calendar tile or duplicate date heading (date is in the navigator).

### Entry card text (pass 2)

- Long URLs, notes, and assignment badges wrap inside the card using grid `min-w-0` on shrinkable columns and `break-words` / `break-all` on detail lines.

### Implementation delta (pass 2)

- Prototype builds day entries with simplified `buildEntries` (not full CR26); production must use **CR26** for derivation per architecture.
- Prototype stacked `itin-day` sections map to **`ItineraryDayTimeline`** single-day view + **`ItineraryDayNavigator`** (prototype layout intent, not CSS parity).
- Prototype participant picker uses mock member pool; production uses approved `base_application` rows + RLS Option A.
- Planners with **`read:page.planning`** may preview any assigned participant via **Viewing as**; RLS still applies to underlying reads for non-planner roles.
- Planner entry **Edit** navigates to `/planning?kind=&resourceId=&edit=1` and auto-opens the Planning edit dialog.

---

## Verification

- RLS manual test: two participants, ensure isolation on dev-db.
- Map empty state when no coordinates.
- Shared-helper parity test: canonical mixed logistics fixtures produce the same day grouping, visible date range, and ordering through the shared **CR25** helper for TRAC and portal consumers.

---

## Testing requirements

| # | Scenario | Type |
|---|----------|------|
| 1 | **Happy path:** Participant with assignments sees expected rows after load, using the shared **CR25** helper for derivation | Integration |
| 2 | **Validation / domain failure:** Multi-day row with missing sort key or malformed timezone/date data — UI degrades gracefully without unstable ordering and without app-local derivation fallback | Unit/integration |
| 3 | **Auth / permission failure:** User without itinerary read cannot access; participant cannot query others’ rows (RLS) | Integration |

Unit: date grouping, participant narrowing, derived day-entry generation, visible date-range metadata, timezone precedence, and sort order via the shared **CR25** helper contract.

---

## Open questions

*(None — participant read path is **Option A** (`SELECT` RLS extension), treated as completed dependency; verify on dev-db when testing.)*

---

## Do not

- Do not duplicate SLICE-03/04 mutations.
- Do not re-implement the shared itinerary derivation rules in TRAC-local pure helpers when **CR25** exists to own the executable helper contract.
- Do not rely on live `trac_location_cache` join for display.
- Do not show other participants’ assignment details to participant role.
- Do not describe **CR25** as a security, RBAC, route-guard, data-fetching, or RLS mechanism.

---

## References

| Document | Role |
|----------|------|
| `trac-architecture.md` | Participant vs planner explainer, IA, DEC-083, shared itinerary derivation helper (CR25) |
| `trac-project-brief.md` | Scope, prerequisites |
| SLICE-03, SLICE-04 | Upstream data owners |
| `pace-portal2` participant event hub docs | Consumer of the same participant itinerary contract (member-facing entry point) |
