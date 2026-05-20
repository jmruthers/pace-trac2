# TRAC — Project brief (pace-trac rebuild)

**App:** TRAC — trip and risk management (transport, accommodation, activities, contacts, costs, risks, journal, operational summaries) within the PACE platform.  
**Document status:** Draft — implementation authority for the rebuild.  
**Technical target:** React client on **pace-core2** (`@solvera/pace-core` from the pace-core2 monorepo), **Supabase**, **Vite**, **TypeScript**.

---

## Documentation-first and authority

- This rebuild is **documentation-first** for AI-assisted implementation: behaviour, scope, and contracts are defined in approved artefacts before code.
- The **legacy pace-trac codebase is informative, not authoritative.** It may suggest risks and gaps; it does not define requirements.
- **Approved artefacts in this folder** (`trac-project-brief.md`, `trac-architecture.md`, `TR01`–`TR10` slice requirements, `trac-feature-list.md`, `trac-user-stories.md`) are the **implementation authority** for rebuild scope and product behaviour. **Legacy pace-trac code** is **observational only**, not authoritative.
- Client implementation assumes two **programme prerequisites** are complete on **dev-db** before TRAC feature work starts: **(1)** TRAC database hardening including participant itinerary **Option A** logistics `SELECT` (see `trac-architecture.md` *Planning stage resolutions*) and **(2)** TRAC **`rbac_app_pages`** registration / permission seeding for the page keys named in this folder. These prerequisites are part of the rebuild programme, but **the client slice docs do not assign that work to implementation agents**.
- Implementation **must not start** while **known blocking ambiguities** remain unresolved in docs or explicit decisions (track lingering items in slice **Open questions** only when they survive multiple passes).

---

## Purpose

Deliver a rebuilt TRAC client that is **person-aware** and aligned with the **live database design** (e.g. per-person itinerary assignment via `trac_itinerary_assignment`, capacity on logistics rows, typed enums, global location cache, generated risk impacts — see domain brief). TRAC must support planners coordinating **organisation- and event-scoped** logistics, risks, costs, and communications artefacts, with **RBAC + RLS** as the enforcement backbone.

---

## Legacy baseline vs intended rebuild (distinction)

| Layer | What it means here |
|--------|-------------------|
| **Current legacy baseline** | The existing **pace-trac** repo (`@solvera/pace-core`, event-only logistics UX, mixed data patterns). Described **observationally** in `trac-architecture.md` *Bounded contexts* and *Composite contracts* sections — **not** a specification to preserve. |
| **Intended rebuild target** | **pace-core2** client, **person-aware** logistics and itinerary, schema-aligned with **dev-db**; product behaviour per approved artefacts in this folder. **RLS** as enforced on Supabase. |
| **Known exclusions** | Explicit **out-of-scope** items — see **Scope boundaries → Out of scope** below (e.g. BASE scanning, MINT app integration, production DB as doc authority). |
| **Known redesign areas** | **Open redesign** except where schema/DECs constrain data behaviour — see **Redesign intent** and architecture *Design principles*. IA v1 is **frozen** in `trac-architecture.md` until explicitly revised. |

The legacy app’s central gap was that **TRAC was never person-aware**; the rebuild implements the **intended** participant-linked model, not the old event-only-resource mindset.

---

## Goals

1. **pace-core2 foundation:** Auth, RBAC, org/event context, secure Supabase access, and UI **using pace-core2 components** — **not** the legacy `@solvera/pace-core` package (that is the old pace-core).
2. **Domain correctness:** Implement bounded contexts and data contracts consistent with **dev-db** schema and **`trac-architecture.md`** *Database-backed design* (validate structure with **Supabase MCP against dev-db** when wiring queries).
3. **Person-aware logistics:** Support `trac_itinerary_assignment` (and related UX) so planners get headcounts, capacity, and assignments; participants get correct visibility per RLS.
4. **Implementability:** Ship in **10 slices** (see `trac-architecture.md`) with **one owning slice per route**; large slices may use **sub-phases** inside one slice doc (see architecture *Slice size and authoring*). **v1 routes are frozen** — any route change updates `trac-architecture.md` first.
5. **Shared file lifecycle:** File-bearing flows use the standard pace-core2 secure file/attachment contract rather than ad-hoc storage logic or public URL generation.
6. **Quality:** Meet the **quality gates** below before calling a slice done.

---

## Non-goals

1. **Preserving legacy behaviour or UX by default** — **nothing** in the legacy app must be preserved unless a slice explicitly chooses to align with a legacy pattern for a documented reason.
2. **Maintaining or fixing the legacy codebase** as part of this rebuild effort.
3. **Owning core platform schema** outside coordinated changes (pace-core2 / shared migrations); TRAC articulates needs and integrates.
4. **Using production DB** as the authority for documentation or validation — use **dev-db only** (Supabase MCP).
5. **Inventing requirements** not represented in approved rebuild artefacts or explicit product decisions.

---

## Scope boundaries

### In scope

- Full TRAC **rebuild** on pace-core2: routing (subject to IA decisions), features, hooks/services, **UI refresh** using pace-core2 components.
- **Person-aware** logistics and itinerary behaviour per **`trac-architecture.md`** *Database-backed design* (tables, enums, DEC-058, DEC-078–083, RLS notes, cross-domain pointers).
- The **participant itinerary contract** may also be consumed from a **member-facing portal surface** for already-scoped participants; this does **not** imply a new TRAC route, public URL, or RBAC bypass.
- **Google / Places / timezone** integration via edge functions and **`trac_location_cache`** (global cache, DEC-080) per security and DEC-083 snapshot rules.
- **Dashboard** and **Master Plan** surfaces: the explicit **v1 composite contracts** defined in `trac-architecture.md` and the owning slice docs, while **presentation may change** with the refresh.

### Known exclusions (out of scope)

- **BASE scanning, boarding, and similar operational flows** — not part of this rebuild. (**Silent** `base_activity_offering.trac_activity_id` linkage and downstream reporting/list use remain valid per architecture.)
- **MINT application integration** (APIs, embedded UI, workflows beyond DB reads) — MINT consumes cost-related data **from the database** only in this phase.
- **Production database** as authority for documentation or validation — **dev-db only** (Supabase MCP).
- **Cutover / migration runbooks** for production data (unless explicitly added later).
- **pace-core2 package internals** — consume public APIs; coordinate gaps, do not fork core for TRAC-only hacks.

Additional exclusions may be recorded here or in architecture via revision history.

### Information architecture

- **v1 routes and nav are frozen** in **`trac-architecture.md`** (section *Information architecture (v1)*). Future changes require updating that section and slice docs together.

---

## Product resolutions (rebuild orchestration, 2026-04-20)

Recorded in **`trac-architecture.md`** *Planning stage resolutions* and slice docs: **(1)** assignment over-capacity — **warn + explicit confirm** before save; **(2)** per-participant cost **R2** — `individual_cost + (group_cost / assigned_count)` per assigned participant per logistics row, with **row event total = `group_cost + (individual_cost * assigned_count)`**; **`assigned_count = 0`** — row contributes **group_cost only** to event totals and **no** per-person allocation; **`NULL`** money fields → **0**. **(3)** TRAC page keys **`dashboard`**, **`itinerary`**, **`masterplan`**, **`currency-rates`** are the target page names for v1; page registration / permission seeding is a **prerequisite before client implementation starts**, but the client slice docs do **not** assign that seeding work to implementation agents. **`/assignments`** stays on **`planning`** for v1. Existing RBAC CRUD semantics are sufficient for `/currency-rates` in v1. **(4)** Participant itinerary requires the TRAC **Option A** logistics **`SELECT`** state (see `trac-architecture.md` *Planning stage resolutions*) to be present on dev-db before client implementation starts. **(5)** **Documentation authority** — artefacts in this folder are authoritative for rebuild product scope. **(6)** **Assignment eligibility** — picker scope is **approved applications only**; duplicate enforcement mirrors DB constraints. **(7)** Currency rates are managed on separate route **`/currency-rates`** with RBAC and **manual edits** in v1; **(8)** rounding uses **line-level rounding then sum** with currency minor-unit precision for display consistency; **(9)** assignments v1 prioritises **by-resource** management while participant perspective is provided elsewhere in TRAC.

---

## Assumptions

1. **pace-core2** consumable package is **`@solvera/pace-core`**. Legacy **`@solvera/pace-core`** is **not** the target dependency.
2. **Shared Supabase** project family with **RLS** and **`check_rbac_permission_with_context()`**-style enforcement for TRAC app id; TRAC does not implement a parallel security model.
3. **Event context** remains central (`organisation_id` + `event_id` scoping); assignment rows include denormalised ids for RLS (per brief).
4. **Pre-build database prerequisites** — TRAC database hardening including participant itinerary **Option A** read-path state is applied on **dev-db** **before** client implementation starts; see **`trac-architecture.md`** *Planning stage resolutions*.
5. **Pre-build RBAC prerequisites** — required TRAC page registration / permission seeding in **`rbac_app_pages`** is complete on **dev-db** **before** client implementation starts; the rebuild docs declare target page keys but do not assign seeding work to client implementation slices.
6. **Approved artefacts** (`trac-project-brief.md`, `trac-architecture.md`, **`TR01-platform-shell-requirements.md` … `TR10-master-plan-requirements.md`**, `trac-feature-list.md`, `trac-user-stories.md`) form the **primary implementation authority set**; **dev-db** validates implementable schema.

---

## Constraints

| Constraint | Detail |
|------------|--------|
| Shared foundation | **pace-core2** (`@solvera/pace-core`) only; **not** legacy `@solvera/pace-core`. |
| Schema truth | Validate tables, columns, enums, RLS intent with **Supabase MCP on dev-db** when documentation decisions depend on structure. |
| Orchestration | Slice order, dependencies, and route ownership live in **`trac-architecture.md`** and are repeated in each slice requirements doc. |
| Doc set | Do not add extra planning/registry files beyond the approved artefact list unless Kusi asks. |
| Conflicts | Artefacts in this folder are **authoritative** for rebuild product scope. **Legacy pace-trac code** is never authoritative. **Dev-db** validates implementable schema. |

---

## Quality gates

A slice is not complete until:

1. **`npm run type-check`** and **`npm run lint`** pass for changed code.
2. **Tests** meet **`trac-architecture.md` *Testing expectations (for slice authors)*** — minimum per slice: **one happy path**, **one validation failure**, **one auth/permission failure**; add unit tests for pure domain logic; add integration-style tests when hooks touch Supabase or storage.
3. **Security:** pace-core2 secure access patterns for privileged data; no secrets in client bundles; behaviour matches RLS expectations for the slice.
4. **No unresolved blocking ambiguities** for that slice’s scope (or they are explicitly deferred with Kusi approval).
5. **Dashboard / Master Plan:** Meet **current functional capability** as defined in slice acceptance criteria (presentation may differ).
6. **Responsive behaviour:** Changed routes are usable on desktop and mobile; dense layouts define explicit stacking/collapse behaviour rather than inheriting desktop assumptions.

---

## Redesign intent (explicit)

- **Everything is open to redesign** except where **live schema / DEC decisions** constrain data behaviour (enums, generated columns, RLS shapes, polymorphic assignment rules).
- **Visual/UI:** **Refresh** is in scope; **must use pace-core2 components** for the shared platform look and behaviour.
- **IA and routes:** **v1** map is fixed in architecture; **changing** routes or nav is a **redesign** that requires updating `trac-architecture.md` and slice docs together.
- **Legacy quirks** are **not** carried forward unless a slice documents a deliberate exception.

---

## References

| Document | Role |
|----------|------|
| `trac-architecture.md` | Bounded contexts, slices, route ownership, orchestration, database-backed design. |
| `trac-feature-list.md` | Feature inventory derived from approved artefacts. |
| `trac-user-stories.md` | User stories derived from approved artefacts. |
| `TR01-platform-shell-requirements.md` … `TR10-master-plan-requirements.md` | Per-slice implementation contracts. |

---

## Revision history

| Date | Author | Change |
|------|--------|--------|
| 2026-04-20 | Rebuild orchestrator | Initial draft |
| 2026-04-20 | Rebuild orchestrator | Aligned with template authoring notes and Kusi decisions |
| 2026-04-20 | Rebuild orchestrator | IA frozen in architecture; BASE/MINT scope; DB p4 assumption |
| 2026-04-20 | Rebuild orchestrator | Consistency pass: legacy/target/exclusions/redesign table; quality gates → architecture testing section; exclusions wording |
| 2026-04-20 | Rebuild orchestrator | **10 slices** after `/assignments` route split (see architecture) |
| 2026-04-20 | Rebuild orchestrator | Assumption 5: explicit slice requirements paths under `docs/requirements/trac/` |
| 2026-05-20 | Rebuild orchestrator | Slice requirements renamed to `TR0N-*-requirements.md` co-located in this folder |
| 2026-05-20 | Rebuild orchestrator | Renamed to `trac-project-brief.md` (PUMP-style `trac-` prefix on planning docs) |
| 2026-04-20 | Rebuild orchestrator | Product resolutions section: over-capacity, cost R2, RBAC pages; dev-db logistics RLS note in architecture |
| 2026-04-20 | Rebuild orchestrator | Participant logistics **Option A** — dependency + assumed-applied docs (architecture, SLICE-05, brief) |
| 2026-04-20 | Kusi / orchestrator | **Authority:** in-folder artefacts authoritative for product scope. **R2:** `assigned_count = 0` — totals include line (incl. group cost); no per-person share. **RBAC:** deferred to **pace-admin** after design lock. **Duplicates:** dev-db + app mirrors. |
| 2026-04-21 | Kusi / orchestrator | Should-resolve decisions recorded: separate RBAC-controlled **`/currency-rates`** route, rounding set to **line-level rounding then sum**, SLICE-04 uses **by-resource primary** view, contact deletion semantics follow DB constraints, and Option A treated as completed DB dependency. |
| 2026-04-23 | Kusi / orchestrator | Clarified that participant itinerary may be surfaced from a member-facing portal entry point using the same TRAC contract, without adding a new TRAC route or bypassing TRAC RBAC guards. |
| 2026-05-20 | Rebuild orchestrator | Removed references to files outside `docs/requirements/trac/`; authority and schema narrative stay in-folder. |
