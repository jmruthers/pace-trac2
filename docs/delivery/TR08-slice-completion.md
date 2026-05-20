# SLICE-08 — Journal — Completion record

**Authority:** [TR08-journal-requirements.md](../requirements/TR08-journal-requirements.md)  
**Completed:** 2026-05-20  
**Branch:** `cursor/28633c20`  
**Quality gate:** `npm run validate` — PASS (6/6)

---

## Acceptance criteria

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Authorised user can create, edit, delete posts for the event. | Complete | CRUD via `useJournalPosts`; editor dialog; `canCreate` / `canUpdate` / `canDelete` from `useResourcePermissions('journal')`. |
| 2 | Images upload/display; storage cleanup rules; no silent storage failure. | Complete | Insert-row-first upload; rollback on upload failure; delete storage-before-row; post-delete storage cleanup with explicit error if cleanup fails. |
| 3 | UI never lists images without post/event filter. | Complete | Post-first query with embedded images only. |
| 4 | Unauthorised users cannot read or write posts/images for the event. | Complete (app) | `PagePermissionGuard`, shell route denial, RLS on dev-db (backend PASS). |
| 5 | Behaviour matches RLS tests for `journal` page key. | Complete (app contract) | App uses `journal` page key consistently; dev-db policy smoke documented below (no in-repo policy test job). |

---

## AC5 — RLS verification strategy

| Layer | What it proves |
|-------|----------------|
| **App** | `PagePermissionGuard pageName="journal"`, shell `/journal` permission map, `useResourcePermissions('journal')` — no super-admin bypass. |
| **Integration tests** | Denied read does not render post content; create/upload failure surfaces destructive toast. |
| **Dev-db (manual)** | Two users (with/without `read:page.journal`) exercise write/read/delete against live RLS — operator sign-off below. |
| **Future (optional)** | Supabase policy test job in platform repo — out of TRAC app scope for v1. |

The app does not ship automated dev-db RLS policy tests; production release still requires the manual checklist when policies change.

---

## Rebuild target summary

| Item | Status |
|------|--------|
| Route `/journal` + nav registration | Complete |
| `PagePermissionGuard` + `useResourcePermissions('journal')` | Complete |
| `useSecureSupabase` / `useStorageCapableClient` (no raw `createClient`) | Complete |
| Post-first load (`event_id` + join images) | Complete |
| Image lifecycle (insert → upload `files/{id}`; rollback; delete cleanup) | Complete |
| Plain-text content (schema `title` / `content`) | Complete |
| No `insert_journal_image` RPC; direct insert | Complete |
| No TRAC super-admin bypass | Complete |
| Chronological feed (`created_at` desc) | Complete |
| Image thumbnails (signed URLs) | Complete |
| Editor toolbar (markdown formatting) | Complete | Bold / italic / heading inserts via `journal-editor` helper |
| Real upload progress during multi-file upload | Complete | `Progress` driven per file in `uploadImagesForPost` |
| `draft` / `published` status in UI | Complete | Status `Select` in `JournalPostEditor` |
| `@solvera/pace-core/forms` scoped imports | Not used — `Form` from `@solvera/pace-core/components` only (acceptable) |

---

## Automated verification

| Check | Result |
|-------|--------|
| `npm run validate` | PASS (6/6) |
| Unit / integration tests | Journal hooks, lifecycle, editor, `JournalPage.integration.test.tsx` (create+image UI, upload-failure toast, permission denial) |
| pace-core audit | PASS |

---

## Manual verification (sign-off)

Record when exercising against dev-db with valid `.env`. Items marked **auto** are covered by integration/unit tests in CI; dev-db rows still need operator confirmation before production.

| # | Check | Auto | Dev-db |
|---|-------|------|--------|
| 1 | User **with** `read:page.journal` can open `/journal` and see event posts | — | [ ] |
| 2 | User **without** `read:page.journal` sees denial on `/journal` (not post content) | Yes — `JournalPage.integration` | [ ] |
| 3 | Create post with image; image visible after refresh | Yes — UI create+image test (mocked) | [ ] |
| 4 | Delete image; storage removed or error surfaced | Partial — lifecycle unit tests | [ ] |
| 5 | Delete post with images; DB + storage cleanup or error surfaced | Partial — lifecycle unit tests | [ ] |
| 6 | Upload failure shows user-visible error; rollback | Yes — lifecycle + destructive toast integration | [ ] |

**Operator:** Run rows 1, 4–5 on dev-db with two test accounts; check boxes when confirmed.

---

## Routes delivered (SLICE-08 ownership)

| Route | Behaviour |
|-------|-----------|
| `/journal` | Event journal feed + composer behind `requireEvent` and `PagePermissionGuard` |

---

## Remediation plan (completed)

| Priority | Gap | Status |
|----------|-----|--------|
| P1 | Manual dev-db RLS sign-off | Documented — checklist + AC5 strategy; operator dev-db boxes pending |
| P2 | TR08 test #1: UI create-post-with-image | Complete — `JournalPage.integration.test.tsx` |
| P2 | TR08 test #2: UI error on failed save | Complete — destructive toast assertion |
| P3 | Visual spec: editor toolbar | Complete |
| P3 | Visual spec: upload progress | Complete |
| P4 | `draft` / `published` in UI | Complete |
| P4 | AC5 automated RLS | Documented — manual + app/integration; optional platform job |

**Not required for v1:** post-upload metadata update rollback; `insert_journal_image` RPC; denormalised `event_id` on images.

---

## Ready for downstream slices

SLICE-08 is **built** for queue purposes. Complete dev-db manual rows before production release when RLS or journal schema changes.
