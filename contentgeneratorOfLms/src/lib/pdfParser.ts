import * as PDFJS from "pdfjs-dist";
import pdfjsWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { ContentTree, SubjectNode } from "../types";

PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;

export async function extractTextFromPdf(
  file: File
): Promise<{ text: string; numPages: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const parts: string[] = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    parts.push(pageText);
  }
  const text = parts.join("\n\n");
  return { text, numPages };
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toSimpleHtml(paragraphs: string[]): string {
  return paragraphs
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("\n");
}

/** Split a section's raw lines into paragraphs (by blank lines or single lines) */
function linesToParagraphs(lines: string[]): string[] {
  const trimmed = lines.map((l) => l.trim()).filter(Boolean);
  if (trimmed.length === 0) return [];
  const paragraphs: string[] = [];
  let current: string[] = [];
  for (const line of trimmed) {
    if (line === "") {
      if (current.length > 0) {
        paragraphs.push(current.join(" "));
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) paragraphs.push(current.join(" "));
  return paragraphs;
}

// --- Neet-Biology (Maharashtra Std XI) book structure ---

const NEET_BIOLOGY_UNITS = [
  "Diversity in living world",
  "Cell structure and functions",
  "Structural organization in organisms",
  "Plant physiology",
  "Animal Physiology",
] as const;

const NEET_BIOLOGY_LESSONS: readonly string[] = [
  "Living World",
  "Systematics of Living Organisms",
  "Kingdom Plantae",
  "Kingdom Animalia",
  "Cell Structure and Organization",
  "Biomolecules",
  "Cell Division",
  "Plant Tissues and Anatomy",
  "Morphology of Flowering Plants",
  "Animal Tissue",
  "Study of Animal Type : Cockroach",
  "Photosynthesis",
  "Respiration and Energy Transfer",
  "Human Nutrition",
  "Excretion and Osmoregulation",
  "Skeleton and Movement",
];

/** Lesson number (1–16) → unit index (0–4) */
function lessonToUnitIndex(lessonNum: number): number {
  if (lessonNum >= 1 && lessonNum <= 4) return 0;
  if (lessonNum >= 5 && lessonNum <= 7) return 1;
  if (lessonNum >= 8 && lessonNum <= 11) return 2;
  if (lessonNum === 12) return 3;
  if (lessonNum >= 13 && lessonNum <= 16) return 4;
  return 0;
}

/** Detect if the text looks like the Neet-Biology book (Maharashtra Std XI, 16 lessons) */
function isNeetBiologyBook(text: string): boolean {
  const t = text.slice(0, 8000);
  const hasLivingWorld = /Living\s+World/i.test(t);
  const hasSystematics = /Systematics\s+of\s+Living/i.test(t);
  const hasSectionPattern = /\b1\.\d+\s+[A-Za-z]/.test(t);
  const hasLessonPattern = /\b1\.\s+Living\s+World/.test(t) || /\b2\.\s+Systematics/.test(t);
  return (hasLivingWorld && hasSystematics && (hasSectionPattern || hasLessonPattern)) === true;
}

interface ParsedSection {
  lessonNum: number;
  sectionNum: number;
  title: string;
  contentLines: string[];
}

/**
 * Parse Neet-Biology book text into lessons and sections (1.1, 1.2, …).
 * Returns flat list of sections with lesson number and content.
 */
function parseNeetBiologySections(text: string): ParsedSection[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const sections: ParsedSection[] = [];
  let currentLesson = 0;
  let currentSection: ParsedSection | null = null;

  // Match lesson start: "1. Living World" or "2. Systematics..." (digit, dot, space, then letter — not "1.1")
  const lessonRe = /^(\d{1,2})\.\s+([A-Za-z]\D*)$/;
  // Match section start: "1.1 Basic principles" or "1.3  Botanical Gardens :"
  const sectionRe = /^(\d{1,2})\.(\d{1,2})\s*(?::?\s*)?(.{1,200})?$/;

  for (const line of lines) {
    if (!line) {
      if (currentSection) currentSection.contentLines.push("");
      continue;
    }

    const sectionMatch = line.match(sectionRe);
    const lessonMatch = line.match(lessonRe);

    // Avoid "1.1" being treated as lesson "1." + "1"
    if (sectionMatch && !line.startsWith(sectionMatch[1] + ". ")) {
      const lessonNum = parseInt(sectionMatch[1], 10);
      const sectionNum = parseInt(sectionMatch[2], 10);
      const title = (sectionMatch[3] || `${sectionMatch[1]}.${sectionMatch[2]}`).trim().replace(/\s*:\s*$/, "");

      if (currentSection) {
        const paras = linesToParagraphs(currentSection.contentLines);
        if (paras.length > 0 || currentSection.title) sections.push({ ...currentSection, contentLines: currentSection.contentLines });
      }

      currentLesson = lessonNum;
      currentSection = { lessonNum, sectionNum, title, contentLines: [] };
      continue;
    }

    if (lessonMatch && currentLesson !== parseInt(lessonMatch[1], 10)) {
      const num = parseInt(lessonMatch[1], 10);
      if (num >= 1 && num <= 16) {
        if (currentSection) {
          const paras = linesToParagraphs(currentSection.contentLines);
          if (paras.length > 0 || currentSection.title) sections.push({ ...currentSection, contentLines: currentSection.contentLines });
        }
        currentLesson = num;
        // Lesson title line doesn't start a section; next line might be 1.1, 2.1, etc.
        currentSection = null;
      }
    }

    if (currentSection) currentSection.contentLines.push(line);
  }

  if (currentSection) {
    const paras = linesToParagraphs(currentSection.contentLines);
    if (paras.length > 0 || currentSection.title) sections.push({ ...currentSection, contentLines: currentSection.contentLines });
  }

  return sections;
}

/**
 * Build 7-level ContentTree from Neet-Biology parsed sections.
 * Units (5) → Chapters (16 lessons) → Topics (X.Y sections) → one Subtopic "Content" → one Definition per section.
 */
function buildNeetBiologyTree(
  sections: ParsedSection[],
  fileName: string,
  numPages: number,
  examName: string,
  subjectName: string
): ContentTree {
  const unitNames = [...NEET_BIOLOGY_UNITS];
  const lessonNames = [...NEET_BIOLOGY_LESSONS];

  const units: SubjectNode["units"] = unitNames.map((name, uIdx) => ({
    name,
    contentBody: `<p>Unit ${uIdx + 1}: ${escapeHtml(name)}. Content from ${escapeHtml(fileName)} (${numPages} pages).</p>`,
    chapters: [],
  }));

  // Group sections by lesson; each lesson goes to one chapter under the correct unit
  const byLesson = new Map<number, ParsedSection[]>();
  for (const s of sections) {
    if (!byLesson.has(s.lessonNum)) byLesson.set(s.lessonNum, []);
    byLesson.get(s.lessonNum)!.push(s);
  }

  for (let lessonNum = 1; lessonNum <= 16; lessonNum++) {
    const unitIdx = lessonToUnitIndex(lessonNum);
    const chapterName = lessonNames[lessonNum - 1] ?? `Lesson ${lessonNum}`;
    const lessonSections = byLesson.get(lessonNum) ?? [];

    const topics = lessonSections.map((sec) => {
      const paras = linesToParagraphs(sec.contentLines);
      const contentBody = paras.length > 0 ? toSimpleHtml(paras) : `<p>${escapeHtml(sec.title)}</p>`;
      const definitionName = sec.title.slice(0, 80) + (sec.title.length > 80 ? "…" : "");
      return {
        name: `${sec.lessonNum}.${sec.sectionNum} ${sec.title}`.slice(0, 120),
        contentBody: `<p>Section ${sec.lessonNum}.${sec.sectionNum}: ${escapeHtml(sec.title)}.</p>`,
        subtopics: [
          {
            name: "Content",
            contentBody: "<p>See definitions below for section content.</p>",
            definitions: [{ name: definitionName || `Section ${sec.lessonNum}.${sec.sectionNum}`, contentBody }],
          },
        ],
      };
    });

    const chapterContent =
      topics.length > 0
        ? `<p>Chapter ${lessonNum}: ${escapeHtml(chapterName)}. ${topics.length} section(s).</p>`
        : `<p>${escapeHtml(chapterName)}. No sections parsed.</p>`;

    const chapter = {
      name: chapterName,
      contentBody: chapterContent,
      topics: topics.length > 0 ? topics : [
        {
          name: "Overview",
          contentBody: chapterContent,
          subtopics: [
            { name: "Content", contentBody: chapterContent, definitions: [{ name: "Overview", contentBody: chapterContent }] },
          ],
        },
      ],
    };

    units[unitIdx].chapters.push(chapter);
  }

  const subject: SubjectNode = {
    name: subjectName,
    contentBody: `<p>Subject: ${escapeHtml(subjectName)}. Imported from <strong>${escapeHtml(fileName)}</strong> (${numPages} pages). Maharashtra Std XI Biology structure: 5 units, 16 chapters.</p>`,
    units,
  };

  return {
    exam: {
      name: examName,
      contentBody: `<p>Exam: ${escapeHtml(examName)}. Content from <strong>${escapeHtml(fileName)}</strong> (${numPages} pages).</p>`,
    },
    subjects: [subject],
  };
}

// --- Generic fallback parser ---

/** Split text into blocks; lines that look like headings start a new section */
function splitIntoBlocks(text: string): string[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const blocks: string[] = [];
  let current: string[] = [];
  const flush = () => {
    const para = current.join(" ").trim();
    if (para) blocks.push(para);
    current = [];
  };
  const looksLikeHeading = (line: string) => {
    if (line.length > 80) return false;
    if (/^\d+[.)]\s*/.test(line) || /^Chapter\s+\d+/i.test(line) || /^Unit\s+\d+/i.test(line) || /^Topic\s+\d+/i.test(line)) return true;
    if (line.length < 60 && line === line.toUpperCase()) return true;
    return false;
  };
  for (const line of lines) {
    if (looksLikeHeading(line) && current.length > 0) flush();
    current.push(line);
  }
  flush();
  return blocks;
}

function buildGenericTree(
  rawText: string,
  fileName: string,
  numPages: number,
  examName: string,
  subjectName: string
): ContentTree {
  const blocks = splitIntoBlocks(rawText);
  const definitionsPerLevel = Math.max(1, Math.floor(blocks.length / 7));
  const definitions: { name: string; contentBody: string }[] = [];
  for (let i = 0; i < blocks.length; ) {
    const chunk = blocks.slice(i, i + definitionsPerLevel);
    const name = (chunk[0]?.slice(0, 60) ?? "") + (chunk[0] && chunk[0].length > 60 ? "…" : "") || `Section ${definitions.length + 1}`;
    definitions.push({ name, contentBody: toSimpleHtml(chunk) });
    i += chunk.length;
  }

  const subjects: SubjectNode[] = [
    {
      name: subjectName,
      contentBody: `<p>Content extracted from <strong>${escapeHtml(fileName)}</strong> (${numPages} pages). ${blocks.length} text blocks detected. Use <strong>Neet-Biology</strong> PDF for automatic unit/chapter/section structure.</p>`,
      units: [
        {
          name: "Unit 1",
          contentBody: "<p>First unit. Refine the tree and export to JSON for import into LMS.</p>",
          chapters: [
            {
              name: "Chapter 1",
              contentBody: "<p>First chapter. Edit the generated JSON to match your book structure.</p>",
              topics: [
                {
                  name: "Topic 1",
                  contentBody: "<p>First topic.</p>",
                  subtopics: [
                    {
                      name: "Subtopic 1",
                      contentBody: "<p>Definitions below contain the extracted text blocks.</p>",
                      definitions: definitions.length ? definitions : [{ name: "Definition 1", contentBody: "<p>No text blocks extracted.</p>" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  return {
    exam: {
      name: examName,
      contentBody: `<p>Content imported from <strong>${escapeHtml(fileName)}</strong> (${numPages} pages).</p>`,
    },
    subjects,
  };
}

/**
 * Build a 7-level content tree from extracted PDF text.
 * Uses Neet-Biology (Maharashtra Std XI) structure when detected; otherwise generic single-unit tree.
 */
export function buildContentTreeFromText(
  rawText: string,
  fileName: string,
  numPages: number,
  examName: string,
  subjectName: string
): ContentTree {
  if (isNeetBiologyBook(rawText)) {
    const sections = parseNeetBiologySections(rawText);
    return buildNeetBiologyTree(sections, fileName, numPages, examName, subjectName);
  }
  return buildGenericTree(rawText, fileName, numPages, examName, subjectName);
}

/** Count nodes for status message */
export function countTreeNodes(tree: ContentTree): { units: number; chapters: number; topics: number; definitions: number } {
  let units = 0;
  let chapters = 0;
  let topics = 0;
  let definitions = 0;
  for (const s of tree.subjects) {
    for (const u of s.units) {
      units++;
      for (const c of u.chapters) {
        chapters++;
        for (const t of c.topics) {
          topics++;
          for (const st of t.subtopics) {
            definitions += st.definitions.length;
          }
        }
      }
    }
  }
  return { units, chapters, topics, definitions };
}
