#!/usr/bin/env node
/**
 * Import a content tree (7-level hierarchy + contentBody HTML) into the LMS via API.
 * Usage:
 *   API_BASE=http://localhost:3000 node scripts/import-content-tree.mjs scripts/sample-content-tree.json
 *   cat my-content.json | API_BASE=http://localhost:3000 node scripts/import-content-tree.mjs
 *
 * JSON format: see docs/PDF-IMPORT.md and scripts/sample-content-tree.json
 */

const API_BASE = process.env.API_BASE || "http://localhost:3000";

function slugify(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "item";
}

async function fetchJson(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`API ${res.status} ${path}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function getOrCreateExam(name) {
  const slug = slugify(name);
  const list = await fetchJson("/api/exams");
  const found = Array.isArray(list) ? list.find((e) => (e.slug || "").toLowerCase() === slug || (e.name || "").toLowerCase() === name.toLowerCase()) : null;
  if (found) return { id: found.id, name: found.name || name, slug: found.slug || slug };
  const created = await fetchJson("/api/exams", {
    method: "POST",
    body: JSON.stringify({ name, status: "Active" }),
  });
  return { id: created.id, name: created.name || name, slug: created.slug || slug };
}

async function createSubject(examId, name, orderNumber) {
  const created = await fetchJson("/api/subjects", {
    method: "POST",
    body: JSON.stringify({ examId, name, status: "Active", orderNumber }),
  });
  return { id: created.id, name: created.name || name, slug: created.slug || slugify(name) };
}

async function updateContentBody(resource, id, contentBody) {
  if (contentBody == null || String(contentBody).trim() === "") return;
  await fetchJson(`/api/${resource}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ contentBody: String(contentBody).trim() }),
  });
}

async function createUnit(subjectId, name, orderNumber) {
  const created = await fetchJson("/api/units", {
    method: "POST",
    body: JSON.stringify({ subjectId, name, status: "Active", orderNumber }),
  });
  return { id: created.id, name: created.name || name, slug: created.slug || slugify(name) };
}

async function createChapter(unitId, name, orderNumber) {
  const created = await fetchJson("/api/chapters", {
    method: "POST",
    body: JSON.stringify({ unitId, name, status: "Active", orderNumber }),
  });
  return { id: created.id, name: created.name || name, slug: created.slug || slugify(name) };
}

async function createTopic(chapterId, name, orderNumber) {
  const created = await fetchJson("/api/topics", {
    method: "POST",
    body: JSON.stringify({ chapterId, name, status: "Active", orderNumber }),
  });
  return { id: created.id, name: created.name || name, slug: created.slug || slugify(name) };
}

async function createSubtopic(topicId, name, orderNumber) {
  const created = await fetchJson("/api/subtopics", {
    method: "POST",
    body: JSON.stringify({ topicId, name, status: "Active", orderNumber }),
  });
  return { id: created.id, name: created.name || name, slug: created.slug || slugify(name) };
}

async function createDefinition(subtopicId, name, orderNumber) {
  const created = await fetchJson("/api/definitions", {
    method: "POST",
    body: JSON.stringify({ subtopicId, name, status: "Active", orderNumber }),
  });
  return { id: created.id, name: created.name || name, slug: created.slug || slugify(name) };
}

async function processExam(examNode) {
  const name = (examNode && examNode.name) ? String(examNode.name).trim() : null;
  if (!name) throw new Error("exam.name is required");
  const exam = await getOrCreateExam(name);
  if (examNode.contentBody) await updateContentBody("exams", exam.id, examNode.contentBody);
  return exam;
}

async function processSubjects(exam, subjects) {
  if (!Array.isArray(subjects)) return;
  for (let i = 0; i < subjects.length; i++) {
    const s = subjects[i];
    const name = (s && s.name) ? String(s.name).trim() : null;
    if (!name) continue;
    const subject = await createSubject(exam.id, name, i + 1);
    if (s.contentBody) await updateContentBody("subjects", subject.id, s.contentBody);
    if (Array.isArray(s.units)) {
      for (let u = 0; u < s.units.length; u++) {
        const un = s.units[u];
        const uname = (un && un.name) ? String(un.name).trim() : null;
        if (!uname) continue;
        const unit = await createUnit(subject.id, uname, u + 1);
        if (un.contentBody) await updateContentBody("units", unit.id, un.contentBody);
        if (Array.isArray(un.chapters)) {
          for (let c = 0; c < un.chapters.length; c++) {
            const ch = un.chapters[c];
            const cname = (ch && ch.name) ? String(ch.name).trim() : null;
            if (!cname) continue;
            const chapter = await createChapter(unit.id, cname, c + 1);
            if (ch.contentBody) await updateContentBody("chapters", chapter.id, ch.contentBody);
            if (Array.isArray(ch.topics)) {
              for (let t = 0; t < ch.topics.length; t++) {
                const top = ch.topics[t];
                const tname = (top && top.name) ? String(top.name).trim() : null;
                if (!tname) continue;
                const topic = await createTopic(chapter.id, tname, t + 1);
                if (top.contentBody) await updateContentBody("topics", topic.id, top.contentBody);
                if (Array.isArray(top.subtopics)) {
                  for (let st = 0; st < top.subtopics.length; st++) {
                    const subt = top.subtopics[st];
                    const stname = (subt && subt.name) ? String(subt.name).trim() : null;
                    if (!stname) continue;
                    const subtopic = await createSubtopic(topic.id, stname, st + 1);
                    if (subt.contentBody) await updateContentBody("subtopics", subtopic.id, subt.contentBody);
                    if (Array.isArray(subt.definitions)) {
                      for (let d = 0; d < subt.definitions.length; d++) {
                        const def = subt.definitions[d];
                        const dname = (def && def.name) ? String(def.name).trim() : null;
                        if (!dname) continue;
                        const definition = await createDefinition(subtopic.id, dname, d + 1);
                        if (def.contentBody) await updateContentBody("definitions", definition.id, def.contentBody);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

async function main() {
  let raw;
  const file = process.argv[2];
  if (file) {
    const fs = await import("fs");
    raw = fs.readFileSync(file, "utf8");
  } else {
    raw = await new Promise((resolve, reject) => {
      let data = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => { data += chunk; });
      process.stdin.on("end", () => resolve(data));
      process.stdin.on("error", reject);
    });
  }
  const data = JSON.parse(raw);
  if (!data.exam) throw new Error("JSON must have an 'exam' object with at least 'name'");
  console.log("Importing content tree to", API_BASE);
  const exam = await processExam(data.exam);
  console.log("Exam:", exam.name, "(" + exam.id + ")");
  await processSubjects(exam, data.subjects || []);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
