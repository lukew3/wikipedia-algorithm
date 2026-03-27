import { useAtomValue } from 'jotai'
import { readingHistoryAtom } from '@/atoms/historyAtom'
import { NetworkGraph } from '@/components/history/NetworkGraph'
import { SessionList } from '@/components/history/SessionList'
import { formatDuration } from '@/utils/time'

function useIsMobile() {
  // SSR-safe check
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

export function HistoryPage() {
  const history = useAtomValue(readingHistoryAtom)
  const isMobile = useIsMobile()

  const sessions = Object.values(history.sessions)
  const totalArticles = new Set(sessions.map((s) => s.pageId)).size
  const totalTime = sessions.reduce((acc, s) => acc + s.totalTimeMs, 0)
  const finishedCount = sessions.filter((s) => s.finished).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: 'calc(100dvh - var(--nav-height))', overflow: 'hidden' }}>
      {/* Stats bar */}
      <div style={{
        display: 'flex',
        gap: 24,
        padding: '12px 24px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        <Stat label="Articles read" value={String(totalArticles)} />
        <Stat label="Completed" value={String(finishedCount)} />
        <Stat label="Total time" value={formatDuration(totalTime)} />
        <Stat label="Rabbit holes" value={String(history.paths.length)} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '16px 24px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '1.3rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          Reading history
        </h1>

        {isMobile ? (
          <SessionList />
        ) : (
          <>
            <div style={{ flex: 1, minHeight: 400 }}>
              <NetworkGraph />
            </div>
            <details style={{ marginTop: 16 }}>
              <summary style={{ cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 8 }}>
                All articles (list view)
              </summary>
              <SessionList />
            </details>
          </>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  )
}
