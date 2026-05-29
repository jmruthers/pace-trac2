# TRAC rebuild — feature list

**Source authority:** Explicit or strongly implied content from `trac-project-brief.md`, `trac-architecture.md`, and `TR01-platform-shell-requirements.md` through `TR10-master-plan-requirements.md` only.

---

## 1. Platform shell & routing

| ID | Feature (atomic, testable) | Sources |
|----|----------------------------|---------|
| F-01-01 | User can sign in at `/login` and reach the authenticated shell with a valid session. | SLICE-01 §Acceptance criteria 1; SLICE-01 §Testing 1 |
| F-01-02 | `/user-dashboard` redirects to `/` (**TRAC** authenticated home per IA). | SLICE-01 §Rebuild target; architecture §Information architecture (v1); SLICE-01 §Acceptance criteria 2 |
| F-01-03 | Unauthenticated access to protected routes uses platform-standard redirect to login (or equivalent). | SLICE-01 §Acceptance criteria 3 |
| F-01-04 | Unknown paths under the authenticated app render a controlled NotFound UI (`*`) with accessible navigation back (not a blank screen). | SLICE-01 §Rebuild target; SLICE-01 §Acceptance criteria 4; architecture §Route ownership (SLICE-01) |
| F-01-05 | Organisation and event context are available to child routes via pace-core2 providers (or documented successor API). | SLICE-01 §Acceptance criteria 5 |
| F-01-06 | RBAC secure client is configured once at app entry; domain slices use the same pattern (no parallel raw clients for privileged operations). | SLICE-01 §Rebuild target; SLICE-01 §Acceptance criteria 6 |
| F-01-07 | Shell renders without requiring domain slices to patch provider internals. | SLICE-01 §Acceptance criteria 7 |
| F-01-08 | Primary navigation shell follows architecture order when implemented: Planning → Assignments → Itinerary → Contacts → Costs → Journal → Master Plan → Risks; Dashboard is not a primary nav item (reach via `/`). | architecture §Information architecture (v1) |
| F-01-09 | Individual nav items may be feature-flagged or hidden until their owning slice ships; routes do not duplicate ownership. | SLICE-01 §Rebuild target |
| F-01-10 | Authenticated NotFound is shell-owned and reachable even when the user lacks dashboard read permission; it is not wrapped in a dashboard-specific page guard. | SLICE-01 §Rebuild target; architecture §Contracts |

---

## 2. RBAC, permissions & page keys (cross-cutting)

**Page key norm:** Every TRAC `pageName`, `useResourcePermissions` argument, DataTable `rbac.pageName`, and permission string slug after `page.` MUST be **lowercase kebab-case** and MUST match `rbac_app_pages.page_name` exactly (pace-core Standard 3 — Page key naming; platform RBAC page name rollout checklist). TRAC v1 catalogue: `contacts`, `costs`, `currency-rates`, `dashboard`, `itinerary`, `journal`, `masterplan`, `planning`, `risks`.

| ID | Feature (atomic, testable) | Sources |
|----|----------------------------|---------|
| F-RBAC-01 | `/planning` and `/assignments` use **`planning`** page permissions for v1 (no dedicated `assignments` page key required for v1). | architecture §Planning stage resolutions; SLICE-04 §Orchestration; architecture §Contracts |
| F-RBAC-02 | `/itinerary` is guarded with **`itinerary`** page key (new TRAC page per architecture Option 1). | architecture §Planning stage resolutions; SLICE-05 §Rebuild target |
| F-RBAC-03 | Dashboard read is gated by **`dashboard`** page key. | SLICE-02 §Rebuild target; architecture §Planning stage resolutions |
| F-RBAC-04 | Master Plan read is gated by **`masterplan`** page key (`read:page.masterplan`). | SLICE-10 §Overview; architecture §Planning stage resolutions |
| F-RBAC-05 | Required TRAC page registration / permission seeding in `rbac_app_pages` is a **prerequisite before client implementation starts**; slice docs name the target keys and guards but do not assign the seeding work to client implementation agents. | architecture §Planning stage resolutions |
| F-RBAC-06 | Contacts, costs, journal, risks pages use their respective page keys as in brief/architecture (e.g. `contacts`, `costs`, `journal`, `risks`); currency rates route targets `currency-rates` key. | architecture §Information architecture (v1); architecture §Contracts; per-slice guards |
| F-RBAC-07 | TRAC relies on standard pace-core2 RBAC patterns only: `ProtectedRoute`, `ProtectedRoute requireEvent`, `PagePermissionGuard`, and secure-client data access. No TRAC-specific super-admin or page-local no-event bypass paths are introduced. | architecture §Design principles; SLICE-01 §Rebuild target; SLICE-08 §API / Contract |

---

## 3. Dashboard (composite)

| ID | Feature (atomic, testable) | Sources |
|----|----------------------------|---------|
| F-02-01 | With selected, accessible event and permission, dashboard shows header: event title, logo (`core_events` / event logo storage), tagline where available. | SLICE-02 §Rebuild target; architecture §Composite contracts — Dashboard & Master Plan |
| F-02-02 | Without event selection, the shared TRAC no-event fallback is shown at route level; the dashboard does not render a second in-page no-event pattern. | SLICE-02 §Rebuild target; SLICE-02 §Acceptance criteria 4; architecture §Composite contracts — Dashboard & Master Plan |
| F-02-03 | Planning card links to `/planning` and shows counts of **confirmed vs total** for activities, transport, and accommodation using **`trac_status`** (not legacy string status). | SLICE-02 §Rebuild target; SLICE-02 §Acceptance criteria 2; architecture §Composite contracts — Dashboard & Master Plan |
| F-02-04 | Itinerary card links to `/itinerary` and shows earliest and latest visible itinerary dates from the SLICE-05 day-entry model, or explicit empty state. | SLICE-02 §Rebuild target; architecture §Composite contracts — Dashboard & Master Plan |
| F-02-05 | Costs card links to `/costs` and shows total cost and per-participant cost formatted using **event base currency** (no hard-coded AUD or other fixed currency strings), with the overall participant denominator taken from the **approved application count** for the active event. | SLICE-02 §Rebuild target; SLICE-02 §Acceptance criteria 3; architecture §Planning stage resolutions |
| F-02-06 | Contacts card links to `/contacts` and shows contact count. | SLICE-02 §Rebuild target; architecture §Composite contracts — Dashboard & Master Plan |
| F-02-07 | User without dashboard read permission cannot access dashboard metrics (guard or server denial with UI feedback). | SLICE-02 §Acceptance criteria 5 |
| F-02-08 | Cost aggregation on dashboard aligns with SLICE-07 rollup rules (single source; no duplicate business rules). | SLICE-02 §Rebuild target; SLICE-02 §API / Contract |
| F-02-09 | Dashboard includes a lightweight link to `/assignments` (rebuild addition; no new assignment aggregate required for v1). | SLICE-02 §Rebuild target; SLICE-02 §Acceptance criteria 6; architecture §Slice overview (SLICE-02) |

---

## 4. Planning — logistics CRUD & location

| ID | Feature (atomic, testable) | Sources |
|----|----------------------------|---------|
| F-03-01 | Planner can create, read, update, delete **transport**, **accommodation**, and **activity** rows for the active event (subject to RLS), via tabs or sections. | SLICE-03 §Rebuild target; SLICE-03 §Acceptance criteria 1 |
| F-03-02 | New/updated rows persist **`trac_status`** (nullable; default `idea` per architecture summary) and **`transport_mode`** on transport; invalid enum rejected client- and server-side. | SLICE-03 §Rebuild target; SLICE-03 §Acceptance criteria 2; architecture §Database-backed design |
| F-03-03 | **Capacity** on the three logistics tables is editable on `/planning`; nullable capacity behaves as uncapped; when set, numeric validation is enforced. | SLICE-03 §Rebuild target; SLICE-03 §Acceptance criteria 3; architecture §Database-backed design |
| F-03-04 | On place pick/save, denormalised location **snapshot** fields persist on the logistics row; cache write-through to **`trac_location_cache`** via service role/edge per platform pattern; logistics row is not live-joined to cache as display source of truth. | SLICE-03 §Rebuild target; SLICE-03 §Acceptance criteria 4; architecture §Explainer — location snapshots (DEC-083) |
| F-03-05 | Product copy does not imply “live Google data”; snapshots are point-in-time. | SLICE-03 §Rebuild target; architecture §Explainer — location snapshots |
| F-03-06 | **`/planning` does not mutate `trac_itinerary_assignment`** (assignment CRUD is SLICE-04 only). | SLICE-03 §Orchestration; SLICE-03 §Acceptance criteria 5; architecture §Recommendation — assignment UX |
| F-03-07 | Participant-only users without planning permission cannot mutate logistics (guard + RLS). | SLICE-03 §Acceptance criteria 6 |
| F-03-08 | Edge Functions used as documented for SLICE-03: **`google-api-key`**, **`google-timezone`**, **`google-maps-script`** (JWT behaviour per architecture); invocation via secure client pattern. | SLICE-03 §pace-core2 imports; architecture §TRAC-related Edge Functions |
| F-03-09 | Planning supports supporting-document upload on transport, accommodation, and activity rows via the standard pace-core2 file/attachment lifecycle; no TRAC-specific attachment table or bespoke public URL flow is introduced. | SLICE-03 §Rebuild target; architecture §Bounded contexts; trac-project-brief §Goals |
| F-03-10 | Planning cost entry supports `group_cost` and `individual_cost` on the same logistics row; UI keeps the secondary input available but optional rather than enforcing mutual exclusivity. | architecture §Planning stage resolutions; SLICE-03 §Rebuild target |
| F-03-11 | Successful planning mutations explicitly invalidate dependent reads (planning lists, itinerary read model, costs rollups, dashboard cards, master plan) rather than depending on timing delays or custom window events. | architecture §Design principles; SLICE-03 §API / Contract |

---

## 5. Assignments

| ID | Feature (atomic, testable) | Sources |
|----|----------------------------|---------|
| F-04-01 | Planner can create, update, delete **`trac_itinerary_assignment`** rows for allowed resource types on the active event. | SLICE-04 §Overview; SLICE-04 §Acceptance criteria 1 |
| F-04-02 | Participant picker lists only **approved** `base_application` rows for the active event; duplicate assignments are blocked where DB constraints disallow them. | SLICE-04 §Rebuild target |
| F-04-03 | Assignment targets a resource type (transport / accommodation / activity) and row; invalid `resource_id` / wrong type fails with actionable error (DB trigger DEC-082 + client validation). | SLICE-04 §Rebuild target; SLICE-04 §Acceptance criteria 2 |
| F-04-04 | Headcount UI shows assigned count vs capacity when capacity is non-null; **over-capacity:** if capacity is non-null and save would exceed it, save is allowed only after **strong warning** and **explicit user confirmation** (Option B; DB does not enforce headcount ≤ capacity). | SLICE-04 §Rebuild target; SLICE-04 §Acceptance criteria 3; architecture §Planning stage resolutions |
| F-04-05 | Assignment-level **notes** CRUD if column exists per dev-db. | SLICE-04 §Rebuild target |
| F-04-06 | Assignment management view is **by resource primary** in v1; participant perspective is handled elsewhere in TRAC (e.g. itinerary role views). | SLICE-04 §Rebuild target; architecture §Explainer — participant vs planner |
| F-04-07 | Deep links support navigation from Planning and Itinerary via URL params without moving mutation ownership from `/assignments`. | SLICE-04 §Rebuild target |
| F-04-08 | User without planning (v1) read/write cannot manage assignments. | SLICE-04 §Acceptance criteria 5 |
| F-04-09 | No assignment mutations are implemented under `/planning`. | SLICE-04 §Acceptance criteria 6; architecture §Route ownership |

---

## 6. Itinerary (read / aggregate)

| ID | Feature (atomic, testable) | Sources |
|----|----------------------------|---------|
| F-05-01 | **Planner** sees full event itinerary: all relevant logistics rows merged into one timeline ordered by `trac_transport.departure_time`, `trac_activity.start_time`, `trac_accommodation.check_in_time` respectively; tie-breaker: resource type, then stable id. | SLICE-05 §Rebuild target |
| F-05-02 | **Planner** sees optional map with legs; coordinates from logistics row snapshots (DEC-083); empty state when no coordinates. | SLICE-05 §Rebuild target; SLICE-05 §Verification |
| F-05-03 | **Participant** sees only logistics rows they are assigned to; RLS assumes **Option A** on logistics `SELECT` (planning permission OR matching assignment for their `base_application`). | SLICE-05 §Rebuild target; SLICE-05 §API / Contract; architecture §Logistics RLS — participant read path |
| F-05-04 | **Day visitor / no `base_application`:** explicit messaging that personalised logistics are unavailable (not silent empty). | SLICE-05 §Overview; SLICE-05 §Rebuild target; SLICE-05 §Acceptance criteria 3 |
| F-05-05 | **Dual role:** single `/itinerary` with sections or tabs rather than duplicating routes (unless IA later adds `/my-itinerary`). | SLICE-05 §Overview; architecture §Explainer — participant vs planner |
| F-05-06 | No mutation of logistics or assignments on `/itinerary`. | SLICE-05 §Acceptance criteria 4; SLICE-05 §Do not |
| F-05-07 | Timezone disclaimer or per-row timezone display aligned with Master Plan contract. | SLICE-05 §Acceptance criteria 5; architecture §Composite contracts — Dashboard & Master Plan |
| F-05-08 | Participant `/itinerary` assumes completed pace-core2 **Option A** `SELECT` RLS state; implementation/tests verify this on dev-db. | SLICE-05 §Platform dependency; architecture §Planning stage resolutions |
| F-05-09 | The SLICE-05 itinerary derivation contract is executed through the shared pure **pace-core2 CR25** helper for participant narrowing, day-entry expansion, timezone precedence, in-day ordering, and visible date-range/group metadata; composites do not apply a second hidden expansion/filtering rule. | SLICE-05 §Rebuild target; SLICE-05 §API / Contract; architecture §Design principles; SLICE-10 §Rebuild target |
| F-05-10 | A member-facing portal surface may expose the same participant itinerary contract from event details / event hub for already-scoped participants, but this does **not** add a second TRAC route or bypass the TRAC `/itinerary` page guard. | SLICE-05 §Rebuild target; architecture §Recommendation — assignment UX placement; architecture §Information architecture (v1) |
| F-05-11 | The shared **CR25** helper is a pure derivation dependency only; it does **not** own TRAC `/itinerary` page guards, planner CRUD, data fetching, RLS, or TRAC-specific page composition/copy. | SLICE-05 §API / Contract; architecture §Shared itinerary derivation helper (CR25) |

---

## 7. Contacts

| ID | Feature (atomic, testable) | Sources |
|----|----------------------------|---------|
| F-06-01 | Authorised user can add, edit, remove contacts for the event per RLS. | SLICE-06 §Acceptance criteria 1 |
| F-06-02 | Contact list is usable as the source for SLICE-09 contact linkage (stable IDs). | SLICE-06 §Acceptance criteria 2 |
| F-06-03 | Validation errors map to UI for required fields and formats. | SLICE-06 §Acceptance criteria 3 |
| F-06-04 | Unauthorised users cannot read or mutate contacts. | SLICE-06 §Acceptance criteria 4 |
| F-06-05 | List supports search/filter as appropriate; empty/loading/permission states. | SLICE-06 §Rebuild target |
| F-06-06 | Contact delete/archive follows DB constraints: FK-blocking deletes return actionable guidance; if soft-delete columns exist, v1 prefers archive/deactivate semantics. | SLICE-06 §Rebuild target |
| F-06-07 | Contact forms enforce explicit required fields and format validation for the actual dev-db schema (for example email/phone where present), and keep inactive/archived contacts out of active pickers while preserving historical references. | SLICE-06 §Rebuild target; SLICE-06 §Acceptance criteria 3 |

---

## 8. Costs & currency

| ID | Feature (atomic, testable) | Sources |
|----|----------------------------|---------|
| F-07-01 | `/costs` shows event **totals** aggregated from logistics rows only: `trac_transport`, `trac_accommodation`, and `trac_activity`. | SLICE-07 §Rebuild target |
| F-07-02 | Currency conversion uses **`trac_currency_rates`**; rates are managed on separate RBAC-controlled route **`/currency-rates`** using existing RBAC CRUD semantics in v1. | SLICE-07 §Rebuild target; architecture §Information architecture (v1) |
| F-07-03 | **Per-participant allocation (R2):** for each logistics row, each assigned participant gets `individual_cost + (group_cost / assigned_count)` where `assigned_count` = count of `trac_itinerary_assignment` for that `(resource_type, resource_id)`. | architecture §Planning stage resolutions; SLICE-07 §Rebuild target; SLICE-07 §Acceptance criteria 4 |
| F-07-04 | **`NULL` `individual_cost` / `group_cost` → 0.** **Row event total = `group_cost + (individual_cost * assigned_count)`.** **`assigned_count = 0`:** row contributes **group_cost only** to event totals; **no** per-person allocation for that row; optional planner UI signal for unallocated group cost. | architecture §Planning stage resolutions; SLICE-07 §Rebuild target |
| F-07-05 | Display formatting uses event base currency from metadata, not literal hard-coded currency strings. | SLICE-07 §Rebuild target; SLICE-07 §Acceptance criteria 2 |
| F-07-06 | Shared rollup function/module is used by SLICE-02 and SLICE-10 (no copy-paste divergence). | SLICE-07 §Overview; SLICE-07 §Acceptance criteria 5 |
| F-07-07 | No TRAC↔MINT API or UI integration in this phase (MINT reads cost data from DB only). | SLICE-07 §Cross-cutting; trac-project-brief §Known exclusions |
| F-07-08 | Displayed cost rollups use **line-level rounding then sum** with currency minor-unit precision for internal consistency across `/costs`, Dashboard, and Master Plan. | architecture §Planning stage resolutions; SLICE-07 §Rebuild target |

---

## 9. Journal

| ID | Feature (atomic, testable) | Sources |
|----|----------------------------|---------|
| F-08-01 | Authorised user can create, edit, delete **posts** for the event (rich or plain text per schema). | SLICE-08 §Rebuild target; SLICE-08 §Acceptance criteria 1 |
| F-08-02 | Images upload and display when tied to a post; deleting post removes images per FK/storage behaviour. | SLICE-08 §Rebuild target; SLICE-08 §Acceptance criteria 2 |
| F-08-03 | UI never lists **`trac_journal_images`** without post/event filter (images have no `event_id`; scope via posts). | SLICE-08 §Overview; SLICE-08 §Acceptance criteria 3; architecture §Investigation — journal posts vs images RLS |
| F-08-04 | Unauthorised users cannot read or write posts/images for the event; behaviour matches RLS for **`journal`** page key. | SLICE-08 §Acceptance criteria 4–5 |
| F-08-05 | Loading/error paths for storage failures. | SLICE-08 §Rebuild target |
| F-08-06 | Journal uses only standard pace-core2 RBAC/RLS and secure storage contracts; no TRAC-specific super-admin override or public-URL shortcut is introduced. | SLICE-08 §Rebuild target; SLICE-08 §API / Contract; architecture §Design principles |

---

## 10. Risks

| ID | Feature (atomic, testable) | Sources |
|----|----------------------------|---------|
| F-09-01 | User can list/create/edit/delete risks on **`trac_risks`** subject to RLS. | SLICE-09 §Rebuild target; SLICE-09 §Acceptance criteria |
| F-09-02 | App writes **likelihood** and **consequence** (and other non-generated fields per schema); **`impact_before` / `impact_after`** are **read-only** from generated columns (DEC-081); client omits generated fields from write payloads. | SLICE-09 §Overview; SLICE-09 §Acceptance criteria 1–2; architecture §Database-backed design |
| F-09-03 | Risks link to contacts from SLICE-06 per schema. | SLICE-09 §Overview; SLICE-09 §Acceptance criteria 3 |
| F-09-04 | Print: action triggers print (`window.print()` or equivalent); print-friendly CSS; layout hides nav/chrome where appropriate. | SLICE-09 §Rebuild target; SLICE-09 §Acceptance criteria 4; architecture §Planning stage resolutions |
| F-09-05 | Empty/loading/permission states. | SLICE-09 §Rebuild target |

---

## 11. Master Plan (composite)

| ID | Feature (atomic, testable) | Sources |
|----|----------------------------|---------|
| F-10-01 | With event selected and permission: header “Master Plan”, event name, date range (single day vs range), event logo via file display component. | SLICE-10 §Rebuild target; architecture §Composite contracts — Dashboard & Master Plan |
| F-10-02 | **JourneyMap** when transport has departure/arrival coordinates; else empty message; coordinates from **snapshots**. | SLICE-10 §Rebuild target; architecture §Composite contracts — Dashboard & Master Plan |
| F-10-03 | **ContactsList** shows full contact list for event. | architecture §Composite contracts — Dashboard & Master Plan; SLICE-10 §Rebuild target |
| F-10-04 | **Costs:** intro copy uses the **approved application count** when referring to overall event participants; detailed listings/resource-specific summaries use the **assigned participant count** for that resource; **MasterPlanCostSummary** uses the **shared SLICE-07 rollup** and **event base currency**. | SLICE-10 §Rebuild target; architecture §Composite contracts — Dashboard & Master Plan |
| F-10-05 | **Itinerary:** “Detailed Itinerary” with **ItineraryItemsList**; **timezone disclaimer** alert. | architecture §Composite contracts — Dashboard & Master Plan; SLICE-10 §Acceptance criteria 5 |
| F-10-06 | **Print:** button invokes `window.print()` without error; print layout hides irrelevant chrome. | SLICE-10 §Rebuild target; SLICE-10 §Acceptance criteria 2; architecture §Composite contracts — Dashboard & Master Plan |
| F-10-07 | Loading state per section; missing-event handling is provided by the shared TRAC no-event fallback at route level. | architecture §Composite contracts — Dashboard & Master Plan; SLICE-10 §Rebuild target |
| F-10-08 | No writes to domain tables from Master Plan. | SLICE-10 §Acceptance criteria 6; SLICE-10 §Do not |
| F-10-09 | User without `read:page.masterplan` receives AccessDenied (or equivalent). | SLICE-10 §Testing 3 |

---

## 12. Cross-cutting product / technical constraints (non-UI features)

| ID | Constraint (verifiable) | Sources |
|----|-------------------------|---------|
| F-X-01 | Client targets **`@solvera/pace-core`** (pace-core2), not `@solvera/pace-core`. | trac-project-brief §Goals; architecture §pace-core2 migration |
| F-X-02 | **BASE** booked activities may link via `base_activity_offering.trac_activity_id` **silently**; no BASE scanning/boarding UX in rebuild. | architecture §Planning stage resolutions; trac-project-brief §Known exclusions |
| F-X-03 | TRAC database hardening (including participant itinerary **Option A**) is assumed applied on dev-db before app build starts. | architecture §Planning stage resolutions; trac-project-brief §Assumptions |
| F-X-04 | Documentation/validation uses **dev-db only** (not production). | trac-project-brief §Non-goals; architecture §Do not |
| F-X-05 | Per slice testing baseline: at least one happy path, one validation/domain failure, one auth/permission failure; unit tests for pure domain logic where listed in architecture. | architecture §Testing requirements; architecture §Testing expectations |
| F-X-06 | **Do not** write `trac_risks.impact_before` / `impact_after` from the app. | architecture §Do not; SLICE-09 §Do not |
| F-X-07 | Shared query defaults align with pace-core2 operations standards unless a slice documents an exception; successful mutations use explicit query invalidation rather than timing hacks or custom browser events. | architecture §Contracts; architecture §Design principles |
| F-X-08 | Rebuild surfaces are responsive by contract: each route defines a usable mobile fallback for dense grids, filters, maps, or print-adjacent layouts. | trac-project-brief §Quality gates; architecture §Design principles |

---

## 13. Explicit out-of-scope (reference only — not deliverables)

| ID | Exclusion | Sources |
|----|-----------|---------|
| X-01 | BASE scanning, boarding, and other BASE/TRAC operational flows (except silent data linkage above). | architecture §Planning stage resolutions; trac-project-brief §Known exclusions |
| X-02 | MINT application integration beyond DB reads of cost-related data. | trac-project-brief §Known exclusions; SLICE-07 |
| X-03 | Production DB as authority for docs/validation. | trac-project-brief §Known exclusions |
| X-04 | Dedicated participant-only **TRAC** route `/my-itinerary` for v1 (deferred; use role-based `/itinerary`; portal may host a separate member-facing entry using the same contract). | architecture §Information architecture (v1) |
| X-05 | Optional: dedicated `assignments` RBAC page key (later refinement). | architecture §Contracts; SLICE-04 |
