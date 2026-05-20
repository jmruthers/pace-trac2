# TRAC Backend Ready Report

> **Path:** `docs/delivery/trac-backend-ready-report.md`  
> **Verification date:** 2026-05-20  
> **Owner:** Jess (DB) / TRAC backend track  
> **Target project:** `yihzsfcceciimdoiibif` (`https://yihzsfcceciimdoiibif.supabase.co`)  
> **Inspection method:** Supabase MCP (`list_migrations`, `execute_sql`, `list_edge_functions`)  
> **Execution authority:** [`docs/requirements/trac/`](../requirements/trac/) slices **TR01–TR10**, [`trac-architecture.md`](../requirements/trac/trac-architecture.md), [`trac-project-brief.md`](../requirements/trac/trac-project-brief.md).

---

## Run Readiness Summary

- **Backend-ready report:** this document (**Gate status: PASS**).
- **Backend freeze status:** **Frozen for this run** — TRAC slices TR01–TR10; no further TRAC/backend DDL scope in this frontend execution lane.
- **Unresolved contract blockers:** **0** (`none`).
- **Frontend queue execution:** **GO** — generate/consume [`trac-build-queue.md`](./trac-build-queue.md) in Phase 2 per [`docs/product-delivery-lifecycle.md`](../product-delivery-lifecycle.md).

**Out of backend gate scope:** pace-core **CR25/CR26** shared itinerary derivation helper — implemented in [`packages/core/src/itinerary/`](../../packages/core/src/itinerary/) per [`packages/core/docs/requirements/CR26-shared-itinerary-derivation-helper.md`](../../packages/core/docs/requirements/CR26-shared-itinerary-derivation-helper.md). TR05 consumes it at app build time, not via Supabase.

---

## Slice coverage

TRAC backend readiness is enforced by **pace-core migrations** and RBAC catalogue state consumed by TR01–TR10. Rows map each slice to primary schema/RPC ownership and whether this run introduced a **TRAC-rebuild** DDL delta (DB-421–DB-423).

| Slice | Requirement doc | Primary backend contracts | TRAC-owned delta (this run) |
| --- | --- | --- | --- |
| TR01 Platform shell | [TR01-platform-shell-requirements.md](../requirements/trac/TR01-platform-shell-requirements.md) | TRAC `rbac_apps` + v1 `rbac_app_pages`; `check_rbac_permission_with_context` | None (catalogue); **DB-421** adds `currency-rates` page |
| TR02 Dashboard | [TR02-dashboard-requirements.md](../requirements/trac/TR02-dashboard-requirements.md) | Read-only logistics/assignments; org `base_currency` | **DB-423** |
| TR03 Planning | [TR03-planning-logistics-requirements.md](../requirements/trac/TR03-planning-logistics-requirements.md) | Logistics CRUD RLS; enums; triggers; `core_file_references`; Google Edge | None (p4 + fu batches) |
| TR04 Assignments | [TR04-assignments-requirements.md](../requirements/trac/TR04-assignments-requirements.md) | `trac_itinerary_assignment` + validate/cleanup triggers; planning RLS | None (DEC-058 / p4) |
| TR05 Itinerary | [TR05-itinerary-requirements.md](../requirements/trac/TR05-itinerary-requirements.md) | Option A participant logistics `SELECT`; read-only | None (p4 batch11) |
| TR06 Contacts | [TR06-contacts-requirements.md](../requirements/trac/TR06-contacts-requirements.md) | `trac_contacts` CRUD RLS | None |
| TR07 Costs / currency | [TR07-costs-and-currency-requirements.md](../requirements/trac/TR07-costs-and-currency-requirements.md) | `trac_currency_rates` RLS; `currency-rates` page + seeds | **DB-421**, **DB-422** |
| TR08 Journal | [TR08-journal-requirements.md](../requirements/trac/TR08-journal-requirements.md) | `trac_journal_*` RLS (`journal` page key); storage path | None (fu011 policy hygiene) |
| TR09 Risks | [TR09-risks-requirements.md](../requirements/trac/TR09-risks-requirements.md) | `trac_risks` generated impacts; contact FK | None (DEC-081 batch) |
| TR10 Master plan | [TR10-master-plan-requirements.md](../requirements/trac/TR10-master-plan-requirements.md) | Composite reads; shared rollup inputs; `base_currency` | **DB-423** |

**Cross-app dependencies:** `base_application` (BASE), `core_events` / `core_org_settings` (CORE), platform RBAC helpers — see [Documentation linkage](#documentation-linkage).

---

## Discovered existing state (Supabase MCP)

### Migration state (tail relevant to TRAC)

Confirmed applied on target project (`list_migrations`), including TRAC rebuild deltas:

| Version | Name |
| --- | --- |
| `20260404130100` | `dec058_trac_itinerary_assignment` |
| `20260404175805` | `trac_dec078_082_open_issues_batch` |
| `20260418143100` | `fu011_fu027_policy_hygiene` |
| `20260426195600` | `p4_batch09_trac_event_fk_audit_fk` |
| `20260426195700` | `p4_batch10_trac_force_rls` |
| `20260426195800` | `p4_batch11_trac_participant_itinerary_rls` |
| `20260426200700` | `p4_batch20_core_org_settings_validation_and_currency` (DB-420 `base_currency`) |
| **`20260520120350`** | **`trac_currency_rates_rbac_and_rls`** |
| **`20260520120400`** | **`trac_org_settings_read_for_composite_pages`** |

### Tables (`public.trac_*`)

All **10** tables present with **`relrowsecurity = true`** and **`relforcerowsecurity = true`**:

| Table | RLS | Notes |
| --- | --- | --- |
| `trac_accommodation` | Yes + force | `participant_select_trac_accommodation` (Option A) |
| `trac_activity` | Yes + force | `participant_select_trac_activity` |
| `trac_transport` | Yes + force | `participant_select_trac_transport` |
| `trac_itinerary_assignment` | Yes + force | Planning read **or** `base_application_is_applicant` on SELECT |
| `trac_contacts` | Yes + force | `contacts` page key |
| `trac_risks` | Yes + force | Generated `impact_before` / `impact_after` |
| `trac_currency_rates` | Yes + force | `costs` / `currency-rates` page keys (DB-422) |
| `trac_location_cache` | Yes + force | Global; authenticated SELECT |
| `trac_journal_posts` | Yes + force | `journal` page key + `event_id` in checker |
| `trac_journal_images` | Yes + force | `journal` page key; `NULL` event param in checker |

### Enumerated types

Verified present: `trac_status`, `transport_mode`, `trac_resource_type`, `journal_post_status`, `risk_type`, `risk_likelihood`, `risk_consequence`, `risk_when`, `risk_status` (values match [`docs/database/domains/trac.md`](../database/domains/trac.md) §3).

### Triggers (contract-critical)

| Table | Trigger | Role |
| --- | --- | --- |
| `trac_itinerary_assignment` | `trac_itinerary_assignment_validate_resource_trigger` | Polymorphic `resource_id` validation |
| `trac_transport` / `trac_activity` / `trac_accommodation` | `trac_itinerary_assignment_cleanup_*_delete` | Remove assignments when parent deleted |
| Logistics + contacts + rates + journal + risks | `*_set_created_by`, `handle_updated_at`, `handle_updated_by` | Audit columns per domain catalogue |

### RBAC catalogue

**TRAC app id:** `3573cee1-8017-4600-98e3-c8207a99b61c` (`rbac_apps.name = 'TRAC'`).

**`rbac_app_pages` (event-scoped, v1):** `planning`, `contacts`, `risks`, `journal`, `costs`, `currency-rates`, `dashboard`, `itinerary`, `masterplan` — **9** pages.

**`rbac_page_permissions` seed coverage:**

| Page | Distinct orgs seeded | Total permission rows | Notes |
| --- | --- | --- | --- |
| `currency-rates` | **5 / 5** | **45** | DB-421: 9 operations × 5 orgs |
| All other TRAC pages | **1 / 5** | **10** each | Legacy dev seed on one org (`95312ea9-d0c1-4eb0-8296-188c7611c23f`) |

All sampled permission rows have **non-null** `organisation_id` (no NULL-org defaults).

**Planning permission matrix (sample org):** `read` for `event_admin`, `planner`, `participant`; `create`/`update`/`delete` for `event_admin`, `planner`; `viewer` read denied — aligns with v1 coordinator model.

### RLS policy samples (MCP)

- **`trac_currency_rates` SELECT:** `read:page.costs` + page `costs` **or** `read:page.currency-rates` + page `currency-rates`; **no** `planning` in qual (DB-422).
- **`trac_itinerary_assignment` SELECT:** `read:page.planning` **or** `base_application_is_applicant(application_id, safe_get_user_id_for_rls())`.
- **Logistics Option A:** `trac_user_assigned_to_resource(...)` on `participant_select_trac_*` policies.
- **Journal:** posts and images policies use page key **`journal`** and `get_app_id('TRAC')`.

### RPCs and helpers

| Function | TRAC use |
| --- | --- |
| `core_org_settings_can_select(uuid)` | DB-423 widened SELECT for dashboard/costs/masterplan/currency-rates readers |
| `data_core_org_settings_base_currency(uuid)` | Event/org base currency display (TR02, TR07, TR10) |
| `trac_user_assigned_to_resource` | Option A logistics read |
| `trac_itinerary_assignment_validate_resource` | Assignment integrity |
| `trac_itinerary_assignment_cleanup_after_resource_delete` | Parent delete cleanup |
| `insert_journal_image` | Journal image row helper |
| `base_application_is_applicant` | Assignment + participant paths |

No TRAC-specific cost rollup or dashboard aggregate RPC is required by slice contracts (client helpers + table SELECT).

### Storage and Edge

**Storage buckets:** `files` (private), `public-files` (public). Journal and planning attachments use the shared **`files`** bucket with `org_scoped_file_access` / member insert policies — no dedicated `journal` bucket row (domain contract: object key = `trac_journal_images.id` under configured bucket).

**Edge Functions (ACTIVE on target, TRAC-relevant):**

| Slug | JWT | Slice |
| --- | --- | --- |
| `google-api-key` | yes | TR03 |
| `google-timezone` | yes | TR03 |
| `google-maps-script` | no | TR03 |
| `create-journal-bucket` | yes | TR08 (provisioning helper) |
| `get_attachments`, `insert_attachment`, `delete_attachment` | yes | TR03 documents |

### Platform dependencies

- **`core_org_settings.base_currency`:** column present (DB-420).
- **`core_file_references`:** table present; **8** RLS policies (TR03 supporting documents).
- **`base_application`:** FK from `trac_itinerary_assignment.application_id`; unique `(resource_type, resource_id, application_id)` on assignments.

---

## Applied deltas

| Migration file | Ledger IDs | Applied (MCP) |
| --- | --- | --- |
| [`20260520120350_trac_currency_rates_rbac_and_rls.sql`](../../packages/core/supabase/migrations/20260520120350_trac_currency_rates_rbac_and_rls.sql) | **DB-421**, **DB-422** | Yes |
| [`20260520120400_trac_org_settings_read_for_composite_pages.sql`](../../packages/core/supabase/migrations/20260520120400_trac_org_settings_read_for_composite_pages.sql) | **DB-423** | Yes |

**Prior TRAC hardening (no additional DDL for this run):** DB-401–DB-406, DB-420 in [`DB-change-decisions-p4.md`](../database/decisions/DB-change-decisions-p4.md); ledger narrative in [`DB-change-decisions-trac.md`](../database/decisions/DB-change-decisions-trac.md).

---

## Contract verification matrix

Legend: **PASS** = verified present and aligned with requirement authority; **FAIL** = blocker.

| Slice | Schema / tables | RPCs | RLS posture | Seed / QA |
| --- | --- | --- | --- | --- |
| TR01 | PASS | PASS (RBAC bootstrap) | PASS | PASS catalogue; QA: multi-org seeds advisory |
| TR02 | PASS | PASS (`base_currency`) | PASS | PASS; QA: use seeded org for guard tests |
| TR03 | PASS | PASS (file refs + Edge) | PASS | PASS |
| TR04 | PASS | PASS (triggers) | PASS | PASS |
| TR05 | PASS | n/a (reads) | PASS (Option A) | QA: participant isolation manual |
| TR06 | PASS | n/a | PASS | PASS |
| TR07 | PASS | PASS (`base_currency`) | PASS (DB-422) | PASS (`currency-rates` 5/5 orgs) |
| TR08 | PASS | PASS (`insert_journal_image`) | PASS (`journal` key) | QA: storage smoke on `files` bucket |
| TR09 | PASS | n/a | PASS | PASS (generated impacts) |
| TR10 | PASS | PASS (`base_currency`) | PASS (composite reads) | PASS |

---

## Blockers

### Contract blockers (schema / RPC / RLS)

- **None**

### QA / advisory (non-blocking for this gate)

1. **RBAC seed coverage:** only **`currency-rates`** is seeded across all **5** organisations; other TRAC pages have permissions for **1** org — affects multi-org guard testing, not table/RLS contracts. Pattern reference: TEAM **TEAM-DB-017** org-scoped reseed ([`team-backend-ready-report.md`](team-backend-ready-report.md)).
2. **Runtime RLS smoke:** planner vs participant isolation (TR04/TR05) should be exercised in integration tests or manual dev-db sessions — not re-proven in this structural SQL pass.
3. **Cost rollup helper:** shared client-side rollup (TR07) is a **pace-core2 / app** contract, not a Supabase RPC — align implementation with TR02/TR10 during frontend execution.

---

## Documentation linkage

| Kind | Path |
| --- | --- |
| TRAC DDL ledger (this run) | [`docs/database/decisions/DB-change-decisions-trac.md`](../database/decisions/DB-change-decisions-trac.md) |
| TRAC schema catalogue | [`docs/database/domains/trac.md`](../database/domains/trac.md) |
| RBAC (TRAC v1 pages) | [`docs/database/domains/rbac.md`](../database/domains/rbac.md) |
| CORE (`base_currency`, org settings RLS) | [`docs/database/domains/core.md`](../database/domains/core.md) |
| BASE (`base_application`, assignments) | [`docs/database/domains/base.md`](../database/domains/base.md) |
| Prior TRAC p4 decisions | [`docs/database/decisions/DB-change-decisions-p4.md`](../database/decisions/DB-change-decisions-p4.md) |
| Shared itinerary helper (app lane) | [`packages/core/docs/requirements/CR26-shared-itinerary-derivation-helper.md`](../../packages/core/docs/requirements/CR26-shared-itinerary-derivation-helper.md) |
| Product delivery lifecycle | [`docs/product-delivery-lifecycle.md`](../product-delivery-lifecycle.md) |

---

## Repeatable verification SQL

Paste into MCP `execute_sql` (or SQL editor against `yihzsfcceciimdoiibif`):

```sql
-- TRAC v1 page catalogue
SELECT ap.page_name, ap.scope_type
FROM public.rbac_app_pages ap
JOIN public.rbac_apps a ON a.id = ap.app_id
WHERE a.name = 'TRAC'
ORDER BY ap.page_name;

-- Permission seed coverage by page
SELECT ap.page_name,
  COUNT(DISTINCT pp.organisation_id) AS orgs_with_perms,
  COUNT(*) AS total_perm_rows
FROM public.rbac_page_permissions pp
JOIN public.rbac_app_pages ap ON ap.id = pp.app_page_id
JOIN public.rbac_apps a ON a.id = ap.app_id
WHERE a.name = 'TRAC'
GROUP BY ap.page_name
ORDER BY ap.page_name;

-- DB-422: currency rates policies must not reference planning in SELECT qual
SELECT pol.polname,
  pg_get_expr(pol.polqual, pol.polrelid) LIKE '%planning%' AS still_uses_planning
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
WHERE c.relname = 'trac_currency_rates'
  AND pol.polname LIKE 'rbac_%';

-- Option A participant policies on logistics
SELECT c.relname, pol.polname
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('trac_transport', 'trac_activity', 'trac_accommodation')
  AND pol.polname LIKE 'participant_select%'
ORDER BY 1, 2;

-- Generated risk impacts (TR09)
SELECT column_name, is_generated, generation_expression
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'trac_risks'
  AND column_name IN ('impact_before', 'impact_after');

-- Assignment uniqueness (TR04)
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.trac_itinerary_assignment'::regclass
  AND contype = 'u';

-- Org base currency helpers (TR02 / TR07 / TR10)
SELECT proname
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND proname IN (
    'core_org_settings_can_select',
    'data_core_org_settings_base_currency'
  );
```

Additional ledger queries: [`DB-change-decisions-trac.md`](../database/decisions/DB-change-decisions-trac.md) (DB-421 verification block).

Optional: MCP `get_advisors` for security regressions outside this PASS gate.

---

## Backend Ready Gate

- **Gate status:** **PASS**
- **Basis:** MCP verification on `yihzsfcceciimdoiibif` — TR01–TR10 schema, RLS, triggers, RBAC catalogue, DB-421/422/423 deltas, and platform RPC/Edge dependencies match requirement authority with **zero** in-scope DDL/RPC/RLS gaps.
- **Frontend queue execution:** **GO**
- **Run freeze:** **Backend frozen for this run** for slices **TR01–TR10** — no incremental backend asks without a new Phase 1 run per PDLC.
