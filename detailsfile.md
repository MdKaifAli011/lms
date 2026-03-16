# LMS Codebase – Detailed Technical Reference

This document describes the **LMS (Learning Management System)** codebase: project structure, APIs, Mongoose models, cascading deletes/updates, database connection, and how the public app connects to the backend.

---

## 1. Project Structure

The repository contains **two Next.js applications**:

| Area | Path | Purpose |
|------|------|---------|
| **Admin / Backend** | Root (`app/`, `api/`, `models/`, `lib/`, `components/`) | Next.js App Router app that serves all API routes and admin UI (practice management, syllabus, self-study, etc.). |
| **Public frontend** | `lms-public/` | Separate Next.js app for candidates: exams, syllabus, mock tests, practice, materials. Consumes the backend API via `NEXT_PUBLIC_API_URL`. |

### Top-level folders (root)

| Folder / file | Contents |
|---------------|----------|
| **app/** | Next.js App Router: `api/` (all REST API routes), `dashboard/`, `practice-management/` (full-length, level-wise, previous-year), `self-study/`, `syllabus-management/`, `study-materials/`, etc. |
| **models/** | Mongoose schemas (Exam, Subject, Unit, Chapter, Topic, Subtopic, Definition, LevelWisePractice, LevelWiseQuestion, FullLengthMock, FullLengthMockQuestion, PreviousYearPaper, PracticePaper, FormulaToolkit, BlockedIp, MockSection, MockQuestion; MockSubject is a stub). |
| **lib/** | `db.ts` (MongoDB connection), `slugify.ts`, `titleCase.ts`, `visit-block.ts` (IP blocking for visit counts), other utilities. |
| **components/** | Shared React components: app sidebar, breadcrumbs, rich-text editor, syllabus trees, UI primitives. |
| **lms-public/** | Second Next.js app: `app/` (exam, practice, mock-tests, materials), `lib/api.ts` (API client), `components/`. |
| **editor/** | Lexical-based rich text editor (nodes, plugins, commenting). |
| **config.ts** | App config: `mongodbUri`, `databaseName`, `nodeEnv` (from env). |

---

## 2. Configuration & Database Connection

### Environment variables (config)

- **MONGODB_URI** – MongoDB connection URI (default: `mongodb://localhost:27017/mylmsdoors`).
- **MONGODB_DATABASE** – Database name (default: `mylmsdoors`).
- **NODE_ENV** – `development` / `production` (default: `development`).

Defined in `config.ts` via `getEnvOptional()`.

### MongoDB connection (`lib/db.ts`)

- **Function:** `connectDB()` – idempotent, no-op if already connected.
- **Mechanism:** `mongoose.connect(MONGODB_URI, { dbName: DATABASE_NAME })`.
- **Caching:** Connection is stored on `global.mongoose` (`conn`, `promise`) to avoid multiple connections in development (e.g. hot reload).
- **Usage:** Every API route that touches the database calls `await connectDB()` at the start.

---

## 3. API Routes (Main App – `app/api/`)

All routes use **connectDB()** before any DB access. Param-based routes accept either **MongoDB ObjectId (24-char hex)** or **slug** unless noted.

### 3.1 Exams

| Path | File | Methods | Models | Description |
|------|------|--------|--------|-------------|
| `/api/exams` | `app/api/exams/route.ts` | GET, POST, OPTIONS | Exam | List exams (optional `?contextapi=1`); create exam. |
| `/api/exams/[param]` | `app/api/exams/[param]/route.ts` | GET, PUT, PATCH, DELETE | Exam, Subject | Get/update/patch/delete by slug or id. **DELETE:** cascades to subjects only (see Cascading). PUT/PATCH require valid MongoDB id. |
| `/api/exams/[param]/visit` | `app/api/exams/[param]/visit/route.ts` | POST | Exam | Increment visit count (uses `visit-block`: blocked IPs do not count). |
| `/api/exams/[param]/meta` | `app/api/exams/[param]/meta/route.ts` | GET | Exam | Return SEO/meta fields only. |
| `/api/exams/reorder` | `app/api/exams/reorder/route.ts` | POST | Exam | Batch update `orderNumber`. |

### 3.2 Syllabus hierarchy (Exam → Subject → Unit → Chapter → Topic → Subtopic → Definition)

| Path | File | Methods | Models | Description |
|------|------|--------|--------|-------------|
| `/api/subjects` | `app/api/subjects/route.ts` | GET, POST | Subject | List/create subjects. |
| `/api/subjects/[param]` | `app/api/subjects/[param]/route.ts` | GET, PUT, PATCH, DELETE | Subject, Unit | Get/update/patch/delete. **DELETE:** cascades to units. |
| `/api/subjects/[param]/visit` | `app/api/subjects/[param]/visit/route.ts` | POST | Subject | Increment visit count. |
| `/api/subjects/[param]/meta` | `app/api/subjects/[param]/meta/route.ts` | GET | Subject | Meta only. |
| `/api/subjects/reorder` | `app/api/subjects/reorder/route.ts` | POST | Subject | Batch reorder. |
| `/api/units` | `app/api/units/route.ts` | GET, POST | Unit | List/create units. |
| `/api/units/[param]` | `app/api/units/[param]/route.ts` | GET, PUT, PATCH, DELETE | Unit, Chapter | Get/update/patch/delete. **DELETE:** cascades to chapters. |
| `/api/units/[param]/visit`, `meta`, `reorder` | … | POST / GET / POST | Unit | Visit, meta, reorder. |
| `/api/chapters` … `/api/chapters/[param]` | … | GET, POST / GET, PUT, PATCH, DELETE | Chapter, Topic | Same pattern. **DELETE:** cascades to topics. |
| `/api/topics` … `/api/topics/[param]` | … | … | Topic, Subtopic | **DELETE:** cascades to subtopics. |
| `/api/subtopics` … `/api/subtopics/[param]` | … | … | Subtopic, Definition | **DELETE:** cascades to definitions. |
| `/api/definitions` … `/api/definitions/[param]` | … | … | Definition | **DELETE:** no cascade (leaf node). |
| `/api/sidebar-tree` | `app/api/sidebar-tree/route.ts` | GET | Exam, Subject, Unit, Chapter, Topic | Full hierarchy for sidebar by `examId` (no weightage/marks). |
| `/api/syllabus-hierarchy` | `app/api/syllabus-hierarchy/route.ts` | GET | Exam … Definition | Full 7-level syllabus tree with weightage/marks by `examId`. |

### 3.3 Blocked IPs (visit analytics)

| Path | File | Methods | Models | Description |
|------|------|--------|--------|-------------|
| `/api/blocked-ips` | `app/api/blocked-ips/route.ts` | GET, POST | BlockedIp | List blocked IPs; add blocked IP. |
| `/api/blocked-ips/[id]` | `app/api/blocked-ips/[id]/route.ts` | DELETE | BlockedIp | Delete blocked IP by id. |

### 3.4 Practice & mocks

| Path | File | Methods | Models | Description |
|------|------|--------|--------|-------------|
| `/api/practice` | `app/api/practice/route.ts` | GET, POST | PracticePaper, Exam, … | List/create legacy practice papers (aggregated). |
| `/api/practice/[param]` | `app/api/practice/[param]/route.ts` | GET, PUT, DELETE | PracticePaper | Get/update/delete by slug or id. No cascade. |
| `/api/practice/reorder` | `app/api/practice/reorder/route.ts` | POST | PracticePaper | Batch reorder. |
| `/api/level-wise-practice` | `app/api/level-wise-practice/route.ts` | GET, POST, PATCH, OPTIONS | LevelWisePractice | List/create; PATCH with `cleanNullHierarchy: true` cleans null hierarchy keys. |
| `/api/level-wise-practice/[param]` | `app/api/level-wise-practice/[param]/route.ts` | GET, PUT, DELETE | LevelWisePractice, LevelWiseQuestion | Get/update/delete. **DELETE:** cascades to LevelWiseQuestion. |
| `/api/level-wise-practice/[param]/questions` | `app/api/level-wise-practice/[param]/questions/route.ts` | GET, POST | LevelWisePractice, LevelWiseQuestion | List/create questions. |
| `/api/level-wise-practice/[param]/questions/[questionId]` | `app/api/level-wise-practice/[param]/questions/[questionId]/route.ts` | GET, PUT, DELETE | LevelWiseQuestion | Get/update/delete one question. |
| `/api/level-wise-practice/[param]/questions/reorder` | … | POST | LevelWiseQuestion | Batch reorder questions. |
| `/api/level-wise-practice/reorder` | `app/api/level-wise-practice/reorder/route.ts` | POST | LevelWisePractice | Batch reorder papers. |
| `/api/full-length-mock` | `app/api/full-length-mock/route.ts` | GET, POST, OPTIONS | FullLengthMock | List/create full-length mocks (paginated/filtered). |
| `/api/full-length-mock/[param]` | `app/api/full-length-mock/[param]/route.ts` | GET, PUT, DELETE | FullLengthMock | Get/update/delete by slug or id. **DELETE:** does **not** delete FullLengthMockQuestion (orphans possible). GET/PUT read `regulations` from raw collection for consistency. |
| `/api/full-length-mock/[param]/questions` | `app/api/full-length-mock/[param]/questions/route.ts` | GET, POST | FullLengthMock, FullLengthMockQuestion | List/create questions. |
| `/api/full-length-mock/[param]/questions/[questionId]` | … | GET, PUT, DELETE | FullLengthMockQuestion | Get/update/delete one question. |
| `/api/full-length-mock/[param]/questions/reorder` | … | POST | FullLengthMockQuestion | Batch reorder. |
| `/api/full-length-mock/reorder` | … | POST | FullLengthMock | Batch reorder mocks. |
| `/api/previous-year-paper` | `app/api/previous-year-paper/route.ts` | GET, POST | PreviousYearPaper | List/create (paginated). |
| `/api/previous-year-paper/[param]` | `app/api/previous-year-paper/[param]/route.ts` | GET, PUT, DELETE | PreviousYearPaper | Get/update/delete by slug or id. No cascade. |
| `/api/previous-year-paper/reorder` | … | POST | PreviousYearPaper | Batch reorder. |

### 3.5 Formula toolkit (study materials)

| Path | File | Methods | Models | Description |
|------|------|--------|--------|-------------|
| `/api/formula-toolkit` | `app/api/formula-toolkit/route.ts` | GET, POST | FormulaToolkit | List/create. |
| `/api/formula-toolkit/[param]` | `app/api/formula-toolkit/[param]/route.ts` | GET, PUT, DELETE | FormulaToolkit | Get/update/delete by slug or id. No cascade. |

---

## 4. Models (`models/`)

All are Mongoose schemas. Collection names are the default plural of the model name (e.g. `exams`, `subjects`).

| File | Collection | Main fields | Refs | Indexes / notes |
|------|------------|-------------|------|-----------------|
| **Exam.ts** | exams | name, slug, status, image, items, content, meta, visits, uniqueVisits, today, descriptions, orderNumber, lastModified, contentBody, seo, timestamps | — | slug; orderNumber |
| **Subject.ts** | subjects | examId, name, slug, status, image, content, meta, visits, uniqueVisits, today, descriptions, orderNumber, weightage, marks, lastModified, contentBody, seo, timestamps | Exam | (examId, slug) unique; (examId, orderNumber) |
| **Unit.ts** | units | subjectId, name, slug, … (same content/SEO/visit pattern) | Subject | (subjectId, slug) unique; (subjectId, orderNumber) |
| **Chapter.ts** | chapters | unitId, name, slug, … | Unit | (unitId, slug) unique; (unitId, orderNumber) |
| **Topic.ts** | topics | chapterId, name, slug, … | Chapter | (chapterId, slug) unique; (chapterId, orderNumber) |
| **Subtopic.ts** | subtopics | topicId, name, slug, … | Topic | (topicId, slug) unique; (topicId, orderNumber) |
| **Definition.ts** | definitions | subtopicId, name, slug, … | Subtopic | (subtopicId, slug) unique; (subtopicId, orderNumber) |
| **LevelWisePractice.ts** | levelwisepractices | examId, level (1–7), subjectId?, unitId?, chapterId?, topicId?, subtopicId?, definitionId?, title, slug, description, durationMinutes, totalMarks, totalQuestions, difficulty, orderNumber, status, locked, image, timestamps | Exam, Subject, Unit, Chapter, Topic, Subtopic, Definition | (examId, slug) unique; (examId, orderNumber); examId; level; (level, orderNumber); (examId, level, orderNumber). Pre-save: unsets hierarchy keys above level |
| **LevelWiseQuestion.ts** | levelwisequestions | practiceId, questionText, type (MCQ/NVQ), options, correctOptionIndex, numericalAnswer, numericalTolerance, numericalUnit, marksCorrect, marksIncorrect, imageUrl, imageCaption, orderNumber, difficulty, explanation, explanationImageUrl, updatedAt | LevelWisePractice | (practiceId, orderNumber) |
| **FullLengthMock.ts** | fulllengthmocks | examId, title, slug, description, durationMinutes, totalMarks, totalQuestions, difficulty, orderNumber, status, mockId, locked, image, **regulations**, timestamps | Exam | (examId, slug) unique; (examId, orderNumber); examId; status. `regulations` read/written via raw collection in API for schema consistency |
| **FullLengthMockQuestion.ts** | fulllengthmockquestions | mockId, subject, questionText, type (MCQ/NVQ), options, correctOptionIndex, numericalAnswer, numericalTolerance, numericalUnit, marksCorrect, marksIncorrect, imageUrl, imageCaption, orderNumber, difficulty, explanation, explanationImageUrl, updatedAt | FullLengthMock | (mockId, orderNumber) |
| **PreviousYearPaper.ts** | previousyearpapers | examId, title, slug, description, year, session, durationMinutes, totalMarks, totalQuestions, difficulty, orderNumber, status, locked, image, timestamps | Exam | (examId, slug) unique; (examId, year -1); (examId, orderNumber); examId; year; status |
| **PracticePaper.ts** | practicepapers | examId, level (1–7), subjectId? … definitionId?, type (practice \| full_length \| previous_paper), title, slug, description, durationMinutes, totalMarks, totalQuestions, difficulty, year?, orderNumber, status, locked, image, timestamps | Exam, Subject, Unit, Chapter, Topic, Subtopic, Definition | (examId, slug) unique; (examId, type, orderNumber); examId; type; level; etc. |
| **FormulaToolkit.ts** | formulatoolkits | examId, level (1–7), subjectId? … definitionId?, title, slug, description, fileUrl, pages, size, subjectLabel, orderNumber, status, timestamps | Exam, Subject, Unit, Chapter, Topic, Subtopic, Definition | (examId, slug) unique; (examId, orderNumber); examId; level; status |
| **BlockedIp.ts** | blockedips | ip, reason?, createdAt | — | ip unique |
| **MockSubject.ts** | — | (stub, no schema) | — | — |
| **MockSection.ts** | mocksections | subjectId, name, type (MCQ/NVQ), orderNumber, timestamps | MockSubject | (subjectId, orderNumber) |
| **MockQuestion.ts** | mockquestions | sectionId, questionText, type (MCQ/NVQ), options, correctOptionIndex, numericalAnswer, numericalTolerance, numericalUnit, marksCorrect, marksIncorrect, imageUrl, imageCaption, orderNumber, difficulty, timestamps | MockSection | (sectionId, orderNumber) |

---

## 5. Cascading Deletes & Updates

### 5.1 Cascade deletes (in route handlers)

| Trigger | Route | Action |
|--------|--------|--------|
| Delete **Exam** | `app/api/exams/[param]/route.ts` | `Subject.deleteMany({ examId })` then `Exam.findByIdAndDelete`. **Note:** Units (and below) under those subjects are **not** deleted here; they become orphans unless cleaned elsewhere. |
| Delete **Subject** | `app/api/subjects/[param]/route.ts` | `Unit.deleteMany({ subjectId })` then `Subject.findByIdAndDelete`. |
| Delete **Unit** | `app/api/units/[param]/route.ts` | `Chapter.deleteMany({ unitId })` then `Unit.findByIdAndDelete`. |
| Delete **Chapter** | `app/api/chapters/[param]/route.ts` | `Topic.deleteMany({ chapterId })` then `Chapter.findByIdAndDelete`. |
| Delete **Topic** | `app/api/topics/[param]/route.ts` | `Subtopic.deleteMany({ topicId })` then `Topic.findByIdAndDelete`. |
| Delete **Subtopic** | `app/api/subtopics/[param]/route.ts` | `Definition.deleteMany({ subtopicId })` then `Subtopic.findByIdAndDelete`. |
| Delete **Definition** | `app/api/definitions/[param]/route.ts` | Only the definition document is deleted (leaf). |
| Delete **LevelWisePractice** | `app/api/level-wise-practice/[param]/route.ts` | `LevelWiseQuestion.deleteMany({ practiceId })` then `LevelWisePractice.findOneAndDelete`. |

### 5.2 No cascade (possible orphans)

| Entity | Route | Behavior |
|--------|--------|----------|
| **FullLengthMock** | `app/api/full-length-mock/[param]/route.ts` | Only `FullLengthMock` is deleted. **FullLengthMockQuestion** documents with that `mockId` are **not** deleted (orphans). |
| **PreviousYearPaper** | `app/api/previous-year-paper/[param]/route.ts` | Only paper document; no child collection. |
| **PracticePaper** | `app/api/practice/[param]/route.ts` | Only `PracticePaper` document. |
| **FormulaToolkit** | `app/api/formula-toolkit/[param]/route.ts` | Only toolkit document. |

### 5.3 Batch / cleanup updates (not “on delete” cascade)

- **PATCH /api/level-wise-practice** with `{ cleanNullHierarchy: true }`: runs `LevelWisePractice.updateMany` per level to `$unset` hierarchy keys above that level.

---

## 6. Visit counting & IP blocking

- **lib/visit-block.ts**
  - `getClientIp(request)` – reads IP from `x-forwarded-for` or `x-real-ip`.
  - `isIpBlocked(ip)` – uses **BlockedIp** model; returns true if IP is blocked.
- Visit routes (`/api/exams/[param]/visit`, etc.) call `isIpBlocked`; if blocked, they do not increment visit counts.

---

## 7. Public app (`lms-public`) – connection to backend

### 7.1 API base URL

- **lms-public/lib/api.ts** uses `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:3000`) as base for all API calls.
- If unset and on server, falls back to `http://localhost:3000`.
- All requests go to the **same backend** as the main app (same origin or configured URL).

### 7.2 API client behavior

- **GET** requests from server use Next.js fetch cache with `revalidate` (default 60s) when `revalidate !== 0`.
- All requests use `Content-Type: application/json`.
- Errors: if response is not JSON or not OK, throws with a message that can reference `NEXT_PUBLIC_API_URL`.

### 7.3 Public app usage of APIs

- **Exams:** `getExams()`, `getExamBySlugOrId()` → `/api/exams`, `/api/exams/[param]`.
- **Syllabus:** `getSubjects()`, `getUnits()`, `getChapters()`, `getTopics()`, `getSubtopics()`, `getDefinitions()`; `getSidebarTree(examId)` → `/api/sidebar-tree`; `getSyllabusTree(examId)` → `/api/syllabus-hierarchy`.
- **Level-wise practice:** `getLevelWisePractices()`, `getLevelWisePracticesByHierarchy()`, `getLevelWisePracticeQuestions()`.
- **Full-length mocks:** `getFullLengthMocks()`, `getFullLengthMocksPaginated()`, `getFullLengthMockBySlug()`, `getFullLengthMockQuestions()`.
- **Previous year:** `getPreviousYearPapers()`, `getPreviousYearPapersPaginated()`.
- **Practice (legacy):** `getPracticePapers()`, `getPracticePaperBySlug()` (tries level-wise, full-length, previous-year by slug).
- **Formula toolkits:** `getFormulaToolkits()`.
- **Visits:** `recordVisit(resource, param)` → `POST /api/[resource]/[param]/visit`.

### 7.4 Server-side data fetching

- **Server components** call the above helpers (which use `fetch` with optional `next: { revalidate }` when `typeof window === "undefined"`).
- **Client components** call the same helpers in `useEffect` or event handlers (e.g. mock-tests detail page).
- No other external backends (no NextAuth, S3, etc.) are used in this flow.

---

## 8. Summary

- **Backend:** Single Next.js app with MongoDB (Mongoose), all APIs under `app/api/`, every route uses `connectDB()`.
- **Models:** Syllabus (Exam → Definition), LevelWisePractice/LevelWiseQuestion, FullLengthMock/FullLengthMockQuestion, PreviousYearPaper, PracticePaper, FormulaToolkit, BlockedIp, MockSection/MockQuestion.
- **Cascading:** Syllabus delete cascades one level (e.g. Exam → Subjects only; Subject → Units; etc.). LevelWisePractice DELETE cascades to LevelWiseQuestion. FullLengthMock DELETE does **not** remove questions (orphans). No other external services; visit counting respects BlockedIp.

This file can be used as the single reference for APIs, models, cascading, and the public app’s connection to the backend.
