/** Shared SEO form data for exam, subject, and other self-study entities */
export type SeoData = {
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  ogTitle: string
  ogDescription: string
  ogImageUrl: string
  canonicalUrl: string
  noIndex: boolean
  noFollow: boolean
}

export const DEFAULT_SEO: SeoData = {
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogTitle: "",
  ogDescription: "",
  ogImageUrl: "",
  canonicalUrl: "",
  noIndex: false,
  noFollow: false,
}
