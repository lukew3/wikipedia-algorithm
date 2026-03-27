import type { ArticleSession, ReadingPath } from './article'

export interface ReadingHistory {
  version: number
  sessions: Record<string, ArticleSession>
  paths: ReadingPath[]
  lastActiveAt: number
}

export interface HistoryGraphNode {
  id: string
  title: string
  slug: string
  thumbnail?: string
  finished: boolean
  visitCount: number
  totalTimeMs: number
  x?: number
  y?: number
}

export interface HistoryGraphLink {
  source: string
  target: string
  pathId: string
}

export interface HistoryGraph {
  nodes: HistoryGraphNode[]
  links: HistoryGraphLink[]
}
