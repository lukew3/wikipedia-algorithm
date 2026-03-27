import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { preferencesAtom } from '@/atoms/preferencesAtom'
import { Navbar } from './Navbar'

export function AppShell() {
  const prefs = useAtomValue(preferencesAtom)

  useEffect(() => {
    document.documentElement.setAttribute('data-dark', String(prefs.darkMode))
  }, [prefs.darkMode])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  )
}
