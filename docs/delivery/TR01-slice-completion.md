# SLICE-01 — Platform shell — Completion record

**Authority:** [TR01-platform-shell-requirements.md](../requirements/TR01-platform-shell-requirements.md)  
**Completed:** 2026-05-20  
**Quality gate:** `npm run validate` — PASS (6/6)

---

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Sign-in at `/login` → authenticated shell | Complete |
| 2 | `/user-dashboard` redirects to `/` | Complete |
| 3 | Unauthenticated access → login | Complete |
| 4 | Unknown paths → NotFound with home navigation | Complete |
| 5 | Org/event context via pace-core2 providers | Complete |
| 6 | `ProtectedRoute requireEvent` + one no-event fallback | Complete |
| 7 | RBAC configured once; secure client pattern documented | Complete |
| 8 | Shell without domain slice provider patches | Complete |
| 9 | NotFound without `read:page.dashboard` | Complete |

---

## Rebuild target summary

| Item | Status |
|------|--------|
| pace-core2 `@solvera/pace-core` dependency | Complete |
| Provider stack (auth, inactivity, org, event) | Complete |
| Protected routing + event gating | Complete |
| Nav IA defined; links enabled as routes register | Complete |
| Navigation permission scaffold (`permissions`, `routePermissions`, `enforcePermissions`) | Complete |
| No domain CRUD | Complete |

---

## Automated verification

| Check | Result |
|-------|--------|
| `npm run validate` | PASS |
| Unit / integration tests | 15+ passed (see `src/**/*.test.ts(x)`) |
| pace-core audit | PASS |

---

## Manual verification (sign-off)

Record results when exercising against dev-db with valid `.env`:

- [ ] Login at `/login` reaches authenticated shell
- [ ] Session survives refresh on protected route
- [ ] Deep-link to protected route while logged out redirects to `/login`
- [ ] Logout returns to unauthenticated state
- [ ] `/user-dashboard` redirects to `/`
- [ ] Without selected event, home shows shared no-event fallback
- [ ] Garbage path (e.g. `/not-a-real-page`) shows NotFound inside shell with home action
- [ ] Dev-db TRAC `rbac_app_pages` prerequisite confirmed (see [trac-backend-ready-report.md](./trac-backend-ready-report.md))

---

## Routes delivered (SLICE-01 ownership)

| Route | Behaviour |
|-------|-----------|
| `/login` | `PaceLoginPage` |
| `/user-dashboard` | Redirect to `/` |
| `/` | Placeholder home (`ShellHomePage`) behind `requireEvent` |
| `*` | `NotFoundPage` (sibling to event gate; no dashboard guard) |

Domain routes (`/planning`, `/dashboard`, etc.) are owned by SLICE-02–10.

---

## Ready for downstream slices

SLICE-01 is **complete**. SLICE-02+ may mount routes under [`authenticated-routes.tsx`](../../src/app/routes/authenticated-routes.tsx), extend [`SLICE_01_REGISTERED_ROUTE_PATHS`](../../src/app/navigation/trac-nav.ts), and use `useSecureSupabase()` per [`supabase.ts`](../../src/lib/supabase.ts).

---

## Follow-up (non-blocking)

| Item | Owner |
|------|--------|
| CI workflow needs `pace-core2` sibling or published package for `file:../pace-core2/packages/core` | Ops |
| Replace `ShellHomePage` with dashboard (SLICE-02) | SLICE-02 |
| Enable primary nav links as slice routes land | SLICE-03–10 |
