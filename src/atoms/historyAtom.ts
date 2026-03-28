import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { ReadingHistory, RabbitHoleTree, RabbitHoleNode } from '@/types/history'
import type { ArticleSession } from '@/types/article'

const EMPTY_HISTORY: ReadingHistory = {
  version: 1,
  sessions: {},
  paths: [],
  lastActiveAt: Date.now(),
}

export const readingHistoryAtom = atomWithStorage<ReadingHistory>('wikiapp:history', EMPTY_HISTORY)

function buildNode(session: ArticleSession, childrenMap: Map<string, string[]>, sessions: Record<string, ArticleSession>): RabbitHoleNode {
  const childIds = childrenMap.get(session.id) ?? []
  return {
    sessionId: session.id,
    pageId: session.pageId,
    title: session.title,
    slug: session.slug,
    thumbnail: session.thumbnail,
    finished: session.finished,
    totalTimeMs: session.totalTimeMs,
    children: childIds
      .map((id) => sessions[id])
      .filter(Boolean)
      .map((child) => buildNode(child, childrenMap, sessions)),
  }
}

function countNodes(node: RabbitHoleNode): number {
  return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0)
}

function buildRabbitHoleTrees(history: ReadingHistory): RabbitHoleTree[] {
  const trees: RabbitHoleTree[] = []

  for (const path of history.paths) {
    const pathSessionIds = new Set(path.articleIds)

    // Build parent -> children map (only within this path)
    const childrenMap = new Map<string, string[]>()
    let rootSession: ArticleSession | undefined

    for (const sessionId of path.articleIds) {
      const session = history.sessions[sessionId]
      if (!session) continue

      if (!session.parentId || !pathSessionIds.has(session.parentId)) {
        rootSession = session
      } else {
        const siblings = childrenMap.get(session.parentId) ?? []
        siblings.push(session.id)
        childrenMap.set(session.parentId, siblings)
      }
    }

    if (!rootSession) continue

    const root = buildNode(rootSession, childrenMap, history.sessions)

    // Compute updatedAt: use path field if present, otherwise derive from sessions
    const updatedAt = path.updatedAt ?? Math.max(
      ...path.articleIds.map((id) => history.sessions[id]?.startedAt ?? 0),
      path.startedAt,
    )

    trees.push({
      pathId: path.id,
      startedAt: path.startedAt,
      updatedAt,
      root,
      nodeCount: countNodes(root),
    })
  }

  // Sort by most recently updated first
  trees.sort((a, b) => b.updatedAt - a.updatedAt)
  return trees
}

export const rabbitHoleTreesAtom = atom<RabbitHoleTree[]>((get) => {
  return buildRabbitHoleTrees(get(readingHistoryAtom))
})

export const unfinishedArticlesAtom = atom<ArticleSession[]>((get) => {
  const { sessions } = get(readingHistoryAtom)
  return Object.values(sessions)
    .filter((s) => !s.finished && s.endedAt !== undefined)
    .sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0))
})

export const allReadSlugsAtom = atom<string[]>((get) => {
  const { sessions } = get(readingHistoryAtom)
  return [...new Set(Object.values(sessions).map((s) => s.slug))]
})
