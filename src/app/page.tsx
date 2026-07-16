'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ErrorBoundary } from '@/components/error-boundary'
import { HomePage } from '@/views/home'
import { GamesPage } from '@/views/games'
import { GameDetailPage } from '@/views/game-detail'
import { ModsPage } from '@/views/mods'
import { ModDetailPage } from '@/views/mod-detail'
import { SearchPage } from '@/views/search'
import { UploadPage } from '@/views/upload'
import { ProfilePage } from '@/views/profile'
import { SeriesPage } from '@/views/series'
import { SeriesDetailPage } from '@/views/series-detail'
import { PlatformPage } from '@/views/platform'
import { ComingSoonPage } from '@/views/coming-soon'
import type { GameSummary } from '@/lib/types'

type View =
  | 'home'
  | 'games'
  | 'game'
  | 'mods'
  | 'mod'
  | 'search'
  | 'upload'
  | 'profile'
  | 'series'
  | 'series-detail'
  | 'platform'

const KNOWN_VIEWS: ReadonlySet<string> = new Set<string>([
  'home', 'games', 'game', 'mods', 'mod', 'search', 'upload', 'profile',
  'series', 'series-detail', 'platform',
])

/** Games list shown in the navbar dropdown — only the fields the navbar needs. */
type NavGame = Pick<GameSummary, 'slug' | 'name' | 'thumbnailUrl' | 'modCount' | 'platform' | 'createdAt'>

function PageContent() {
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'home'
  const isKnownView = KNOWN_VIEWS.has(view)

  const [navGames, setNavGames] = useState<NavGame[]>([])

  // Fetch the nav games list once on mount. We don't fetch site-wide stats
  // here because the home page fetches its own aggregated data via /api/home,
  // and no other view displays site stats.
  useEffect(() => {
    let cancelled = false
    // نجيب أحدث الألعاب (مش الأكثر تعديلات) عشان قوائم المنصات في الـ Navbar
    // تعرض "أحدث 3" فعلياً لكل منصة — وعدد أكبر (40) عشان نضمن تغطية كل
    // المنصات الخمسة حتى لو بعضها فيه ألعاب أقل.
    fetch('/api/games?sort=newest&limit=40')
      .then((r) => r.json())
      .then((d: { games: GameSummary[] }) => {
        if (cancelled) return
        setNavGames(d.games || [])
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Scroll to top on view change — but only if there's no #hash on the URL
  // (so in-page anchors still work, if we ever add them).
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash) return
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [view, searchParams.toString()])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar games={navGames} />
      <main className="flex-1">
        <ErrorBoundary label="this page">
          {view === 'home' && <HomePage />}
          {view === 'games' && <GamesPage />}
          {view === 'game' && <GameDetailPage />}
          {view === 'mods' && <ModsPage />}
          {view === 'mod' && <ModDetailPage />}
          {view === 'search' && <SearchPage />}
          {view === 'upload' && <UploadPage />}
          {view === 'profile' && <ProfilePage />}
          {view === 'series' && <SeriesPage />}
          {view === 'series-detail' && <SeriesDetailPage />}
          {view === 'platform' && <PlatformPage />}
          {view && !isKnownView && <ComingSoonPage title={view} />}
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label="Loading" />
        </div>
      }
    >
      <PageContent />
    </Suspense>
  )
}
