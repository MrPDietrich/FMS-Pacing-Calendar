# Project Architecture & Maintenance Handoff

This file documents the critical architecture invariants, Firestore schema/rules constraints, and safe-update guidelines for the **2026–2027 Pacing Calendar & Essential Standards Tracker** so future updates preserve all live teacher data.

## 1. Live Database & Non-Destructive Updates
- **Firebase Config**: `firebase-applet-config.json` binds the app to its provisioned Cloud Firestore database (`firestoreDatabaseId`) and Google Auth project. Never re-provision a new database or overwrite `firebase-applet-config.json` once teachers have started entering data.
- **Non-Destructive Seeding (`src/services/pacingService.ts`)**: `seedInitialDataIfNeeded` only seeds sample standards for calendars in `newlySeededCalIds` (calendars that did not yet exist in Firestore). Existing calendars—including any where staff cleared or replaced standards—are never overwritten on reload.

## 2. Firestore Data Model & Security Rule Invariants (`firestore.rules` + `firebase-blueprint.json`)
- **Collections (all scoped by `schoolYear: "2026-2027"`)**:
  - `calendars/{calendarId}`: `id`, `name`, `category`, `isScience`, `order`, `schoolYear`, `createdByUid`, `updatedBy`, `updatedAt`.
  - `standards/{standardId}`: `calendarId`, `code`, `description`, `gradeLevel`, `domain`, `type` (`essential | supporting | prerequisite | unassigned`), `ngssModel` (`integrated | discipline-specific | both | none`), `schoolYear`, `updatedBy`, `updatedByUid`, `updatedAt`.
  - `entries/{calendarId}__{YYYY-MM-DD}`: `calendarId`, `date`, `topic`, `notes`, optional `dayTag` (max 32 chars), `standardIds` (max 30 IDs), `schoolYear`, `updatedBy`, `updatedByUid`, `updatedAt`.
  - `admins/{uid}`: Explicit admin role grants (`uid`, `email`, `grantedBy`, `createdAt`), alongside `BOOTSTRAP_ADMIN_EMAIL` (`pdietrich@gonzales.k12.ca.us`).
- **Critical Rules Constraints (DO NOT BREAK ON FUTURE EDITS)**:
  1. **Backward-Compatible Schema Additions**: Any new field added to `entries`, `standards`, or `calendars` must be **optional** in both TypeScript and `firestore.rules` (add to `keys().hasOnly([...])` and `affectedKeys().hasOnly([...])`, guard with `!('field' in data) || ...`, and do **not** add to `keys().hasAll([...])`) so older teacher documents continue to load and save cleanly.
  2. **Scoped `list` Queries**: `allow list` enforces `resource.data.schoolYear == '2026-2027'`. Every client collection query on `calendars`, `standards`, and `entries` must include `where('schoolYear', '==', SCHOOL_YEAR)`.
  3. **20-Lookup Batch Limit**: `standards` and `entries` creation rules call `exists(/databases/$(database)/documents/calendars/$(incoming().calendarId))`. Firestore caps `get()`/`exists()` calls at **20 per batched write**, so all batched `create`/`set` writes (`seedInitialDataIfNeeded`, `bulkImportStandards`, `applyEntryToDateRange`) **must** remain chunked at `<= 15` documents per batch.
  4. **Deterministic Entry IDs**: `entries` document IDs must strictly follow `${calendarId}__${YYYY-MM-DD}` (`entryId == (data.calendarId + '__' + data.date)`).
  5. **Rule Validation & Deployment**: Whenever editing `firestore.rules`, keep `firebase-blueprint.json` in sync, run `npx eslint firestore.rules`, and deploy updated rules via `DeployRules`.

## 3. District Domain Lock (`ALLOWED_DOMAIN`)
- Locked to **`gonzales.k12.ca.us`** (`@gonzales.k12.ca.us` verified Google accounts only).
- Enforced in both:
  1. `ALLOWED_DOMAIN` in `src/config/authConfig.ts` (and Google OAuth `hd` hint in `src/lib/firebase.ts`)
  2. `allowedDomain()` in `firestore.rules` (deployed)

## 4. Implemented Feature Map
- **Landing Directory (`src/components/LandingDirectoryView.tsx`)**: Color-coded department cards (`6th Grade Core`, `7th Grade Core`, `8th Grade Core`, `VAPA`, `PE`, `SDC`) with course search and quick links to Calendar, Standards Triage, and Coverage.
- **Monthly Calendar (`src/components/CalendarView.tsx`, `src/components/DayTagBadge.tsx`)**: Mon–Fri grid (with optional weekend toggle), Aug 2026–Jun 2027 selector, landscape PLC Print/Export, and full-cell color coding + top stripe for day tags (`Flex Day`, `Activity`, `Reteach`, `Review`, `CFA`, `PM*`, `BM*`, `CA`).
- **Day Editor (`src/components/DayEditorDrawer.tsx`)**: Topic, notes, day type/assessment selector (including editable `PM1–4` / `BM1–4` labels), searchable standard tagging, multi-day date range apply, and last-updated attribution.
- **Standards Triage & Bulk Import (`src/components/StandardsTriageView.tsx`, `src/components/BulkImportModal.tsx`)**: Domain/grade/classification filters, CA NGSS model toggle (`Preferred Integrated`, `Discipline-Specific`, `All NGSS`) on Science calendars, 1-click 4-way classification buttons, single add/edit/delete, **Clear All Standards for This Calendar** with confirmation modal, and JSON/CSV Bulk Import with **Append** vs **Replace Existing Standards** modes.
- **Coverage Summary & Settings (`src/components/CoverageSummaryView.tsx`, `src/components/SettingsView.tsx`)**: Year-long tagged day counts highlighting 0-day Essential pacing gaps, plus admin `+ Add Calendar` and admin role management.
