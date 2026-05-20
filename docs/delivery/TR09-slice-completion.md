# SLICE-09 — Risks — Completion record

**Authority:** [TR09-risks-requirements.md](../requirements/TR09-risks-requirements.md)  
**Completed (code):** 2026-05-20  
**Quality gate:** `npm run validate` — PASS (6/6)

---

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Manage risks with valid enums; impacts display from generated columns after save | Complete |
| 2 | Client omits `impact_before` / `impact_after` on write | Complete (`toRiskWritePayload`, integration test) |
| 3 | Contact linkage via `responsible_contact_id` (SLICE-06) | Complete (`ResponsibleContactSelect`) |
| 4 | Print action without throw; readable print layout | Complete (`window.print`, `usePaceMain`; manual preview recommended) |
| 5 | RLS enforced for risks page | Complete (`PagePermissionGuard`, `useResourcePermissions('risks')`) |

---

## Rebuild target summary

| Item | Status | Evidence |
|------|--------|----------|
| List/create/edit/delete on `trac_risks` | Complete | `use-risks.ts`, `RisksContent`, `RiskDialog` |
| Writable L/C before/after, mitigations, enums | Complete | `risk-schema.ts`, dev-db enum modules |
| Read-only generated impacts | Complete | `RiskImpactDisplay`, `format-risk-impact.ts` |
| Contact FK | Complete | `ResponsibleContactSelect` |
| Print | Complete | `usePaceMain`, Print button, pace-core print CSS |
| Empty / loading / permission states | Complete | `RisksContent`, `RisksPage` guard |

---

## Routes delivered (SLICE-09 ownership)

| Route | Behaviour |
|-------|-----------|
| `/risks` | `RisksPage` → `PagePermissionGuard` → `RisksContent` |

Registered in [`TRAC_REGISTERED_ROUTE_PATHS`](../../src/app/navigation/trac-nav.ts).

---

## API / contract

| Item | Status |
|------|--------|
| CRUD on `trac_risks` via secure client | Complete |
| Event + organisation scoping on insert | Complete |
| Write payloads omit generated impacts | Complete |
| Reads return generated impacts for display | Complete |
| `tracRisksQueryKey` invalidation on mutation | Complete |

---

## Automated verification

| Check | Result |
|-------|--------|
| `npm run validate` | PASS (6/6) |
| Unit / integration tests | 101 passed (`src/features/risks/**`) |
| pace-core audit | PASS |

### Testing requirements (TR09)

| # | Scenario | Status |
|---|----------|--------|
| 1 | Happy path: create with L/C; generated impact on refetch | Complete (`risks.integration.test.tsx`) |
| 2 | Validation failure: invalid enum rejected | Complete (`risk-schema.test.ts`, integration) |
| 3 | AccessDenied without risks permission | Complete (`risks.integration.test.tsx`) |
| Unit | Impact display formatting | Complete (`format-risk-impact.test.ts`) |

---

## Manual verification (sign-off)

Exercise against **dev-db** with planner role:

- [ ] `/risks` reachable; Risks nav enabled
- [ ] Create risk; `impact_before` / `impact_after` update when L/C changes (read-only in UI)
- [ ] Link responsible contact from SLICE-06 list
- [ ] Print preview hides shell chrome; register readable
- [ ] User without `read:page.risks` sees AccessDenied

---

## SLICE-06 integration

- `ResponsibleContactSelect` for `responsible_contact_id`
- Shared `tracRisksQueryKey` / `tracContactsQueryKey` invalidation contract preserved

---

## Ready for downstream slices

SLICE-09 is **built**. SLICE-10 (Master Plan) may add complementary print surfaces per architecture.
