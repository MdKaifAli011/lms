# Content import scripts

Use these to import **subject book content** (e.g. from a PDF) into the LMS **seven-level hierarchy** with the same format as the editor (HTML in `contentBody`). Full guide: [docs/PDF-IMPORT.md](../docs/PDF-IMPORT.md).

## Prerequisites

- Node 18+
- API server running (e.g. `npm run dev` in project root so `http://localhost:3000` serves the API)

## 1. Import from JSON

**Script:** `import-content-tree.mjs`

Reads a content tree JSON (exam → subjects → units → chapters → topics → subtopics → definitions) and creates/updates entities via API, setting `contentBody` (HTML) on each.

**Usage:**

```bash
# From file
API_BASE=http://localhost:3000 node scripts/import-content-tree.mjs path/to/your-content.json

# From stdin
cat my-content.json | API_BASE=http://localhost:3000 node scripts/import-content-tree.mjs
```

**Env:**

| Variable   | Default               | Description                    |
|-----------|------------------------|--------------------------------|
| `API_BASE` | `http://localhost:3000` | Base URL of your API (no trailing slash) |

**JSON format:** See [docs/PDF-IMPORT.md](../docs/PDF-IMPORT.md) and `sample-content-tree.json`. Each node can have `name`, `contentBody` (HTML), and the next level’s array.

## 2. Sample file

**File:** `sample-content-tree.json`

Example tree with one exam, one subject, one unit, one chapter, one topic, one subtopic, one definition. Use it as a template and replace names/content with your PDF-derived data.

## 3. Getting from PDF to JSON

- **Manual:** Build the JSON by hand from your PDF (copy text, convert to HTML, add `<img>` for diagrams).
- **Semi-automated:** Use `pdf-to-content-tree.mjs` (optional, see below) to extract text and a simple structure, then edit the generated JSON.

## 4. Optional: PDF → JSON

**Script:** `pdf-to-content-tree.mjs`

Extracts text from a PDF and outputs a content tree JSON with placeholder HTML (paragraphs). You then refine the JSON (fix hierarchy, add image URLs) and run `import-content-tree.mjs`.

**Install PDF parser (one-time):**

```bash
npm install pdf-parse
```

**Usage:**

```bash
node scripts/pdf-to-content-tree.mjs path/to/subject-book.pdf > output.json
# Edit output.json, then:
API_BASE=http://localhost:3000 node scripts/import-content-tree.mjs output.json
```

Diagrams: export images from the PDF (e.g. by page), upload to your server/CDN, and add `<img src="...">` in the right `contentBody` in the JSON.
