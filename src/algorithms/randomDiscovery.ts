import { fetchMoreLike, fetchCategories, fetchFeatured } from '@/api/wikipedia'
import type { Recommendation } from '@/types/recommendations'
import { jaccard, filterNoisyCategories } from './scoring'

export async function getDiscoveryRecommendations(fullHistory: string[]): Promise<Recommendation[]> {
  if (fullHistory.length === 0) {
    // No history yet — return today's featured article
    const featured = await fetchFeatured().catch(() => null)
    if (featured?.tfa) {
      return [{
        title: featured.tfa.title,
        slug: featured.tfa.title.replace(/ /g, '_'),
        description: featured.tfa.description,
        thumbnail: featured.tfa.thumbnail?.source,
        score: 1,
        source: 'random-discovery',
        reason: "Today's featured article on Wikipedia",
      }]
    }
    return []
  }

  // Step 1: Build interest vector from history categories
  const batchSize = 10
  const allCats: string[][] = []
  const titleToCats: Record<string, string[]> = {}

  for (let i = 0; i < Math.min(fullHistory.length, 50); i += batchSize) {
    const batch = fullHistory.slice(i, i + batchSize).map((s) => s.replace(/_/g, ' '))
    const map = await fetchCategories(batch).catch(() => ({} as Record<string, string[]>))
    for (const [title, cats] of Object.entries(map)) {
      const filtered = filterNoisyCategories(cats)
      titleToCats[title] = filtered
      allCats.push(filtered)
    }
  }

  // Count category frequencies across articles
  const catFreq = new Map<string, number>()
  for (const cats of allCats) {
    for (const cat of cats) catFreq.set(cat, (catFreq.get(cat) ?? 0) + 1)
  }

  // Keep categories that appear on ≥2 articles, take top 10
  const interestVector = [...catFreq.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([cat]) => cat)

  // Step 2: Weighted seed selection (recency bias)
  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
  // We don't have timestamps here, so use index as proxy: recent = end of array
  const recentCount = Math.min(Math.ceil(fullHistory.length * 0.4), fullHistory.length)
  const weights = fullHistory.map((_, i) => i >= fullHistory.length - recentCount ? 3 : 1)
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let rand = Math.random() * totalWeight
  let seedIdx = 0
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i]
    if (rand <= 0) { seedIdx = i; break }
  }
  const seedSlug = fullHistory[seedIdx]

  // Step 3: Fetch morelike candidates
  const moreLike = await fetchMoreLike(seedSlug.replace(/_/g, ' '), 50).catch(() => [])
  const historySet = new Set(fullHistory)
  const novel = moreLike.filter((r) => !historySet.has(r.title.replace(/ /g, '_')) && !historySet.has(r.title))

  if (novel.length === 0) {
    // Fallback to featured
    const featured = await fetchFeatured().catch(() => null)
    if (featured?.tfa) {
      return [{
        title: featured.tfa.title,
        slug: featured.tfa.title.replace(/ /g, '_'),
        description: featured.tfa.description,
        thumbnail: featured.tfa.thumbnail?.source,
        score: 0.5,
        source: 'random-discovery',
        reason: "Explore something new — today's featured article",
      }]
    }
    return []
  }

  // Step 4: Score by category overlap with interest vector
  const batchTitles = novel.slice(0, 30).map((r) => r.title)
  const novelCatsMap = batchTitles.length > 0
    ? await fetchCategories(batchTitles).catch(() => ({} as Record<string, string[]>))
    : {}

  const scored = novel.slice(0, 30).map((r) => {
    const cats = filterNoisyCategories(novelCatsMap[r.title] ?? [])
    const score = interestVector.length > 0 ? jaccard(cats, interestVector) : 0.5
    const dominantCat = interestVector.find((cat) => cats.includes(cat))
    const reason = dominantCat
      ? `Explore a topic adjacent to your interest in ${dominantCat}`
      : `Related to ${seedSlug.replace(/_/g, ' ')}, an article you've read`
    return { title: r.title, slug: r.title.replace(/ /g, '_'), score, reason }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, 3).map(({ title, slug, score, reason }) => ({
    title,
    slug,
    score,
    source: 'random-discovery' as const,
    reason,
  }))
}
