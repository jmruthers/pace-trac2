# TRAC rebuild — user stories

**Format:** As a [user], I want [goal], so that [outcome].  
**Sources:** `trac-project-brief.md`, `trac-architecture.md`, `TR01-platform-shell-requirements.md` … `TR10-master-plan-requirements.md`.

---

## Platform shell & access

### US-01-01

**Story:** As a **user**, I want to **sign in at `/login` and land in the authenticated app shell**, so that **I can use TRAC with a valid session**.

**Acceptance criteria**

- Successful sign-in reaches the authenticated shell with context available to child routes.  
- Invalid credentials or missing fields show a non-crashing error (no unhandled rejection).  
- Unauthenticated access to protected routes redirects to login (or platform-standard behaviour).

**Edge cases (implied)**

- Session refresh and deep-link to protected route behave deterministically (SLICE-01 §Verification).

**Sources:** SLICE-01 §Acceptance criteria 1, 3; SLICE-01 §Testing 1–2.

---

### US-01-02

**Story:** As a **user**, I want **`/user-dashboard` to redirect to home (`/`)**, so that **I reach the TRAC authenticated home without a duplicate dashboard path**.

**Acceptance criteria**

- Navigating to `/user-dashboard` redirects to `/` (or equivalent home per IA).

**Sources:** SLICE-01 §Rebuild target; SLICE-01 §Acceptance criteria 2; architecture §Information architecture (v1).

---

### US-01-03

**Story:** As a **signed-in user**, I want **a clear NotFound page for unknown app paths**, so that **I am not left on a blank screen and can navigate back**.

**Acceptance criteria**

- Authenticated `*` route shows controlled NotFound UI inside the shell with accessible navigation back.

**Sources:** SLICE-01 §Rebuild target; SLICE-01 §Acceptance criteria 4.

---

### US-01-04

**Story:** As a **user without access to a protected capability**, I want **redirect or `AccessDenied` (not a silent blank screen)**, so that **I understand I cannot use that area**.

**Acceptance criteria**

- RBAC guard or platform equivalent surfaces denial using pace-core2 patterns where guards fail.

**Sources:** SLICE-01 §Visual specification; SLICE-01 §Testing 3.

---

## Dashboard

### US-02-01

**Story:** As a **planner with dashboard read permission and a selected event**, I want **summary cards for planning, itinerary, costs, and contacts**, so that **I can see event health at a glance and jump to each area**.

**Acceptance criteria**

- Header shows event title, logo, tagline where available.  
- Planning card: link to `/planning`; confirmed vs total counts for activities, transport, accommodation using `trac_status`.  
- Itinerary card: link to `/itinerary`; earliest/latest dates or explicit empty state.  
- Costs card: link to `/costs`; total and per-participant amounts in **event base currency** (no hard-coded currency literals), with the overall participant denominator taken from the **approved application count** for the active event.  
- Contacts card: link to `/contacts`; contact count.  
- Aggregates match architecture functional parity intent; cost maths matches SLICE-07.

**Edge cases (implied)**

- No event selected: shared TRAC no-event fallback at route level (SLICE-02 §Acceptance criteria 4).  
- Upstream invalid enum: UI does not crash (SLICE-02 §Testing 2).

**Sources:** SLICE-02 §Rebuild target; SLICE-02 §Acceptance criteria 1–4; architecture §Composite contracts — Dashboard & Master Plan.

---

### US-02-02

**Story:** As a **planner**, I want **a lightweight link to `/assignments` from dashboard**, so that **I can reach person-aware assignment management quickly**.

**Acceptance criteria**

- Lightweight `/assignments` link is present on dashboard.  
- No additional assignment aggregate metric is required for this link in v1.

**Sources:** SLICE-02 §Rebuild target; SLICE-02 §Acceptance criteria 6; architecture §Slice overview (SLICE-02).

---

## Planning (logistics)

### US-03-01

**Story:** As a **planner with planning permission**, I want to **create, edit, and delete transport, accommodation, and activity rows for my event**, so that **the event logistics are maintained in TRAC**.

**Acceptance criteria**

- CRUD works per RLS for the active event.  
- `trac_status` and `transport_mode` persist as enums; invalid values rejected.  
- Capacity nullable means uncapped; when set, numeric validation enforced.  
- Participant without planning permission cannot mutate logistics.

**Sources:** SLICE-03 §Acceptance criteria 1–3, 6.

---

### US-03-02

**Story:** As a **planner**, I want **location snapshots saved on logistics rows when I pick a place**, so that **display uses stable, point-in-time place data (not live Google as SoT)**.

**Acceptance criteria**

- Saving a place writes snapshot fields on the row and participates in `trac_location_cache` write path per platform contract.  
- Copy does not imply live Google data.

**Edge cases (implied)**

- External Google updates do not change saved row until user edits/resaves (architecture DEC-083 explainer).

**Sources:** SLICE-03 §Rebuild target; SLICE-03 §Acceptance criteria 4; architecture §Explainer — location snapshots.

---

### US-03-03

**Story:** As a **planner**, I want **`/planning` to exclude assignment editing**, so that **assignments are managed in one place (`/assignments`)**.

**Acceptance criteria**

- No `trac_itinerary_assignment` mutations on `/planning`.

**Sources:** SLICE-03 §Orchestration; SLICE-03 §Acceptance criteria 5; architecture §Recommendation — assignment UX.

---

### US-03-04

**Story:** As a **planner**, I want to **attach supporting documents to transport, accommodation, and activity rows**, so that **tickets, confirmations, and other operational files stay with the logistics record they support**.

**Acceptance criteria**

- Supporting documents can be uploaded and listed from each logistics row.  
- Upload, replace, access, and delete follow the standard pace-core2 secure file/attachment lifecycle rather than ad-hoc storage URLs.  
- Storage cleanup and metadata/reference cleanup remain explicit and user-visible on failure.  

**Edge cases (implied)**

- Multiple documents per logistics row are allowed unless dev-db proves otherwise.  
- Unsupported type or oversize rejection surfaces before or during upload with actionable feedback.  

**Sources:** SLICE-03 §Rebuild target; architecture §Bounded contexts; trac-project-brief §Goals.

---

## Assignments

### US-04-01

**Story:** As a **planner with planning permission**, I want to **assign participants (`base_application`) to transport, accommodation, and activity rows**, so that **the event is person-aware and headcounts reflect reality**.

**Acceptance criteria**

- Create/update/delete assignment rows for allowed resource types.  
- Participant picker scoped to event pool per RLS/brief.  
- Invalid `resource_id` / type surfaces actionable errors.  
- Primary operational view is by resource in v1.  
- User without planning permission cannot manage assignments.

**Edge cases (implied)**

- Duplicate assignments: prevented where business rules disallow (exact rules in brief — SLICE-04 §Rebuild target).
- Participant-oriented perspective is covered elsewhere in TRAC (itinerary role views), not as the primary management UI in `/assignments`.

**Sources:** SLICE-04 §Overview; SLICE-04 §Acceptance criteria 1–2, 4–5.

---

### US-04-02

**Story:** As a **planner**, I want **warning and explicit confirmation before saving over capacity**, so that **I can proceed when headcount exceeds a non-null capacity only deliberately**.

**Acceptance criteria**

- When capacity is non-null and save would exceed it: strong warning + explicit confirmation required before save succeeds.  
- Headcount UI reflects assigned count vs capacity when capacity is set.

**Sources:** SLICE-04 §Rebuild target; SLICE-04 §Acceptance criteria 3; architecture §Planning stage resolutions (Option B).

---

### US-04-03

**Story:** As a **planner**, I want **notes on assignment rows (when supported by schema)**, so that **I can record operational detail per assignment**.

**Acceptance criteria**

- Notes CRUD if column exists per dev-db.

**Sources:** SLICE-04 §Rebuild target.

---

## Itinerary

### US-05-01

**Story:** As a **planner with planning visibility**, I want **a full event itinerary (list and map) ordered by the documented time fields**, so that **I can see the schedule and geography for the whole event**.

**Acceptance criteria**

- Timeline merge order: `departure_time` / `start_time` / `check_in_time` per resource type; tie-breaker resource type then stable id.  
- Map uses snapshot coordinates; empty state when no coordinates.  
- No logistics or assignment mutations on this route.
- TRAC consumes the shared pure **pace-core2 CR25** helper for day-entry derivation rather than re-implementing those pure rules locally.

**Sources:** SLICE-05 §Rebuild target; SLICE-05 §Acceptance criteria 1, 4, 7; architecture §Shared itinerary derivation helper (CR25).

---

### US-05-02

**Story:** As a **participant with `base_application` and assignments**, I want **`/itinerary` to show only my assigned logistics**, so that **I see my personal schedule without others’ details**.

**Acceptance criteria**

- Rows are limited to assigned resources; RLS assumes Option A on logistics `SELECT`.  
- Labels clarify “your” items.
- Participant-only narrowing, day grouping, timezone precedence, and in-day ordering come from the shared pure **pace-core2 CR25** helper, while TRAC remains the authority for those rules.

**Edge cases (implied)**

- Option A participant logistics `SELECT` dependency is treated as completed in DB change bundle for rebuild assumptions.

**Sources:** SLICE-05 §Rebuild target; SLICE-05 §Acceptance criteria 2, 7; architecture §Logistics RLS — Option A; architecture §Shared itinerary derivation helper (CR25).

---

### US-05-03

**Story:** As a **day visitor without `base_application`**, I want **an explanation that personalised logistics are not available**, so that **I am not confused by an empty screen**.

**Acceptance criteria**

- Explanatory state, not silent empty.

**Sources:** SLICE-05 §Overview; SLICE-05 §Acceptance criteria 3; architecture §Explainer — participant vs planner.

---

### US-05-04

**Story:** As a **user with both planner and participant roles**, I want **one `/itinerary` experience (sections/tabs)**, so that **I do not need duplicate routes for the same page**.

**Acceptance criteria**

- Single route with role-based content per architecture preference.

**Sources:** SLICE-05 §Overview; architecture §Explainer — participant vs planner (dual role).

---

### US-05-05

**Story:** As a **planner or participant viewing itinerary**, I want **timezone context consistent with Master Plan**, so that **times are interpreted correctly across the event**.

**Acceptance criteria**

- Timezone disclaimer or per-row timezone display aligned with Master Plan intent.

**Sources:** SLICE-05 §Acceptance criteria 5; architecture §Composite contracts — Dashboard & Master Plan.

---

### US-05-06

**Story:** As a **participant already scoped in the member portal**, I want **an event-level link to my personalised itinerary**, so that **I can view my assigned logistics without needing broader TRAC app access**.

**Acceptance criteria**

- Member-facing entry can be hosted outside TRAC on a portal event details / event hub surface.
- The view applies the same participant-only assignment filter and Option A RLS assumptions as SLICE-05.
- The shared pure **pace-core2 CR25** helper provides the participant narrowing/day-derivation execution path for both consumers without moving source-of-truth ownership away from TRAC.
- This does not introduce a dedicated participant-only TRAC route or bypass the TRAC `/itinerary` page guard.

**Sources:** SLICE-05 §Overview; SLICE-05 §Rebuild target; architecture §Recommendation — assignment UX placement; architecture §Information architecture (v1); architecture §Shared itinerary derivation helper (CR25).

---

## Contacts

### US-06-01

**Story:** As an **authorised user with contacts permission**, I want to **maintain the event contact list**, so that **TRAC has accurate people to reference (including risks)**.

**Acceptance criteria**

- Add/edit/remove contacts per RLS.  
- Validation errors surface in UI, including required fields and format checks for the actual dev-db schema.  
- Unauthorised users cannot read or mutate contacts.  
- List supports search/filter as appropriate.

**Edge cases (implied)**

- Delete/archive semantics follow DB constraints; if FK rules block delete, UI provides actionable guidance; if soft-delete columns exist, v1 prefers archive/deactivate behaviour.
- Inactive/archived contacts stay out of active pickers while preserving historical links where the schema allows.

**Sources:** SLICE-06 §Rebuild target; SLICE-06 §Acceptance criteria 1, 3–4.

---

## Costs & currency

### US-07-01

**Story:** As a **planner with costs access**, I want **event cost totals and currency handling using event base currency**, so that **financial summaries are correct and not hard-coded to a single currency**.

**Acceptance criteria**

- Totals aggregate logistics (and other brief-defined sources).  
- Display uses event base currency metadata.  
- Rate management is handled on separate RBAC-controlled route `/currency-rates` using existing RBAC CRUD semantics.

**Sources:** SLICE-07 §Rebuild target; SLICE-07 §Acceptance criteria 1–3.

---

### US-07-02

**Story:** As a **planner**, I want **per-participant cost allocation that matches R2**, so that **each assigned person sees a fair share of group costs on top of individual costs**.

**Acceptance criteria**

- Per logistics row and assigned participant: `individual_cost + (group_cost / assigned_count)` with `assigned_count` = assignment count for `(resource_type, resource_id)`.  
- `NULL` costs treated as **0** per SLICE-07.  
- **`assigned_count = 0`:** line still counts toward **event totals** (including group cost); **no** per-person share for that row; optional UI for unallocated group cost (architecture, Kusi 2026-04-20).
- Displayed values use **line-level rounding then sum** with currency minor-unit precision for consistency across costs surfaces.

**Edge cases (implied)**

- Fixture tests use the same shared rounding helper as dashboard/master plan outputs.

**Sources:** SLICE-07 §Rebuild target; SLICE-07 §Acceptance criteria 4; architecture §Planning stage resolutions (R2).

---

### US-07-03

**Story:** As an **authorised finance/admin user**, I want to **manage currency rates on a dedicated page (`/currency-rates`)**, so that **rate changes are governed separately from day-to-day cost viewing**.

**Acceptance criteria**

- `/currency-rates` is separate from `/costs`.  
- Access is RBAC-controlled.  
- Rate validation errors are surfaced clearly.

**Sources:** SLICE-07 §Owning routes, §Rebuild target, §Acceptance criteria 3; architecture §Information architecture (v1), §Planning stage resolutions.

---

## Journal

### US-08-01

**Story:** As an **authorised user with journal permission**, I want to **create and manage event journal posts**, so that **the team has a shared chronological record**.

**Acceptance criteria**

- Posts CRUD for the event.  
- Unauthorised users cannot read or write posts for the event.

**Sources:** SLICE-08 §Rebuild target; SLICE-08 §Acceptance criteria 1, 4–5.

---

### US-08-02

**Story:** As an **authorised user**, I want to **attach images to posts with upload/delete**, so that **journal entries can include visuals tied to the post lifecycle**.

**Acceptance criteria**

- Images display when tied to a post; post deletion removes images per FK/storage behaviour.  
- UI never lists images without post/event scoping (no bare `trac_journal_images` list for event UI).
- Behaviour relies only on the standard pace-core2 RBAC/RLS model for `journal`; no TRAC-specific super-admin bypass is introduced.

**Edge cases (implied)**

- Storage failure surfaces loading/error states (SLICE-08 §Rebuild target).  
- Upload rejection (size/type) shows user-visible error (SLICE-08 §Testing 2).

**Sources:** SLICE-08 §Overview; SLICE-08 §Acceptance criteria 2–3; architecture §Investigation — journal posts vs images RLS.

---

## Risks

### US-09-01

**Story:** As an **authorised user with risks permission**, I want to **maintain the risk register using likelihood and consequence**, so that **impacts reflect the database-generated scores**.

**Acceptance criteria**

- CRUD with valid enums; generated `impact_before` / `impact_after` **display** after save.  
- Client does not send generated columns on write.  
- Contact linkage uses SLICE-06 contacts.  
- RLS enforced for risks page.

**Sources:** SLICE-09 §Rebuild target; SLICE-09 §Acceptance criteria 1–3, 5.

---

### US-09-02

**Story:** As a **planner**, I want to **print the risks view**, so that **I can share an operational hard copy**.

**Acceptance criteria**

- Print action completes without throw; print stylesheet hides nav/chrome appropriately.

**Sources:** SLICE-09 §Rebuild target; SLICE-09 §Acceptance criteria 4; architecture §Planning stage resolutions (risks print).

---

## Master Plan

### US-10-01

**Story:** As a **planner with masterplan read permission and a selected event**, I want **an operational summary with map, contacts, costs, and detailed itinerary**, so that **I can review and print the event in one place**.

**Acceptance criteria**

- Sections present per architecture parity: header (title “Master Plan”, event name, date range, logo), JourneyMap when coords exist, full contacts list, cost summary with participant-aware intro copy using SLICE-07 rollup and event base currency, detailed itinerary with timezone disclaimer.  
- Loading and no-event alert behaviour matches slice.  
- Print via `window.print()` without error; print layout hides irrelevant chrome.  
- No domain writes from this page.

**Edge cases (implied)**

- Partial upstream failure: section degrades with message, page stable (SLICE-10 §Testing 2).

**Sources:** SLICE-10 §Rebuild target; SLICE-10 §Acceptance criteria 1–3, 5–6; architecture §Composite contracts — Dashboard & Master Plan.

---

## Cross-cutting / compliance stories

### US-X-01

**Story:** As a **product owner**, I want **the client built on pace-core2 (`@solvera/pace-core`) with dev-db validation only**, so that **the rebuild aligns with platform security and schema truth**.

**Acceptance criteria**

- No declared dependency on `@solvera/pace-core` for new work.  
- No production DB used as documentation authority.

**Sources:** trac-project-brief §Goals, §Non-goals; architecture §Do not; SLICE-01 §Do not.

---

### US-X-02

**Story:** As a **stakeholder**, I want **BASE booking linkage to TRAC activities to remain data-level only**, so that **operational BASE flows stay out of scope while reporting fields remain valid**.

**Acceptance criteria**

- No BASE scanning/boarding UX; silent `trac_activity` linkage per architecture.

**Sources:** architecture §Planning stage resolutions; trac-project-brief §Known exclusions.
