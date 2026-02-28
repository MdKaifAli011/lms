export type NavItem = { label: string; href: string } | null

export function getHierarchyNav(
  hierarchy: any[],
  path: { s?: string; u?: string; c?: string; t?: string },
  examSlug: string
): { prev: NavItem; next: NavItem } {
  let prev: NavItem = null
  let next: NavItem = null

  // 1. SUBJECT LEVEL
  if (path.s && !path.u) {
    const idx = hierarchy.findIndex(s => (s.slug || s.id) === path.s)
    if (idx > 0) prev = { label: hierarchy[idx - 1].title, href: `/exam/${examSlug}/${hierarchy[idx - 1].slug || hierarchy[idx - 1].id}` }
    if (idx !== -1 && idx < hierarchy.length - 1) next = { label: hierarchy[idx + 1].title, href: `/exam/${examSlug}/${hierarchy[idx + 1].slug || hierarchy[idx + 1].id}` }
  }

  // 2. UNIT LEVEL
  if (path.u && !path.c) {
    const subject = hierarchy.find(s => (s.slug || s.id) === path.s)
    if (subject?.units) {
      const idx = subject.units.findIndex((u: any) => (u.slug || u.id) === path.u)
      if (idx > 0) prev = { label: subject.units[idx - 1].title, href: `/exam/${examSlug}/${path.s}/${subject.units[idx - 1].slug || subject.units[idx - 1].id}` }
      if (idx !== -1 && idx < subject.units.length - 1) next = { label: subject.units[idx + 1].title, href: `/exam/${examSlug}/${path.s}/${subject.units[idx + 1].slug || subject.units[idx + 1].id}` }
    }
  }

  // 3. CHAPTER LEVEL
  if (path.c && !path.t) {
    const subject = hierarchy.find(s => (s.slug || s.id) === path.s)
    const unit = subject?.units?.find((u: any) => (u.slug || u.id) === path.u)
    if (unit?.chapters) {
      const idx = unit.chapters.findIndex((c: any) => (c.slug || c.id) === path.c)
      if (idx > 0) prev = { label: unit.chapters[idx - 1].title, href: `/exam/${examSlug}/${path.s}/${path.u}/${unit.chapters[idx - 1].slug || unit.chapters[idx - 1].id}` }
      if (idx !== -1 && idx < unit.chapters.length - 1) next = { label: unit.chapters[idx + 1].title, href: `/exam/${examSlug}/${path.s}/${path.u}/${unit.chapters[idx + 1].slug || unit.chapters[idx + 1].id}` }
    }
  }

  // 4. TOPIC LEVEL
  if (path.t) {
    const subject = hierarchy.find(s => (s.slug || s.id) === path.s)
    const unit = subject?.units?.find((u: any) => (u.slug || u.id) === path.u)
    const chapter = unit?.chapters?.find((c: any) => (c.slug || c.id) === path.c)
    if (chapter?.topics) {
      const idx = chapter.topics.findIndex((t: any) => (t.slug || t.id) === path.t)
      if (idx > 0) prev = { label: chapter.topics[idx - 1].title, href: `/exam/${examSlug}/${path.s}/${path.u}/${path.c}/${chapter.topics[idx - 1].slug || chapter.topics[idx - 1].id}` }
      if (idx !== -1 && idx < chapter.topics.length - 1) next = { label: chapter.topics[idx + 1].title, href: `/exam/${examSlug}/${path.s}/${path.u}/${path.c}/${chapter.topics[idx + 1].slug || chapter.topics[idx + 1].id}` }
    }
  }

  return { prev, next }
}
