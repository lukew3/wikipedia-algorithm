import { useNavigate } from 'react-router-dom'
import { useAtomValue, useAtom } from 'jotai'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faXmark } from '@fortawesome/free-solid-svg-icons'
import { unfinishedArticlesAtom } from '@/atoms/historyAtom'
import { preferencesAtom } from '@/atoms/preferencesAtom'
import { resumeBannerDismissedAtom } from '@/atoms/uiAtom'
import { activeSessionAtom } from '@/atoms/sessionAtom'

export function ResumeBanner() {
  const navigate = useNavigate()
  const unfinished = useAtomValue(unfinishedArticlesAtom)
  const prefs = useAtomValue(preferencesAtom)
  const [dismissed, setDismissed] = useAtom(resumeBannerDismissedAtom)
  const activeSession = useAtomValue(activeSessionAtom)

  // Find the most recent unfinished article that isn't the one being read
  const candidate = unfinished.find((s) => s.slug !== activeSession?.slug)

  if (!prefs.showResumeReminders || dismissed || !candidate) return null

  return (
    <div style={{
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: '0.875rem',
    }}>
      <FontAwesomeIcon icon={faBookOpen} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        Resume reading:{' '}
        <button
          onClick={() => navigate(`/wiki/${candidate.slug}`)}
          style={{ color: 'var(--color-accent)', fontWeight: 500, textDecoration: 'underline', cursor: 'pointer' }}
        >
          {candidate.title}
        </button>
        {' '}— you read {Math.round(candidate.maxScrollDepth * 100)}%
      </span>
      <button
        onClick={() => setDismissed(true)}
        style={{ color: 'var(--color-text-muted)', flexShrink: 0, padding: 4 }}
        aria-label="Dismiss"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  )
}
