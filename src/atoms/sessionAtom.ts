import { atom } from 'jotai'
import type { ArticleSession } from '@/types/article'

/** Live session being tracked now — flushed into readingHistoryAtom on navigation */
export const activeSessionAtom = atom<ArticleSession | null>(null)

/** Ordered list of session IDs in the current rabbit hole */
export const activePathIdAtom = atom<string>('')

/** Ordered article slugs in current path (for recommendation context) */
export const activePathSlugsAtom = atom<string[]>([])
