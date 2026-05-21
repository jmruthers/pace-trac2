# SLICE-01 QA Pack

## Slice metadata

- slice_id: SLICE-01
- app: trac
- requirement_path: docs/requirements/TR01-platform-shell-requirements.md

## Manual frontend scenarios

| scenario_ref | route_or_screen | steps | expected_result | result | notes |
|---|---|---|---|---|---|
| S-01 · AC1 | `/login` | Sign in with valid TRAC credentials. | Authenticated shell loads with valid session (header/nav visible). | - | - |
| S-02 · AC2 | `/user-dashboard` | While authenticated, open `/user-dashboard`. | Browser lands on `/` without a duplicate dashboard at `/user-dashboard`. | - | - |
| S-03 · AC3 | Protected route (e.g. `/planning`) | Sign out or use a fresh session; open a protected TRAC route directly. | Redirect to `/login` or platform-standard unauthenticated behaviour (not a blank shell). | - | - |
| S-04 · AC4 | NotFound (authenticated shell) | While authenticated, navigate to a non-existent path under the app. | Controlled NotFound UI with navigation back to home/dashboard. | - | - |
| S-05 · AC5 | Authenticated shell | After sign-in, inspect org and event selectors in the shell. | Org and event context controls are present and usable for child routes. | - | Planner role with org/event access |
| S-06 · AC6 | Event-scoped route (e.g. `/planning`) | Clear event selection; open an event-scoped route. | Shared TRAC no-event fallback appears (one consistent pattern). Re-select event and route loads. | - | - |
| S-07 · AC7 | Domain route (e.g. `/contacts`) | Open a domain page that loads event data. | Data loads without auth/client errors indicating a parallel raw privileged client. | - | UI-level check only |
| S-08 · AC8 | Authenticated shell | Navigate across several shell-owned and domain routes. | Shell layout, nav, and outlets render without broken provider state. | - | - |
| S-09 · AC9 | NotFound (authenticated shell) | Use a user without `read:page.dashboard`; open a garbage authenticated path. | NotFound still renders with navigation back (not blocked by dashboard guard). | - | - |
| S-10 · Verification | `/login` | Sign in, refresh the browser on a protected route, then sign out. | Session restores on refresh; logout returns to login or ends session cleanly. | - | - |
| S-11 · Verification | Protected route | While authenticated, deep-link directly to a protected TRAC URL. | Protected content or standard guard/redirect (not raw router error). | - | - |

## Test run summary

- overall result: [Not run]
- failed scenarios: -
- defect links: N/A
- retest needed: [TBD]
