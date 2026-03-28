import type { ArticleSession, ReadingPath } from './article'

export interface ReadingHistory {
  version: number
  sessions: Record<string, ArticleSession>
  paths: ReadingPath[]
  lastActiveAt: number
}

export interface RabbitHoleNode {
  sessionId: string
  pageId: number
  title: string
  slug: string
  thumbnail?: string
  finished: boolean
  totalTimeMs: number
  children: RabbitHoleNode[]
}

export interface RabbitHoleTree {
  pathId: string
  startedAt: number
  updatedAt: number
  root: RabbitHoleNode
  nodeCount: number
}
