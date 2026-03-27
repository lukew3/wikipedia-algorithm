import { useAtomValue } from 'jotai'
import { activeSessionAtom } from '@/atoms/sessionAtom'

export function ReadProgressBar() {
  const session = useAtomValue(activeSessionAtom)
  const depth = session?.maxScrollDepth ?? 0

  return (
    <div style={{
      position: 'fixed',
      top: 'var(--nav-height)',
      left: 0,
      right: 0,
      height: 3,
      background: 'var(--color-border)',
      zIndex: 40,
    }}>
      <div style={{
        height: '100%',
        width: `${depth * 100}%`,
        background: depth >= 0.8 ? 'var(--color-finished)' : 'var(--color-accent)',
        transition: 'width 0.1s linear',
      }} />
    </div>
  )
}
