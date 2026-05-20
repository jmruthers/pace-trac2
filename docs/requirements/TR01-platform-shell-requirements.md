# SLICE-01 — Platform shell — Requirements

**Document status:** Draft — rebuild implementation contract.  
**Companion authority:** `trac-project-brief.md`, `trac-architecture.md`.

---

## Orchestration metadata (canonical)

Reinforces `trac-architecture.md` — do not drift without updating architecture first.

| Field | Value |
|--------|--------|
| **Slice ID** | SLICE-01 |
| **Name** | Platform shell |
| **Bounded context** | Platform shell |
| **Owning routes** | `/login`, `/user-dashboard` (redirect to `/`), `*` (NotFound within authenticated shell) |
| **Depends on** | — (foundation slice) |
| **Blocks** | All other slices (SLICE-02…10) |
| **Implementation order** | 1 of 10 |
| **High-risk** | Yes — pace-core2 bootstrap, auth, RBAC, provider assumptions vs legacy |
| **Cross-cutting** | Router, app layout, TRAC app id + RBAC wiring, org/event providers |

---

## Overview

Establish the TRAC client on **pace-core2**: Vite + React entry, authentication, organisation and event context, protected routing, primary navigation shell (structure only — nav labels/links completed as routes land), and deterministic handling of unknown routes. This slice delivers the **platform spine** so domain slices mount under a single authenticated layout without re-solving auth or provider topology.

---

## Rebuild target

- **Dependency:** `@solvera/pace-core` (pace-core2 monorepo), not legacy `@solvera/pace-core`.
- **Auth:** pace-core2 **`UnifiedAuthProvider`** with session restoration and inactivity wiring per the current pace-core2 shell pattern.
- **Redirect:** `/user-dashboard` redirects to **`/`** (**TRAC** authenticated home), matching architecture IA v1.
- **Protected shell:** Authenticated routes render inside the pace-core2 app shell with org/event selection gating as required by platform patterns.
- **Routing pattern:** Use pace-core2 **`ProtectedRoute`** for authenticated route trees, and use **`ProtectedRoute requireEvent`** for event-scoped routes so TRAC has one consistent no-event fallback instead of page-by-page variations.
- **Navigation:** Primary nav order is defined in architecture (Planning → Assignments → Itinerary → …); this slice provides the **shell** and route outlets; individual nav items may be feature-flagged or hidden until their slice ships, but **routes must not duplicate ownership**.
- **NotFound:** Authenticated `*` route shows a controlled NotFound UI inside the shell (not a blank screen), with navigation back to `/`; it is **shell-owned** and must not depend on dashboard-specific page guards to remain reachable.
- **RBAC setup:** Call **`setupRBAC`** once at app startup for the TRAC app id; page guards and secure data access then use the same configured client boundary.
- **Standard RBAC contract only:** Use pace-core2 **`ProtectedRoute`**, **`ProtectedRoute requireEvent`**, **`PagePermissionGuard`**, navigation permission wiring, and secure-client data access as documented in pace-core2 RBAC guidance. Do **not** introduce TRAC-specific page-local permission bypasses or custom no-event fallbacks.
- **Prerequisites:** Required TRAC page registration / permission seeding in **`rbac_app_pages`** is a **pre-build prerequisite on dev-db**; this slice names the target guards and page names but does **not** assign seeding work to implementation agents.
- **No domain data:** This slice does not implement planning, assignments, or other domain CRUD — only the shell and routing contracts.

---

## pace-core2 shell contract

| Area | Current pace-core2 contract |
|------|---------------------------|
| App bootstrap | `setupRBAC(...)` called once before render; shell bootstraps through `QueryClientProvider` → `BrowserRouter` → `UnifiedAuthProvider` → session restoration loader → app/providers |
| Provider stack | `InactivityServiceProvider` wraps app content; org/event context comes from `OrganisationServiceProvider` and `EventServiceProvider` inside auth context |
| Protected routing | Use `ProtectedRoute` for authenticated routes and `ProtectedRoute requireEvent` for event-scoped routes |
| App shell | Use pace-core2 shell/layout primitives (for example `PaceAppLayout`) and keep logo/home navigation aligned to `/` |
| Secure data access | Domain slices use `useSecureSupabase()` (or approved successor secure hook) rather than raw clients |
| Types | Regenerate from dev-db via pace-core2 `db:gen-types` when schema changes |

---

## pace-core2 imports (current reference pattern — confirm exact package version at implementation)

| Need | Import path | Notes |
|------|-------------|--------|
| Auth facade | `@solvera/pace-core` | `UnifiedAuthProvider`, `useUnifiedAuthContext` |
| Org / event context | `@solvera/pace-core/providers` | `OrganisationServiceProvider`, `EventServiceProvider`, `InactivityServiceProvider` |
| Protected routing / shell UI | `@solvera/pace-core/components` | `ProtectedRoute`, login/shell/loading components as applicable |
| RBAC guards / setup | `@solvera/pace-core/rbac` | `setupRBAC`, `PagePermissionGuard`, `NavigationGuard`, `AccessDenied`, `useSecureSupabase` |
| Theming / tokens | `@solvera/pace-core/theming` | App theme attachment if required by shell |

*This slice follows the current pace-core2 shell contract; implementers verify exact symbols against the installed `@solvera/pace-core` package version.*

---

## Data and schema references

| Source | Use |
|--------|-----|
| **`trac-architecture.md`** | TRAC app id, RBAC model, `rbac_app_pages` page keys, pre-build prerequisites |
| **Supabase MCP (dev-db only)** | Confirm `rbac_app_pages`, app registration, permission function behaviour, and schema-sensitive columns |

This slice does not own `trac_*` domain tables but **must** load RBAC/page metadata needed for guards.

---

## Acceptance criteria

1. User can complete sign-in at `/login` and reach the authenticated shell with valid session.
2. `/user-dashboard` **redirects** to `/` (or equivalent home) without rendering a duplicate dashboard at that path unless explicitly routed (dashboard is SLICE-02 on `/` and `/dashboard` per architecture — clarify redirect target is **`/`** which owns dashboard in IA).
3. Unauthenticated access to protected routes redirects to login (or platform-standard behaviour).
4. Unknown paths under the authenticated app show **NotFound** (`*`) with accessible navigation back.
5. Org and event context are available to child routes via pace-core2 providers (or documented successor API).
6. Event-scoped routes use pace-core2 **`ProtectedRoute requireEvent`** (or documented successor API) with one approved TRAC no-event fallback.
7. RBAC secure client is configured once; domain slices use the same pattern (no parallel raw clients for privileged operations).
8. Shell renders without requiring domain slices to patch provider internals.
9. Authenticated NotFound remains reachable without requiring **`read:page.dashboard`**.

---

## API / Contract

| Boundary | Contract |
|----------|----------|
| **Auth** | Session establishment and teardown per pace-core2; no secrets in client bundle |
| **RBAC** | `check_rbac_permission_with_context`-style enforcement on server; client uses guards aligned to page keys in dev-db |
| **Routing** | React Router (or pace-core2 wrapper): public `/login`; protected layout wraps all TRAC feature routes owned by SLICE-02…10; event-scoped routes use pace-core2 `ProtectedRoute requireEvent` |
| **TRAC app** | Single TRAC application id in RBAC; page keys must match brief + dev-db |

No Edge Function requirement for this slice unless login flow depends on platform-wide functions (document if so when implementing).

---

## Visual specification

- **Layout:** pace-core2 app shell — header/region for org/event selectors, primary nav strip, main content outlet, consistent spacing and typography per `@solvera/pace-core` / `theming`.
- **Login:** Dedicated screen using platform login components; clear error and loading states.
- **NotFound:** Friendly message, link to dashboard/home; avoid raw router errors.
- **Access denied:** Use `AccessDenied` (or successor) from RBAC module where guards fail.
- **No-event handling:** Shared route-level fallback only; feature pages must not render their own competing no-event prompts once mounted behind `ProtectedRoute requireEvent`.

---

## Verification

- Manual: login, refresh, deep-link to protected route, logout.
- Confirm `/user-dashboard` redirect target matches IA.
- Confirm event-scoped routes use one consistent no-event fallback.
- Confirm NotFound for garbage path.
- **Dev-db:** RBAC page rows exist for TRAC for pages referenced by guards in this slice (e.g. dashboard read if guard wraps home).

---

## Testing requirements

| # | Scenario | Type |
|---|----------|------|
| 1 | **Happy path:** User with valid credentials signs in and lands in authenticated shell with context loaded | Integration / E2E (mock or test project) |
| 2 | **Validation failure:** Invalid credentials or missing fields show non-crashing error (no unhandled rejection) | Integration |
| 3 | **Auth / permission failure:** User without TRAC/event access hits protected route → redirect or `AccessDenied`, not silent blank | Integration |

Plus: unit tests for any pure route-config or redirect helpers (no Supabase in unit tests).

---

## Open questions

*(None blocking — confirm page key strings for TRAC against dev-db during implementation.)*

---

## Do not

- Do not ship **`@solvera/pace-core`** as the declared dependency for new work.
- Do not use **production** DB for RBAC or page key verification.
- Do not implement domain CRUD in this slice.
- Do not add routes owned by other slices without updating `trac-architecture.md`.

---

## References

| Document | Role |
|----------|------|
| `trac-architecture.md` | IA v1, route ownership, high-risk notes, testing expectations, RBAC page keys |
| `trac-project-brief.md` | Authority model, exclusions, quality gates |
