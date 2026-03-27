import { atom } from 'jotai'
import type { Recommendation } from '@/types/recommendations'

export const nextPageRecommendationsAtom = atom<Recommendation[]>([])
export const discoveryRecommendationsAtom = atom<Recommendation[]>([])
export const recommendationsLoadingAtom = atom({ nextPage: false, discovery: false })
