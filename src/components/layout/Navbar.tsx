import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiagramProject, faMoon, faSun, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { useAtom } from 'jotai'
import { preferencesAtom } from '@/atoms/preferencesAtom'
import { SearchBar } from './SearchBar'

export function Navbar() {
  const [prefs, setPrefs] = useAtom(preferencesAtom)

  return (
    <nav style={{
      height: 'var(--nav-height)',
      background: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 16px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontWeight: 700,
        fontSize: '1.1rem',
        color: 'var(--color-accent)',
        whiteSpace: 'nowrap',
        textDecoration: 'none',
        flexShrink: 0,
      }}>
        <FontAwesomeIcon icon={faGlobe} />
        <span className="nav-logo-text">WikiLayer</span>
      </Link>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
        <SearchBar />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <Link
          to="/history"
          title="Reading history"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            borderRadius: 'var(--radius)',
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
            transition: 'color var(--transition)',
          }}
        >
          <FontAwesomeIcon icon={faDiagramProject} size="lg" />
          <span style={{ fontSize: '0.85rem', display: 'var(--nav-label-display, inline)' }}>History</span>
        </Link>

        <button
          onClick={() => setPrefs((p) => ({ ...p, darkMode: !p.darkMode }))}
          title={prefs.darkMode ? 'Light mode' : 'Dark mode'}
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius)',
            color: 'var(--color-text-muted)',
          }}
        >
          <FontAwesomeIcon icon={prefs.darkMode ? faSun : faMoon} size="lg" />
        </button>
      </div>
    </nav>
  )
}
