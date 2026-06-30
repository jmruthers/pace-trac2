# TRAC — Architecture (pace-trac rebuild)

**Document status:** Draft — canonical orchestration and technical authority for the rebuild.  
**Companion:** `trac-project-brief.md`  
**Documentation authority:** **`trac-project-brief.md`**, **`trac-architecture.md`**, and **`TR01–TR10 *-requirements.md` slice files in this folder** are **authoritative for rebuild scope, behaviour, and product decisions**. Legacy pace-trac code is **observational only**. **Implementers still validate** columns, enums, and RLS **against dev-db** when wiring queries so the client matches the live schema.

---

## Orchestration metadata (canonical)

All slice ordering, route ownership, dependencies, and cross-cutting rules are defined **here** and must be **reinforced in each** slice requirements file: **`TR01-platform-shell-requirements.md`** through **`TR10-master-plan-requirements.md`**. No separate index/registry files.

**Contents (orchestration):**

| Section | Location |
|---------|----------|
| Slice requirements (files) | `TR0N-{brief-description}-requirements.md` in this folder (one per slice) |
| Slice overview | [Implementation plan → Slice overview](#slice-overview) |
| Dependency rationale | [Implementation plan → Dependency rationale](#dependency-rationale) |
| Implementation order | [Implementation plan → Implementation order](#implementation-order) |
| High-risk slices | [Implementation plan → High-risk slices](#high-risk-slices) |
| Route ownership | [Implementation plan → Route ownership](#route-ownership) |
| Slice size / split guidance | [Slice size and authoring](#slice-size-and-authoring) |

---

## Planning stage resolutions (2026-04-20)

Decisions and recommendations from orchestration review; slice requirements should treat these as **inputs**, not open questions, unless marked optional.

| Topic | Resolution |
|--------|------------|
| **BASE** | When BASE activities are **booked**, they **flow into TRAC** (see `base_activity_offering.trac_activity_id` in domain docs). **Scanning, boarding, and other BASE/TRAC flows** are **out of scope** for this rebuild. |
| **MINT** | MINT will **read cost-related data from the database** only; **no** additional MINT integration (APIs, UI coupling) in this phase. |
| **DB hardening (p4)** | TRAC client implementation starts **only after** TRAC database hardening (including participant itinerary **Option A** logistics `SELECT`) is applied and verified on **dev-db**. Rebuild docs describe the **post-change client state**; they do **not** assign the database work to client implementation agents. |
| **pace-core2** | Consumable package **`@solvera/pace-core`** from the pace-core2 monorepo. |
| **IA** | **Finalised for v1** in [Information architecture (v1)](#information-architecture-v1) below — sufficient to start slice requirements; only change via explicit doc update. |
| **BASE → TRAC activity** | **Silent linkage** is sufficient for v1 (`base_activity_offering.trac_activity_id`): no requirement for TRAC UI to surface BASE links. Data supports downstream uses (e.g. booked pax, participant lists). |
| **Currency display** | **Event base currency** (and `trac_currency_rates` behaviour) — do **not** hard-code AUD or other fixed currency strings in Master Plan / costs copy. |
| **Risks print** | **Keep** print capability for risks (alongside Master Plan print), consistent with legacy intent. |
| **Assignment over-capacity** | **Option B:** allow saving assignments that exceed a non-null `capacity`, but require a **strong warning** and **explicit user confirmation** in the UI (DB does not enforce headcount ≤ capacity). |
| **Per-participant cost rollup** | **R2:** for each logistics row, per assigned participant add **`individual_cost + (group_cost / assigned_count)`** where **`assigned_count`** = count of `trac_itinerary_assignment` rows for that `(resource_type, resource_id)`. **Event total for a row** is **`group_cost + (individual_cost * assigned_count)`**. **`NULL`** `individual_cost` / `group_cost` → treat as **0**. **When `assigned_count = 0`:** the row contributes **`group_cost`** only to event totals and **no** per-person share is computed. Planner-facing UI **may** surface **unallocated group cost** for that row. (Kusi confirmed 2026-04-22.) |
| **Cost entry UX** | Keep support for **both** `group_cost` and `individual_cost` on the same logistics row. Rebuild UI should stay simple: default to a primary cost input with the secondary cost input available when needed, rather than enforcing mutual exclusivity or splitting one real-world booking into artificial duplicate rows. |
| **TRAC page keys (IA) & RBAC** | Dedicated keys **`dashboard`**, **`itinerary`**, **`masterplan`**, and **`currency-rates`** (plus existing `planning`, `contacts`, `risks`, `journal`, `costs`) are the **target v1 page names**. Required TRAC page registration / permission seeding in **`rbac_app_pages`** is a **prerequisite before client implementation starts**. Slice docs name the target keys and client guard behaviour, but do **not** assign the registration / seeding work to client implementation agents. **`/assignments`** uses **`planning`** for v1. For `/currency-rates`, existing RBAC **CRUD** model is sufficient for v1 (no extra RBAC design work required). |
| **Currency rates IA placement** | **Decision:** `trac_currency_rates` management is moved to a **separate route** **`/currency-rates`** (owned by SLICE-07), controlled via RBAC (`currency-rates` page key target). `/costs` remains focused on totals, conversion display, and rollups. |
| **Currency rates operations** | **Decision:** v1 uses **manual edits** on `/currency-rates`; no additional publish/approval workflow required. |
| **Cost rounding (display consistency)** | **Decision A:** for displayed rollups, use **line-level rounding then sum** (internally consistent across `/costs`, Dashboard, Master Plan). Use currency-specific minor units (e.g. ISO exponent) in the shared helper; test at least 0/2/3-decimal currencies. |
| **Participant logistics `SELECT` (Option A)** | Participant `/itinerary` requires the **Option A** post-change state to be present on **dev-db before client implementation starts**: **`SELECT`** RLS on **`trac_transport`**, **`trac_activity`**, and **`trac_accommodation`** allows read when user has **`read:page.planning`** (existing) **or** matching **`trac_itinerary_assignment`** for their `base_application` (e.g. **`EXISTS`** + **`base_application_is_applicant`**). **Rejected:** granting participants **`read:page.planning`** wholesale; **deferred:** `SECURITY DEFINER` RPC for this read path. Client slice docs assume this prerequisite state when describing participant behaviour. |

**RBAC vs rebuild schedule (Kusi 2026-04-20):** Slice docs describe **`PagePermissionGuard`** and page keys as the **required client contract**. The corresponding **`rbac_app_pages`** rows and permission seeding are a **programme prerequisite before client implementation starts**; rebuild client slices do **not** own that seeding work. **RLS** on Supabase remains the authoritative data boundary.

### Logistics RLS — participant read path (Option A)

**Dependency status (pace-core2 migrations):** **Option A is a prerequisite** — widened **`SELECT`** on the three logistics tables must be present on **dev-db** before client implementation starts so participants without planning permission can **`SELECT`** rows **only** when they have an assignment to that resource.

**Rebuild assumption:** TRAC client and **`TR05-itinerary-requirements.md`** are written as if **Option A is already live** on **dev-db** when implementation begins: participants load **assigned** logistics via normal table queries (plus assignment rows as needed); RLS enforces **no access** to unassigned resources.

**Historical note:** Before Option A (p4 batch11), dev-db showed logistics **`SELECT`** allowed only for **`read:page.planning`** (plus super-admin), while **`trac_itinerary_assignment`** already allowed applicant **`SELECT`** — that gap motivated Option A. Verified closed on **`yihzsfcceciimdoiibif`** per [`trac-backend-ready-report.md`](../../delivery/trac-backend-ready-report.md).

### TRAC-related Edge Functions (pace project, MCP list)

Deployed slugs relevant to maps/Places/timezone (others exist for platform/auth/payments): **`google-api-key`**, **`google-timezone`**, **`google-maps-script`** (`verify_jwt: false`). Attachment helpers if still used elsewhere: **`get_attachments`**, **`insert_attachment`**, **`delete_attachment`**. **Validate request/response** against function source when wiring SLICE-03 / SLICE-05.

### Recommendation — assignment UX placement (issue 1) — **superseded by route split**

**Current decision:** **`/assignments`** is a **dedicated route** (**SLICE-04**) for **`trac_itinerary_assignment`** CRUD, headcounts, participant pickers, and per-resource assignment views. **`/planning`** (**SLICE-03**) covers **logistics rows only** (transport, accommodation, activity), including **capacity** and **location snapshots**, without owning assignment mutations.

- **`/itinerary`** (**SLICE-05**) stays **time-ordered** read/aggregate: planners see schedule + signals; participants see **their** rows (RLS). Deep links: **Planning** ↔ **Assignments** ↔ **Itinerary** as needed.
- **Member-facing entry:** when a participant is already scoped in **pace-portal2**, the member-facing link to their personalised itinerary may live on the portal event details / event hub surface and open a **portal-hosted** participant itinerary page that consumes the **same SLICE-05 participant contract**. This does **not** add a new TRAC route or bypass TRAC page guards.
- **RBAC (v1):** **`/assignments`** uses **`planning`** page permissions (same as `trac_itinerary_assignment` RLS). Optional dedicated `assignments` page key remains a later refinement.

### Shared itinerary derivation helper (CR25)

- **TRAC remains the business/source authority** for itinerary rules, participant visibility semantics, route ownership, and the **Option A** RLS assumption.
- **pace-core2 CR25** owns the **shared pure executable helper contract** for itinerary derivation so TRAC, its composites, and portal do not re-implement day-entry expansion, participant narrowing, timezone precedence, in-day ordering, or visible date-range/group metadata separately.
- **CR25 is not a security boundary.** It does **not** own data fetching, RBAC, route guards, RLS, planner CRUD, assignment mutation, or TRAC-specific/portal-specific copy and page composition.
- TRAC slice docs should reference **CR25** as the reusable helper dependency while keeping the written business rules authoritative in TRAC docs.

### Explainer — participant vs planner journeys (issue 2)

| Role | What it means in TRAC | UX direction |
|------|------------------------|--------------|
| **Planner / coordinator** | RBAC allows **read/write** logistics, assignments, journal, etc. (per page keys). | Full event views, assignment **management**, capacity/headcounts, all contacts/risks. |
| **Participant (has `base_application`)** | RLS: can **SELECT** own `trac_itinerary_assignment` rows; **after Option A**, can **SELECT** parent logistics rows **only** for assigned resources (not full event logistics). | **“My” itinerary** — only their transport/stays/activities; clear labels; no access to other participants’ assignments or unassigned resources. If the user is already in **pace-portal2**, the member-facing entry may be hosted there rather than requiring TRAC RBAC. |
| **Day visitor / no `base_application`** | Not in assignment model by design. | Explain that personalised logistics are **not** available; avoid empty confusing screens. |
| **Dual role** | Same user may be planner and participant. | Prefer **one** `/itinerary` (and **Planning** / **Assignments** if permitted) with sections or tabs rather than duplicating routes unless IA later adds a dedicated `/my-itinerary`. |

Slice requirements should spell out **empty, loading, and permission-denied** states for each role.

### Investigation — journal posts vs images RLS (issue 4)

**Status:** **Aligned** in **`20260418143100_fu011_fu027_policy_hygiene.sql`** and **verified on dev-db** (pace project): both **posts** and **images** use **`check_rbac_permission_with_context`** with page key **`journal`** and **`get_app_id('TRAC')`**. Older narratives that suggested images used org-only RLS are **superseded** by this verification.

**Difference:** `trac_journal_posts` passes **`(event_id)::text`** into the permission checker; `trac_journal_images` passes **`NULL::text`** for the event parameter because **image rows have no `event_id` column** — only `post_id` → `trac_journal_posts.event_id`.

**Recommendation for v1 app (no DB change required):**

1. **Always load images in an event-scoped journal UI** by querying **posts** (filter `event_id`) and **joining** images to those posts — never rely on a bare `trac_journal_images` list for event UI.
2. Treat **storage** paths consistently with post lifecycle (delete post → cascade images per existing FKs).
3. **Optional later:** Denormalise `event_id` onto images **or** extend RLS to derive event via subquery — only if a security review requires DB-level event scoping for image rows; not blocking for slice docs if (1) is enforced.

### Explainer — location snapshots (DEC-083) (issue 8)

- Logistics rows store **their own** copy of place fields (`*_place_id`, coords, timezone, display names, etc.) at **save time**.
- `trac_location_cache` is the **shared** Places cache for new lookups; it is **not** joined live as the source of truth for display.
- If Google updates a place **after** you saved, **the logistics row does not change** until someone **edits/refreshes** and writes a new snapshot (+ cache write).
- **Product copy:** Avoid implying “live Google data”; optional “Refresh from Places” in a later iteration would be a **new** save, not automatic sync.

---

## Information architecture (v1)

**Status:** Frozen for slice requirements unless this section is updated.

### Page key naming (RBAC)

TRAC v1 page keys are **lowercase kebab-case** slugs identical to `rbac_app_pages.page_name`, RLS `{operation}:page.{slug}` literals, and consuming app `pageName` / `useResourcePermissions` arguments. See pace-core **Standard 3 — Page key naming** and the platform [RBAC page name rollout checklist](../../pace-core2/docs/database/decisions/RBAC-page-name-rollout-checklist.md).

**Canonical catalogue (9 keys):** `contacts`, `costs`, `currency-rates`, `dashboard`, `itinerary`, `journal`, `masterplan`, `planning`, `risks`.

**Intentional v1 choices:**

- **`/assignments`** shares **`planning`** (no dedicated `assignments` page key).
- **`masterplan`** is one word (kebab-valid); route is **`/masterplan`**, not `/master-plan`.
- **`/`, `/dashboard`:** shell route registry + `routeAccessDenied` enforce read access; pages do not wrap content in read `PagePermissionGuard`.

App source of truth for route → `pageName`: `src/app/navigation/trac-nav-definitions.ts` and `src/app/navigation/trac-route-permissions.ts`.

| Route | RBAC `pageName` | Purpose | Owning slice |
|-------|-----------------|---------|--------------|
| `/login` | — | Sign-in | SLICE-01 |
| `/user-dashboard` | — | Redirect to `/` (**TRAC** authenticated home) | SLICE-01 |
| `/`, `/dashboard` | `dashboard` | Dashboard (home alias) | SLICE-02 |
| `/planning` | `planning` | Logistics only (resources, capacity, status, location snapshots) | SLICE-03 |
| `/assignments` | `planning` | Per-person assignments (`trac_itinerary_assignment`), headcounts, notes | SLICE-04 |
| `/itinerary` | `itinerary` | Schedule / map / person-aware views | SLICE-05 |
| `/contacts` | `contacts` | Event contacts | SLICE-06 |
| `/costs` | `costs` | Costs totals, conversion display, participant rollups | SLICE-07 |
| `/currency-rates` | `currency-rates` | Currency rate management (RBAC-controlled) | SLICE-07 |
| `/journal` | `journal` | Event journal | SLICE-08 |
| `/risks` | `risks` | Risk register | SLICE-09 |
| `/masterplan` | `masterplan` | Printable-style operational summary | SLICE-10 |
| `*` | — | NotFound (within authenticated shell) | SLICE-01 |

**Primary navigation (max five items per CR05c):** Overview (`/dashboard`), Planning, Itinerary, Costs, Risks — inline at `lg+` via pace-core `NavigationMenu`. Assignments, Contacts, Journal, and Master Plan are **deep-link routes** (event overview launcher / hubs), not primary nav items. `/currency-rates` is RBAC-controlled management and is not in primary nav. Landing context shows a single **Events** item when no event is selected.

**v1 IA split:** **`/itinerary`** is always the signed-in viewer's **personal** schedule (participant contract). **`/masterplan`** is the full-event operational summary for planners with **`read:page.masterplan`**. A **portal-hosted** member route that consumes the same participant itinerary contract is allowed and does **not** count as a TRAC IA change.

---

## Composite contracts — Dashboard & Master Plan

This section is the **explicit v1 contract** for TRAC composite surfaces. It is **not** dependent on access to the legacy codebase. **Enum/status** values in logic must follow **`trac_status`**.

### Dashboard

| Area | v1 contract |
|------|-------------|
| **Route gating** | Event-scoped route behind pace-core2 **`ProtectedRoute requireEvent`** with one approved no-event fallback for TRAC. |
| **Header** | Event title, event logo, and optional tagline / supporting text from event metadata. |
| **KPI row** | Planning confirmed/total (aggregate across transport, accommodation, activity), itinerary visible date span, event total cost + per-participant (SLICE-07 rollup, event base currency), open risks count. |
| **Hero actions** | Primary **Open planning** → `/planning`; secondary **View itinerary** → `/itinerary`. |
| **Costs access** | Primary nav item **Costs** → `/costs` (not a dashboard launcher card). |
| **Contacts card** | Links to `/contacts`; shows contact count. |
| **Assignments link** | Lightweight link to `/assignments`; no additional assignment aggregate required for v1. |
| **Partial failure policy** | **Hybrid policy.** Route/event gating failures are handled at the **route/shell** level via `ProtectedRoute requireEvent`. Once route access is established, **event identity/header data is critical**: if selected-event metadata required for page identity cannot load, show a page-level error state. After header identity is established, launcher cards degrade **independently**. A failure in one upstream aggregate must not blank the whole page. Failed launcher cards show inline error/retry messaging; successful regions still render. Empty states are not errors. KPI row may show neutral placeholders when an aggregate fails; it must not crash the page. |
| **Permissions** | Route read enforced by shell `routeAccessDenied` + **`dashboard`** page key in route registry once the required TRAC page registration / permission seeding prerequisite is present on dev-db. |

### Master Plan

| Area | v1 contract |
|------|-------------|
| **Route gating** | Event-scoped route behind pace-core2 **`ProtectedRoute requireEvent`** with one approved no-event fallback for TRAC. |
| **Print** | Button triggers **`window.print()`**; print layout remains readable and hides app chrome. |
| **Header** | Title “Master Plan”; event name; single-day vs range display; event logo. |
| **Map** | Journey map when transport rows provide the required snapshot coordinates; otherwise explicit empty-state copy. |
| **Contacts** | Full event contact list. |
| **Costs** | Intro copy that refers to the event-wide participant total uses the **approved application count** for the active event. Detailed cost/listing sections that refer to a specific logistics resource use the **assigned participant count** for that resource. Summary uses the shared SLICE-07 rollup and **event base currency**. |
| **Itinerary** | Detailed itinerary built from the SLICE-05 derived day-entry model; includes timezone disclaimer / interpretation guidance. |
| **Partial failure policy** | **Hybrid policy.** Route/event gating failures are handled at the **route/shell** level via `ProtectedRoute requireEvent`. Once route access is established, **event identity/header data is critical**: if selected-event metadata required for page identity cannot load, show a page-level error state. After header identity is established, sections degrade **independently**. For example, a costs failure does not suppress contacts or itinerary. Empty states are not errors. |
| **Permissions** | Page content guarded by **`PagePermissionGuard pageName=\"masterplan\" operation=\"read\"`** once the required TRAC page registration / permission seeding prerequisite is present on dev-db. |

---

## System overview

TRAC is a **single-page application** (Vite + React + TypeScript) built on **pace-core2** (`@solvera/pace-core`). It uses **Supabase** (`trac_*` domain tables, shared `core_*` / RBAC / `base_application` as per brief) and **Edge Functions** for Google API mediation. The rebuild **standardises** on pace-core2 data-access, auth, and UI patterns; it **does not** target the legacy **`@solvera/pace-core`** package.

---

## pace-core2 migration and dependency assumptions

| # | Assumption |
|---|------------|
| 1 | **Package:** **`@solvera/pace-core`** (workspace under **pace-core2**). Legacy **`@solvera/pace-core`** is the **old** pace-core — **do not** treat it as the long-term dependency. |
| 2 | **Monorepo:** TRAC consumes **`@solvera/pace-core`** from the pace-core2 workspace until publish workflow is defined. |
| 3 | **Surface area:** Auth/session, RBAC, org/event providers, secure Supabase access, app shell, layout, tokens, forms — follow **actual pace-core2 exports**; slice docs list concrete imports. |
| 4 | **Bootstrap:** Single base Supabase client at app entry for platform setup; domain access via pace-core2 **secure** patterns. |
| 5 | **Types:** After schema-impacting platform changes, follow pace-core2 **`db:gen-types`** (or equivalent) so generated types match dev-db. |
| 6 | **No legacy carry-forward:** Patterns from legacy (e.g. mixed React Query vs ad-hoc hooks, permission timing workarounds) are **not** replicated unless a slice documents an explicit exception. |

---

## Database-backed design (summary)

**Source:** DEC-058, DEC-078–083 (summarised below; live on dev-db unless noted). Validate details via **Supabase MCP on dev-db** before implementation decisions.

| Area | Intent |
|------|--------|
| **Person-awareness (DEC-058)** | `trac_itinerary_assignment` links `base_application` to logistics rows (`resource_type` + `resource_id`); capacity on `trac_transport`, `trac_accommodation`, `trac_activity` (nullable = uncapped); cleanup triggers on resource delete. |
| **Logistics status (DEC-078)** | `trac_status` enum on logistics tables (nullable; default `idea`). |
| **Transport mode (DEC-079)** | `transport_mode` enum on `trac_transport.mode`. |
| **Location cache (DEC-080)** | `trac_location_cache` is **global** (PK `place_id`); RLS SELECT for authenticated users; writes via service role from edge. |
| **Risk impact (DEC-081)** | `impact_before` / `impact_after` are **generated** — app sets likelihood/consequence only. |
| **Assignment integrity (DEC-082)** | Trigger validates polymorphic `resource_id` exists. |
| **Location snapshots (DEC-083)** | Denormalised location fields on logistics rows are **snapshots**; no FK to cache in v1. |

**Cross-domain:** BASE **booked activity → TRAC** linkage per brief; **MINT** reads costs from DB only (no TRAC↔MINT app integration this phase). See **Planning stage resolutions**.

**Pre-build database:** Assume TRAC database hardening is applied on **dev-db** before client work starts, including the participant itinerary **Option A** state and other TRAC hardening items the client depends on (see *Planning stage resolutions*).

---

## Bounded contexts

For each context: **legacy baseline** (observational) vs **intended rebuild target** (authoritative direction).

| Context | Legacy baseline (informative) | Intended rebuild target |
|---------|------------------------------|-------------------------|
| **Platform shell** | Vite app with `@solvera/pace-core`, `UnifiedAuthProvider`, `OrganisationProvider`, `PaceAppLayout`, route permissions split between layout and pages. | pace-core2 shell: auth, RBAC, org/event selection, navigation, secure client, **refreshed UI** using pace-core2 components; explicit permission model per slice. |
| **Planning (logistics write)** | CRUD for transport, accommodation, activity; event-scoped; free-text status in older data; no assignments in UX. | **`/planning` only:** logistics CRUD with **`trac_status`**, **`transport_mode`**, **capacity**, location **snapshots** per DEC-083; **no** `trac_itinerary_assignment` mutations here (see Assignments context). |
| **Planning documents** | Legacy had ad-hoc planning attachments tied to logistics rows. | Logistics rows may attach supporting **documents** via the standard pace-core2 file/attachment lifecycle; no TRAC-specific bespoke storage pattern or parallel attachment model. |
| **Assignments** | N/A (legacy had no dedicated route; assignments not in app). | **`/assignments`:** planner CRUD on **`trac_itinerary_assignment`**, headcounts vs capacity, notes; uses **planning** RBAC page key in v1 unless a dedicated page key is added. |
| **Itinerary & assignment read/UX** | Read-only aggregation from logistics; map/list; **not person-aware**. | **`/itinerary`:** **Person-aware** schedule/map/list; planner vs participant views; **participant SELECT** own assignment rows per RLS; consumes planning + assignments data. Shared derivation logic is consumed from **pace-core2 CR25** rather than re-implemented locally. |
| **Location & maps** | Google provider, edge key/timezone, org-scoped cache assumption in older docs. | **Global** `trac_location_cache` (DEC-080); snapshots on logistics rows; edge-mediated secrets. |
| **Contacts** | Event contacts; risk linkage. | Unchanged role; ensure consistency with risk and permissions. |
| **Costs & currency** | Rollups from planning + `trac_currency_rates`. | Same economic intent; align with enums/types and participant-aware logistics where costs roll up per person/group. |
| **Risks** | Manual impact fields possible in old app. | **Generated impact** only (DEC-081); likelihood/consequence drives display. |
| **Journal** | Posts + images; storage. | Same capabilities; **RLS** uses `journal` page key for both tables; **images** have no `event_id` column — **scope event UI via posts** (see Planning stage resolutions). |
| **Composite (Dashboard, Master Plan)** | Aggregates across domains. | Read-only composite surfaces with explicit v1 section contracts, independent section failure handling, and shared read models / helpers from upstream slices. |

**pace-core2 delta (cross-cutting):** Replace all **`@solvera/pace-core`** imports with **`@solvera/pace-core`** (or documented subpaths); align RBAC and secure Supabase APIs to pace-core2 **exports** (slice requirements list **pace-core2 imports** tables).

---

## Schema validation (dev-db)

When a decision depends on columns, enums, triggers, or RLS, **confirm with Supabase MCP against dev-db** (not production). The canonical Supabase project ref for TRAC rebuild MCP verification and backend-ready evidence is **`yihzsfcceciimdoiibif`** (same target as Portal/TEAM/PUMP reports — see [`docs/delivery/trac-backend-ready-report.md`](../../delivery/trac-backend-ready-report.md)). Align local env with this project for TRAC work. Priority areas:

- `trac_itinerary_assignment` + triggers on logistics tables  
- Enum columns: `trac_status`, `transport_mode`, risk enums  
- `trac_risks` generated columns  
- `trac_location_cache` RLS and shape (global)  
- `base_application` relationship to assignments  

Authoritative narrative: **`trac-architecture.md`** *Database-backed design* and per-slice requirements in this folder; confirm structure on **dev-db**.

---

## Design principles

1. **Person-aware first:** Logistics and itinerary UX reflect **assignments** and **capacity**, not only anonymous resources.
2. **Event and organisation scope:** All TRAC mutations respect `organisation_id` / `event_id` and RLS.
3. **Single secure data path:** pace-core2 secure access — no ad-hoc raw clients for privileged tables.
4. **Schema truth:** App behaviour matches **DEC decisions** (e.g. do not write generated risk impact columns).
5. **Composites after domains:** **SLICE-02** (Dashboard) and **SLICE-10** (Master Plan) build on stable upstream slices.
6. **Standard RBAC only:** Use pace-core2 **`ProtectedRoute`**, **`ProtectedRoute requireEvent`**, **`PagePermissionGuard`**, and secure-client contracts as written. Do **not** add TRAC-specific permission bypasses, page-owned no-event flows, or slice-local super-admin branches.
7. **Shared read models:** The itinerary **derived day-entry model** remains a TRAC-owned business contract but is executed through the shared pure **pace-core2 CR25** helper; the cost **rollup/allocation model** and itinerary outputs are shared helpers consumed by upstream composites. Dashboard and Master Plan must not invent alternate derivation rules.
8. **Explicit invalidation over timing hacks:** Successful mutations invalidate the affected query keys directly. Do **not** rely on artificial delays, `window` event buses, or blanket draft-key clearing as the correctness mechanism for refresh.
9. **Responsive by contract:** Each route defines desktop and mobile behaviour explicitly; dense tables, maps, filters, and print surfaces need mobile fallbacks rather than desktop-only layouts.
10. **IA changes:** **v1 routes and nav** are fixed in [Information architecture (v1)](#information-architecture-v1). Renaming or adding routes is allowed **only** by editing that section and dependent slice docs (not silent drift).

---

## Contracts (summary)

| Area | Expectation |
|------|-------------|
| Auth / RBAC | TRAC app id in RBAC; page keys per brief (e.g. `planning`, `contacts`, `risks`, `journal`, `costs`). **`/assignments`:** v1 uses **`planning`** permissions unless a dedicated `assignments` page key exists. Event-scoped routes use pace-core2 **`ProtectedRoute requireEvent`** with a consistent TRAC no-event fallback. |
| NotFound / home fallback | Authenticated unknown routes render a **shell-owned** NotFound UI with navigation back to `/`; this fallback must not depend on dashboard-specific page guards to remain reachable. |
| Assignments | Polymorphic integrity enforced in DB (trigger); app validates for UX. |
| Risks | Write likelihood/consequence only; impacts read from generated columns. |
| Location | Writes through cache (service role) + snapshot to logistics per DEC-083. |
| Storage | Journal images and planning documents follow the standard pace-core2 secure file/attachment lifecycle: secure/storage-capable client only, explicit metadata/reference ownership, explicit cleanup on delete/replace, and no bespoke public URL generation. |
| Data freshness | Use shared TanStack Query defaults aligned to pace-core2 operations standards unless a slice documents a justified exception; successful mutations invalidate dependent queries explicitly. |
| Shared itinerary helper | TRAC consumes the pure helper contract from **pace-core2 CR25** for participant narrowing, day-entry expansion, timezone precedence, in-day ordering, and visible date range/day grouping. **CR25 does not own** TRAC `/itinerary` guards, data fetching, RLS, planner CRUD, or page composition. |

---

## Verification (cross-cutting)

- Login and protected routing; event/org gating behaves deterministically.
- Planner vs participant paths for **assignment** visibility match RLS described in brief.
- Dev-db validation for any schema-sensitive acceptance criterion.

---

## Testing requirements (baseline)

Per slice: **one happy path**, **one validation failure**, **one auth/permission failure** (see slice authoring notes). Plus unit coverage for pure domain logic (costs, date grouping, impact display).

---

## Testing expectations (for slice authors)

Slice requirement documents **must** inherit and spell out:

| Expectation | Detail |
|-------------|--------|
| **Minimum three scenario tests** | One **happy path**, one **validation / domain failure** (invalid input, enum mismatch, rejected mutation), one **auth or permission denial** (wrong role, missing page permission, RLS expectation). |
| **Unit tests** | Pure functions: currency formatting, cost rollups, date grouping, risk score display (read-only generated impacts), itinerary grouping — **no** Supabase in unit tests. |
| **Integration / hook tests** | Where hooks call **Supabase**, **storage**, or **edge functions**, use mocks or test project patterns agreed in slice; assert loading/error/success. |
| **RLS-sensitive slices** | SLICE-03–05 (planning, assignments, itinerary), journal, risks — tests should **name** the role under test (planner vs participant vs denied). |
| **Print surfaces** | Master Plan, Risks — smoke test that **print action** does not throw; optional snapshot of print CSS if slice requires. |
| **Regression vs legacy** | Tests assert **rebuild acceptance criteria** and schema contracts, not **byte-for-byte** legacy behaviour. |

**Project-level commands:** `npm run type-check`, `npm run lint` (and `npm run test` / `vitest` as configured in the rebuilt app) must pass for the slice’s changed code before merge.

---

## Do not

- Do not use **production** DB for documentation or automated validation.
- Do not ship **legacy `@solvera/pace-core`** as the declared dependency for new work.
- Do not **write** `trac_risks.impact_before` / `impact_after` directly.
- Do not add planning artefacts outside the approved rebuild file set unless Kusi asks.

---

## References

| Reference | Use |
|-----------|-----|
| `trac-project-brief.md` | Purpose, scope, assumptions, quality gates. |
| `trac-feature-list.md` | Feature inventory. |
| `trac-user-stories.md` | User stories. |
| `TR01-platform-shell-requirements.md` … `TR10-master-plan-requirements.md` | Per-slice implementation contracts. |

---

## Implementation plan

### Slice overview

| Slice ID | Name | Bounded context | Routes (current ownership — update if IA changes) | Depends on | Summary |
|----------|------|-----------------|---------------------------------------------------|------------|---------|
| **SLICE-01** | Platform shell | Platform shell | `/login`, `/user-dashboard`, `*` (NotFound) | — | pace-core2 bootstrap, auth, router, protected layout, NotFound, org/event context. |
| **SLICE-02** | Dashboard | Composite — Dashboard | `/`, `/dashboard` | SLICE-01; substantive content after core domains (min. SLICE-03–07) | Explicit v1 dashboard contract: planning, itinerary, costs, contacts, and lightweight `/assignments` navigation. |
| **SLICE-03** | Planning | Planning, Location (partial) | `/planning` | SLICE-01 | Logistics CRUD (**transport**, **accommodation**, **activity**), **capacity**, **trac_status** / **transport_mode**, location snapshots / Places; **no** assignment rows. |
| **SLICE-04** | Assignments | Assignments | `/assignments` | SLICE-01, SLICE-03 | **`trac_itinerary_assignment`** CRUD, headcounts, participant ↔ resource; depends on logistics rows existing. |
| **SLICE-05** | Itinerary | Itinerary, Location (partial) | `/itinerary` | SLICE-01, SLICE-03, SLICE-04; **pace-core2 migration — logistics `SELECT` Option A** (participant read of assigned rows only) | Person-aware itinerary/map/list; planner vs participant views per RLS. Slice docs **assume** Option A is applied on dev-db. |
| **SLICE-06** | Contacts | Contacts | `/contacts` | SLICE-01 | Event contacts CRUD. |
| **SLICE-07** | Costs | Costs & currency | `/costs`, `/currency-rates` | SLICE-01, SLICE-03, SLICE-04 | Totals, participant rollups, and separate RBAC-controlled currency rates management aligned to schema. |
| **SLICE-08** | Journal | Journal | `/journal` | SLICE-01 | Posts + images; storage; load images **via event-scoped posts**. |
| **SLICE-09** | Risks | Risks | `/risks` | SLICE-01, SLICE-06 | Risk register; **generated impact**; contact links. |
| **SLICE-10** | Master plan | Composite — Master Plan | `/masterplan` | SLICE-01; upstream domains | Explicit v1 composite contract for the operational summary surface. |

**Cross-cutting:** Google Maps, edge functions, and `trac_location_cache` are implemented inside **SLICE-03** / **SLICE-05** (shared utilities as needed); **SLICE-04** may use lists/maps only as needed without duplicating full Places UI.

### Dependency rationale

- **SLICE-01** blocks all authenticated features (providers, shell, routing).
- **SLICE-06** before **SLICE-09** — risks reference contacts.
- **SLICE-03** before **SLICE-04** — assignments must reference existing logistics rows.
- **SLICE-04** before **SLICE-05** and **SLICE-07** — itinerary and costs consume assignment data where rollups require it.
- **SLICE-05 (participant mode)** — depends on completed **pace-core2** RLS **Option A** on `trac_transport` / `trac_activity` / `trac_accommodation` so participants can `SELECT` logistics rows **only** for resources they are assigned to; verify this state on dev-db when validating participant `/itinerary`.
- **SLICE-02** and **SLICE-10** follow core domains so aggregates match **current capability** with real data paths (assignment-aware where applicable).
- **SLICE-10** last — highest cross-domain dependency.

### Implementation order

1. **SLICE-01** — Platform shell (pace-core2), login, protected routes, layout, NotFound.  
2. **SLICE-06** — Contacts.  
3. **SLICE-03** — Planning (logistics + location snapshots + cache integration).  
4. **SLICE-04** — Assignments (`/assignments`).  
5. **SLICE-05** — Itinerary (person-aware views); verify completed logistics RLS **Option A** dependency on dev-db.  
6. **SLICE-07** — Costs.  
7. **SLICE-08** — Journal (may parallelise with SLICE-07 after SLICE-01 — coordinate merge order).  
8. **SLICE-09** — Risks.  
9. **SLICE-02** — Dashboard.  
10. **SLICE-10** — Master Plan.

### High-risk slices

| Slice | Primary risk |
|-------|----------------|
| **SLICE-01** | pace-core2 bootstrap, auth, RBAC, provider migration from legacy `@solvera/pace-core` assumptions. |
| **SLICE-03** | Three resource types + **capacity** + enums + **location snapshots** + Places/cache. |
| **SLICE-04** | **Polymorphic** `trac_itinerary_assignment`, RLS, participant pickers, headcounts vs capacity. |
| **SLICE-05** | Person-aware itinerary, maps, planner vs participant RLS, depends on SLICE-03 + SLICE-04. |
| **SLICE-08** | Journal posts + **storage** + images; event-scoped UX via posts (images lack `event_id`). |
| **SLICE-02** | Composite dashboard: many upstream hooks; wrong order if built too early. |
| **SLICE-10** | Composite master plan + **print** + cross-domain consistency. |
| **SLICE-09** | **Generated** risk impacts + **print** + contact linkage. |

### Route ownership

**Rule:** Each **path** appears in **exactly one** slice.

| Slice | Routes |
|-------|--------|
| SLICE-01 | `/login`, `/user-dashboard` (redirect), `*` (NotFound) |
| SLICE-02 | `/`, `/dashboard` |
| SLICE-03 | `/planning` |
| SLICE-04 | `/assignments` |
| SLICE-05 | `/itinerary` |
| SLICE-06 | `/contacts` |
| SLICE-07 | `/costs`, `/currency-rates` |
| SLICE-08 | `/journal` |
| SLICE-09 | `/risks` |
| SLICE-10 | `/masterplan` |

If IA changes, **update this table** and the [Slice overview](#slice-overview) table together.

### Slice size and authoring

**Route split:** `/assignments` exists **so SLICE-03 and SLICE-04 stay implementable** without sub-phasing assignment into Planning. Remaining large slices may still use **ordered sub-phases** inside one slice ID.

| Slice | Size concern | Suggested mitigation |
|-------|----------------|----------------------|
| **SLICE-03** | Three resource types + location/Places | Sub-phases: per transport/accommodation/activity tabs → capacity/status → location snapshots. |
| **SLICE-04** | Polymorphic assignments + participant pickers | Sub-phases: list by resource (primary) → add/remove assignment → notes → validation UX. |
| **SLICE-05** | Map + list + planner/participant modes | Sub-phases: read model → map → participant view → polish. |
| **SLICE-08** | Posts + images + storage | Sub-phases: posts CRUD → image upload/delete → storage error paths. |
| **SLICE-09** | Risks CRUD + scoring + contacts + **print** | Sub-phases: CRUD + generated impact → print stylesheet. |
| **SLICE-10** | Large composite + **print** | Build after upstream; sub-phases: layout → map → costs → itinerary list → print CSS. |

**SLICE-06** (contacts) and **SLICE-07** (costs) are smaller; still document sub-phases if currency edge cases multiply tests.

---

## Revision history

| Date | Author | Change |
|------|--------|--------|
| 2026-04-20 | Rebuild orchestrator | Initial draft |
| 2026-04-20 | Rebuild orchestrator | Template-aligned slice table; person-awareness; legacy vs `@solvera/pace-core` |
| 2026-04-20 | Rebuild orchestrator | Planning resolutions: IA v1, BASE/MINT scope, DB p4, assignment UX recommendation, Dashboard/Master Plan parity, journal RLS, DEC-083 explainer |
| 2026-04-20 | Rebuild orchestrator | BASE silent linkage; base currency copy; risks print retained |
| 2026-04-20 | Rebuild orchestrator | Consistency pass: legacy/target/exclusions/redesign; orchestration index; route table; testing expectations; slice size; nav/Dashboard; IA vs design principles |
| 2026-04-20 | Rebuild orchestrator | Added `/assignments` route — **10 slices** (SLICE-01…10); split Planning vs Assignments |
| 2026-04-20 | Rebuild orchestrator | Slice requirements files: `TR01-platform-shell-requirements.md` … `TR10-master-plan-requirements.md` in `docs/requirements/trac/` (canonical paths in orchestration metadata) |
| 2026-05-20 | Rebuild orchestrator | Renamed slice requirements from `slices/SLICE-0N_requirements.md` to `TR0N-*-requirements.md` co-located in this folder |
| 2026-05-20 | Rebuild orchestrator | Removed references to files outside `docs/requirements/trac/` |
| 2026-04-20 | Rebuild orchestrator | Product resolutions: over-capacity B, cost rollup R2, RBAC pages Option 1; MCP: logistics SELECT planning-only, journal aligned, Edge slugs listed |
| 2026-04-20 | Rebuild orchestrator | Participant logistics **Option A** — documented as pace-core2 migration **dependency**; rebuild text **assumes** it is applied; explainer + SLICE-05 updated |
| 2026-04-20 | Kusi / orchestrator | **Doc authority:** in-folder artefacts authoritative for product decisions. **R2 `assigned_count = 0`:** totals include row/group cost; no per-person allocation. **RBAC:** pace-admin after design lock; rebuild need not block. **Duplicates:** dev-db + app mirrors. |
| 2026-04-21 | Kusi / orchestrator | Should-resolve decisions: **`/currency-rates`** added as separate RBAC-controlled route (SLICE-07); rounding approach set to **line-level rounding then sum**; SLICE-04 keeps **by-resource primary** assignments view (participant-perspective lives elsewhere in TRAC); Option A logistics `SELECT` treated as completed dependency in DB change bundle. |
| 2026-04-21 | Kusi / orchestrator | Follow-up decisions: `/currency-rates` uses existing RBAC CRUD model (no extra RBAC design), rates are edited manually for v1, and rounding helper uses currency minor units with line-level rounding then sum. |
| 2026-05-20 | Rebuild orchestrator | Renamed planning docs to `trac-project-brief.md`, `trac-architecture.md`, `trac-feature-list.md`, `trac-user-stories.md` per PUMP-style `trac-` prefix. |
