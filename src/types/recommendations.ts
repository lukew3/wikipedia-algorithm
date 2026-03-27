export type RecommendationSource = 'next-page' | 'random-discovery'

export interface Recommendation {
  title: string
  slug: string
  description?: string
  thumbnail?: string
  score: number
  source: RecommendationSource
  reason: string
}

export interface RecommendationContext {
  currentSlug: string
  currentCategories: string[]
  currentLinks: string[]
  recentPath: string[]
  fullHistory: string[]
}
