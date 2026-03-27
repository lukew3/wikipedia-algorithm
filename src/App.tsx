import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider as JotaiProvider } from 'jotai'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { ArticlePage } from '@/pages/ArticlePage'
import { HistoryPage } from '@/pages/HistoryPage'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export function App() {
  return (
    <JotaiProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path="/wiki/:title" element={<ArticlePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<HomePage />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </JotaiProvider>
  )
}
