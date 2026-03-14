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

/** Convert paragraphs to HTML <p> tags */
function paragraphsToHtml(paragraphs: string[]): string {
  return paragraphs
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("\n");
}

/** Split lines into paragraphs (by blank lines) */
function linesToParagraphs(lines: string[]): string[] {
  const trimmed = lines.map((l) => l.trim());
  const paragraphs: string[] = [];
  let current: string[] = [];
  for (const line of trimmed) {
    if (line === "") {
      if (current.length > 0) {
        paragraphs.push(current.join(" ").trim());
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) paragraphs.push(current.join(" ").trim());
  return paragraphs.filter(Boolean);
}

/**
 * Convert raw lines to HTML: paragraphs <p>, bullet lists <ul><li>, figures Fig. X.Y Caption → <figure><figcaption>.
 */
function linesToHtml(lines: string[]): string {
  const blocks: string[] = [];
  let i = 0;
  const flushParagraph = (paraLines: string[]) => {
    const p = paraLines.join(" ").trim();
    if (p) blocks.push(`<p>${escapeHtml(p)}</p>`);
  };
  let paraBuffer: string[] = [];
  const flushParaBuffer = () => {
    if (paraBuffer.length > 0) {
      flushParagraph(paraBuffer);
      paraBuffer = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    const bulletMatch = trimmed.match(/^[•\-]\s*(.+)$/) || (trimmed.length > 0 && /^\d+\.\s+/.test(trimmed));
    if (bulletMatch) {
      flushParaBuffer();
      const listItems: string[] = [];
      if (typeof bulletMatch === "boolean") {
        listItems.push(trimmed);
        i++;
      } else {
        listItems.push(bulletMatch[1]);
        i++;
      }
      while (i < lines.length) {
        const next = lines[i].trim();
        const nextBullet = next.match(/^[•\-]\s*(.+)$/) || (next && /^\d+\.\s+/.test(next));
        if (nextBullet) {
          if (typeof nextBullet === "boolean") listItems.push(next);
          else listItems.push(nextBullet[1]);
          i++;
        } else if (next === "") {
          i++;
        } else {
          break;
        }
      }
      if (listItems.length > 0) {
        blocks.push("<ul>\n" + listItems.map((li) => `<li>${escapeHtml(li.trim())}</li>`).join("\n") + "\n</ul>");
      }
      continue;
    }

    const figMatch = trimmed.match(/^Fig\.?\s*(\d+\.?\d*)\s*[:\s]*(.+)$/i);
    if (figMatch) {
      flushParaBuffer();
      const caption = figMatch[2].trim();
      blocks.push(`<figure>\n<figcaption>${escapeHtml(caption)}</figcaption>\n</figure>`);
      i++;
      continue;
    }

    if (trimmed === "") {
      flushParaBuffer();
      i++;
      continue;
    }

    paraBuffer.push(line);
    i++;
  }
  flushParaBuffer();

  return blocks.length > 0 ? blocks.join("\n") : "";
}

// --- Neet-Biology (Maharashtra Std XI) ---

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

function lessonToUnitIndex(lessonNum: number): number {
  if (lessonNum >= 1 && lessonNum <= 4) return 0;
  if (lessonNum >= 5 && lessonNum <= 7) return 1;
  if (lessonNum >= 8 && lessonNum <= 11) return 2;
  if (lessonNum === 12) return 3;
  if (lessonNum >= 13 && lessonNum <= 16) return 4;
  return 0;
}

function isNeetBiologyBook(text: string): boolean {
  const t = text.slice(0, 8000);
  return (
    /Living\s+World/i.test(t) &&
    /Systematics\s+of\s+Living/i.test(t) &&
    (/\b1\.\d+\s+[A-Za-z]/.test(t) || /\b1\.\s+Living\s+World/.test(t))
  );
}

/** Extract competency statements (unit bullets) from Competency Statements section.
 * Unit names in the PDF are often split across lines (e.g. "Diversity in" / "living world").
 * Use a sliding window to match full unit names and assign bullets to the correct unit.
 */
function parseCompetencyStatements(text: string): Map<number, string> {
  const unitContent = new Map<number, string>();
  const idx = text.indexOf("Competency Statements");
  if (idx < 0) return unitContent;
  const endIdx = text.indexOf("Contents");
  const section = endIdx > idx ? text.slice(idx, endIdx) : text.slice(idx);
  const lines = section.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const unitNamesLower = NEET_BIOLOGY_UNITS.map((u) => u.toLowerCase());
  let currentUnit = -1;
  const bullets: string[] = [];
  const window: string[] = [];
  const maxWindow = 3;

  const flushUnit = () => {
    if (currentUnit >= 0 && bullets.length > 0) {
      const html = "<ul>\n" + bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("\n") + "\n</ul>";
      const existing = unitContent.get(currentUnit) || "";
      unitContent.set(currentUnit, existing + html);
    }
  };

  for (const line of lines) {
    const lower = line.toLowerCase();
    const isBullet = /^[•\-]\s*/.test(line);
    const isShort = line.length < 100;

    if (!isBullet && isShort) {
      window.push(lower);
      if (window.length > maxWindow) window.shift();
      const combined = window.join(" ");
      for (let u = 0; u < unitNamesLower.length; u++) {
        if (combined.includes(unitNamesLower[u])) {
          flushUnit();
          currentUnit = u;
          bullets.length = 0;
          window.length = 0;
          const intro = line.replace(new RegExp(unitNamesLower[u].replace(/\s+/g, "\\s+"), "gi"), "").trim();
          if (intro.length > 2 && !/^[•\-]\s*/.test(intro)) {
            unitContent.set(currentUnit, `<p>${escapeHtml(intro)}</p>\n`);
          }
          break;
        }
      }
      continue;
    }

    if (isBullet && currentUnit >= 0) {
      bullets.push(line.replace(/^[•\-]\s*/, "").trim());
    }
  }
  flushUnit();

  return unitContent;
}

interface ParsedSection {
  lessonNum: number;
  sectionNum: number;
  title: string;
  contentLines: string[];
}

interface ParsedSubtopic {
  name: string;
  contentLines: string[];
}

/** Split topic content into lettered subtopics (A., B., C.).
 * Handles both "A. Title text" on one line and "A." alone with content on following lines.
 */
function parseSubtopicsAndDefinitions(contentLines: string[]): { subtopics: ParsedSubtopic[] } {
  const subtopics: ParsedSubtopic[] = [];
  const letterWithTextRe = /^([A-Z])\.\s+(.+)$/;
  const letterOnlyRe = /^([A-Z])\.\s*$/;
  let current: ParsedSubtopic | null = null;

  for (const line of contentLines) {
    const trimmed = line.trim();
    const withText = trimmed.match(letterWithTextRe);
    const onlyLetter = trimmed.match(letterOnlyRe);

    if (withText && withText[1].length === 1) {
      if (current) subtopics.push({ ...current, contentLines: [...current.contentLines] });
      current = { name: `${withText[1]}. ${withText[2].trim()}`, contentLines: [] };
      continue;
    }
    if (onlyLetter && onlyLetter[1].length === 1) {
      if (current) subtopics.push({ ...current, contentLines: [...current.contentLines] });
      current = { name: `${onlyLetter[1]}.`, contentLines: [] };
      continue;
    }
    if (current) current.contentLines.push(line);
  }
  if (current) subtopics.push(current);

  if (subtopics.length === 0 && contentLines.length > 0) {
    subtopics.push({ name: "Content", contentLines: [...contentLines] });
  }
  return { subtopics };
}

/** Build definitions from lines: "Term is explanation" or one definition per paragraph */
function buildDefinitionsFromLines(lines: string[]): { name: string; contentBody: string }[] {
  const definitions: { name: string; contentBody: string }[] = [];
  const paras = linesToParagraphs(lines);
  for (const p of paras) {
    const isMatch = p.match(/^([A-Za-z][^.]{2,60}?)\s+(?:is|means|refers to|denotes)\s+(.+)$/);
    if (isMatch) {
      definitions.push({
        name: isMatch[1].trim(),
        contentBody: `<p>${escapeHtml(p)}</p>`,
      });
    } else {
      const name = p.slice(0, 60).trim() + (p.length > 60 ? "…" : "") || "Definition";
      definitions.push({ name, contentBody: `<p>${escapeHtml(p)}</p>` });
    }
  }
  return definitions.length > 0 ? definitions : [{ name: "Content", contentBody: paragraphsToHtml(paras) || "<p>—</p>" }];
}

function parseNeetBiologySections(text: string): ParsedSection[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const sections: ParsedSection[] = [];
  let currentLesson = 0;
  let currentSection: ParsedSection | null = null;

  const lessonRe = /^(\d{1,2})\.\s+([A-Za-z]\D*)$/;
  const sectionRe = /^(\d{1,2})\.(\d{1,2})\s*(?::?\s*)?(.{1,200})?$/;

  for (const line of lines) {
    if (!line) {
      if (currentSection) currentSection.contentLines.push("");
      continue;
    }

    const sectionMatch = line.match(sectionRe);
    const lessonMatch = line.match(lessonRe);

    if (sectionMatch && !line.startsWith(sectionMatch[1] + ". ")) {
      const lessonNum = parseInt(sectionMatch[1], 10);
      const sectionNum = parseInt(sectionMatch[2], 10);
      const title = (sectionMatch[3] || `${sectionMatch[1]}.${sectionMatch[2]}`).trim().replace(/\s*:\s*$/, "");

      if (currentSection) {
        if (currentSection.contentLines.length > 0 || currentSection.title) {
          sections.push({ ...currentSection, contentLines: [...currentSection.contentLines] });
        }
      }

      currentLesson = lessonNum;
      currentSection = { lessonNum, sectionNum, title, contentLines: [] };
      continue;
    }

    if (lessonMatch && currentLesson !== parseInt(lessonMatch[1], 10)) {
      const num = parseInt(lessonMatch[1], 10);
      if (num >= 1 && num <= 16) {
        if (currentSection && (currentSection.contentLines.length > 0 || currentSection.title)) {
          sections.push({ ...currentSection, contentLines: [...currentSection.contentLines] });
        }
        currentLesson = num;
        currentSection = null;
      }
    }

    if (currentSection) currentSection.contentLines.push(line);
  }

  if (currentSection && (currentSection.contentLines.length > 0 || currentSection.title)) {
    sections.push({ ...currentSection, contentLines: [...currentSection.contentLines] });
  }

  return sections;
}

function buildNeetBiologyTree(
  sections: ParsedSection[],
  competencyByUnit: Map<number, string>,
  fileName: string,
  numPages: number,
  examName: string,
  subjectName: string
): ContentTree {
  const unitNames = [...NEET_BIOLOGY_UNITS];
  const lessonNames = [...NEET_BIOLOGY_LESSONS];

  const units: SubjectNode["units"] = unitNames.map((name, uIdx) => ({
    name,
    contentBody:
      competencyByUnit.get(uIdx) ||
      `<p>Unit ${uIdx + 1}: ${escapeHtml(name)}. Content from ${escapeHtml(fileName)} (${numPages} pages).</p>`,
    chapters: [],
  }));

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
      const { subtopics: parsedSubtopics } = parseSubtopicsAndDefinitions(sec.contentLines);

      const subtopics = parsedSubtopics.map((st) => {
        const definitions = buildDefinitionsFromLines(st.contentLines);
        const contentBody = linesToHtml(st.contentLines) || `<p>${escapeHtml(st.name)}</p>`;
        return {
          name: st.name,
          contentBody: contentBody || "<p>—</p>",
          definitions,
        };
      });

      const topicIntroHtml = linesToHtml(sec.contentLines);
      const topicContentBody =
        topicIntroHtml ||
        `<p>Section ${sec.lessonNum}.${sec.sectionNum}: ${escapeHtml(sec.title)}.</p>`;

      if (subtopics.length === 0) {
        const defs = buildDefinitionsFromLines(sec.contentLines);
        subtopics.push({
          name: "Content",
          contentBody: topicContentBody || "<p>—</p>",
          definitions: defs.length > 0 ? defs : [{ name: sec.title.slice(0, 80) || "Content", contentBody: topicContentBody }],
        });
      }

      return {
        name: `${sec.lessonNum}.${sec.sectionNum} ${sec.title}`.slice(0, 120),
        contentBody: topicContentBody,
        subtopics,
      };
    });

    const chapterContent =
      topics.length > 0
        ? `<p>Chapter ${lessonNum}: ${escapeHtml(chapterName)}. ${topics.length} topic(s).</p>`
        : `<p>${escapeHtml(chapterName)}. No topics parsed.</p>`;

    const chapter = {
      name: chapterName,
      contentBody: chapterContent,
      topics:
        topics.length > 0
          ? topics
          : [
              {
                name: "Overview",
                contentBody: chapterContent,
                subtopics: [
                  {
                    name: "Content",
                    contentBody: chapterContent,
                    definitions: [{ name: "Overview", contentBody: chapterContent }],
                  },
                ],
              },
            ],
    };

    units[unitIdx].chapters.push(chapter);
  }

  const subject: SubjectNode = {
    name: subjectName,
    contentBody: `<p>Subject: <strong>${escapeHtml(subjectName)}</strong>. Imported from ${escapeHtml(fileName)} (${numPages} pages). Maharashtra Std XI Biology — 5 units, 16 chapters.</p>`,
    units,
  };

  return {
    exam: {
      name: examName,
      contentBody: `<p>Exam: <strong>${escapeHtml(examName)}</strong>. Content from ${escapeHtml(fileName)} (${numPages} pages).</p>`,
    },
    subjects: [subject],
  };
}

// --- Generic fallback ---

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
    if (/^\d+[.)]\s*/.test(line) || /^Chapter\s+\d+/i.test(line) || /^Unit\s+\d+/i.test(line)) return true;
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
    definitions.push({ name, contentBody: paragraphsToHtml(chunk) });
    i += chunk.length;
  }

  const subjects: SubjectNode[] = [
    {
      name: subjectName,
      contentBody: `<p>Content from <strong>${escapeHtml(fileName)}</strong> (${numPages} pages). ${blocks.length} blocks. Use Neet-Biology PDF for full hierarchy.</p>`,
      units: [
        {
          name: "Unit 1",
          contentBody: "<p>First unit. Edit JSON to match your book.</p>",
          chapters: [
            {
              name: "Chapter 1",
              contentBody: "<p>First chapter.</p>",
              topics: [
                {
                  name: "Topic 1",
                  contentBody: "<p>First topic.</p>",
                  subtopics: [
                    {
                      name: "Content",
                      contentBody: "<p>Definitions below.</p>",
                      definitions: definitions.length ? definitions : [{ name: "Definition 1", contentBody: "<p>No content.</p>" }],
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
      contentBody: `<p>Content from <strong>${escapeHtml(fileName)}</strong> (${numPages} pages).</p>`,
    },
    subjects,
  };
}

export function buildContentTreeFromText(
  rawText: string,
  fileName: string,
  numPages: number,
  examName: string,
  subjectName: string
): ContentTree {
  if (isNeetBiologyBook(rawText)) {
    const competencyByUnit = parseCompetencyStatements(rawText);
    const sections = parseNeetBiologySections(rawText);
    return buildNeetBiologyTree(sections, competencyByUnit, fileName, numPages, examName, subjectName);
  }
  return buildGenericTree(rawText, fileName, numPages, examName, subjectName);
}

export function countTreeNodes(tree: ContentTree): { units: number; chapters: number; topics: number; definitions: number } {
  let units = 0,
    chapters = 0,
    topics = 0,
    definitions = 0;
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
