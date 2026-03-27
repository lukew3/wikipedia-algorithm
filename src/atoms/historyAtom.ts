import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { ReadingHistory, HistoryGraph, HistoryGraphNode, HistoryGraphLink } from '@/types/history'
import type { ArticleSession } from '@/types/article'

const EMPTY_HISTORY: ReadingHistory = {
  version: 1,
  sessions: {},
  paths: [],
  lastActiveAt: Date.now(),
}

export const readingHistoryAtom = atomWithStorage<ReadingHistory>('wikiapp:history', EMPTY_HISTORY)

function buildHistoryGraph(history: ReadingHistory): HistoryGraph {
  const nodeMap = new Map<number, HistoryGraphNode>()
  const links: HistoryGraphLink[] = []

  // Use pageId to deduplicate nodes across multiple visits to the same article
  for (const session of Object.values(history.sessions)) {
    const existing = nodeMap.get(session.pageId)
    if (existing) {
      existing.visitCount += 1
      existing.totalTimeMs += session.totalTimeMs
      if (session.finished) existing.finished = true
    } else {
      nodeMap.set(session.pageId, {
        id: session.id,
        title: session.title,
        slug: session.slug,
        thumbnail: session.thumbnail,
        finished: session.finished,
        visitCount: 1,
        totalTimeMs: session.totalTimeMs,
      })
    }
  }

  // Build edges from parentId relationships
  for (const session of Object.values(history.sessions)) {
    if (session.parentId) {
      const parentSession = history.sessions[session.parentId]
      if (parentSession) {
        const parentNode = nodeMap.get(parentSession.pageId)
        const childNode = nodeMap.get(session.pageId)
        if (parentNode && childNode && parentNode.id !== childNode.id) {
          // Find which path this edge belongs to
          const path = history.paths.find(
            (p) => p.articleIds.includes(session.parentId!) && p.articleIds.includes(session.id)
          )
          links.push({
            source: parentNode.id,
            target: childNode.id,
            pathId: path?.id ?? '',
          })
        }
      }
    }
  }

  return { nodes: Array.from(nodeMap.values()), links }
}

export const historyGraphAtom = atom<HistoryGraph>((get) => {
  return buildHistoryGraph(get(readingHistoryAtom))
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
