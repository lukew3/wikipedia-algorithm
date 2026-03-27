import { useNavigate } from 'react-router-dom'
import { useAtomValue, useAtom } from 'jotai'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faChevronLeft, faArrowTrendUp, faShuffle } from '@fortawesome/free-solid-svg-icons'
import { nextPageRecommendationsAtom, discoveryRecommendationsAtom, recommendationsLoadingAtom } from '@/atoms/recommendationsAtom'
import { recommendationPanelOpenAtom } from '@/atoms/uiAtom'
import { Spinner } from '@/components/common/Spinner'
import type { Recommendation } from '@/types/recommendations'
import { useRecommendations } from '@/hooks/useRecommendations'

function RecommendationCard({ rec, onClick }: { rec: Recommendation; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '10px 12px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
        transition: 'border-color var(--transition)',
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        {rec.thumbnail && (
          <img
            src={rec.thumbnail}
            alt=""
            width={40}
            height={40}
            style={{ borderRadius: 3, objectFit: 'cover', flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.3 }}>{rec.title}</div>
          {rec.description && (
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              marginTop: 2,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {rec.description}
            </div>
          )}
        </div>
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 2 }}>
        {rec.reason}
      </div>
    </button>
  )
}

export function RecommendationPanel() {
  const navigate = useNavigate()
  const [open, setOpen] = useAtom(recommendationPanelOpenAtom)
  const nextPage = useAtomValue(nextPageRecommendationsAtom)
  const discovery = useAtomValue(discoveryRecommendationsAtom)
  const loading = useAtomValue(recommendationsLoadingAtom)

  useRecommendations()

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Show recommendations"
        style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRight: 'none',
          borderRadius: '6px 0 0 6px',
          padding: '12px 8px',
          color: 'var(--color-text-muted)',
          zIndex: 30,
        }}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
    )
  }

  return (
    <aside style={{
      width: 'var(--panel-width)',
      flexShrink: 0,
      position: 'sticky',
      top: 'calc(var(--nav-height) + 6px)',
      height: 'calc(100dvh - var(--nav-height) - 6px)',
      overflowY: 'auto',
      padding: '1.5rem 0 1.5rem 16px',
      borderLeft: '1px solid var(--color-border)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Recommendations</span>
        <button
          onClick={() => setOpen(false)}
          style={{ color: 'var(--color-text-muted)', padding: 4 }}
          title="Hide recommendations"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {/* Up next section */}
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <FontAwesomeIcon icon={faArrowTrendUp} style={{ color: 'var(--color-accent)', fontSize: '0.8rem' }} />
          <span style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Up next
          </span>
          {loading.nextPage && <Spinner size="xs" />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {nextPage.slice(0, 3).map((rec) => (
            <RecommendationCard key={rec.slug} rec={rec} onClick={() => navigate(`/wiki/${rec.slug}`)} />
          ))}
          {!loading.nextPage && nextPage.length === 0 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Loading suggestions…</p>
          )}
        </div>
      </section>

      {/* Discover section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <FontAwesomeIcon icon={faShuffle} style={{ color: 'var(--color-finished)', fontSize: '0.8rem' }} />
          <span style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Discover
          </span>
          {loading.discovery && <Spinner size="xs" />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {discovery.slice(0, 3).map((rec) => (
            <RecommendationCard key={rec.slug} rec={rec} onClick={() => navigate(`/wiki/${rec.slug}`)} />
          ))}
          {!loading.discovery && discovery.length === 0 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Read more articles to unlock discovery.</p>
          )}
        </div>
      </section>
    </aside>
  )
}
