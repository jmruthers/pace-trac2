# SLICE-04 — Assignments — Requirements

**Document status:** Draft — rebuild implementation contract.  
**Companion authority:** `trac-project-brief.md`, `trac-architecture.md`.

---

## Orchestration metadata (canonical)

| Field | Value |
|--------|--------|
| **Slice ID** | SLICE-04 |
| **Name** | Assignments |
| **Bounded context** | Assignments |
| **Owning routes** | `/assignments` |
| **Depends on** | SLICE-01, **SLICE-03** (logistics rows must exist to reference) |
| **Blocks** | SLICE-05 (itinerary), SLICE-07 (costs rollups where assignment-aware) |
| **Implementation order** | 4 of 10 |
| **High-risk** | Yes — polymorphic `trac_itinerary_assignment`, RLS, participant pickers, headcounts vs capacity |
| **Cross-cutting** | May use lists/maps **read-only** as needed — **no** full Places planning UI duplication |

**RBAC (v1):** **`planning`** page permissions for `/assignments` (authoritative per `trac-architecture.md`); optional dedicated `assignments` key is a later refinement.

---

## Overview

Deliver **`/assignments`**: planner-facing CRUD for **`trac_itinerary_assignment`**, linking **`base_application`** (participant) to logistics rows via **`resource_type`** + **`resource_id`**, with **headcounts** vs **capacity** on transport/accommodation/activity, optional **notes**, and views that help planners see coverage per resource. This route **owns all assignment mutations**; `/planning` remains logistics-only.

---

## Current legacy baseline (observational only)

Legacy TRAC had **no dedicated assignments route** and did not surface assignment UX. Baseline is **N/A** for UX parity; requirements are **schema- and brief-driven**.

---

## Rebuild target

- **Participant picker:** Select people from the active event’s **approved** `base_application` rows only. Do not show `draft`, `submitted`, `under_review`, `rejected`, or `withdrawn` applications in the assignment picker. Prevent duplicate assignment rows where DB constraints disallow them.
- **Polymorphic target:** Choose resource type (transport / accommodation / activity) and specific row; **DB trigger (DEC-082)** validates `resource_id` exists — surface errors cleanly.
- **Headcounts:** Show assigned count vs capacity (nullable capacity = uncapped). **Over-capacity (per `trac-architecture.md`):** if `capacity` is non-null and a save would exceed it, **allow** the save only after a **strong warning** and **explicit confirmation** (Option B — DB does not enforce headcount ≤ capacity).
- **Notes:** CRUD on assignment-level notes if column exists per dev-db.
- **Views:** **By resource is primary for v1** (list assignments per transport leg, etc.). Per-participant perspective is provided elsewhere in TRAC (e.g. itinerary role views).
- **RLS:** Planners with planning permission see/manage event assignments; participants see **own** rows on read surfaces (SLICE-05) — this slice focuses **planner management**.
- **Deep links:** Support navigation from Planning (read-only “open assignments”) and Itinerary as needed via URL params — without moving mutation ownership.

**Suggested sub-phases:** list by resource → add/remove assignment → notes → validation UX.

---

## pace-core2 delta (vs legacy)

| Area | Legacy | Rebuild |
|------|--------|---------|
| Route | None | Dedicated `/assignments` |
| Data model | Not in app | Full `trac_itinerary_assignment` |
| Permissions | N/A | **`planning`** page key for v1 |

---

## pace-core2 imports (expected)

| Need | Import path (expected) |
|------|------------------------|
| RBAC | `@solvera/pace-core/rbac` — `PagePermissionGuard` with **`planning`** page key for v1 |
| Providers | `@solvera/pace-core/providers` |
| Forms / tables | `@solvera/pace-core/forms`, `@solvera/pace-core/components` |
| Secure client | `@solvera/pace-core/rbac` — `createSecureClient` / usage via app setup |

---

## Data and schema references

| Table | Notes |
|-------|--------|
| `trac_itinerary_assignment` | Polymorphic link; organisation_id / event_id denormalisation per brief |
| `base_application` | Participant scope for pickers |
| `trac_transport`, `trac_accommodation`, `trac_activity` | Capacity + labels for pickers |
| **Triggers** | Integrity on resource_id; cleanup on resource delete (DEC-058) — **validate on dev-db** |
| **Supabase MCP (dev-db)** | **Required:** columns, RLS policies for planner vs participant |

---

## Acceptance criteria

1. Planner can create, update, delete assignment rows for allowed resource types on the active event.
2. Invalid `resource_id` / wrong type fails with **actionable** error (DB + client validation).
3. Headcount UI reflects assignments count vs row capacity when capacity is non-null; **over-capacity** saves require warning + explicit confirmation (architecture Option B).
4. Participant picker only lists **approved** applications in scope for the active event.
5. User without **planning** (or future **assignments**) read/write cannot manage assignments.
6. No assignment mutations implemented under `/planning`.

---

## API / Contract

- **CRUD** on `trac_itinerary_assignment` via secure client; all rows scoped by event/org.
- **Reads** for pickers: `base_application` + logistics tables — respect RLS.
- **Writes:** No direct changes to generated or non-owned columns; follow brief for nullable fields.
- **Invalidation:** Successful assignment mutations invalidate assignment lists/headcounts plus dependent itinerary/cost/dashboard/master-plan reads directly; do not rely on timing delays or custom browser events.

---

## Visual specification

- Dense operational UI: tables with filters by resource type; mobile-friendly stacked layout.
- Clear badges for capacity pressure (token-based colours).
- Empty states: “No assignments yet” with CTA to add; loading states for pickers.

---

## Verification

- Assignment round-trip against dev-db; trigger failure cases (bad id).
- RLS: participant cannot list others’ assignments **on management views** (should be planner-only); participant read model verified in SLICE-05.

---

## Testing requirements

| # | Scenario | Type |
|---|----------|------|
| 1 | **Happy path:** Planner assigns participant to existing activity; row appears; headcount updates | Integration |
| 2 | **Validation failure:** Assignment to non-existent `resource_id` — rejected | Integration |
| 3 | **Auth / permission failure:** User without planning permission — no save; AccessDenied or RLS | Integration |

Unit: headcount vs capacity pure logic.

---

## Open questions

*(None — over-capacity Option B and `planning` RBAC recorded in `trac-architecture.md`.)*

---

## Do not

- Do not implement assignment CRUD on `/planning`.
- Do not bypass RLS with service role in the browser.
- Do not expose other participants’ PII to participant role on this **management** route (route should be planner-gated).

---

## References

| Document | Role |
|----------|------|
| `trac-architecture.md` | Assignment route split, RBAC note, participant vs planner explainer, DEC-058 |
| `trac-project-brief.md` | Person-aware logistics scope |
| TR03-planning-logistics-requirements.md | Logistics ownership boundary |
