import { fetchMoreLike, fetchLinks, fetchCategories, fetchCategoryMembers } from '@/api/wikipedia'
import type { Recommendation, RecommendationContext } from '@/types/recommendations'
import { jaccard, rankScore, filterNoisyCategories } from './scoring'

export async function getNextPageRecommendations(ctx: RecommendationContext): Promise<Recommendation[]> {
  const { currentSlug, recentPath } = ctx

  const [moreLikeResults, currentLinks, categoriesMap] = await Promise.all([
    fetchMoreLike(currentSlug, 20).catch(() => []),
    fetchLinks(currentSlug).catch((): string[] => []),
    fetchCategories([currentSlug]).catch(() => ({} as Record<string, string[]>)),
  ])

  const currentCategories = filterNoisyCategories(categoriesMap[currentSlug] ?? [])

  // Build category members for top 3 categories
  const topCategories = currentCategories.slice(0, 3)
  const categoryMemberSets = await Promise.all(
    topCategories.map((cat) => fetchCategoryMembers(cat, 15).catch(() => []))
  )
  const categoryMembers = new Set(categoryMemberSets.flat().map((m) => m.title))

  // Gather all path categories for overlap scoring
  const pathCategoryMap = await fetchCategories(recentPath.slice(-5)).catch(() => ({} as Record<string, string[]>))
  const pathCategories = filterNoisyCategories(
    Object.values(pathCategoryMap).flat()
  )

  // Build candidate pool (deduplicated by title)
  const candidates = new Map<string, {
    title: string
    inMoreLike: boolean
    moreLikeRank: number
    inCurrentLinks: boolean
    inCategoryMembers: boolean
  }>()

  for (let i = 0; i < moreLikeResults.length; i++) {
    const r = moreLikeResults[i]
    candidates.set(r.title, {
      title: r.title,
      inMoreLike: true,
      moreLikeRank: i,
      inCurrentLinks: currentLinks.includes(r.title),
      inCategoryMembers: categoryMembers.has(r.title),
    })
  }

  for (const title of currentLinks) {
    if (!candidates.has(title)) {
      candidates.set(title, {
        title,
        inMoreLike: false,
        moreLikeRank: moreLikeResults.length,
        inCurrentLinks: true,
        inCategoryMembers: categoryMembers.has(title),
      })
    }
  }

  for (const title of categoryMembers) {
    if (!candidates.has(title)) {
      candidates.set(title, {
        title,
        inMoreLike: false,
        moreLikeRank: moreLikeResults.length,
        inCurrentLinks: false,
        inCategoryMembers: true,
      })
    }
  }

  // Filter: exclude current, recent path, and recently-read articles
  const recentSet = new Set([
    currentSlug,
    ...recentPath,
    // We can't filter by date here without timestamps; we use fullHistory as a soft exclusion
  ])
  const filtered = [...candidates.values()].filter((c) => {
    const slug = c.title.replace(/ /g, '_')
    return !recentSet.has(slug) && !recentSet.has(c.title)
  })

  // Batch-fetch categories for scoring
  const batchTitles = filtered.slice(0, 40).map((c) => c.title)
  const candidateCategoriesMap = batchTitles.length > 0
    ? await fetchCategories(batchTitles).catch(() => ({} as Record<string, string[]>))
    : {}

  // Score each candidate
  const scored: Array<{ candidate: typeof filtered[0]; score: number; reason: string }> = []

  for (const c of filtered.slice(0, 40)) {
    const catRaw = filterNoisyCategories(candidateCategoriesMap[c.title] ?? [])
    const catOverlap = jaccard(catRaw, pathCategories)
    const mlScore = c.inMoreLike ? rankScore(c.moreLikeRank, moreLikeResults.length) : 0
    const linkScore = c.inCurrentLinks ? 1 : 0
    const catScore = catOverlap

    const total = mlScore * 0.35 + catScore * 0.30 + linkScore * 0.20 + (c.inCategoryMembers ? 0.15 : 0)

    let reason = 'Related article'
    if (c.inCurrentLinks) reason = `Linked from ${currentSlug.replace(/_/g, ' ')}`
    else if (c.inMoreLike && c.moreLikeRank < 5) reason = `Often read alongside ${currentSlug.replace(/_/g, ' ')}`
    else if (catOverlap > 0.2) reason = `Shares topics with your recent reading`
    else if (c.inCategoryMembers) reason = `Same category as ${currentSlug.replace(/_/g, ' ')}`

    scored.push({ candidate: c, score: total, reason })
  }

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, 5).map(({ candidate, score, reason }) => ({
    title: candidate.title,
    slug: candidate.title.replace(/ /g, '_'),
    score,
    source: 'next-page',
    reason,
  }))
}
