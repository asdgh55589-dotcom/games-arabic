export function formatNumber(n: number): string {
  // Guard against NaN / Infinity — return a placeholder rather than
  // producing strings like "NaNM" or "InfinityB".
  if (!Number.isFinite(n)) return '—'
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toString()
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// تنسيق التاريخ بالعربية كاملة (يوم شهر سنة) — لعرض "تاريخ النشر" في صف التعريب
export function formatArabicDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// تنسيق "منذ كذا" بالعربي — كانت بترجع إنجليزي (3h ago) وده كان بيتسبب في مشكلة
// قراءة النص العربي لما تتحط جوه جملة RTL (bidi bug). دلوقتي عربي بالكامل.
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return 'الآن'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return arabicUnit(minutes, 'دقيقة', 'دقيقتين', 'دقائق')

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return arabicUnit(hours, 'ساعة', 'ساعتين', 'ساعات')

  const days = Math.floor(hours / 24)
  if (days < 30) return arabicUnit(days, 'يوم', 'يومين', 'أيام')

  const months = Math.floor(days / 30)
  if (months < 12) return arabicUnit(months, 'شهر', 'شهرين', 'أشهر')

  const years = Math.floor(days / 365)
  return arabicUnit(years, 'سنة', 'سنتين', 'سنوات')
}

// صياغة عربية بسيطة: منذ دقيقة / منذ دقيقتين / منذ 5 دقائق
function arabicUnit(n: number, singular: string, dual: string, plural: string): string {
  if (n === 1) return `منذ ${singular}`
  if (n === 2) return `منذ ${dual}`
  return `منذ ${n} ${plural}`
}

export function parseGalleryUrls(s: string | null | undefined): string[] {
  if (!s) return []
  return s.split(',').filter(Boolean)
}

export function parseTags(s: string | null | undefined): string[] {
  if (!s) return []
  return s.split(',').map((t) => t.trim()).filter(Boolean)
}
