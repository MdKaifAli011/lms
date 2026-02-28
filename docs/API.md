# Exams API Documentation

Base URL: `/api/exams` (e.g. `http://localhost:3000/api/exams`)

All exam endpoints use MongoDB. The `[param]` in paths can be either:

- **Slug** – exam slug (e.g. `neet`, `jee`)
- **ID** – MongoDB ObjectId, 24-character hex (e.g. `699f3a54b2e824cf0ff1f0c1`)

---

## 1. List exams

**GET** `/api/exams`

Returns all exams, sorted by `orderNumber`.

### Query parameters

| Parameter   | Values   | Description |
|------------|----------|-------------|
| `contextapi` | `1` or `true` | Return only `id`, `name`, `slug`, `status`, `order` (lightweight list). |

### Examples

- Full list: `GET /api/exams`
- Lightweight list: `GET /api/exams?contextapi=1`

### Response (full list)

```json
[
  {
    "id": "699f3a54b2e824cf0ff1f0c1",
    "name": "NEET",
    "slug": "neet",
    "status": "Active",
    "image": "No Image",
    "items": 0,
    "content": "-",
    "meta": "-",
    "visits": 0,
    "uniqueVisits": 0,
    "today": 0,
    "descriptions": [],
    "orderNumber": 1,
    "lastModified": "February 25, 2026 at 11:49 PM",
    "createdAt": "February 25, 2026 at 11:37 PM"
  }
]
```

### Response (contextapi=1)

```json
[
  { "id": "...", "name": "NEET", "slug": "neet", "status": "Active", "order": 1 },
  { "id": "...", "name": "JEE", "slug": "jee", "status": "Inactive", "order": 2 }
]
```

### Errors

- **500** – Server error; body has `{ "error": "..." }`.

---

## 2. Create exam

**POST** `/api/exams`

Creates a new exam. Rejects if an exam with the same name (slug) already exists (no duplicates).

### Request body (JSON)

| Field         | Type     | Required | Description |
|---------------|----------|----------|-------------|
| `name`        | string   | Yes      | Exam name (slug is derived from it). |
| `status`      | string   | No       | `"Active"` or `"Inactive"`. Default: `"Active"`. |
| `cardImageUrl`| string   | No       | Image URL for the card. |
| `descriptions`| string[] | No       | Array of description strings. |

### Example

```json
{
  "name": "NEET",
  "status": "Active",
  "cardImageUrl": "https://example.com/image.png",
  "descriptions": ["Description 1", "Description 2"]
}
```

### Response (201)

Returns the created exam object (same shape as full list item, including `id`, `slug`, `orderNumber`, etc.).

### Errors

- **400** – Missing or invalid `name`; body has `{ "error": "..." }`.
- **409** – Duplicate name; body has `{ "error": "An exam with this name already exists", "code": "DUPLICATE_EXAM", "existingSlug": "...", "existingId": "..." }`.
- **500** – Server error.

---

## 3. Get one exam

**GET** `/api/exams/[param]`

Returns a single exam by slug or ID (full document including `contentBody`, `seo`).

### Examples

- By slug: `GET /api/exams/neet`
- By ID: `GET /api/exams/699f3a54b2e824cf0ff1f0c1`

### Response

```json
{
  "id": "699f3a54b2e824cf0ff1f0c1",
  "name": "NEET",
  "slug": "neet",
  "status": "Active",
  "image": "No Image",
  "items": 0,
  "content": "-",
  "meta": "-",
  "visits": 5,
  "uniqueVisits": 5,
  "today": 0,
  "descriptions": [],
  "orderNumber": 1,
  "lastModified": "February 25, 2026 at 11:49 PM",
  "contentBody": "<p>...</p>",
  "seo": { "metaTitle": "", "metaDescription": "", ... },
  "createdAt": "February 25, 2026 at 11:37 PM"
}
```

### Errors

- **400** – Missing slug/id.
- **404** – Exam not found.
- **500** – Server error.

---

## 4. Update exam

**PUT** `/api/exams/[param]`

Updates an exam. **`[param]` must be the exam’s MongoDB ID** (not slug).

### Request body (JSON)

All fields are optional; only sent fields are updated.

| Field          | Type     | Description |
|----------------|----------|-------------|
| `name`         | string   | Exam name (slug recomputed; duplicate name returns 409). |
| `status`       | string   | `"Active"` or `"Inactive"`. |
| `image` / `cardImageUrl` | string | Card image URL. |
| `descriptions` | string[] | Description list. |
| `orderNumber`  | number   | Display order. |
| `contentBody`  | string   | Rich text / HTML content. |
| `seo`          | object   | SEO fields (see Meta API). |

### Example (content + SEO save)

```json
{
  "contentBody": "<p>Exam content...</p>",
  "seo": {
    "metaTitle": "NEET 2026",
    "metaDescription": "Prepare for NEET.",
    "metaKeywords": "neet, exam",
    "ogTitle": "",
    "ogDescription": "",
    "ogImageUrl": "",
    "canonicalUrl": "",
    "noIndex": false,
    "noFollow": false
  }
}
```

### Response

Returns the updated exam (same shape as “Get one exam”).

### Errors

- **400** – Invalid or missing exam id; or invalid body (e.g. empty name).
- **404** – Exam not found.
- **409** – Another exam already has that name.
- **500** – Server error.

---

## 5. Delete exam

**DELETE** `/api/exams/[param]`

Deletes an exam. **`[param]` must be the exam’s MongoDB ID.**

### Response

```json
{ "ok": true, "id": "699f3a54b2e824cf0ff1f0c1" }
```

### Errors

- **400** – Invalid id.
- **404** – Exam not found.
- **500** – Server error.

---

## 6. Reorder exams

**POST** `/api/exams/reorder`

Updates `orderNumber` for multiple exams in one request.

### Request body (JSON)

```json
{
  "order": [
    { "id": "699f3a54b2e824cf0ff1f0c1", "orderNumber": 1 },
    { "id": "699f3a54b2e824cf0ff1f0c2", "orderNumber": 2 }
  ]
}
```

| Field | Type     | Description |
|-------|----------|-------------|
| `order` | array  | List of `{ id, orderNumber }`. `id` must be valid MongoDB id. |

### Response

```json
{ "ok": true }
```

### Errors

- **500** – Server error; body has `{ "error": "..." }`.

---

## 7. Get exam meta (SEO only)

**GET** `/api/exams/[param]/meta`

Returns only meta/SEO data for one exam (title, description, keywords, Open Graph, etc.). Use for public pages or head/meta tags.

### Examples

- By slug: `GET /api/exams/neet/meta`
- By ID: `GET /api/exams/699f3a54b2e824cf0ff1f0c1/meta`

### Response

```json
{
  "id": "699f3a54b2e824cf0ff1f0c1",
  "slug": "neet",
  "metaTitle": "NEET 2026",
  "metaDescription": "Prepare for NEET exam.",
  "metaKeywords": "neet, exam, medical",
  "ogTitle": "NEET 2026",
  "ogDescription": "Prepare for NEET.",
  "ogImageUrl": "https://example.com/og.png",
  "canonicalUrl": "https://example.com/exams/neet",
  "noIndex": false,
  "noFollow": false
}
```

### Errors

- **400** – Missing slug/id.
- **404** – Exam not found.
- **500** – Server error.

---

## 8. Record visit (public pages)

**POST** `/api/exams/[param]/visit`

Increments the exam’s visit count (and “today” count). Call from public exam pages when a user views the page.

### Examples

- By slug: `POST /api/exams/neet/visit`
- By ID: `POST /api/exams/699f3a54b2e824cf0ff1f0c1/visit`

No request body required.

### Response

```json
{
  "ok": true,
  "visits": 6,
  "today": 2
}
```

### Errors

- **400** – Missing slug/id.
- **404** – Exam not found.
- **500** – Server error.

---

## Summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/exams` | List all exams (full or `?contextapi=1` for minimal). |
| POST | `/api/exams` | Create exam (no duplicate name). |
| GET | `/api/exams/[param]` | Get one exam by slug or id. |
| PUT | `/api/exams/[param]` | Update exam (param = id). |
| DELETE | `/api/exams/[param]` | Delete exam (param = id). |
| POST | `/api/exams/reorder` | Batch update order. |
| GET | `/api/exams/[param]/meta` | Get only meta/SEO. |
| POST | `/api/exams/[param]/visit` | Increment visit count (public). |

All error responses include a JSON body with an `error` message (and optionally `code`, `existingSlug`, `existingId` for 409).

---

# Subjects API Documentation

Base URL: `/api/subjects`

Subject identity in paths uses **MongoDB _id** (24-char hex). Slug is unique **per exam** (same slug allowed in different exams).

**Cascade:** Deleting an exam deletes all its subjects. Deleting a subject deletes all its units.

---

## 1. List subjects

**GET** `/api/subjects`

### Query parameters

| Parameter   | Description |
|------------|-------------|
| `contextapi` | `1` or `true` – return only `id`, `examId`, `name`, `slug`, `status`, `order`. |
| `exam`     | Filter by exam slug (e.g. `neet`). |
| `examId`   | Filter by exam MongoDB id. |

### Response (full)

Array of subject objects with `id`, `examId`, `name`, `slug`, `status`, `orderNumber`, `contentBody`, `seo`, `visits`, `today`, `lastModified`, `createdAt`, etc.

### Response (contextapi=1)

`[{ "id", "examId", "name", "slug", "status", "order": number }, ...]`

### Errors

- **500** – Server error.

---

## 2. Create subject

**POST** `/api/subjects`

Body: `name` (required), `examId` (MongoDB id) or `exam` (exam slug). Optional: `status`, `descriptions`, etc. Slug is derived from name. Duplicate (same exam + same slug) returns **409**.

### Errors

- **400** – Missing name or exam context.
- **404** – Exam not found (when using `exam` slug).
- **409** – A subject with this name already exists in this exam.
- **500** – Server error.

---

## 3. Get one subject

**GET** `/api/subjects/[param]`

`param` = subject MongoDB **id** (slug not used for single-subject get; slug is per-exam).

### Errors

- **400** – Invalid id.
- **404** – Subject not found.
- **500** – Server error.

---

## 4. Update subject

**PUT** `/api/subjects/[param]`

`param` = subject MongoDB id. Body may include `name`, `examId`, `status`, `orderNumber`, `contentBody`, `seo`, etc. Rename duplicate in same exam → **409**.

### Errors

- **400** – Invalid id or body.
- **404** – Subject not found.
- **409** – Duplicate name in same exam.
- **500** – Server error.

---

## 5. Delete subject

**DELETE** `/api/subjects/[param]`

`param` = subject MongoDB id. **Cascades:** all units for this subject are deleted first.

### Response

`{ "ok": true, "id": "..." }`

### Errors

- **400** – Invalid id.
- **404** – Subject not found.
- **500** – Server error.

---

## 6. Reorder subjects

**POST** `/api/subjects/reorder`

Body: `{ "order": [ { "id": "<subjectId>", "orderNumber": 1 }, ... ] }`. Batch update `orderNumber`.

### Errors

- **500** – Server error.

---

## 7. Get subject meta (SEO only)

**GET** `/api/subjects/[param]/meta`

`param` = subject id. Returns only meta/SEO fields.

### Errors

- **400** – Invalid id.
- **404** – Subject not found.
- **500** – Server error.

---

## 8. Record subject visit

**POST** `/api/subjects/[param]/visit`

Increment visit count. `param` can be:

- **Subject id** (24-char hex) – no query.
- **Subject slug** (e.g. `physics`) – requires exam context: `?exam=slug` or `?examId=id`.

### Errors

- **400** – Missing param or (when using slug) missing exam context.
- **404** – Subject not found.
- **500** – Server error.

---

## Subjects summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/subjects` | List (optional `?exam`, `?examId`, `?contextapi=1`). |
| POST | `/api/subjects` | Create (no duplicate name per exam). |
| GET | `/api/subjects/[id]` | Get one by id. |
| PUT | `/api/subjects/[id]` | Update by id. |
| DELETE | `/api/subjects/[id]` | Delete by id (cascades to units). |
| POST | `/api/subjects/reorder` | Batch update order. |
| GET | `/api/subjects/[id]/meta` | Get meta/SEO. |
| POST | `/api/subjects/[id]/visit` | Record visit (param can be id or slug + exam query). |

---

# Units API Documentation

Base URL: `/api/units`

Unit identity in paths uses **MongoDB _id** (24-char hex). Slug is unique **per subject** (same slug allowed in different subjects).

**Cascade:** Deleting a subject deletes all its units. Deleting a unit deletes all its chapters.

---

## 1. List units

**GET** `/api/units`

### Query parameters

| Parameter   | Description |
|------------|-------------|
| `contextapi` | `1` or `true` – return only `id`, `subjectId`, `name`, `slug`, `status`, `order`. |
| `subject`  | Filter by subject slug. |
| `subjectId`| Filter by subject MongoDB id. |

### Response (full)

Array of unit objects with `id`, `subjectId`, `name`, `slug`, `status`, `orderNumber`, `contentBody`, `seo`, `visits`, `today`, `lastModified`, `createdAt`, etc.

### Response (contextapi=1)

`[{ "id", "subjectId", "name", "slug", "status", "order": number }, ...]`

### Errors

- **500** – Server error.

---

## 2. Create unit

**POST** `/api/units`

Body: `name` (required), `subjectId` (MongoDB id) or `subject` (subject slug). Optional: `status`, `descriptions`, etc. Slug derived from name. Duplicate (same subject + same slug) returns **409**.

### Errors

- **400** – Missing name or subject context.
- **404** – Subject not found (when using `subject` slug).
- **409** – A unit with this name already exists in this subject.
- **500** – Server error.

---

## 3. Get one unit

**GET** `/api/units/[param]`

`param` = unit MongoDB **id**.

### Errors

- **400** – Invalid id.
- **404** – Unit not found.
- **500** – Server error.

---

## 4. Update unit

**PUT** `/api/units/[param]`

`param` = unit MongoDB id. Body may include `name`, `subjectId`, `status`, `orderNumber`, `contentBody`, `seo`, etc. Rename duplicate in same subject → **409**.

### Errors

- **400** – Invalid id or body.
- **404** – Unit not found.
- **409** – Duplicate name in same subject.
- **500** – Server error.

---

## 5. Delete unit

**DELETE** `/api/units/[param]`

`param` = unit MongoDB id.

### Response

`{ "ok": true, "id": "..." }`

### Errors

- **400** – Invalid id.
- **404** – Unit not found.
- **500** – Server error.

---

## 6. Reorder units

**POST** `/api/units/reorder`

Body: `{ "order": [ { "id": "<unitId>", "orderNumber": 1 }, ... ] }`. Batch update `orderNumber`.

### Errors

- **500** – Server error.

---

## 7. Get unit meta (SEO only)

**GET** `/api/units/[param]/meta`

`param` = unit id. Returns only meta/SEO fields.

### Errors

- **400** – Invalid id.
- **404** – Unit not found.
- **500** – Server error.

---

## 8. Record unit visit

**POST** `/api/units/[param]/visit`

Increment visit count. `param` can be:

- **Unit id** (24-char hex) – no query.
- **Unit slug** – requires subject context: `?subject=slug` or `?subjectId=id`.

### Errors

- **400** – Missing param or (when using slug) missing subject context.
- **404** – Unit not found.
- **500** – Server error.

---

## Units summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/units` | List (optional `?subject`, `?subjectId`, `?contextapi=1`). |
| POST | `/api/units` | Create (no duplicate name per subject). |
| GET | `/api/units/[id]` | Get one by id. |
| PUT | `/api/units/[id]` | Update by id. |
| DELETE | `/api/units/[id]` | Delete by id (cascades to chapters). |
| POST | `/api/units/reorder` | Batch update order. |
| GET | `/api/units/[id]/meta` | Get meta/SEO. |
| POST | `/api/units/[id]/visit` | Record visit (param can be id or slug + subject query). |

---

# Chapters API Documentation

Base URL: `/api/chapters`

Chapter identity in paths uses **MongoDB _id** (24-char hex). Slug is unique **per unit** (same slug allowed in different units).

**Cascade:** Deleting a unit deletes all its chapters. Deleting a chapter deletes all its topics.

---

## 1. List chapters

**GET** `/api/chapters`

### Query parameters

| Parameter   | Description |
|------------|-------------|
| `contextapi` | `1` or `true` – return only `id`, `unitId`, `name`, `slug`, `status`, `order`. |
| `unit`     | Filter by unit slug. |
| `unitId`   | Filter by unit MongoDB id. |

### Response (full)

Array of chapter objects with `id`, `unitId`, `name`, `slug`, `status`, `orderNumber`, `contentBody`, `seo`, `visits`, `today`, `lastModified`, `createdAt`, etc.

### Response (contextapi=1)

`[{ "id", "unitId", "name", "slug", "status", "order": number }, ...]`

### Errors

- **500** – Server error.

---

## 2. Create chapter

**POST** `/api/chapters`

Body: `name` (required), `unitId` (MongoDB id) or `unit` (unit slug). Optional: `status`, `descriptions`, etc. Slug derived from name. Duplicate (same unit + same slug) returns **409**.

### Errors

- **400** – Missing name or unit context.
- **404** – Unit not found (when using `unit` slug).
- **409** – A chapter with this name already exists in this unit.
- **500** – Server error.

---

## 3. Get one chapter

**GET** `/api/chapters/[param]`

`param` = chapter MongoDB **id**.

### Errors

- **400** – Invalid id.
- **404** – Chapter not found.
- **500** – Server error.

---

## 4. Update chapter

**PUT** `/api/chapters/[param]`

`param` = chapter MongoDB id. Body may include `name`, `unitId`, `status`, `orderNumber`, `contentBody`, `seo`, etc. Rename duplicate in same unit → **409**.

### Errors

- **400** – Invalid id or body.
- **404** – Chapter not found.
- **409** – Duplicate name in same unit.
- **500** – Server error.

---

## 5. Delete chapter

**DELETE** `/api/chapters/[param]`

`param` = chapter MongoDB id. **Cascades:** all topics for this chapter are deleted first.

### Response

`{ "ok": true, "id": "..." }`

### Errors

- **400** – Invalid id.
- **404** – Chapter not found.
- **500** – Server error.

---

## 6. Reorder chapters

**POST** `/api/chapters/reorder`

Body: `{ "order": [ { "id": "<chapterId>", "orderNumber": 1 }, ... ] }`. Batch update `orderNumber`.

### Errors

- **500** – Server error.

---

## 7. Get chapter meta (SEO only)

**GET** `/api/chapters/[param]/meta`

`param` = chapter id. Returns only meta/SEO fields.

### Errors

- **400** – Invalid id.
- **404** – Chapter not found.
- **500** – Server error.

---

## 8. Record chapter visit

**POST** `/api/chapters/[param]/visit`

Increment visit count. `param` can be:

- **Chapter id** (24-char hex) – no query.
- **Chapter slug** – requires unit context: `?unit=slug` or `?unitId=id`.

### Errors

- **400** – Missing param or (when using slug) missing unit context.
- **404** – Chapter not found.
- **500** – Server error.

---

## Chapters summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/chapters` | List (optional `?unit`, `?unitId`, `?contextapi=1`). |
| POST | `/api/chapters` | Create (no duplicate name per unit). |
| GET | `/api/chapters/[id]` | Get one by id. |
| PUT | `/api/chapters/[id]` | Update by id. |
| DELETE | `/api/chapters/[id]` | Delete by id (cascades to topics). |
| POST | `/api/chapters/reorder` | Batch update order. |
| GET | `/api/chapters/[id]/meta` | Get meta/SEO. |
| POST | `/api/chapters/[id]/visit` | Record visit (param can be id or slug + unit query). |

---

# Topics API Documentation

Base URL: `/api/topics`

Topic identity in paths uses **MongoDB _id** (24-char hex). Slug is unique **per chapter** (same slug allowed in different chapters).

**Cascade:** Deleting a chapter deletes all its topics. Deleting a topic deletes all its subtopics (see Subtopics API).

---

## 1. List topics

**GET** `/api/topics`

### Query parameters

| Parameter   | Description |
|------------|-------------|
| `contextapi` | `1` or `true` – return only `id`, `chapterId`, `name`, `slug`, `status`, `order`. |
| `chapter`  | Filter by chapter slug. |
| `chapterId`| Filter by chapter MongoDB id. |

### Response (full)

Array of topic objects with `id`, `chapterId`, `name`, `slug`, `status`, `orderNumber`, `contentBody`, `seo`, `visits`, `today`, `lastModified`, `createdAt`, etc.

### Response (contextapi=1)

`[{ "id", "chapterId", "name", "slug", "status", "order": number }, ...]`

### Errors

- **500** – Server error.

---

## 2. Create topic

**POST** `/api/topics`

Body: `name` (required), `chapterId` (MongoDB id) or `chapter` (chapter slug). Optional: `status`, `descriptions`, etc. Slug derived from name. Duplicate (same chapter + same slug) returns **409**.

### Errors

- **400** – Missing name or chapter context.
- **404** – Chapter not found (when using `chapter` slug).
- **409** – A topic with this name already exists in this chapter.
- **500** – Server error.

---

## 3. Get one topic

**GET** `/api/topics/[param]`

`param` = topic MongoDB **id**.

### Errors

- **400** – Invalid id.
- **404** – Topic not found.
- **500** – Server error.

---

## 4. Update topic

**PUT** `/api/topics/[param]`

`param` = topic MongoDB id. Body may include `name`, `chapterId`, `status`, `orderNumber`, `contentBody`, `seo`, etc. Rename duplicate in same chapter → **409**.

### Errors

- **400** – Invalid id or body.
- **404** – Topic not found.
- **409** – Duplicate name in same chapter.
- **500** – Server error.

---

## 5. Delete topic

**DELETE** `/api/topics/[param]`

`param` = topic MongoDB id. **Cascades:** all subtopics for this topic are deleted first.

### Response

`{ "ok": true, "id": "..." }`

### Errors

- **400** – Invalid id.
- **404** – Topic not found.
- **500** – Server error.

---

## 6. Reorder topics

**POST** `/api/topics/reorder`

Body: `{ "order": [ { "id": "<topicId>", "orderNumber": 1 }, ... ] }`. Batch update `orderNumber`.

### Errors

- **500** – Server error.

---

## 7. Get topic meta (SEO only)

**GET** `/api/topics/[param]/meta`

`param` = topic id. Returns only meta/SEO fields.

### Errors

- **400** – Invalid id.
- **404** – Topic not found.
- **500** – Server error.

---

## 8. Record topic visit

**POST** `/api/topics/[param]/visit`

Increment visit count. `param` can be:

- **Topic id** (24-char hex) – no query.
- **Topic slug** – requires chapter context: `?chapter=slug` or `?chapterId=id`.

### Errors

- **400** – Missing param or (when using slug) missing chapter context.
- **404** – Topic not found.
- **500** – Server error.

---

## Topics summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/topics` | List (optional `?chapter`, `?chapterId`, `?contextapi=1`). |
| POST | `/api/topics` | Create (no duplicate name per chapter). |
| GET | `/api/topics/[id]` | Get one by id. |
| PUT | `/api/topics/[id]` | Update by id. |
| DELETE | `/api/topics/[id]` | Delete by id (cascades to subtopics). |
| POST | `/api/topics/reorder` | Batch update order. |
| GET | `/api/topics/[id]/meta` | Get meta/SEO. |
| POST | `/api/topics/[id]/visit` | Record visit (param can be id or slug + chapter query). |

---

# Subtopics API Documentation

Base URL: `/api/subtopics`

Subtopic identity in paths uses **MongoDB _id** (24-char hex). Slug is unique **per topic** (same slug allowed in different topics).

**Cascade:** Deleting a topic deletes all its subtopics (see Topics API). **Deleting a subtopic deletes all its definitions** (see Definitions API).

---

## 1. List subtopics

**GET** `/api/subtopics`

### Query parameters

| Parameter   | Description |
|------------|-------------|
| `contextapi` | `1` or `true` – return only `id`, `topicId`, `name`, `slug`, `status`, `order`. |
| `topic`    | Filter by topic slug. |
| `topicId`  | Filter by topic MongoDB id. |

### Response (full)

Array of subtopic objects with `id`, `topicId`, `name`, `slug`, `status`, `orderNumber`, `contentBody`, `seo`, `visits`, `today`, `lastModified`, `createdAt`, etc.

### Response (contextapi=1)

`[{ "id", "topicId", "name", "slug", "status", "order": number }, ...]`

### Errors

- **500** – Server error.

---

## 2. Create subtopic

**POST** `/api/subtopics`

Body: `name` (required), `topicId` (MongoDB id) or `topic` (topic slug). Optional: `status`, `descriptions`, etc. Slug derived from name. Duplicate (same topic + same slug) returns **409**.

### Errors

- **400** – Missing name or topic context.
- **404** – Topic not found (when using `topic` slug).
- **409** – A subtopic with this name already exists in this topic.
- **500** – Server error.

---

## 3. Get one subtopic

**GET** `/api/subtopics/[param]`

`param` = subtopic MongoDB **id**.

### Errors

- **400** – Invalid id.
- **404** – Subtopic not found.
- **500** – Server error.

---

## 4. Update subtopic

**PUT** `/api/subtopics/[param]`

`param` = subtopic MongoDB id. Body may include `name`, `topicId`, `status`, `orderNumber`, `contentBody`, `seo`, etc. Rename duplicate in same topic → **409**.

### Errors

- **400** – Invalid id or body.
- **404** – Subtopic not found.
- **409** – Duplicate name in same topic.
- **500** – Server error.

---

## 5. Delete subtopic

**DELETE** `/api/subtopics/[param]`

`param` = subtopic MongoDB id. **Cascades:** all definitions for this subtopic are deleted first.

### Response

`{ "ok": true, "id": "..." }`

### Errors

- **400** – Invalid id.
- **404** – Subtopic not found.
- **500** – Server error.

---

## 6. Reorder subtopics

**POST** `/api/subtopics/reorder`

Body: `{ "order": [ { "id": "<subtopicId>", "orderNumber": 1 }, ... ] }`. Batch update `orderNumber`.

### Errors

- **500** – Server error.

---

## 7. Get subtopic meta (SEO only)

**GET** `/api/subtopics/[param]/meta`

`param` = subtopic id. Returns only meta/SEO fields.

### Errors

- **400** – Invalid id.
- **404** – Subtopic not found.
- **500** – Server error.

---

## 8. Record subtopic visit

**POST** `/api/subtopics/[param]/visit`

Increment visit count. `param` can be:

- **Subtopic id** (24-char hex) – no query.
- **Subtopic slug** – requires topic context: `?topic=slug` or `?topicId=id`.

### Errors

- **400** – Missing param or (when using slug) missing topic context.
- **404** – Subtopic not found.
- **500** – Server error.

---

## Subtopics summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/subtopics` | List (optional `?topic`, `?topicId`, `?contextapi=1`). |
| POST | `/api/subtopics` | Create (no duplicate name per topic). |
| GET | `/api/subtopics/[id]` | Get one by id. |
| PUT | `/api/subtopics/[id]` | Update by id. |
| DELETE | `/api/subtopics/[id]` | Delete by id (cascades to definitions). |
| POST | `/api/subtopics/reorder` | Batch update order. |
| GET | `/api/subtopics/[id]/meta` | Get meta/SEO. |
| POST | `/api/subtopics/[id]/visit` | Record visit (param can be id or slug + topic query). |

---

# Definitions API Documentation

Base URL: `/api/definitions`

Definition identity in paths uses **MongoDB _id** (24-char hex). Slug is unique **per subtopic** (same slug allowed in different subtopics).

**Cascade:** Deleting a subtopic deletes all its definitions (see Subtopics API).

---

## 1. List definitions

**GET** `/api/definitions`

### Query parameters

| Parameter   | Description |
|------------|-------------|
| `contextapi` | `1` or `true` – return only `id`, `subtopicId`, `name`, `slug`, `status`, `order`. |
| `subtopic` | Filter by subtopic slug. |
| `subtopicId` | Filter by subtopic MongoDB id. |

### Response (full)

Array of definition objects with `id`, `subtopicId`, `name`, `slug`, `status`, `orderNumber`, `content`, `meta`, `contentBody`, `seo`, `visits`, `uniqueVisits`, `today`, `lastModified`, `createdAt`, etc.

### Response (contextapi=1)

`[{ "id", "subtopicId", "name", "slug", "status", "order": number }, ...]`

### Errors

- **500** – Server error.

---

## 2. Create definition

**POST** `/api/definitions`

Body: `name` (required), `subtopicId` (MongoDB id) or `subtopic` (subtopic slug). Optional: `status`, etc. Slug derived from name. Duplicate (same subtopic + same slug) returns **409**.

### Errors

- **400** – Missing name or subtopic context.
- **404** – Subtopic not found (when using `subtopic` slug).
- **409** – A definition with this name already exists in this subtopic.
- **500** – Server error.

---

## 3. Get one definition

**GET** `/api/definitions/[param]`

`param` = definition MongoDB **id**.

### Errors

- **400** – Invalid id.
- **404** – Definition not found.
- **500** – Server error.

---

## 4. Update definition

**PUT** `/api/definitions/[param]`

`param` = definition MongoDB id. Body may include `name`, `subtopicId`, `status`, `orderNumber`, `contentBody`, `seo`, etc. Rename duplicate in same subtopic → **409**.

### Errors

- **400** – Invalid id or body.
- **404** – Definition not found.
- **409** – Duplicate name in same subtopic.
- **500** – Server error.

---

## 5. Delete definition

**DELETE** `/api/definitions/[param]`

`param` = definition MongoDB id.

### Response

`{ "ok": true, "id": "..." }`

### Errors

- **400** – Invalid id.
- **404** – Definition not found.
- **500** – Server error.

---

## 6. Reorder definitions

**POST** `/api/definitions/reorder`

Body: `{ "order": [ { "id": "<definitionId>", "orderNumber": 1 }, ... ] }`. Batch update `orderNumber`.

### Errors

- **500** – Server error.

---

## 7. Get definition meta (SEO only)

**GET** `/api/definitions/[param]/meta`

`param` = definition id. Returns only meta/SEO fields.

### Errors

- **400** – Invalid id.
- **404** – Definition not found.
- **500** – Server error.

---

## 8. Record definition visit

**POST** `/api/definitions/[param]/visit`

Increment visit count. `param` can be:

- **Definition id** (24-char hex) – no query.
- **Definition slug** – requires subtopic context: `?subtopic=slug` or `?subtopicId=id`.

### Errors

- **400** – Missing param or (when using slug) missing subtopic context.
- **404** – Definition not found.
- **500** – Server error.

---

## Definitions summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/definitions` | List (optional `?subtopic`, `?subtopicId`, `?contextapi=1`). |
| POST | `/api/definitions` | Create (no duplicate name per subtopic). |
| GET | `/api/definitions/[id]` | Get one by id. |
| PUT | `/api/definitions/[id]` | Update by id. |
| DELETE | `/api/definitions/[id]` | Delete by id. |
| POST | `/api/definitions/reorder` | Batch update order. |
| GET | `/api/definitions/[id]/meta` | Get meta/SEO. |
| POST | `/api/definitions/[id]/visit` | Record visit (param can be id or slug + subtopic query). |
