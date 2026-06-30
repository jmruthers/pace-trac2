# Trac dashboard load performance verification

Baseline captured from dev HAR at `http://localhost:8088/dashboard` before this work (see performance plan).

## Changes applied

### Phase 1 — pace-core RBAC

- `createGetAppIdResolver` caches `data_rbac_apps_list` per user + app name; `getUser` cached per session.
- `ResolvedScopeProvider` resolves org/event/app scope once; wired in pace-trac `AppWithProviders`.
- Secure client skips redundant `set_organisation_context` when scope unchanged (with in-flight coalescing).
- `NavPermissionMapProvider` batches nav permissions via `getPermissionMap`; `NavigationMenu` pre-filters via `filterNavItemsByPermissionMap`.

### Phase 2 — pace-trac dashboard

- Progressive `DashboardContent`: hero and KPIs load independently with section loading states.
- `useDashboardSummary` consolidates dashboard KPI queries into one `Promise.all` with slim column selects.
- Removed duplicate read `PagePermissionGuard` on registry-covered TRAC pages (shell `enforcePermissions` + `routeAccessDenied` via `useShellRouteAccessDenied`).
- `useCostRollupData` reuses cached rollup from dashboard summary when available.

### Phase 3 — bundle

- Event-scoped routes lazy-loaded via `React.lazy` + `Suspense` in `authenticated-routes.tsx`.

### Phase 4 — RBAC + RPC (post HAR `20-35-44`)

**pace-core**

- `useNavPermission` is map-only (no unconditional `useCan`); `PagePermissionGuard` uses `useMapFirstCan` (map hit, otherwise `useCan` fallback).
- `NavPermissionMapProvider` lifted to `PaceAppLayout`; nav items pre-filtered once (no duplicate inline/compact guards).
- `usePermissions` waits for stable scope before `rbac_get_permission_map`; `isPermittedCached` coalesces in-flight checks.
- `useCan` skips RPC while resolved scope is loading.

**pace-trac**

- `data_trac_dashboard_summary` RPC replaces 11 client SELECT fan-out; mapper runs `computeCostRollup` + itinerary model client-side.
- Contacts card reads count from summary RPC (not `useContacts` / resource permissions).
- Header uses single embedded `core_events` + `core_file_references` select.

## How to re-capture HAR

1. Start pace-trac dev server on port 8088.
2. Open DevTools → Network, preserve log, disable cache.
3. Hard reload `/dashboard` with an event selected.
4. Export HAR when KPI cards have finished loading.

## Metrics

| Metric | Baseline (dev HAR) | After phases 1–3 (`20-35-44`) | Phase 4 target |
|--------|-------------------|--------------------------------|----------------|
| `data_rbac_apps_list` POST | 47 | 1 | ≤ 2 |
| `set_organisation_context` | 38 | 6 | ≤ 5 |
| `rbac_check_permission_simplified` | 42+ | 20 | ≤ 8 |
| `rbac_get_permission_map` | 0 | 4 | ≤ 2 |
| `auth/v1/user` | 94 | 1 | — |
| onLoad | ~3.7s | ~713ms | — |
| Time to dashboard header | ~16s | ~4.9s | < 4s after auth context |
| Time to KPI content | ~34s | ~5.7s | < 6s after auth context |
| Dashboard data HTTP | 11+ SELECTs | 11+ SELECTs | 1 RPC + header |

Record post-phase-4 HAR timings in the **After phase 4** column when validating manually.
