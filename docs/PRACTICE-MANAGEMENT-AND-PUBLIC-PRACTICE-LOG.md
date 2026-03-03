# Practice Management & Public Practice – Deep Read, APIs, and Issues Log

**Document:** Deep read of `app/practice-management`, `lms-public/app/practice`, their APIs, and issue list  
**Date:** February 28, 2025  

---

## Table of Contents

1. [Admin: app/practice-management](#1-admin-apppractice-management)
2. [Public: lms-public/app/practice](#2-public-lmspublicapppractice)
3. [APIs Used](#3-apis-used)
4. [Data Models](#4-data-models)
5. [Issues Identified](#5-issues-identified)
6. [Recommendations](#6-recommendations)

---

## 1. Admin: app/practice-management

### 1.1 Structure

| Path | File | Purpose |
|------|------|---------|
| `/practice-management` | `page.tsx` | **Landing** – three cards linking to level-wise, full-length, previous-years. |
| `/practice-management` | `layout.tsx` | SidebarProvider + AppSidebar + SidebarInset. |
| `/practice-management/level-wise` | `level-wise/page.tsx` | Level-wise practice CRUD (table, add/edit dialogs). |
| `/practice-management/full-length` | `full-length/page.tsx` | Full-length mock CRUD. |
| `/practice-management/previous-years` | `previous-years/page.tsx` | Previous year papers CRUD. |

### 1.2 Sidebar (components/app-sidebar.tsx)

- **Practice Management** (icon: ClipboardList) → `/practice-management`
- **Level Wise** → `/practice-management/level-wise`
- **Full Length** → `/practice-management/full-length`
- **Previous Years Paper** → `/practice-management/previous-years`

### 1.3 Level-wise page (level-wise/page.tsx)

- **Data:** Fetches `GET /api/level-wise-practice` and `GET /api/exams?contextapi=1`.
- **Response handling:** Expects `papersData.papers` or `papersData` as array; sets `papers` and uses for table.
- **Filters:** Search (title, examName), level dropdown (all, 1–7).
- **Stats:** Total, Active, Inactive, Locked.
- **Add dialog:** Exam, Level (1–7), Title, Description, Duration, Marks, Questions, Difficulty, Status. **Does not** show hierarchy dropdowns (Subject, Unit, Chapter, etc.) for level ≥ 2; sends `subjectId`, `unitId`, etc. from form state (all optional in form).
- **Create:** `POST /api/level-wise-practice` with form data (level, examId, subjectId, unitId, chapterId, topicId, subtopicId, definitionId, title, description, durationMinutes, totalMarks, totalQuestions, difficulty, status, locked).
- **Edit:** `PUT /api/level-wise-practice/:id` with same shape.
- **Delete:** `DELETE /api/level-wise-practice/:id`.
- **Breadcrumb:** Home → Practice Management (`href="/practice-management"`) → Level Wise.

### 1.4 Full-length page (full-length/page.tsx)

- **Data:** `GET /api/full-length-mock`, `GET /api/exams?contextapi=1`.
- **Response:** Expects array (no `papers`/`total` wrapper).
- **Filters:** Search only.
- **Stats:** Total Mocks, Active, Inactive, Locked.
- **Add/Edit:** Exam, Title, Description, Duration (default 180), Marks (300), Questions (90), Difficulty, Status, Locked. No level or year.
- **API:** POST/PUT/DELETE `/api/full-length-mock` and `/api/full-length-mock/:id`.
- **Breadcrumb:** Home → Practice Management (`href="/practice-management"`) → Full Length.

### 1.5 Previous-years page (previous-years/page.tsx)

- **Data:** `GET /api/previous-year-paper`, `GET /api/exams?contextapi=1`.
- **Response:** Expects array.
- **Filters:** Search, year dropdown (from unique years in data).
- **Stats:** Total Papers, Active, Inactive, Locked.
- **Add/Edit:** Exam, Title, Year, Session, Description, Duration, Marks, Questions, Difficulty, Status, Locked.
- **API:** POST/PUT/DELETE `/api/previous-year-paper` and `/api/previous-year-paper/:id`.
- **Breadcrumb:** Home → Practice Management (`href="/practice-management"`) → Previous Years.

---

## 2. Public: lms-public/app/practice

### 2.1 Routes (route-based; no tabs)

| Route | File | Purpose |
|-------|------|---------|
| `/practice` | `app/practice/page.tsx` | **Landing page** – three cards linking to separate routes (no tabs). |
| `/practice/tests` | `app/practice/tests/page.tsx` | Practice tests only (level-wise). Grid of cards, load more. Links to `/practice/[slug]`. |
| `/practice/full-length` | `app/practice/full-length/page.tsx` | Full-length mocks only. List of mock cards. Links to `/practice/[slug]`. |
| `/practice/previous-year` | `app/practice/previous-year/page.tsx` | Previous year papers only. Grouped by year + exam. Links to `/practice/[slug]`. |
| `/practice/[slug]` | `app/practice/[slug]/page.tsx` | Paper detail + “Start Test” (or “Coming soon”). Resolves paper via `getPracticePaperBySlug(slug)`. |

**Design:** Tabs were removed. Users open **separate routes** when they click a category (Practice Tests, Full-Length Mock Tests, Previous Year Papers). Each category has its own URL and page.

### 2.2 Data flow

- **Landing (`/practice`):** Static cards with `href` to `/practice/tests`, `/practice/full-length`, `/practice/previous-year`. No API calls.
- **Tests (`/practice/tests`):** `getLevelWisePractices({ status: "Active", page, limit })`; grid + infinite scroll (load more).
- **Full-length (`/practice/full-length`):** `getFullLengthMocks({ status: "Active" })`; list of mock cards.
- **Previous year (`/practice/previous-year`):** `getPreviousYearPapers({ status: "Active" })` + `getExams(true)`; grouped by year and exam, one card per paper.
- **Slug (`/practice/[slug]`):** `getPracticePaperBySlug(slug)` (tries level-wise, then full-length, then previous-year by slug); shows paper details and “Start Test (Coming soon)” or “Back to Practice”.

### 2.3 Shared layout and components

- **PracticeShell** (`components/practice/PracticeShell.tsx`): Wraps sub-pages with Header, ExamCategoriesBar, GradientBg, “← Practice” back link, title/description, and FooterComponent.
- **Cards:** Each sub-route page uses inline card components (or could reuse from PracticePageView) that link to `/practice/${paper.slug}`.

### 2.4 Legacy PracticePageView (components/practice/PracticePageView.tsx)

- **Status:** No longer used by the main practice flow. The landing page does not render tabs or PracticePageView.
- **Sections (for reference):** Performance Analytics (hardcoded), Weekly Growth (hardcoded), tabs, Recommended/All Practice Tests, Full-Length Mocks, Previous Year Papers. Cards linked to `/practice/${paper.slug}` – now served by `app/practice/[slug]/page.tsx`.

### 2.5 Public API client (lms-public/lib/api.ts)

- **getLevelWisePractices:** `GET /api/level-wise-practice?…` → `{ papers, total }`. Returns `{ papers: [], total: 0 }` on error.
- **getFullLengthMocks:** `GET /api/full-length-mock?…` → array. Returns `[]` on error.
- **getPreviousYearPapers:** `GET /api/previous-year-paper?…` → array. Returns `[]` on error.
- **getPracticePaperBySlug(slug):** Tries `GET /api/level-wise-practice/:slug`, `GET /api/full-length-mock/:slug`, `GET /api/previous-year-paper/:slug` in parallel; returns `{ type, paper }` for first OK, or `null`.
- **getExams(contextApi):** Used by previous-year page for exam names.
- **getPracticePapers:** Legacy unified API; not used by current route-based practice pages.

---

## 3. APIs Used

### 3.1 Level-wise practice

| Method | Path | Used by | Response shape |
|--------|------|--------|----------------|
| GET | `/api/level-wise-practice` | Admin level-wise page, Public practice page | `{ papers: [], total: number }`. Query: examId, level, status, page, limit. |
| POST | `/api/level-wise-practice` | Admin level-wise page | Body: examId, level, subjectId?, unitId?, chapterId?, topicId?, subtopicId?, definitionId?, title, description, durationMinutes, totalMarks, totalQuestions, difficulty, status, locked. |
| GET | `/api/level-wise-practice/[param]` | – | Single paper by id/slug. |
| PUT | `/api/level-wise-practice/[param]` | Admin level-wise page | Same body as POST. |
| DELETE | `/api/level-wise-practice/[param]` | Admin level-wise page | – |
| POST | `/api/level-wise-practice/reorder` | – | Batch orderNumber. |

**Model:** `LevelWisePractice` (Mongoose). Populates examId, subjectId, unitId, chapterId, topicId, subtopicId, definitionId for names.

### 3.2 Full-length mock

| Method | Path | Used by | Response shape |
|--------|------|--------|----------------|
| GET | `/api/full-length-mock` | Admin full-length page, Public practice page | **Array** (not `{ papers, total }`). Query: examId, status. |
| POST | `/api/full-length-mock` | Admin full-length page | Body: examId, title, description, durationMinutes, totalMarks, totalQuestions, difficulty, status, locked. |
| GET/PUT/DELETE | `/api/full-length-mock/[param]` | Admin full-length page | – |
| POST | `/api/full-length-mock/reorder` | – | – |

**Model:** `FullLengthMock` (Mongoose).

### 3.3 Previous year paper

| Method | Path | Used by | Response shape |
|--------|------|--------|----------------|
| GET | `/api/previous-year-paper` | Admin previous-years page, Public practice page | **Array**. Query: examId, year, status. |
| POST | `/api/previous-year-paper` | Admin previous-years page | Body includes year, session, … |
| GET/PUT/DELETE | `/api/previous-year-paper/[param]` | Admin previous-years page | – |
| POST | `/api/previous-year-paper/reorder` | – | – |

**Model:** `PreviousYearPaper` (Mongoose). Has `session` field.

### 3.4 Unified practice API (separate stack)

- **Path:** `/api/practice`, `/api/practice/[param]`, `/api/practice/reorder`.
- **Model:** `PracticePaper` with `type: practice | full_length | previous_paper`.
- **Used by:** Legacy/admin path (e.g. `PracticeManagementContent` under different route structure). **Not** used by current admin pages (level-wise, full-length, previous-years) or by public practice page.
- **Note:** Codebase has **two parallel implementations**: (1) LevelWisePractice + FullLengthMock + PreviousYearPaper + separate APIs, (2) PracticePaper + unified /api/practice.

---

## 4. Data Models

| Model | Collection | Used by API |
|-------|------------|-------------|
| **LevelWisePractice** | levelwisepractices | `/api/level-wise-practice` |
| **FullLengthMock** | fulllengthmocks | `/api/full-length-mock` |
| **PreviousYearPaper** | previousyearpapers | `/api/previous-year-paper` |
| **PracticePaper** | practicepapers | `/api/practice` |

Level-wise hierarchy (1–7) and scope IDs (subjectId, unitId, …) exist in **LevelWisePractice** and in **PracticePaper**; full-length and previous-year are separate models for the separate APIs.

---

## 5. Issues Identified

### 5.1 Critical (resolved)

| # | Issue | Location | Status |
|---|--------|----------|--------|
| 1 | **Missing landing page** | `app/practice-management/page.tsx` | **Fixed.** Landing page added; three cards to level-wise, full-length, previous-years. |
| 2 | **Public “Start Test” 404** | `lms-public` | **Fixed.** `app/practice/[slug]/page.tsx` added; uses `getPracticePaperBySlug(slug)`; shows paper detail + “Start Test (Coming soon)”. |

### 5.2 High

| # | Issue | Location | Description |
|---|--------|----------|-------------|
| 3 | **Breadcrumb dead link** | Admin level-wise, full-length, previous-years | **Fixed.** “Practice Management” now uses `href="/practice-management"`. |
| 4 | **Level-wise add form and API** | Admin level-wise page + API | Form does not show Subject/Unit/Chapter/Topic/Subtopic/Definition dropdowns for level ≥ 2. User cannot select scope; optional IDs are sent as empty. API may require them for level ≥ 2 (needs validation on POST). |
| 5 | **getFullLengthMocks response shape** | lms-public/lib/api.ts | API returns a **plain array**. Client uses it as array; if API ever returns `{ list }` or `{ papers }`, client would break. Currently consistent. |

### 5.3 Medium

| # | Issue | Location | Description |
|---|--------|----------|-------------|
| 6 | **Hardcoded analytics copy** | PracticePageView.tsx | “Performance Analytics”, “NEET 2024”, “642/720”, “#1,240”, “92%”, “48 tests”, “Weekly Growth +18.5%” are hardcoded. Should come from props or real analytics. |
| 7 | **Two practice data stacks** | Repo-wide | (1) LevelWisePractice + FullLengthMock + PreviousYearPaper + `/api/level-wise-practice`, `/api/full-length-mock`, `/api/previous-year-paper`. (2) PracticePaper + `/api/practice`. Risk of confusion and duplicate features; admin and public use (1). |
| 8 | **Full-length GET returns array** | Public practice page | Code does `Array.isArray(res) ? res : []` and `res.length` for total. No `total` from API; “total” is derived from array length. Pagination for full-length not supported by API. |

### 5.4 Low

| # | Issue | Location | Description |
|---|--------|----------|-------------|
| 9 | **Floating buttons** | PracticePageView.tsx | “Ask AI Tutor”, “Take Notes”, “Flashcards” have no handlers. |
| 10 | **CORS on practice APIs** | level-wise-practice, full-length-mock, previous-year-paper | All send `Access-Control-Allow-Origin: *`. Acceptable for public client; ensure intentional for production. |

---

## 6. Recommendations

### Done

| # | Recommendation | Status |
|---|----------------|--------|
| 1 | **Add `app/practice-management/page.tsx`** – Landing with three cards (Level Wise, Full Length, Previous Years) linking to sub-routes. | **Done.** Landing exists; breadcrumb “Practice Management” points to `/practice-management`. |
| 2 | **Fix breadcrumbs** – In level-wise, full-length, previous-years pages, set Practice Management to `href="/practice-management"`. | **Done.** |
| 3 | **Public practice: route-based UI (no tabs)** – Replace tabbed `/practice` with a landing and **separate routes** so clicking a category opens that route. | **Done.** Landing at `/practice` with three cards → `/practice/tests`, `/practice/full-length`, `/practice/previous-year`. |
| 4 | **Add `lms-public/app/practice/[slug]/page.tsx`** – Paper detail + “Start Test” so `/practice/:slug` does not 404. | **Done.** Uses `getPracticePaperBySlug(slug)`; shows paper details and “Start Test (Coming soon)” + “Back to Practice”. |
| 5 | **Add `getPracticePaperBySlug(slug)` in lms-public** – Resolve paper by slug across level-wise, full-length, previous-year. | **Done.** In `lib/api.ts`; tries three GETs in parallel, returns `{ type, paper }` or `null`. |

### Remaining

| # | Recommendation | Notes |
|---|----------------|--------|
| 6 | **Level-wise admin: scope selection** | For level ≥ 2, show hierarchy dropdowns (Subject → Unit → Chapter → Topic → Subtopic → Definition) and validate required scope in client and `POST /api/level-wise-practice`. |
| 7 | **Unify or document practice data** | Either migrate to single stack or document that admin + public use LevelWisePractice, FullLengthMock, PreviousYearPaper (separate APIs); `/api/practice` is legacy. |
| 8 | **Public analytics** | Replace hardcoded “Performance Analytics” and “Weekly Growth” in PracticePageView with real data or remove until backend is ready. (PracticePageView is not used by current route-based flow.) |
| 9 | **Optional: pagination for full-length** | Add `page`/`limit` to `GET /api/full-length-mock` and return `{ papers, total }` if list can be large. |
| 10 | **Wire “Start Test”** | `/practice/[slug]` currently shows “Start Test (Coming soon)”. When exam/attempt flow exists, link to the actual test route. |

---

*End of log. Use this document to track fixes and alignment between admin practice-management, public practice, and APIs.*
