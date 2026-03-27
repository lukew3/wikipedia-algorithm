import wikiImport from 'wikipedia'
import type { wikiSummary } from 'wikipedia'
import type { WikiCategoryMembersResponse } from '@/types/wikipedia'

// Vite's CJS interop may give us the module namespace instead of exports.default
const wiki = ('default' in wikiImport ? (wikiImport as Record<string, unknown>).default : wikiImport) as typeof wikiImport

const ACTION = 'https://en.wikipedia.org/w/api.php'

export type { wikiSummary }

export async function fetchSummary(slug: string): Promise<wikiSummary> {
  return wiki.summary(slug.replace(/_/g, ' '))
}

export async function fetchArticleHtml(slug: string): Promise<string> {
  return wiki.html(slug.replace(/_/g, ' '))
}

export async function searchTitles(query: string, limit = 8): Promise<string[]> {
  return wiki.autocompletions(query, { limit })
}

export async function fetchLinks(slug: string): Promise<string[]> {
  return wiki.links(slug.replace(/_/g, ' '), { limit: 100 })
}

export async function fetchCategories(slugs: string[]): Promise<Record<string, string[]>> {
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      const title = slug.replace(/_/g, ' ')
      const cats = await wiki.categories(title, { limit: 50 })
      return [title, cats.map((c) => c.replace(/^Category:/, ''))] as const
    })
  )
  return Object.fromEntries(entries)
}

export async function fetchMoreLike(slug: string, limit = 20): Promise<Array<{ title: string; pageid: number }>> {
  const result = await wiki.search(`morelike:${slug.replace(/_/g, ' ')}`, { limit })
  return result.results.map((r: { title: string; pageid: number }) => ({ title: r.title, pageid: r.pageid }))
}

export async function fetchCategoryMembers(categoryTitle: string, limit = 20): Promise<Array<{ title: string; pageid: number }>> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'categorymembers',
    cmtitle: `Category:${categoryTitle}`,
    cmlimit: String(limit),
    cmnamespace: '0',
    format: 'json',
    origin: '*',
  })
  const res = await fetch(`${ACTION}?${params}`)
  if (!res.ok) throw new Error(`Category members fetch failed: ${res.status}`)
  const data = await res.json() as WikiCategoryMembersResponse
  return data.query.categorymembers.map((m) => ({ title: m.title, pageid: m.pageid }))
}

export async function fetchRandomTitle(): Promise<string> {
  const result = await wiki.random('summary') as wikiSummary
  return result.title.replace(/ /g, '_')
}

export async function fetchFeatured(): Promise<{ tfa?: wikiSummary }> {
  const now = new Date()
  const result = await wiki.featuredContent({
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1).padStart(2, '0'),
    day: String(now.getDate()).padStart(2, '0'),
  })
  return { tfa: result.tfa }
}
