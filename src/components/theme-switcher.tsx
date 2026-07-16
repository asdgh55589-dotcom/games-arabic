'use client'

import { useEffect, useState } from 'react'
import { Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

type Theme = 'default' | 'etrdream'

const THEMES: { key: Theme; label: string; color: string }[] = [
  { key: 'default', label: 'النسخة الأصلية', color: '#FF6B35' },
  { key: 'etrdream', label: 'ETR Dream', color: '#0d76ff' },
]

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('default')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved && saved !== 'default') {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  const onThemeChange = (t: Theme) => {
    setTheme(t)
    if (t === 'default') {
      document.documentElement.removeAttribute('data-theme')
      localStorage.removeItem('theme')
    } else {
      document.documentElement.setAttribute('data-theme', t)
      localStorage.setItem('theme', t)
    }
  }

  const currentTheme = THEMES.find((t) => t.key === theme) || THEMES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="تبديل السمة">
          <Palette className="h-4 w-4" />
          <span
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-background"
            style={{ backgroundColor: currentTheme.color }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs">اختر السمة</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.key}
            onClick={() => onThemeChange(t.key)}
            className="flex items-center gap-2"
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: t.color }}
            />
            <span className={theme === t.key ? 'font-bold' : ''}>{t.label}</span>
            {theme === t.key && (
              <span className="mr-auto text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
