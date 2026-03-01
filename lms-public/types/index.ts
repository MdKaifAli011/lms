/** Types matching your API (docs/API.md) */

export interface Exam {
  id: string;
  name: string;
  slug: string;
  status: string;
  image?: string;
  items?: number;
  content?: string;
  meta?: string;
  visits?: number;
  uniqueVisits?: number;
  today?: number;
  descriptions?: string[];
  orderNumber?: number;
  lastModified?: string;
  createdAt?: string;
  contentBody?: string;
  seo?: SeoData;
}

export interface Subject {
  id: string;
  name: string;
  examId: string;
  slug: string;
  status?: string;
  orderNumber?: number;
  contentBody?: string;
  seo?: SeoData;
  visits?: number;
  today?: number;
  lastModified?: string;
  createdAt?: string;
}

export interface Unit {
  id: string;
  name: string;
  subjectId: string;
  slug: string;
  status?: string;
  orderNumber?: number;
  contentBody?: string;
  seo?: SeoData;
  visits?: number;
  today?: number;
  lastModified?: string;
  createdAt?: string;
}

export interface Chapter {
  id: string;
  name: string;
  unitId: string;
  slug: string;
  status?: string;
  orderNumber?: number;
  contentBody?: string;
  seo?: SeoData;
  visits?: number;
  today?: number;
  lastModified?: string;
  createdAt?: string;
}

export interface Topic {
  id: string;
  name: string;
  chapterId: string;
  slug: string;
  status?: string;
  orderNumber?: number;
  contentBody?: string;
  seo?: SeoData;
  visits?: number;
  today?: number;
  lastModified?: string;
  createdAt?: string;
}

export interface Subtopic {
  id: string;
  name: string;
  topicId: string;
  slug: string;
  status?: string;
  orderNumber?: number;
  contentBody?: string;
  seo?: SeoData;
  visits?: number;
  today?: number;
  lastModified?: string;
  createdAt?: string;
}

export interface Definition {
  id: string;
  name: string;
  subtopicId: string;
  slug: string;
  status?: string;
  orderNumber?: number;
  contentBody?: string;
  seo?: SeoData;
  visits?: number;
  today?: number;
  lastModified?: string;
  createdAt?: string;
}

export interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}
