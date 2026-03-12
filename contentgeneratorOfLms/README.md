# LMS Content Generator

Standalone app to **upload a PDF**, see **extracted contentBody** (HTML) and the **7-level tree structure**. Export **import-ready JSON** and use it in the main LMS (admin/import script).

## Run

From this folder (`contentgeneratorOfLms`):

```bash
npm install
npm run dev
```

Open http://localhost:5173 (or the URL Vite prints).

## Usage

1. **Upload PDF** – Click “Insert PDF” and choose a book PDF (e.g. Neet-Biology).
2. **Exam & subject** – Set “Exam name” (e.g. NEET) and “Subject name” (e.g. Biology) before or after loading; they are used when building the tree.
3. **Tree** – Left panel shows: Exam → Subject → Unit → Chapter → Topic → Subtopic → Definition. Click a node to view its **contentBody**.
4. **contentBody** – Right panel shows raw HTML and a preview (as in the LMS).
5. **Export JSON** – Click “Export as JSON” to download a file. Use it in the main LMS to import content.

## Neet-Biology (Maharashtra Std XI) PDFs

For **Neet-Biology-book.pdf** (and similar Maharashtra Std XI Biology books with 16 lessons and section numbers like 1.1, 1.2):

- The app **auto-detects** this format and builds:
  - **5 units**: Diversity in living world, Cell structure and functions, Structural organization in organisms, Plant physiology, Animal Physiology
  - **16 chapters**: Living World, Systematics of Living Organisms, … through Skeleton and Movement
  - **Topics** = sections (e.g. 1.1 Basic principles of life, 1.2 Herbarium); each has one **Subtopic** “Content” with one **Definition** whose **contentBody** is the section text as HTML.

Other PDFs use a **generic** parser: one unit/chapter/topic/subtopic and many definition blocks from split paragraphs.

## Importing into the LMS

1. Export JSON from this app (e.g. `content-tree-Neet-Biology-book.json`).
2. In the **main LMS** repo (root):
   ```bash
   API_BASE=http://localhost:3000 node scripts/import-content-tree.mjs path/to/content-tree-Neet-Biology-book.json
   ```
   Or with stdin: `cat content-tree.json | API_BASE=http://localhost:3000 node scripts/import-content-tree.mjs`
3. The script creates exam/subject/unit/chapter/topic/subtopic/definition via API and sets **contentBody** on each. You can then edit content in the LMS admin/self-study editor.

## Output format

- **Tree**: Same 7-level hierarchy as the LMS (exam → subjects → units → chapters → topics → subtopics → definitions).
- **contentBody**: HTML string per node. Images can be added as `<img src="...">` in the JSON or later in the LMS editor.

## Tech

- Vite + React + TypeScript
- `pdfjs-dist` for client-side PDF text extraction
- No backend; everything runs in the browser.
