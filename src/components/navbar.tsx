'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, Menu, ChevronDown, Upload, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'
import { useDebounced } from '@/hooks/use-debounced'
import type { GameSummary, SearchResponse } from '@/lib/types'

interface NavbarProps {
  games: Pick<GameSummary, 'slug' | 'name' | 'thumbnailUrl' | 'modCount' | 'platform' | 'createdAt'>[]
}

// عدد الألعاب المعروضة في كل قسم منصة داخل الـ Navbar — ثابت وموحّد في كل الأقسام
const NAV_SECTION_LIMIT = 3

const PLATFORMS = [
  { key: 'PC', label: 'ARABIC PC' },
  { key: 'PS4', label: 'ARABIC PS4' },
  { key: 'PS3', label: 'ARABIC PS3' },
  { key: 'PS2', label: 'ARABIC PS2' },
  { key: 'PS1', label: 'ARABIC PS1' },
] as const

export function Navbar({ games }: NavbarProps) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [suggestions, setSuggestions] = useState<SearchResponse>({ mods: [], games: [] })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1)

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedQ = useDebounced(q, 200)

  useEffect(() => {
    if (!debouncedQ.trim()) {
      Promise.resolve().then(() => {
        setSuggestions({ mods: [], games: [] })
        setActiveSuggestionIdx(-1)
      })
      return
    }
    const controller = new AbortController()
    let cancelled = false
    fetch(`/api/search?q=${encodeURIComponent(debouncedQ)}&limit=5`, {
      signal: controller.signal,
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data: SearchResponse | null) => {
        if (!cancelled && data) {
          setSuggestions(data)
          setShowSuggestions(true)
          setActiveSuggestionIdx(-1)
        }
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return
        console.error('[navbar search] failed:', err)
      })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [debouncedQ])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isTypingTarget =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      if (e.key === '/' && !isTypingTarget && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && showSuggestions) {
        setShowSuggestions(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showSuggestions])

  const hasSuggestions = suggestions.mods.length > 0 || suggestions.games.length > 0
  const flatSuggestions = [
    ...suggestions.games.map((g) => ({ kind: 'game' as const, item: g })),
    ...suggestions.mods.map((m) => ({ kind: 'mod' as const, item: m })),
  ]

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) {
      router.push(`/?view=search&q=${encodeURIComponent(q.trim())}`)
      setShowSuggestions(false)
      setMobileOpen(false)
      inputRef.current?.blur()
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!hasSuggestions) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestionIdx((i) => Math.min(i + 1, flatSuggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestionIdx((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeSuggestionIdx >= 0) {
      e.preventDefault()
      const selected = flatSuggestions[activeSuggestionIdx]
      if (selected) {
        const url =
          selected.kind === 'game'
            ? `/?view=game&slug=${selected.item.slug}`
            : `/?view=mod&slug=${selected.item.slug}`
        router.push(url)
        setShowSuggestions(false)
        setQ('')
        inputRef.current?.blur()
      }
    }
  }

  const clearSuggestions = useCallback(() => {
    setShowSuggestions(false)
    setQ('')
  }, [])

  // الشريط العلوي بالكامل بالإنجليزية (LTR)
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm" dir="ltr">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[360px]">
            <SheetHeader>
              <SheetTitle className="text-left">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <span className="text-2xl font-bold tracking-tight">
                    <span className="text-primary">GAMES</span>
                    <span className="text-foreground"> ARABIC</span>
                  </span>
                </Link>
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              <MobileLink href="/?view=series" onClick={() => setMobileOpen(false)}>
                سلاسل التعريبات
              </MobileLink>
              {PLATFORMS.map((p) => (
                <MobileLink key={p.key} href={`/?view=games&platform=${p.key}`} onClick={() => setMobileOpen(false)}>
                  {p.label}
                </MobileLink>
              ))}

              <div className="mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Games</div>
              {games.slice(0, 6).map((g) => (
                <Link
                  key={g.slug}
                  href={`/?view=game&slug=${g.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  <img src={g.thumbnailUrl} alt={g.name} className="h-8 w-8 rounded object-cover" loading="lazy" />
                  <span className="flex-1 truncate">{g.name}</span>
                  <Badge variant="outline" className="text-[10px]">{g.platform}</Badge>
                </Link>
              ))}

              <div className="mt-4 space-y-2 border-t pt-4">
                <Button asChild className="w-full">
                  <Link href="/?view=upload" onClick={() => setMobileOpen(false)}>
                    <Upload className="mr-2 h-4 w-4" /> Upload Mod
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/?view=profile" onClick={() => setMobileOpen(false)}>
                    <LogIn className="mr-2 h-4 w-4" /> Log in
                  </Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo — English */}
        <Link href="/" className="flex shrink-0 items-center gap-1" aria-label="Games Arabic home">
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-primary">GAMES</span>
            <span className="text-foreground"> ARABIC</span>
          </span>
        </Link>

        {/* Desktop nav — platform sections, English */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          <Link
            href="/?view=series"
            className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
          >
            سلاسل التعريبات
          </Link>
          {PLATFORMS.map((p) => (
            <NavDropdown
              key={p.key}
              label={p.label}
              items={games
                .filter(g => g.platform === p.key)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, NAV_SECTION_LIMIT)
                .map((g) => ({
                  label: g.name,
                  href: `/?view=game&slug=${g.slug}`,
                  thumbnail: g.thumbnailUrl,
                  meta: `${formatNumber(g.modCount)} mods`,
                }))}
              footer={{ label: `Browse all ${p.label} games`, href: `/?view=games&platform=${p.key}` }}
            />
          ))}
        </nav>

        {/* Search — English */}
        <div ref={searchRef} className="relative flex-1 max-w-md mx-auto">
          <form onSubmit={onSearch} role="search">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => hasSuggestions && setShowSuggestions(true)}
                onKeyDown={onKeyDown}
                placeholder="Search…"
                aria-label="Search mods and games"
                aria-expanded={showSuggestions && hasSuggestions}
                aria-autocomplete="list"
                aria-controls="search-suggestions"
                className="h-9 border-border bg-secondary/50 pl-10 pr-4 text-sm"
              />
            </div>
          </form>

          {showSuggestions && hasSuggestions && (
            <div
              id="search-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-border bg-popover shadow-xl"
            >
              {suggestions.games.length > 0 && (
                <div className="border-b border-border">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Games</div>
                  {suggestions.games.map((g, i) => (
                    <Link
                      key={g.id}
                      href={`/?view=game&slug=${g.slug}`}
                      onClick={clearSuggestions}
                      onMouseEnter={() => setActiveSuggestionIdx(i)}
                      role="option"
                      aria-selected={activeSuggestionIdx === i}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2',
                        activeSuggestionIdx === i ? 'bg-accent' : 'hover:bg-accent'
                      )}
                    >
                      <img src={g.thumbnailUrl} alt="" className="h-8 w-12 rounded object-cover" loading="lazy" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{g.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{g.tagline}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {suggestions.mods.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mods</div>
                  {suggestions.mods.map((m, modIdx) => {
                    const flatIdx = suggestions.games.length + modIdx
                    return (
                      <Link
                        key={m.id}
                        href={`/?view=mod&slug=${m.slug}`}
                        onClick={clearSuggestions}
                        onMouseEnter={() => setActiveSuggestionIdx(flatIdx)}
                        role="option"
                        aria-selected={activeSuggestionIdx === flatIdx}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2',
                          activeSuggestionIdx === flatIdx ? 'bg-accent' : 'hover:bg-accent'
                        )}
                      >
                        <img src={m.thumbnailUrl} alt="" className="h-8 w-12 rounded object-cover" loading="lazy" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{m.name}</div>
                          <div className="truncate text-xs text-muted-foreground">{m.game.name} · {formatNumber(m.downloads)} downloads</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right actions — English */}
        <div className="hidden items-center gap-3 sm:flex">
          <Button asChild variant="ghost" size="sm" className="text-sm font-medium text-foreground hover:text-primary">
            <Link href="/?view=profile">
              Log in
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/?view=upload">
              <Upload className="mr-1.5 h-4 w-4" /> Upload Mod
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

function NavDropdown({
  label,
  items,
  footer,
}: {
  label: string
  items: { label: string; href: string; thumbnail?: string; meta?: string }[]
  footer?: { label: string; href: string }
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary">
          {label}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[360px] p-2">
        <DropdownMenuLabel className="px-2 text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </DropdownMenuLabel>
        <div className="grid grid-cols-1 gap-0.5">
          {items.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} className="flex items-center gap-3 rounded-md px-2 py-2">
                {item.thumbnail && (
                  <img src={item.thumbnail} alt="" className="h-8 w-12 rounded object-cover" loading="lazy" />
                )}
                <span className="flex-1 truncate text-sm">{item.label}</span>
                {item.meta && (
                  <span className="text-xs text-muted-foreground">{item.meta}</span>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
        {footer && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={footer.href} className="flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-primary">
                {footer.label}
                <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
    >
      {children}
    </Link>
  )
}
