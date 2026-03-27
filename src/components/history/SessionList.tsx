import { useNavigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { readingHistoryAtom } from '@/atoms/historyAtom'
import { formatDuration, formatRelativeDate } from '@/utils/time'

export function SessionList() {
  const navigate = useNavigate()
  const history = useAtomValue(readingHistoryAtom)

  const sessions = Object.values(history.sessions)
    .sort((a, b) => b.startedAt - a.startedAt)

  if (sessions.length === 0) {
    return (
      <p style={{ color: 'var(--color-text-muted)', padding: '2rem 0' }}>
        No articles read yet. Start exploring!
      </p>
    )
  }

  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sessions.map((s) => (
        <li key={s.id}>
          <button
            onClick={() => navigate(`/wiki/${s.slug}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            {s.thumbnail && (
              <img src={s.thumbnail} alt="" width={40} height={40} style={{ borderRadius: 3, objectFit: 'cover', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                {s.title}
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: s.finished ? 'var(--color-finished)' : 'var(--color-unfinished)',
                }} />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                {Math.round(s.maxScrollDepth * 100)}% read · {formatDuration(s.totalTimeMs)} · {formatRelativeDate(s.startedAt)}
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}
