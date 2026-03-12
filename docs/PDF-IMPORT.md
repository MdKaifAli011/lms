# Importing Subject Book PDF Content (7-Level Hierarchy)

This guide explains how to get content from a **subject book PDF** (with seven-level structure, questions, diagrams) into the LMS in the **same format** as the editor: **HTML in `contentBody`** for each level.

---

## 1. Target format in the LMS

- **Levels:** Exam → Subject → Unit → Chapter → Topic → Subtopic → Definition (7 levels).
- **Content:** Each entity has a **`contentBody`** field: **HTML string** (the same format the Lexical editor produces and `ContentRenderer` displays).
- **Supported in HTML:** Paragraphs, headings (h1–h6), lists, tables, links, **images** (for diagrams), code, blockquotes. Images can be hosted URLs or base64 (prefer URLs for large diagrams).
- **Questions:** Can be embedded in `contentBody` as formatted text, or added separately via **Level-wise practice** (quiz) for the same level.

So your PDF content should end up as **HTML per level**, stored in `contentBody` for the matching exam/subject/unit/chapter/topic/subtopic/definition.

---

## 2. Two ways to import

| Approach | Use when |
|----------|----------|
| **A. JSON import** | You have (or can build) a structured file: tree + HTML per node. Best for one-time or bulk import with control. |
| **B. PDF → JSON → import** | You start from a PDF; a script extracts text (and optionally structure) into the same JSON format, then you run the JSON importer. |

Both use the same **content tree JSON format** and the same **import script** that talks to your API.

---

## 3. Content tree JSON format

The import script expects a single JSON file (or stdin) in this shape. Names become entity names (and slugs); `contentBody` is the HTML for that node.

```json
{
  "exam": {
    "name": "NEET",
    "contentBody": "<p>Overview of NEET exam...</p>"
  },
  "subjects": [
    {
      "name": "Physics",
      "contentBody": "<p>Introduction to Physics.</p>",
      "units": [
        {
          "name": "Units and Measurement",
          "contentBody": "<p>Content for this unit...</p><figure><img src=\"https://example.com/diagram.png\" alt=\"Diagram\" /><figcaption>Diagram caption</figcaption></figure>",
          "chapters": [
            {
              "name": "Physical Quantities",
              "contentBody": "<h2>Physical Quantities</h2><p>Text...</p>",
              "topics": [
                {
                  "name": "Scalars and Vectors",
                  "contentBody": "<p>Topic content...</p>",
                  "subtopics": [
                    {
                      "name": "Vector Addition",
                      "contentBody": "<p>Subtopic content...</p>",
                      "definitions": [
                        {
                          "name": "Resultant Vector",
                          "contentBody": "<p>Definition content. Diagrams: <img src=\"...\" alt=\"Resultant\" /></p>"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

Rules:

- **exam**: Required. `name` required; `contentBody` optional (HTML).
- **subjects**: Array. Each subject has `name`, optional `contentBody`, and `units` array.
- **units** → **chapters** → **topics** → **subtopics** → **definitions**: Same idea; each node has `name`, optional `contentBody`, and the next level’s array.
- **contentBody**: HTML string. Use normal tags: `<p>`, `<h2>`, `<ul>`, `<table>`, `<figure>`, `<img>`, etc. Same as what the Lexical editor saves. For **diagrams**, use `<img src="url" alt="..." />` or `<figure><img ... /><figcaption>...</figcaption></figure>`.
- **Questions**: Either put them inside `contentBody` (e.g. in a `<section>` or list) or add them later via Practice / Level-wise quiz for that level.

---

## 4. How to get from PDF to this JSON

### Option A: Manual (or external PDF tool)

1. Open the PDF and identify the **7-level structure** (e.g. Part → Unit → Chapter → Section → Topic → Subtopic → Definition, or your book’s headings).
2. For each section, copy or type the text. Convert to simple HTML (paragraphs, headings, lists). For **diagrams**, export images from the PDF (or screenshot), upload somewhere, and use `<img src="..." alt="..." />` in `contentBody`.
3. Build the JSON by hand (or with a spreadsheet → JSON tool) to match the format above.
4. Run the import script (see below).

### Option B: Semi-automated (script extracts text from PDF)

- Use the provided **PDF → JSON** script (see [Scripts](#5-scripts)) to extract text from the PDF and guess structure (e.g. by heading levels or page breaks). It outputs the same JSON shape with **plain-text turned into simple HTML** (e.g. `<p>...</p>` per paragraph).
- **Diagrams:** The script can optionally list page numbers where images appear; you then export those pages as images, upload them, and paste the `<img>` URLs into the generated JSON.
- **Questions:** If the PDF has a “Questions” section, you can either include that HTML in the right node’s `contentBody` or add questions later via the Level-wise practice UI/API.
- After generation, **review and edit the JSON** (fix hierarchy, merge/split sections, add image URLs), then run the **JSON import** script.

---

## 5. Scripts

| Script | Purpose |
|--------|--------|
| `scripts/import-content-tree.mjs` | Reads the content tree JSON and creates/updates exam + all levels via API; sets `contentBody` on each entity (PUT). |
| `scripts/pdf-to-content-tree.mjs` | (Optional) Reads a PDF, extracts text (and simple structure), outputs content tree JSON with placeholder HTML. Install `pdf-parse` to use. |
| `scripts/sample-content-tree.json` | Example JSON; use as template. |
| `scripts/README-import.md` | How to run the scripts, env vars, and tips. |

Import flow:

1. **Create** the JSON (manually or via `pdf-to-content-tree.mjs`).
2. **Edit** the JSON: fix levels, add diagram `<img>` URLs, refine HTML.
3. Run **`import-content-tree.mjs`** with `API_BASE` pointing at your backend (e.g. `http://localhost:3000`). The script will create any missing exam/subject/unit/chapter/topic/subtopic/definition and then **PUT `contentBody`** for each so the frontend shows content in the **same format** (rendered by `ContentRenderer`).

---

## 6. Diagrams and images

- **In PDF:** Diagrams are usually embedded images. Extract them (e.g. export page as image, or use a PDF tool that exports images).
- **In LMS:** Store images on a server or CDN (or use base64 for very small ones). In `contentBody` use:
  - `<img src="https://your-cdn.com/diagram.png" alt="Description" />`
  - Or `<figure><img src="..." alt="..." /><figcaption>Caption</figcaption></figure>`
- `ContentRenderer` adds lazy loading and responsive classes; `.lexical-content` in `globals.css` styles figures and images. So the **same format** as the editor is used for display.

---

## 7. Questions

- **Inside content:** You can put question text (and optional answers) inside `contentBody` as HTML (e.g. numbered list, or a `<section class="questions">`).
- **As practice quizzes:** For MCQs/NVQs per level, use **Level-wise practice** (and the level-wise practice APIs) separately; the import script only fills **content** (`contentBody`), not quiz questions.

---

## 8. Summary

- **Goal:** Subject book PDF content (seven levels + content + diagrams, optionally questions) in the LMS with the **same format** as the editor (HTML in `contentBody`).
- **Steps:** (1) Produce the **content tree JSON** (manual or PDF script), (2) Put HTML (and diagram `<img>` URLs) into each node’s `contentBody`, (3) Run **import-content-tree.mjs** to create/update entities and set `contentBody` via the existing API.
