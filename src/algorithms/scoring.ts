/** Jaccard similarity between two sets */
export function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0
  const setA = new Set(a)
  const setB = new Set(b)
  let intersection = 0
  for (const item of setA) if (setB.has(item)) intersection++
  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}

/** Normalize morelike rank to 0–1 score (rank 1 = 1.0, rank N = ~0) */
export function rankScore(rank: number, total: number): number {
  return 1 - rank / (total + 1)
}

const NOISE_PREFIXES = ['Articles ', 'Pages ', 'CS1 ', 'Use ', 'All ', 'Good ', 'Featured ', 'Wikipedia ']

export function filterNoisyCategories(categories: string[]): string[] {
  return categories.filter((c) => !NOISE_PREFIXES.some((p) => c.startsWith(p)))
}
