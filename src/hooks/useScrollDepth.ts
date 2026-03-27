import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { activeSessionAtom } from '@/atoms/sessionAtom'
import { useAtomValue } from 'jotai'
import { preferencesAtom } from '@/atoms/preferencesAtom'

export function useScrollDepth() {
  const [session, setSession] = useAtom(activeSessionAtom)
  const prefs = useAtomValue(preferencesAtom)

  useEffect(() => {
    if (!session) return

    let rafId: number | null = null

    function compute() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      const depth = Math.min(window.scrollY / scrollable, 1)

      setSession((prev) => {
        if (!prev || depth <= prev.maxScrollDepth) return prev
        return {
          ...prev,
          maxScrollDepth: depth,
          finished: depth >= prefs.finishedThreshold,
        }
      })
    }

    function onScroll() {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        compute()
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    compute() // initial check

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [session?.id, setSession, prefs.finishedThreshold]) // re-attach only when session changes
}
