import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

export function ArticlePage() {
  const { title = '' } = useParams<{ title: string }>()
  const navigate = useNavigate()
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeSession, setActiveSession] = useAtom(activeSessionAtom)
  const [activePathId, setActivePathId] = useAtom(activePathIdAtom)
  const setActivePathSlugs = useSetAtom(activePathSlugsAtom)
  const setHistory = useSetAtom(readingHistoryAtom)
  const history = useAtomValue(readingHistoryAtom)

  useScrollDepth()
  useSessionTimer()

  useEffect(() => {
    if (!title) { navigate('/'); return }

    setLoading(true)
    setError('')
    // Scroll to top on article change
    window.scrollTo(0, 0)

    const slug = title

    // Load article content in parallel with summary
    Promise.all([
      fetchArticleHtml(slug),
      fetchSummary(slug),
    ]).then(([articleHtml, summary]) => {
      setHtml(articleHtml)

      const sessionId = nanoid()
      const now = Date.now()

      // Determine parent: the current active session
      const parentId = activeSession?.id

      // Start or continue a reading path
      let pathId = activePathId
      if (!pathId || !parentId) {
        // New rabbit hole
        pathId = nanoid()
        setActivePathId(pathId)
        setActivePathSlugs([slug])
      } else {
        setActivePathSlugs((prev) => [...prev, slug])
      }

      const newSession = {
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
        parentId,
      }

      setActiveSession(newSession)

      // Add session + path to history
      setHistory((prev) => {
        const existingPath = prev.paths.find((p) => p.id === pathId)
        if (existingPath) {
          return {
            ...prev,
            sessions: { ...prev.sessions, [sessionId]: newSession },
            paths: prev.paths.map((p) =>
              p.id === pathId
                ? { ...p, articleIds: [...p.articleIds, sessionId] }
                : p
            ),
          }
        } else {
          return {
            ...prev,
            sessions: { ...prev.sessions, [sessionId]: newSession },
            paths: [...prev.paths, { id: pathId, startedAt: now, articleIds: [sessionId] }],
          }
        }
      })

      setLoading(false)
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to load article')
      setLoading(false)
    })
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
          <ArticleContent html={html} />
        </article>
        <RecommendationPanel />
      </div>
    </>
  )
}
