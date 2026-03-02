/**
 * API client for your admin API (docs/API.md).
 * All requests go to NEXT_PUBLIC_API_URL (e.g. http://localhost:3000).
 */

const getBase = () => {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (base) return base.replace(/\/$/, "");
  if (typeof window !== "undefined") return "";
  return "http://localhost:3000";
};

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const base = getBase();
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    const text = await res.text();
    if (text.length > 200) {
      throw new Error(`API ${res.status} at ${url}: ${res.statusText}. Check NEXT_PUBLIC_API_URL (current base: ${base || "(empty)"}).`);
    }
    throw new Error(text || res.statusText);
  }

  if (!isJson) {
    const text = await res.text();
    throw new Error(
      `API at ${url} returned HTML instead of JSON. Set NEXT_PUBLIC_API_URL to your API base (e.g. http://localhost:3000 or http://localhost:3000/self-study). Current base: ${base || "(empty)"}`
    );
  }
  return res.json() as Promise<T>;
}

// ——— Level Wise Practice Papers ———
export interface LevelWisePractice {
  id: string;
  examId: string;
  examName?: string;
  examSlug?: string;
  level: number;
  levelName?: string;
  subjectId?: string;
  subjectName?: string;
  unitId?: string;
  unitName?: string;
  chapterId?: string;
  chapterName?: string;
  topicId?: string;
  topicName?: string;
  subtopicId?: string;
  subtopicName?: string;
  definitionId?: string;
  definitionName?: string;
  title: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  orderNumber: number;
  status: "Active" | "Inactive";
  locked: boolean;
  image?: string;
}

export async function getLevelWisePractices(filters?: { examId?: string; level?: number; status?: string; page?: number; limit?: number }): Promise<{ papers: LevelWisePractice[]; total: number }> {
  try {
    const params = new URLSearchParams();
    if (filters?.examId) params.set("examId", filters.examId);
    if (filters?.level != null) params.set("level", String(filters.level));
    if (filters?.status) params.set("status", filters.status);
    if (filters?.page != null) params.set("page", String(filters.page));
    if (filters?.limit != null) params.set("limit", String(filters.limit));
    const q = params.toString() ? `?${params}` : "";
    const res = await fetchApi<{ papers: LevelWisePractice[]; total: number }>(`/api/level-wise-practice${q}`);
    return { papers: Array.isArray(res.papers) ? res.papers : [], total: res.total || 0 };
  } catch (e) {
    if (typeof window === "undefined") console.error("[getLevelWisePractices]", e);
    return { papers: [], total: 0 };
  }
}

// ——— Full Length Mock Tests ———
export interface FullLengthMock {
  id: string;
  examId: string;
  examName?: string;
  examSlug?: string;
  title: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  orderNumber: number;
  status: "Active" | "Inactive";
  locked: boolean;
  image?: string;
}

export async function getFullLengthMocks(filters?: { examId?: string; status?: string }): Promise<FullLengthMock[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.examId) params.set("examId", filters.examId);
    if (filters?.status) params.set("status", filters.status);
    const q = params.toString() ? `?${params}` : "";
    const list = await fetchApi<FullLengthMock[]>(`/api/full-length-mock${q}`);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    if (typeof window === "undefined") console.error("[getFullLengthMocks]", e);
    return [];
  }
}

// ——— Previous Year Papers ———
export interface PreviousYearPaper {
  id: string;
  examId: string;
  examName?: string;
  examSlug?: string;
  title: string;
  slug: string;
  description?: string;
  year: number;
  session?: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  orderNumber: number;
  status: "Active" | "Inactive";
  locked: boolean;
  image?: string;
}

export async function getPreviousYearPapers(filters?: { examId?: string; year?: number; status?: string }): Promise<PreviousYearPaper[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.examId) params.set("examId", filters.examId);
    if (filters?.year) params.set("year", String(filters.year));
    if (filters?.status) params.set("status", filters.status);
    const q = params.toString() ? `?${params}` : "";
    const list = await fetchApi<PreviousYearPaper[]>(`/api/previous-year-paper${q}`);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    if (typeof window === "undefined") console.error("[getPreviousYearPapers]", e);
    return [];
  }
}

// ——— Legacy Practice Papers (for backward compatibility) ———
export interface PracticePaperFilters {
  examId?: string;
  type?: "practice" | "full_length" | "previous_paper";
  level?: number;
  status?: "Active" | "Inactive";
}

export interface PracticePaper {
  id: string;
  examId: string;
  type: "practice" | "full_length" | "previous_paper";
  level: number;
  title: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  difficulty?: string;
  year?: number;
  orderNumber: number;
  status: string;
  locked?: boolean;
  image?: string;
}

export async function getPracticePapers(filters?: PracticePaperFilters): Promise<PracticePaper[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.examId) params.set("examId", filters.examId);
    if (filters?.type) params.set("type", filters.type);
    if (filters?.level != null) params.set("level", String(filters.level));
    if (filters?.status) params.set("status", filters.status);
    const q = params.toString() ? `?${params}` : "";
    const list = await fetchApi<PracticePaper[]>(`/api/practice${q}`);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    if (typeof window === "undefined") console.error("[getPracticePapers]", e);
    return [];
  }
}

// ——— Exams ———
export async function getExams(contextApi = false): Promise<unknown[]> {
  try {
    const q = contextApi ? "?contextapi=1" : "";
    return await fetchApi<unknown[]>(`/api/exams${q}`);
  } catch (e) {
    if (typeof window === "undefined") console.error("[getExams]", e);
    return [];
  }
}

export async function getExamBySlugOrId(param: string): Promise<unknown | null> {
  try {
    return await fetchApi<unknown>(`/api/exams/${encodeURIComponent(param)}`);
  } catch {
    return null;
  }
}

// ——— Subjects ———
export async function getSubjects(filters?: {
  examId?: string;
  exam?: string;
  contextapi?: boolean;
}): Promise<unknown[]> {
  const params = new URLSearchParams();
  if (filters?.examId) params.set("examId", filters.examId);
  if (filters?.exam) params.set("exam", filters.exam);
  if (filters?.contextapi) params.set("contextapi", "1");
  const q = params.toString() ? `?${params}` : "";
  return fetchApi<unknown[]>(`/api/subjects${q}`);
}

export async function getSubjectById(id: string): Promise<unknown | null> {
  try {
    return await fetchApi<unknown>(`/api/subjects/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

// ——— Units ———
export async function getUnits(filters?: {
  subjectId?: string;
  subject?: string;
  contextapi?: boolean;
}): Promise<unknown[]> {
  const params = new URLSearchParams();
  if (filters?.subjectId) params.set("subjectId", filters.subjectId);
  if (filters?.subject) params.set("subject", filters.subject);
  if (filters?.contextapi) params.set("contextapi", "1");
  const q = params.toString() ? `?${params}` : "";
  return fetchApi<unknown[]>(`/api/units${q}`);
}

export async function getUnitById(id: string): Promise<unknown | null> {
  try {
    return await fetchApi<unknown>(`/api/units/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

// ——— Chapters ———
export async function getChapters(filters?: {
  unitId?: string;
  unit?: string;
  contextapi?: boolean;
}): Promise<unknown[]> {
  const params = new URLSearchParams();
  if (filters?.unitId) params.set("unitId", filters.unitId);
  if (filters?.unit) params.set("unit", filters.unit);
  if (filters?.contextapi) params.set("contextapi", "1");
  const q = params.toString() ? `?${params}` : "";
  return fetchApi<unknown[]>(`/api/chapters${q}`);
}

export async function getChapterById(id: string): Promise<unknown | null> {
  try {
    return await fetchApi<unknown>(`/api/chapters/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

// ——— Topics ———
export async function getTopics(filters?: {
  chapterId?: string;
  chapter?: string;
  contextapi?: boolean;
}): Promise<unknown[]> {
  const params = new URLSearchParams();
  if (filters?.chapterId) params.set("chapterId", filters.chapterId);
  if (filters?.chapter) params.set("chapter", filters.chapter);
  if (filters?.contextapi) params.set("contextapi", "1");
  const q = params.toString() ? `?${params}` : "";
  return fetchApi<unknown[]>(`/api/topics${q}`);
}

export async function getTopicById(id: string): Promise<unknown | null> {
  try {
    return await fetchApi<unknown>(`/api/topics/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

// ——— Subtopics ———
export async function getSubtopics(filters?: {
  topicId?: string;
  topic?: string;
  contextapi?: boolean;
}): Promise<unknown[]> {
  const params = new URLSearchParams();
  if (filters?.topicId) params.set("topicId", filters.topicId);
  if (filters?.topic) params.set("topic", filters.topic);
  if (filters?.contextapi) params.set("contextapi", "1");
  const q = params.toString() ? `?${params}` : "";
  return fetchApi<unknown[]>(`/api/subtopics${q}`);
}

export async function getSubtopicById(id: string): Promise<unknown | null> {
  try {
    return await fetchApi<unknown>(`/api/subtopics/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

// ——— Definitions ———
export async function getDefinitions(filters?: {
  subtopicId?: string;
  subtopic?: string;
  contextapi?: boolean;
}): Promise<unknown[]> {
  const params = new URLSearchParams();
  if (filters?.subtopicId) params.set("subtopicId", filters.subtopicId);
  if (filters?.subtopic) params.set("subtopic", filters.subtopic);
  if (filters?.contextapi) params.set("contextapi", "1");
  const q = params.toString() ? `?${params}` : "";
  return fetchApi<unknown[]>(`/api/definitions${q}`);
}

export async function getDefinitionById(id: string): Promise<unknown | null> {
  try {
    return await fetchApi<unknown>(`/api/definitions/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

// ——— Visit (optional, for analytics) ———
export async function recordVisit(
  resource: "exams" | "subjects" | "units" | "chapters" | "topics" | "subtopics" | "definitions",
  param: string
): Promise<{ ok: boolean; visits?: number; today?: number }> {
  return fetchApi(`/api/${resource}/${encodeURIComponent(param)}/visit`, {
    method: "POST",
  });
}
