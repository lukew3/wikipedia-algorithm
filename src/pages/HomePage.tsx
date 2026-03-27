import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faRandom } from '@fortawesome/free-solid-svg-icons'
import { fetchFeatured, fetchRandomTitle } from '@/api/wikipedia'
import type { wikiSummary } from '@/api/wikipedia'
import { titleToSlug } from '@/utils/titleToSlug'
import { useAtomValue } from 'jotai'
import { unfinishedArticlesAtom } from '@/atoms/historyAtom'
import { formatRelativeDate, formatDuration } from '@/utils/time'

export function HomePage() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState<wikiSummary | null>(null)
  const unfinished = useAtomValue(unfinishedArticlesAtom)

  useEffect(() => {
    fetchFeatured()
      .then((data) => { if (data.tfa) setFeatured(data.tfa) })
      .catch(() => {/* show nothing if featured fails */})
  }, [])

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 16px' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>WikiLayer</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>
        Your personal Wikipedia reading companion. Search for any article to start exploring.
      </p>

      {unfinished.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Continue reading</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {unfinished.slice(0, 3).map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/wiki/${s.slug}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                {s.thumbnail && (
                  <img src={s.thumbnail} alt="" width={48} height={48} style={{ borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{s.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {Math.round(s.maxScrollDepth * 100)}% read · {formatDuration(s.totalTimeMs)} · {formatRelativeDate(s.endedAt ?? s.startedAt)}
                  </div>
                  <div style={{
                    marginTop: 4,
                    height: 3,
                    background: 'var(--color-border)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${s.maxScrollDepth * 100}%`,
                      background: 'var(--color-accent)',
                    }} />
                  </div>
                </div>
                <FontAwesomeIcon icon={faArrowRight} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </section>
      )}

      {featured && (
        <section>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Today's featured article</h2>
          <button
            onClick={() => navigate(`/wiki/${titleToSlug(featured.title)}`)}
            style={{
              display: 'flex',
              gap: 16,
              padding: '16px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            {featured.thumbnail && (
              <img
                src={featured.thumbnail.source}
                alt=""
                width={80}
                height={80}
                style={{ borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: 4 }}>{featured.title}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {featured.description ?? featured.extract}
              </div>
            </div>
            <FontAwesomeIcon icon={faArrowRight} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: 4 }} />
          </button>
        </section>
      )}

      <div style={{ marginTop: 24 }}>
        <button
          onClick={() => {
            fetchRandomTitle()
              .then((slug) => navigate(`/wiki/${slug}`))
              .catch(() => {/* ignore */})
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: 'var(--color-accent)',
            color: '#fff',
            borderRadius: 20,
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <FontAwesomeIcon icon={faRandom} />
          Random article
        </button>
      </div>
    </div>
  )
}
