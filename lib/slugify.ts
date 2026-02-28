/**
 * Slugify a string for URL-safe exam (and other entity) slugs.
 */
export function slugify(value: string): string {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return base || "exam"
}

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/

export function isMongoId(str: string): boolean {
  return OBJECT_ID_REGEX.test(str)
}
