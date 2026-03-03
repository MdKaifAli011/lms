import type { Metadata } from "next";

/** API returns metaKeywords; we normalize to keywords for this helper */
export interface EntitySeo {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  keywords?: string | null;
  noIndex?: boolean | null;
  noFollow?: boolean | null;
}

export interface SEOProps {
  title: string;
  examTitle?: string;
  subjectTitle?: string;
  unitTitle?: string;
  chapterTitle?: string;
  topicTitle?: string;
  subtopicTitle?: string;
  level: "exam" | "subject" | "unit" | "chapter" | "topic" | "subtopic" | "definition";
  seo?: EntitySeo | null;
}

const SITE_NAME = "LmsDoors";
const MAX_TITLE_LENGTH = 65;
const MAX_DESCRIPTION_LENGTH = 160;

/**
 * Build Next.js Metadata for exam hierarchy pages.
 * Uses API seo (metaTitle, metaDescription, metaKeywords, noIndex, noFollow) when present;
 * otherwise generates from title and hierarchy context.
 */
export function generateEntityMetadata({
  title,
  examTitle,
  subjectTitle,
  unitTitle,
  chapterTitle,
  topicTitle,
  subtopicTitle,
  level,
  seo,
}: SEOProps): Metadata {
  /* ---------------- TITLE ---------------- */
  let metaTitle = (seo?.metaTitle ?? "").trim();

  if (!metaTitle) {
    let specificLabel = title;

    if (level === "exam") {
      specificLabel = `${title} Exam Overview`;
    }
    if (level === "definition") {
      specificLabel = `Definition of ${title}`;
    }

    const parts: string[] = [specificLabel];

    if (level === "definition" && subtopicTitle) parts.push(subtopicTitle);
    if (["subtopic", "definition"].includes(level) && topicTitle) parts.push(topicTitle);
    if (["topic", "subtopic", "definition"].includes(level) && chapterTitle) parts.push(chapterTitle);
    if (["chapter", "topic", "subtopic", "definition"].includes(level) && unitTitle) parts.push(unitTitle);
    if (["unit", "chapter", "topic", "subtopic", "definition"].includes(level) && subjectTitle) parts.push(subjectTitle);
    if (examTitle && level !== "exam") parts.push(examTitle);

    metaTitle = `${parts.join(" – ")} | ${SITE_NAME}`;

    if (metaTitle.length > MAX_TITLE_LENGTH && examTitle && level !== "exam") {
      metaTitle = `${specificLabel} – ${examTitle} | ${SITE_NAME}`;
    }
    if (metaTitle.length > MAX_TITLE_LENGTH) {
      metaTitle = `${specificLabel} | ${SITE_NAME}`;
    }
  }

  /* ---------------- DESCRIPTION ---------------- */
  let metaDescription = (seo?.metaDescription ?? "").trim();

  if (!metaDescription) {
    switch (level) {
      case "exam":
        metaDescription = `Prepare for ${title} with ${SITE_NAME}. Get exam overview, syllabus, subjects, preparation strategy, and important resources.`;
        break;
      case "subject":
        metaDescription = `Study ${title} for ${examTitle ?? "exam"} with ${SITE_NAME}. Access chapters, units, topics, and concept-wise notes.`;
        break;
      case "unit":
        metaDescription = `Learn ${title} from ${subjectTitle ?? "subject"} for ${examTitle ?? "exam"} on ${SITE_NAME}. Explore chapters and exam-focused explanations.`;
        break;
      case "chapter":
        metaDescription = `${title} from ${unitTitle ?? "unit"} of ${subjectTitle ?? "subject"} for ${examTitle ?? "exam"}, explained clearly on ${SITE_NAME}.`;
        break;
      case "topic":
        metaDescription = `Understand ${title} from ${chapterTitle ?? "chapter"} in ${subjectTitle ?? "subject"} for ${examTitle ?? "exam"} with easy explanations on ${SITE_NAME}.`;
        break;
      case "subtopic":
        metaDescription = `Learn ${title} under ${topicTitle ?? "topic"} from ${chapterTitle ?? "chapter"} for ${examTitle ?? "exam"} with ${SITE_NAME}.`;
        break;
      case "definition":
        metaDescription = `Definition of ${title} explained clearly for ${examTitle ?? "exam"}. Simple and exam-focused content by ${SITE_NAME}.`;
        break;
    }
  }

  if (metaDescription.length > MAX_DESCRIPTION_LENGTH) {
    metaDescription = metaDescription.slice(0, MAX_DESCRIPTION_LENGTH - 3) + "...";
  }

  /* ---------------- KEYWORDS ---------------- */
  const rawKeywords = seo?.metaKeywords ?? seo?.keywords ?? "";
  let keywords = (typeof rawKeywords === "string" ? rawKeywords : "").trim();

  if (!keywords) {
    keywords = [title, examTitle, subjectTitle, unitTitle, chapterTitle].filter(Boolean).join(", ");
  }

  const noIndex = seo?.noIndex === true;
  const noFollow = seo?.noFollow === true;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: keywords || undefined,
    robots: {
      index: !noIndex,
      follow: !noFollow,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      siteName: SITE_NAME,
    },
  };
}

/** Normalize API entity's seo (metaKeywords) into EntitySeo for generateEntityMetadata */
export function normalizeApiSeo(apiSeo: unknown): EntitySeo | null {
  if (!apiSeo || typeof apiSeo !== "object") return null;
  const s = apiSeo as Record<string, unknown>;
  return {
    metaTitle: (s.metaTitle as string) ?? null,
    metaDescription: (s.metaDescription as string) ?? null,
    metaKeywords: (s.metaKeywords as string) ?? null,
    keywords: (s.keywords as string) ?? (s.metaKeywords as string) ?? null,
    noIndex: (s.noIndex as boolean) ?? null,
    noFollow: (s.noFollow as boolean) ?? null,
  };
}
