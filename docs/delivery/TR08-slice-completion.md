# SLICE-08 — Journal — Completion record

**Authority:** [TR08-journal-requirements.md](../requirements/TR08-journal-requirements.md)  
**Completed:** 2026-05-20  
**Branch:** `cursor/28633c20` (commit `ed2086d`)  
**Quality gate:** `npm run validate` — PASS (6/6)

---

## Acceptance criteria

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Authorised user can create, edit, delete posts for the event. | Complete | CRUD via `useJournalPosts`; editor dialog; `canCreate` / `canUpdate` / `canDelete` from `useResourcePermissions('journal')`. |
| 2 | Images upload/display; storage cleanup rules; no silent storage failure. | Complete | Insert-row-first upload; rollback on upload failure; delete storage-before-row; post-delete storage cleanup with explicit error if cleanup fails. |
| 3 | UI never lists images without post/event filter. | Complete | Post-first query with embedded images only. |
| 4 | Unauthorised users cannot read or write posts/images for the event. | Complete (app) | `PagePermissionGuard`, shell route denial, RLS on dev-db (backend PASS). Manual sign-off pending. |
| 5 | Behaviour matches RLS tests for `journal` page key. | Partial | App contract satisfied; automated dev-db RLS tests not in repo (manual verification). |

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
| Editor toolbar (markdown formatting) | **Gap** — see remediation |
| Real upload progress during multi-file upload | **Gap** — stub `Progress` at 10% only |
| `draft` / `published` status in UI | **Gap** — always `published` (schema supports both) |
| `@solvera/pace-core/forms` scoped imports | Not used — `Form` from `@solvera/pace-core/components` only (acceptable) |

---

## Automated verification

| Check | Result |
|-------|--------|
| `npm run validate` | PASS (6/6) |
| Unit / integration tests | 55 passed (`journal-*`, `JournalPage.integration.test.tsx`, nav permissions) |
| pace-core audit | PASS |

---

## Manual verification (sign-off)

Record when exercising against dev-db with valid `.env`:

- [ ] User **with** `read:page.journal` can open `/journal` and see event posts
- [ ] User **without** `read:page.journal` sees shell `AccessDenied` on `/journal` (not post content)
- [ ] Create post with image; image visible after refresh
- [ ] Delete image; storage object removed (or error surfaced if storage fails)
- [ ] Delete post with images; DB rows gone and storage objects removed (or incomplete-cleanup error surfaced)
- [ ] Upload failure shows user-visible error; no orphan storage object without row (or rollback error documented)

---

## Routes delivered (SLICE-08 ownership)

| Route | Behaviour |
|-------|-----------|
| `/journal` | Event journal feed + composer behind `requireEvent` and `PagePermissionGuard` |

---

## Remediation plan (non-blocking for slice sign-off)

Prioritised gaps between requirements **visual spec** / **testing** and current implementation:

| Priority | Gap | Remediation |
|----------|-----|-------------|
| P1 | Manual dev-db RLS sign-off not recorded | Run checklist above with two test users (with/without journal permission); record results in this file. |
| P2 | TR08 test #1: no full UI integration for create-post-with-image | Add `JournalPage.integration.test.tsx` case: open editor, fill fields, attach file, save, assert new post in feed (mocked Supabase insert + upload). |
| P2 | TR08 test #2: UI-visible error on failed save not asserted | Extend integration test: mock upload failure on create, assert destructive toast or inline error text in page. |
| P3 | Visual spec: editor **toolbar** (formatting) | Add lightweight toolbar on `JournalPostEditor` content field (insert markdown markers into `Textarea`); no new dependencies required. |
| P3 | Visual spec: **upload progress** during uploads | Drive `Progress` from `uploadImagesForPost` (per-file increments or indeterminate while `isMutating`). |
| P4 | Schema: `journal_post_status` (`draft` / `published`) | Add optional status control in editor if product wants draft workflow; default can remain `published`. |
| P4 | AC5 automated RLS tests | Document reliance on platform RLS + manual smoke; optional future Supabase policy test job (out of app repo scope). |

**Not required for v1:** post-upload metadata update rollback (no metadata update step after upload in current schema); `insert_journal_image` RPC; denormalised `event_id` on images.

---

## Ready for downstream slices

SLICE-08 is **built** for queue purposes. Complete P1 manual sign-off before production release. P2–P3 items improve spec fidelity and test coverage without blocking merge of core journal functionality.
