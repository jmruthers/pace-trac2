# SLICE-02 — Dashboard — Remediation plan

**Authority:** [TR02-dashboard-requirements.md](../requirements/TR02-dashboard-requirements.md)  
**Completion record:** [TR02-slice-completion.md](./TR02-slice-completion.md)  
**Opened:** 2026-05-21 (compliance review)

---

## Status

| Priority | Item | Status |
|----------|------|--------|
| P0 | Manual dev-db + live permission verification | Open |
| P1 | Delivery doc expansion | Complete (2026-05-21) |
| P2 | AC7 per-card failure integration test | Complete (2026-05-21) |
| P2 | `DashboardPage` smoke test | Complete (2026-05-21) |

---

## P0 — Manual dev-db verification (sign-off)

Run against target project `yihzsfcceciimdoiibif` (see [trac-backend-ready-report.md](./trac-backend-ready-report.md)).

### Checklist

1. Log in as **planner** (or role with `read:page.dashboard`) and select a fixture event with logistics, contacts, and cost data.
2. Open `/` (dashboard). Record UI values for:
   - Transport / accommodation / activity: **confirmed of total**
   - Itinerary: **visible date range** (or empty copy)
   - Costs: **event total** and **per approved participant** with currency code
   - Contacts: **count**
3. Compare to SQL below (replace `:event_id`).
4. Log in as user **without** `read:page.dashboard`; confirm `AccessDenied` on `/` and `/dashboard`.
5. When steps 1–4 pass, mark AC1 and AC3 sign-off `[x]` in [TR02-slice-completion.md](./TR02-slice-completion.md).

### Reference SQL — planning counts (`trac_status`)

```sql
SELECT 'transport' AS kind,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed
FROM trac_transport WHERE event_id = :event_id
UNION ALL
SELECT 'accommodation', COUNT(*), COUNT(*) FILTER (WHERE status = 'confirmed')
FROM trac_accommodation WHERE event_id = :event_id
UNION ALL
SELECT 'activity', COUNT(*), COUNT(*) FILTER (WHERE status = 'confirmed')
FROM trac_activity WHERE event_id = :event_id;
```

### Reference SQL — contacts

```sql
SELECT COUNT(*) AS contact_count
FROM trac_contacts
WHERE event_id = :event_id;
```

### Reference SQL — approved participants (costs denominator)

```sql
SELECT COUNT(*) AS approved_participant_count
FROM base_application
WHERE event_id = :event_id AND status = 'approved';
```

### Reference SQL — base currency

```sql
SELECT data_core_org_settings_base_currency(e.organisation_id) AS base_currency
FROM core_events e
WHERE e.event_id = :event_id;
```

### Costs total

Use the same manual rollup procedure as [TR07-remediation-plan.md](./TR07-remediation-plan.md) P0 (line-level round-then-sum in base currency), or compare dashboard **Costs** card to `/costs` page totals for the same event.

### Itinerary date range

Compare dashboard range to `/itinerary` event view earliest/latest day keys (SLICE-05 derived model). No separate SQL rollup required if itinerary page matches.

---

## Agent-assisted SQL snapshot (2026-05-21)

MCP verification on dev-db for fixture event **European Adventure** (`event_id` `0f564bf7-4a47-413a-a060-999ac52490a6`). Use these expected dashboard planning/contact values when completing P0 UI spot-check:

| Kind | Total | Confirmed |
|------|-------|-----------|
| transport | 30 | 9 |
| accommodation | 6 | 2 |
| activity | 105 | 29 |
| contacts | 6 | — |
| approved participants | 0 | — |

**Still required for P0 close:** live `/` UI match to table above; `/costs` vs costs card; itinerary range vs `/itinerary`; `AccessDenied` without `read:page.dashboard` on `/` and `/dashboard`.

---

## P2 — Automated hardening (complete)

- Per-card failure: [`dashboard.integration.test.tsx`](../../src/features/dashboard/dashboard.integration.test.tsx) — planning error while itinerary/costs render.
- Page smoke: [`DashboardPage.test.tsx`](../../src/app/pages/DashboardPage.test.tsx).
