export interface ArticleSession {
  id: string
  pageId: number
  title: string
  slug: string
  url: string
  thumbnail?: string
  description?: string
  startedAt: number
  endedAt?: number
  totalTimeMs: number
  maxScrollDepth: number
  finished: boolean
  parentId?: string
}

export interface ReadingPath {
  id: string
  startedAt: number
  endedAt?: number
  articleIds: string[]
}
