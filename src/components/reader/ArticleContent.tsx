import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '@/styles/article.css'

interface Props {
  html: string
  onReady?: () => void
}

/** Sanitize Wikipedia HTML: remove script/style/link tags */
function sanitize(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
}

export function ArticleContent({ html, onReady }: Props) {
  const navigate = useNavigate()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    // Hijack all internal Wikipedia links to stay in-app
    const anchors = el.querySelectorAll<HTMLAnchorElement>('a[href]')
    const cleanup: Array<() => void> = []

    for (const a of anchors) {
      const href = a.getAttribute('href') ?? ''

      // Relative ./Article_Name links are internal Wikipedia article links
      if (href.startsWith('./')) {
        const slug = decodeURIComponent(href.slice(2)).replace(/ /g, '_').split('#')[0]
        if (!slug) continue
        const handler = (e: MouseEvent) => {
          e.preventDefault()
          navigate(`/wiki/${slug}`)
        }
        a.addEventListener('click', handler)
        cleanup.push(() => a.removeEventListener('click', handler))
      } else if (href.startsWith('http') && href.includes('wikipedia.org/wiki/')) {
        // Absolute Wikipedia links
        const match = /\/wiki\/([^#?]+)/.exec(href)
        if (match) {
          const slug = decodeURIComponent(match[1]).replace(/ /g, '_')
          const handler = (e: MouseEvent) => {
            e.preventDefault()
            navigate(`/wiki/${slug}`)
          }
          a.addEventListener('click', handler)
          cleanup.push(() => a.removeEventListener('click', handler))
        }
      } else if (!href.startsWith('http')) {
        // Other relative links — open externally or suppress
        a.setAttribute('href', `https://en.wikipedia.org${href}`)
        a.setAttribute('target', '_blank')
        a.setAttribute('rel', 'noopener noreferrer')
      }
    }

    onReady?.()
    return () => cleanup.forEach((fn) => fn())
  }, [html, navigate, onReady])

  return (
    <div
      ref={contentRef}
      className="wiki-content"
      dangerouslySetInnerHTML={{ __html: sanitize(html) }}
    />
  )
}
