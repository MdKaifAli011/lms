/**
 * Import scripts/biology.json (or any same-shape JSON) into LMS syllabus.
 *
 * Flow:
 *   1. EXAM_ID — target exam (must exist).
 *   2. Subject — from JSON book_title (e.g. "Biology") or SUBJECT_NAME / SUBJECT_SLUG.
 *      Creates subject under that exam if none with that slug exists; otherwise reuses it.
 *   3. Children — Unit → Chapter → Topic → Subtopic (same as before).
 *
 * Subtopic: name = definition term, contentBody = definition_content (HTML).
 *
 * Usage:
 *   node scripts/import-biology.mjs
 *   → prompts: Please enter examId:
 *   Optional: node scripts/import-biology.mjs ./path/to.json
 *
 * Non-interactive (CI): set EXAM_ID in environment.
 *
 * Env:
 *   EXAM_ID          Exam ObjectId (optional; required if stdin is not a TTY)
 *   SUBJECT_NAME     Override subject display name (default: book_title)
 *   SUBJECT_SLUG     Override subject slug (default: slugify(SUBJECT_NAME))
 *   MONGODB_URI, MONGODB_DATABASE
 *   DRY_RUN=1        verify exam + print counts; no writes
 *   SKIP_EXISTING=1  merge descriptions on existing rows (default 1)
 */

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

function askLine(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(String(answer ?? "").trim());
    });
  });
}

async function resolveExamId() {
  let id = (process.env.EXAM_ID || "").trim();
  const tty = process.stdin.isTTY && process.stdout.isTTY;
  if (tty) {
    const first = await askLine("Please enter examId: ");
    if (first) id = first;
    let attempts = 0;
    while (!mongoose.Types.ObjectId.isValid(id)) {
      attempts++;
      if (attempts > 5) {
        console.error("No valid examId after several tries. Exiting.");
        process.exit(1);
      }
      id = await askLine(
        "Invalid examId (must be 24 hex characters). Please enter examId: "
      );
    }
    return id;
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error(
      "Set EXAM_ID in the environment when running non-interactively (no TTY)."
    );
    process.exit(1);
  }
  return id;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  for (const fname of [".env.local", ".env"]) {
    try {
      const p = path.join(process.cwd(), fname);
      if (!fs.existsSync(p)) continue;
      const text = fs.readFileSync(p, "utf8");
      for (const line of text.split("\n")) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const i = t.indexOf("=");
        if (i === -1) continue;
        const k = t.slice(0, i).trim();
        let v = t.slice(i + 1).trim();
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1);
        }
        if (process.env[k] === undefined) process.env[k] = v;
      }
    } catch {
      /* ignore */
    }
  }
}

loadEnvLocal();

function slugify(value) {
  const base = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "item";
}

function toTitleCase(text) {
  const s = String(text || "").trim();
  if (!s) return "";
  const LOWER = new Set(["and", "of", "or", "in", "the", "a", "an", "to", "for"]);
  return s
    .split(/\s+/)
    .map((word, i) => {
      if (word === word.toUpperCase() && /[A-Z]/.test(word)) return word;
      if (i > 0 && LOWER.has(word.toLowerCase())) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mylmsdoors";
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "mylmsdoors";
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
const SKIP_EXISTING =
  process.env.SKIP_EXISTING !== "0" && process.env.SKIP_EXISTING !== "false";

const jsonArg = process.argv[2];
const jsonPath = jsonArg
  ? path.resolve(process.cwd(), jsonArg)
  : path.join(__dirname, "biology.json");

const defaultDoc = {
  status: "Active",
  image: "No Image",
  content: "-",
  meta: "-",
  visits: 0,
  uniqueVisits: 0,
  today: 0,
  descriptions: [],
  seo: { noIndex: true, noFollow: true },
};

async function main() {
  const examIdArg = await resolveExamId();
  const examObjectId = new mongoose.Types.ObjectId(examIdArg);
  console.log("Using examId:", examIdArg);

  if (!fs.existsSync(jsonPath)) {
    console.error("File not found:", jsonPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, "utf8");
  const data = JSON.parse(raw);
  const units = data.units;
  if (!Array.isArray(units)) {
    console.error("Invalid JSON: expected .units array");
    process.exit(1);
  }

  const bookTitle = String(data.book_title || "").trim();
  const subjectName = toTitleCase(
    (process.env.SUBJECT_NAME || bookTitle || "Imported").trim()
  );
  const subjectSlug =
    slugify(process.env.SUBJECT_SLUG || subjectName) || "subject";

  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DATABASE });
  const db = mongoose.connection.db;

  const exams = db.collection("exams");
  const exam = await exams.findOne({ _id: examObjectId });
  if (!exam) {
    console.error("Exam not found for EXAM_ID:", examIdArg);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log("Exam:", exam.name, "| slug:", exam.slug);

  const subjectsCol = db.collection("subjects");
  let subjectDoc = await subjectsCol.findOne({
    examId: examObjectId,
    slug: subjectSlug,
  });

  if (DRY_RUN) {
    let chapters = 0,
      topics = 0,
      subtopics = 0;
    for (const u of units) {
      for (const ch of u.chapters || []) {
        chapters++;
        for (const tp of ch.topics || []) {
          topics++;
          for (const st of tp.subtopics || []) {
            if (String(st.definition || st.definition_content || "").trim()) {
              subtopics++;
            }
          }
        }
      }
    }
    console.log("\nDRY_RUN — no database writes.");
    console.log(
      JSON.stringify(
        {
          subject: subjectDoc
            ? { action: "reuse", name: subjectDoc.name, slug: subjectDoc.slug }
            : { action: "would_create", name: subjectName, slug: subjectSlug },
          units: units.length,
          chapters,
          topics,
          subtopics,
        },
        null,
        2
      )
    );
    await mongoose.disconnect();
    return;
  }

  let subjectCreated = false;
  if (!subjectDoc) {
    const lastSub = await subjectsCol
      .find({ examId: examObjectId })
      .sort({ orderNumber: -1 })
      .limit(1)
      .toArray();
    const orderNumber =
      (lastSub[0]?.orderNumber != null ? lastSub[0].orderNumber : 0) + 1;
    const ins = await subjectsCol.insertOne({
      examId: examObjectId,
      name: subjectName,
      slug: subjectSlug,
      ...defaultDoc,
      orderNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    subjectDoc = await subjectsCol.findOne({ _id: ins.insertedId });
    subjectCreated = true;
    console.log("Created subject:", subjectName, "| slug:", subjectSlug);
  } else {
    console.log("Using existing subject:", subjectDoc.name, "| slug:", subjectDoc.slug);
  }

  const subjectId = subjectDoc._id;

  const col = {
    units: db.collection("units"),
    chapters: db.collection("chapters"),
    topics: db.collection("topics"),
    subtopics: db.collection("subtopics"),
  };

  let stats = {
    examId: examIdArg,
    subjectId: subjectId.toString(),
    subjectName: subjectDoc.name,
    subjectSlug: subjectDoc.slug,
    subjectCreated,
    units: 0,
    chapters: 0,
    topics: 0,
    subtopics: 0,
    skipped: { units: 0, chapters: 0, topics: 0, subtopics: 0 },
  };

  async function nextOrder(collection, filter) {
    const last = await collection
      .find(filter)
      .sort({ orderNumber: -1 })
      .limit(1)
      .toArray();
    const n = last[0]?.orderNumber;
    return typeof n === "number" ? n + 1 : 1;
  }

  for (const u of units) {
    const unitName = toTitleCase((u.unit_name || "").trim()) || "Untitled unit";
    let unitSlug = slugify(`${u.chapter_number || ""}-${unitName}`.replace(/^-/, ""));
    if (!unitSlug || unitSlug === "item") unitSlug = slugify(unitName);

    let unitDoc = await col.units.findOne({ subjectId, slug: unitSlug });
    if (!unitDoc) {
      const orderNumber = await nextOrder(col.units, { subjectId });
      const ins = await col.units.insertOne({
        subjectId,
        name: unitName,
        slug: unitSlug,
        ...defaultDoc,
        orderNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      unitDoc = await col.units.findOne({ _id: ins.insertedId });
      stats.units++;
      console.log("Unit:", unitName);
    } else {
      stats.skipped.units++;
      if (SKIP_EXISTING) console.log("Skip existing unit:", unitName, unitSlug);
    }

    const unitId = unitDoc._id;
    const chapters = Array.isArray(u.chapters) ? u.chapters : [];

    for (const ch of chapters) {
      const chapterName =
        toTitleCase((ch.name || "").trim()) || "Untitled chapter";
      const chSlug =
        slugify(
          `${chapterName}-${ch.page_start ?? ""}-${ch.page_end ?? ""}`
        ) || slugify(chapterName);
      let chDoc = await col.chapters.findOne({ unitId, slug: chSlug });

      const chapterDescriptions = [];
      if (ch.topic_type) {
        chapterDescriptions.push(`Type: ${ch.topic_type}`);
      }
      if (ch.page_start != null && ch.page_end != null) {
        chapterDescriptions.push(`Pages: ${ch.page_start}–${ch.page_end}`);
      }
      const formulas = Array.isArray(ch.formulas) ? ch.formulas : [];
      for (const f of formulas) {
        if (typeof f === "string") {
          chapterDescriptions.push(`Formula: ${f}`);
        } else if (f && typeof f === "object") {
          const ex = f.expression || "";
          const desc = f.description || "";
          const pg = f.page != null ? ` (p. ${f.page})` : "";
          chapterDescriptions.push(
            ex ? `Formula: ${ex}${desc ? ` — ${desc}` : ""}${pg}` : JSON.stringify(f)
          );
        }
      }

      if (!chDoc) {
        const orderNumber = await nextOrder(col.chapters, { unitId });
        const ins = await col.chapters.insertOne({
          unitId,
          name: chapterName,
          slug: chSlug,
          ...defaultDoc,
          descriptions: chapterDescriptions,
          orderNumber,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        chDoc = await col.chapters.findOne({ _id: ins.insertedId });
        stats.chapters++;
      } else {
        stats.skipped.chapters++;
        if (chapterDescriptions.length && SKIP_EXISTING) {
          await col.chapters.updateOne(
            { _id: chDoc._id },
            {
              $addToSet: { descriptions: { $each: chapterDescriptions } },
              $set: { updatedAt: new Date() },
            }
          );
        }
      }

      const chapterId = chDoc._id;
      const topics = Array.isArray(ch.topics) ? ch.topics : [];

      for (const tp of topics) {
        const topicName =
          toTitleCase((tp.name || "").trim()) || "Untitled topic";
        const tpSlug =
          slugify(
            `${topicName}-${tp.page_start ?? ""}-${tp.page_end ?? ""}`
          ) || slugify(topicName);
        let tpDoc = await col.topics.findOne({ chapterId, slug: tpSlug });

        const topicDescriptions = Array.isArray(tp.key_concepts)
          ? tp.key_concepts.map((x) => String(x).trim()).filter(Boolean)
          : [];
        if (tp.page_start != null && tp.page_end != null) {
          topicDescriptions.unshift(`Pages: ${tp.page_start}–${tp.page_end}`);
        }

        if (!tpDoc) {
          const orderNumber = await nextOrder(col.topics, { chapterId });
          const ins = await col.topics.insertOne({
            chapterId,
            name: topicName,
            slug: tpSlug,
            ...defaultDoc,
            descriptions: topicDescriptions,
            orderNumber,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          tpDoc = await col.topics.findOne({ _id: ins.insertedId });
          stats.topics++;
        } else {
          stats.skipped.topics++;
          if (topicDescriptions.length && SKIP_EXISTING) {
            await col.topics.updateOne(
              { _id: tpDoc._id },
              {
                $addToSet: { descriptions: { $each: topicDescriptions } },
                $set: { updatedAt: new Date() },
              }
            );
          }
        }

        const topicId = tpDoc._id;
        const subtopics = Array.isArray(tp.subtopics) ? tp.subtopics : [];
        const usedSlugs = new Set();

        const lastSt = await col.subtopics
          .find({ topicId })
          .sort({ orderNumber: -1 })
          .limit(1)
          .toArray();
        let stOrder =
          (lastSt[0]?.orderNumber != null ? lastSt[0].orderNumber : 0) + 1;

        for (const st of subtopics) {
          const term = String(st.definition || "").trim();
          const content = String(st.definition_content || "").trim();
          if (!term && !content) continue;

          const displayName = toTitleCase(term) || "Term";
          let stSlug = slugify(term || "term");
          let n = 0;
          while (usedSlugs.has(stSlug)) {
            n++;
            stSlug = `${slugify(term || "term")}-${n}`;
          }
          usedSlugs.add(stSlug);

          const existing = await col.subtopics.findOne({ topicId, slug: stSlug });
          if (existing) {
            stats.skipped.subtopics++;
            if (content) {
              const body = `<p>${escapeHtml(content).replace(/\n/g, "</p><p>")}</p>`;
              await col.subtopics.updateOne(
                { _id: existing._id },
                {
                  $set: {
                    contentBody: body,
                    updatedAt: new Date(),
                  },
                }
              );
            }
            continue;
          }

          const contentBody = content
            ? `<p>${escapeHtml(content).replace(/\n/g, "</p><p>")}</p>`
            : "";

          await col.subtopics.insertOne({
            topicId,
            name: displayName,
            slug: stSlug,
            ...defaultDoc,
            contentBody,
            orderNumber: stOrder++,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          stats.subtopics++;
        }
      }
    }
  }

  await mongoose.disconnect();

  console.log("\nDone.");
  console.log(
    JSON.stringify(
      {
        examId: stats.examId,
        subject: {
          id: stats.subjectId,
          name: stats.subjectName,
          slug: stats.subjectSlug,
          created: stats.subjectCreated,
        },
        created: {
          units: stats.units,
          chapters: stats.chapters,
          topics: stats.topics,
          subtopics: stats.subtopics,
        },
        skipped: stats.skipped,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
