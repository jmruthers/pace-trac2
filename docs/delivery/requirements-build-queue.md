# TRAC requirements build queue (pass 2)

Pass 2 **uplifts implementation** in `src/` (and tests) against pass-1-updated requirement slices, prototype layout, and pace-core standards. **`npm run validate` must exit 0** before marking a slice **Built**.

**Pass 1 gate:** [requirements-audit-queue.md](./requirements-audit-queue.md) — row `audit_status` must be `Done` or `N/A` before starting that slice.

**Orchestration rule:** `.cursor/rules/trac-requirements-build-pass2.mdc`

## How to kick off

Open the **pace-trac2** workspace (with **pace-prototype** and **pace-core2** siblings available for `@` references).

In **Agent** mode (Plan-only is insufficient — validate must run), send:

```text
Continue TRAC requirements pass 2 from docs/delivery/requirements-build-queue.md
```

Optional modifiers: `— one slice only` · `— plan only` · `— from TR03` · `— dry run`

## Status values

| Column | Values | Meaning |
|--------|--------|---------|
| `build_status` | `Pending` · `In progress` · `Built` · `Skipped` · `Blocked` | Orchestration state |
| `validate_status` | `—` · `Pass` · `Fail` | Last validate result for this slice |
| `uplift_summary` | free text | e.g. `No changes`, `Planning list grid`, `Assignments route delta documented only` |

## Queue

Process in **`audit_order`** sequence. Slice ids **SLICE-NN** map to requirement files **TR0N-***.

| audit_order | slice_id | requirement_doc | prototype_refs | impl_hints | build_status | validate_status | uplift_summary |
|---:|---|---|---|---|---|---|---|
| 1 | SLICE-01 / TR01 | [TR01-platform-shell-requirements.md](../requirements/TR01-platform-shell-requirements.md) | `pace-prototype/apps/pace-trac/app.jsx` (shell, routing, auth); `pages/OverviewPage.jsx` (`TracLandingPage`) | `src/App.tsx`, shell layout | Built | Pass | Event landing at `/`, shell nav switching, EventScopedOutlet, NotFound CTA |
| 2 | SLICE-03 / TR03 | [TR03-planning-logistics-requirements.md](../requirements/TR03-planning-logistics-requirements.md) | `pages/PlanningPage.jsx`, `PlanningNewPage`, `PlanningItemPage` (list + full-page edit) | `src/pages/planning/` | Built | Pass | PageHeader + breadcrumbs; By type / By day switch with tab counts; header Add item; PlanningByDayView; dialog CRUD retained (no full-page routes) |
| 3 | SLICE-06 / TR06 | [TR06-contacts-requirements.md](../requirements/TR06-contacts-requirements.md) | `pages/ContactsPage.jsx` | contacts page | Built | Pass | PageHeader + event breadcrumbs; DataTable CRUD retained (card grid delta) |
| 4 | SLICE-08 / TR08 | [TR08-journal-requirements.md](../requirements/TR08-journal-requirements.md) | `pages/JournalPage.jsx`, `JournalNewPage`, `JournalItemPage` | journal pages | Built | Pass | PageHeader; All / Published / Drafts tabs with counts; New post action; draft Publish + status badges on cards |
| 5 | SLICE-04 / TR04 | [TR04-assignments-requirements.md](../requirements/TR04-assignments-requirements.md) | `pages/PlanningPage.jsx` (`PlanningItemPage` — **inline assignment panel**; prototype has no separate `/assignments` route) | `src/pages/assignments/` — note prod route split | Built | Pass | PageHeader + breadcrumbs; Assigned people list title; dedicated `/assignments` route retained per TR04 delta |
| 6 | SLICE-05 / TR05 | [TR05-itinerary-requirements.md](../requirements/TR05-itinerary-requirements.md) | `pages/ItineraryPage.jsx` (schedule mode) | itinerary page | Built | Pass | PageHeader with mode subtitle; Master plan link in header actions; planner/participant tab labels aligned to prototype |
| 7 | SLICE-07 / TR07 | [TR07-costs-and-currency-requirements.md](../requirements/TR07-costs-and-currency-requirements.md) | `pages/CostsPage.jsx`, `CurrencyRatesPage` (under `#/events/:code/costs/currency`) | costs + currency routes | Built | Pass | PageHeader; CostsHeroRow + CostsByTypeCard; Currency rates header action; currency page Back to costs + base-currency alert |
| 8 | SLICE-09 / TR09 | [TR09-risks-requirements.md](../requirements/TR09-risks-requirements.md) | `pages/RisksPage.jsx`, `RiskNewPage`, `RiskItemPage` | risks register | Built | Pass | PageHeader with Print + Add risk; 5×5 RiskMatrix; status filter tabs; dialog CRUD retained |
| 9 | SLICE-02 / TR02 | [TR02-dashboard-requirements.md](../requirements/TR02-dashboard-requirements.md) | `pages/OverviewPage.jsx` (`EventOverviewPage` — dashboard cards on event overview) | dashboard / home | Built | Pass | AttentionSection always visible with empty state; prototype copy (Logistics to confirm + kind chips); hero/KPI/launchers retained |
| 10 | SLICE-10 / TR10 | [TR10-master-plan-requirements.md](../requirements/TR10-master-plan-requirements.md) | `pages/ItineraryPage.jsx` (`mode=full` / `#/events/:code/itinerary/full`) | master plan / printable view | Built | Pass | `/masterplan` route; Back to itinerary + Print master plan; header KV (dates, base currency); contacts mini-table; journey legs list |

## Prototype vs production routing notes

- Prototype **folds assignments into** planning item page; production **`/assignments`** is dedicated — respect **Implementation delta (pass 2)** in TR04.
- Prototype **master plan** is Itinerary **Full plan** mode; production may use `/masterplan` — respect TR10 delta notes.

## Prototype kit index

Routes: comment block in `pace-prototype/apps/pace-trac/app.jsx`.

Shared shell: `pace-prototype/apps/_pace-core/`.

## Legacy build queue (Evidence)

On **Built**, optionally append a one-line uplift note to [trac-build-queue.md](./trac-build-queue.md) when the slice maps 1:1.

## Validate

From repo root: `npm run validate`. Do not mark **Built** until validate exits 0 after slice uplift.

**Chain complete:** all pass-2 slices Built; full `npm run validate` exit 0 (re-verified after pass-1 re-audit alignment, 2026-06-18).
