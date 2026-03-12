#!/usr/bin/env node
/**
 * Extract text from a PDF and output a content tree JSON (placeholder structure).
 * Install: npm install pdf-parse
 * Usage: node scripts/pdf-to-content-tree.mjs path/to/book.pdf [exam-name] [subject-name] > output.json
 *
 * Output is a minimal 7-level tree; contentBody is simple HTML from extracted text.
 * You should edit the JSON to fix hierarchy, add diagram <img> URLs, and refine HTML before importing.
 */

const fs = await import("fs");
const path = await import("path");

let pdfParse;
try {
  pdfParse = (await import("pdf-parse")).default;
} catch {
  console.error("Install pdf-parse first: npm install pdf-parse");
  process.exit(1);
}

const pdfPath = process.argv[2];
const examName = process.argv[3] || "Imported Exam";
const subjectName = process.argv[4] || "Imported Subject";

if (!pdfPath) {
  console.error("Usage: node scripts/pdf-to-content-tree.mjs <path-to-pdf> [exam-name] [subject-name]");
  process.exit(1);
}

const buffer = fs.readFileSync(pdfPath);
const data = await pdfParse(buffer);
const fullText = (data && data.text) ? String(data.text) : "";
const numPages = (data && data.numpages) ? data.numpages : 0;

/** Split into blocks by double newline; treat lines that look like headings as section starts */
function splitIntoBlocks(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const blocks = [];
  let current = [];
  const flush = () => {
    const para = current.join(" ").trim();
    if (para) blocks.push(para);
    current = [];
  };
  const looksLikeHeading = (line) => {
    if (line.length > 80) return false;
    if (/^\d+[\.\)]\s*/.test(line) || /^Chapter\s+\d+/i.test(line) || /^Unit\s+\d+/i.test(line) || /^Topic\s+\d+/i.test(line)) return true;
    if (line.length < 60 && line === line.toUpperCase()) return true;
    return false;
  };
  for (const line of lines) {
    if (looksLikeHeading(line) && current.length > 0) {
      flush();
    }
    current.push(line);
  }
  flush();
  return blocks;
}

/** Wrap plain text in <p> tags for use as contentBody */
function toSimpleHtml(paragraphs) {
  return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const blocks = splitIntoBlocks(fullText);

/** Build a minimal 7-level tree: 1 exam, 1 subject, ... 1 subtopic, N definitions (one per block or group) */
const definitionsPerLevel = Math.max(1, Math.floor(blocks.length / 7));
const definitions = [];
for (let i = 0; i < blocks.length; ) {
  const chunk = blocks.slice(i, i + definitionsPerLevel);
  const name = chunk[0].slice(0, 60) + (chunk[0].length > 60 ? "…" : "");
  definitions.push({
    name: name || `Section ${definitions.length + 1}`,
    contentBody: toSimpleHtml(chunk),
  });
  i += chunk.length;
}

const tree = {
  exam: {
    name: examName,
    contentBody: `<p>Content imported from ${path.basename(pdfPath)} (${numPages} pages).</p>`,
  },
  subjects: [
    {
      name: subjectName,
      contentBody: `<p>Subject content extracted from PDF. ${blocks.length} text blocks found.</p>`,
      units: [
        {
          name: "Unit 1",
          contentBody: "<p>First unit. Edit the generated JSON to split content into real units/chapters/topics/subtopics/definitions.</p>",
          chapters: [
            {
              name: "Chapter 1",
              contentBody: "<p>First chapter. Refine hierarchy in the JSON and re-import.</p>",
              topics: [
                {
                  name: "Topic 1",
                  contentBody: "<p>First topic.</p>",
                  subtopics: [
                    {
                      name: "Subtopic 1",
                      contentBody: "<p>First subtopic. Definitions below contain the extracted text blocks.</p>",
                      definitions: definitions.length ? definitions : [{ name: "Definition 1", contentBody: "<p>No text blocks extracted. Check the PDF.</p>" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

console.log(JSON.stringify(tree, null, 2));
