'use client'

import { useEffect, useState } from 'react'
import { Flame, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Theme = 'default' | 'etrdream'

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('default')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved && saved !== 'default') {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  const toggle = () => {
    const next = theme === 'default' ? 'etrdream' : 'default'
    setTheme(next)
    if (next === 'default') {
      document.documentElement.removeAttribute('data-theme')
      localStorage.removeItem('theme')
    } else {
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem('theme', next)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={toggle}
      aria-label="تبديل السمة"
      title={theme === 'default' ? 'السمة الأصلية' : 'ETR Dream'}
    >
      {theme === 'default' ? (
        <Flame className="h-5 w-5 text-[#FF6B35]" />
      ) : (
        <Moon className="h-5 w-5 text-[#0d76ff]" />
      )}
    </Button>
  )
}
