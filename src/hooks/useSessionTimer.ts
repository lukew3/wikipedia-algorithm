import { useEffect, useRef } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { activeSessionAtom } from '@/atoms/sessionAtom'
import { readingHistoryAtom } from '@/atoms/historyAtom'

export function useSessionTimer() {
  const [session, setSession] = useAtom(activeSessionAtom)
  const setHistory = useSetAtom(readingHistoryAtom)
  const lastTickRef = useRef<number>(Date.now())
  const pausedRef = useRef<boolean>(false)

  // Accumulate time, pausing when tab is hidden
  useEffect(() => {
    if (!session) return

    lastTickRef.current = Date.now()
    pausedRef.current = document.hidden

    function onVisibilityChange() {
      if (document.hidden) {
        // Flush accumulated time before pausing
        const now = Date.now()
        const delta = now - lastTickRef.current
        setSession((prev) => prev ? { ...prev, totalTimeMs: prev.totalTimeMs + delta } : prev)
        lastTickRef.current = now
        pausedRef.current = true
      } else {
        lastTickRef.current = Date.now()
        pausedRef.current = false
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [session?.id, setSession])

  // Flush completed session to history on unmount (navigation away)
  useEffect(() => {
    return () => {
      setSession((prev) => {
        if (!prev) return null
        const now = Date.now()
        const extraMs = pausedRef.current ? 0 : now - lastTickRef.current
        const completed = { ...prev, endedAt: now, totalTimeMs: prev.totalTimeMs + extraMs }

        setHistory((history) => ({
          ...history,
          lastActiveAt: now,
          sessions: { ...history.sessions, [completed.id]: completed },
          paths: history.paths.map((path) =>
            path.articleIds.includes(completed.id)
              ? { ...path, endedAt: now }
              : path
          ),
        }))

        return null
      })
    }
  }, []) // empty deps — intentional: runs only on unmount
}
