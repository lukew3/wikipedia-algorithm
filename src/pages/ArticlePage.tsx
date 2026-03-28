import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import { nanoid } from 'nanoid'
import { fetchSummary, fetchArticleHtml } from '@/api/wikipedia'
import { activeSessionAtom, activePathIdAtom, activePathSlugsAtom } from '@/atoms/sessionAtom'
import { readingHistoryAtom } from '@/atoms/historyAtom'
import { ArticleContent } from '@/components/reader/ArticleContent'
import { ReadProgressBar } from '@/components/reader/ReadProgressBar'
import { RecommendationPanel } from '@/components/reader/RecommendationPanel'
import { ResumeBanner } from '@/components/resume/ResumeBanner'
import { Spinner } from '@/components/common/Spinner'
import { useScrollDepth } from '@/hooks/useScrollDepth'
import { useSessionTimer } from '@/hooks/useSessionTimer'
import type { ArticleSession } from '@/types/article'

/** Walk up the parentId chain from `current` looking for an ancestor with the given slug. */
function findAncestor(
  slug: string,
  current: ArticleSession | null,
  sessions: Record<string, ArticleSession>,
): ArticleSession | undefined {
  let cursor = current
  while (cursor) {
    if (cursor.slug === slug) return cursor
    cursor = cursor.parentId ? sessions[cursor.parentId] ?? null : null
  }
  return undefined
}

export function ArticlePage() {
  const { title = '' } = useParams<{ title: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeSession, setActiveSession] = useAtom(activeSessionAtom)
  const [activePathId, setActivePathId] = useAtom(activePathIdAtom)
  const setActivePathSlugs = useSetAtom(activePathSlugsAtom)
  const setHistory = useSetAtom(readingHistoryAtom)
  const history = useAtomValue(readingHistoryAtom)

  useScrollDepth()
  const { flushCurrentSession } = useSessionTimer()

  // Refs to avoid stale closures in async .then() callback
  const activeSessionRef = useRef(activeSession)
  const activePathIdRef = useRef(activePathId)
  const historyRef = useRef(history)
  useLayoutEffect(() => { activeSessionRef.current = activeSession }, [activeSession])
  useLayoutEffect(() => { activePathIdRef.current = activePathId }, [activePathId])
  useLayoutEffect(() => { historyRef.current = history }, [history])

  // Ref to persist parentSessionId across StrictMode remounts
  // (keyed by slug so it's only valid for the navigation that set it)
  const parentIdRef = useRef<{ slug: string; id: string }>({ slug: '', id: '' })

  useEffect(() => {
    if (!title) { navigate('/'); return }

    // AbortController so StrictMode's first mount becomes a no-op
    const ac = new AbortController()

    setLoading(true)
    setError('')
    window.scrollTo(0, 0)

    const slug = title

    // Capture parentSessionId in a ref (survives StrictMode remount).
    // Only overwrite when fresh state is provided by navigation.
    const freshParentId = (location.state as { parentSessionId?: string } | null)?.parentSessionId
    if (freshParentId) {
      parentIdRef.current = { slug, id: freshParentId }
    }

    Promise.all([
      fetchArticleHtml(slug),
      fetchSummary(slug),
    ]).then(([articleHtml, summary]) => {
      if (ac.signal.aborted) return // StrictMode killed first mount — skip

      setHtml(articleHtml)

      // Read current values from refs (not stale closure)
      const curHistory = historyRef.current
      const curActiveSession = activeSessionRef.current
      const curActivePathId = activePathIdRef.current

      // Consume parentSessionId from ref (only valid for this slug)
      const stateParentSessionId = parentIdRef.current.slug === slug
        ? parentIdRef.current.id
        : undefined

      // --- CASE 1: Forward navigation (user clicked a link/recommendation) ---
      // Verify parent is valid (exists in current path) to guard against stale state after refresh
      const currentPath = curHistory.paths.find((p) => p.id === curActivePathId)
      const parentValid = stateParentSessionId && currentPath?.articleIds.includes(stateParentSessionId)

      if (parentValid) {
        flushCurrentSession()

        // Clear consumed state so browser back/forward doesn't replay it
        parentIdRef.current = { slug: '', id: '' }
        window.history.replaceState({}, '')

        const sessionId = nanoid()
        const now = Date.now()

        let pathId = curActivePathId
        if (!pathId) {
          pathId = nanoid()
          setActivePathId(pathId)
          setActivePathSlugs([slug])
        } else {
          setActivePathSlugs((prev) => [...prev, slug])
        }

        const newSession: ArticleSession = {
          id: sessionId,
          pageId: summary.pageid,
          title: summary.title,
          slug,
          url: summary.content_urls.desktop.page,
          thumbnail: summary.thumbnail?.source,
          description: summary.description,
          startedAt: now,
          totalTimeMs: 0,
          maxScrollDepth: 0,
          finished: false,
          parentId: stateParentSessionId,
        }

        setActiveSession(newSession)
        setHistory((prev) => {
          const ep = prev.paths.find((p) => p.id === pathId)
          if (ep) {
            return {
              ...prev,
              sessions: { ...prev.sessions, [sessionId]: newSession },
              paths: prev.paths.map((p) =>
                p.id === pathId
                  ? { ...p, articleIds: [...p.articleIds, sessionId], updatedAt: now, endedAt: undefined }
                  : p
              ),
            }
          }
          return {
            ...prev,
            sessions: { ...prev.sessions, [sessionId]: newSession },
            paths: [...prev.paths, { id: pathId, startedAt: now, updatedAt: now, articleIds: [sessionId] }],
          }
        })
        setLoading(false)
        return
      }

      // --- CASE 2: Back navigation (slug matches an ancestor in the current path) ---
      const ancestor = findAncestor(slug, curActiveSession, curHistory.sessions)
      if (ancestor && currentPath?.articleIds.includes(ancestor.id)) {
        flushCurrentSession()
        // Re-activate the ancestor session (clear endedAt so timer resumes)
        setActiveSession({ ...ancestor, endedAt: undefined })
        setLoading(false)
        return
      }

      // --- CASE 3: New path (search, random, direct URL, refresh) ---
      flushCurrentSession()

      const sessionId = nanoid()
      const now = Date.now()
      const pathId = nanoid()

      setActivePathId(pathId)
      setActivePathSlugs([slug])

      const newSession: ArticleSession = {
        id: sessionId,
        pageId: summary.pageid,
        title: summary.title,
        slug,
        url: summary.content_urls.desktop.page,
        thumbnail: summary.thumbnail?.source,
        description: summary.description,
        startedAt: now,
        totalTimeMs: 0,
        maxScrollDepth: 0,
        finished: false,
      }

      setActiveSession(newSession)
      setHistory((prev) => ({
        ...prev,
        sessions: { ...prev.sessions, [sessionId]: newSession },
        paths: [...prev.paths, { id: pathId, startedAt: now, updatedAt: now, articleIds: [sessionId] }],
      }))
      setLoading(false)
    }).catch((err: unknown) => {
      if (ac.signal.aborted) return
      setError(err instanceof Error ? err.message : 'Failed to load article')
      setLoading(false)
    })

    return () => ac.abort()
  }, [title]) // deliberately not including all deps — only re-run when title changes

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
        <Spinner size="2x" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', maxWidth: 700, margin: '0 auto' }}>
        <p style={{ color: 'var(--color-danger)' }}>Failed to load "{title}": {error}</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: 12, color: 'var(--color-accent)' }}>
          ← Go back
        </button>
      </div>
    )
  }

  return (
    <>
      <ReadProgressBar />
      <ResumeBanner />
      <div style={{
        display: 'flex',
        flex: 1,
        gap: 0,
        maxWidth: 1280,
        margin: '0 auto',
        width: '100%',
        padding: '0 16px',
        paddingTop: 6, // offset progress bar
      }}>
        <article style={{ flex: 1, minWidth: 0, padding: '1.5rem 0', paddingRight: 24 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
            {activeSession?.title ?? title.replace(/_/g, ' ')}
          </h1>
          {activeSession?.description && (
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              {activeSession.description}
            </p>
          )}
          <ArticleContent html={html} activeSessionId={activeSession?.id} />
        </article>
        <RecommendationPanel />
      </div>
    </>
  )
}
