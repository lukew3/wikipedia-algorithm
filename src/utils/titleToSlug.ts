/** "Albert Einstein" ↔ "Albert_Einstein" */
export function titleToSlug(title: string): string {
  return title.trim().replace(/ /g, '_')
}

export function slugToTitle(slug: string): string {
  return slug.replace(/_/g, ' ')
}
