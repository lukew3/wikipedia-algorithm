import { useEffect, useRef } from 'react'
import { useSetAtom, useAtomValue } from 'jotai'
import { nextPageRecommendationsAtom, discoveryRecommendationsAtom, recommendationsLoadingAtom } from '@/atoms/recommendationsAtom'
import { activeSessionAtom, activePathSlugsAtom } from '@/atoms/sessionAtom'
import { allReadSlugsAtom } from '@/atoms/historyAtom'
import { getNextPageRecommendations } from '@/algorithms/nextPage'
import { getDiscoveryRecommendations } from '@/algorithms/randomDiscovery'

export function useRecommendations() {
  const setNextPage = useSetAtom(nextPageRecommendationsAtom)
  const setDiscovery = useSetAtom(discoveryRecommendationsAtom)
  const setLoading = useSetAtom(recommendationsLoadingAtom)
  const session = useAtomValue(activeSessionAtom)
  const pathSlugs = useAtomValue(activePathSlugsAtom)
  const allHistory = useAtomValue(allReadSlugsAtom)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!session) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const ctx = {
        currentSlug: session.slug,
        currentCategories: [],
        currentLinks: [],
        recentPath: pathSlugs,
        fullHistory: allHistory,
      }

      // Next page recommendations
      setLoading((prev) => ({ ...prev, nextPage: true }))
      getNextPageRecommendations(ctx)
        .then((recs) => setNextPage(recs))
        .catch(() => setNextPage([]))
        .finally(() => setLoading((prev) => ({ ...prev, nextPage: false })))

      // Discovery recommendations (fire lazily, only when history is substantial enough)
      if (allHistory.length > 0) {
        setLoading((prev) => ({ ...prev, discovery: true }))
        getDiscoveryRecommendations(allHistory)
          .then((recs) => setDiscovery(recs))
          .catch(() => setDiscovery([]))
          .finally(() => setLoading((prev) => ({ ...prev, discovery: false })))
      }
    }, 500)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [session?.slug])
}
