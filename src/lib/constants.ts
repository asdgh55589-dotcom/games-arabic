/**
 * Shared constants used across multiple views and components.
 *
 * Centralizing these here prevents drift between the navbar, footer, home page,
 * games list, and platform pages — all of which need to enumerate the same
 * set of platforms.
 */

/** All supported platforms, in the order they should appear in navigation. */
export const PLATFORMS = [
  { key: 'PC', label: 'ARABIC PC', arabicLabel: 'ألعاب الكمبيوتر' },
  { key: 'PS4', label: 'ARABIC PS4', arabicLabel: 'ألعاب البلايستيشن 4' },
  { key: 'PS3', label: 'ARABIC PS3', arabicLabel: 'ألعاب البلايستيشن 3' },
  { key: 'PS2', label: 'ARABIC PS2', arabicLabel: 'ألعاب البلايستيشن 2' },
  { key: 'PS1', label: 'ARABIC PS1', arabicLabel: 'ألعاب البلايستيشن 1' },
] as const

/** Platform keys only — useful for `includes` checks on filter values. */
export const PLATFORM_KEYS = PLATFORMS.map((p) => p.key) as readonly string[]

/** Arabic display label for each platform key. */
export const PLATFORM_ARABIC: Record<string, string> = Object.fromEntries(
  PLATFORMS.map((p) => [p.key, p.arabicLabel])
)

/** English display label for each platform key. */
export const PLATFORM_LABEL: Record<string, string> = Object.fromEntries(
  PLATFORMS.map((p) => [p.key, p.label])
)

/**
 * Map of English game names → Arabic transliterations.
 *
 * Used to localize game names on cards and detail pages without requiring a
 * full localization layer. Add new entries here when seeding new games.
 */
export const GAME_ARABIC_NAMES: Record<string, string> = {
  'Skyrim Special Edition': 'سكايرم النسخة الخاصة',
  'Cyberpunk 2077': 'سايبربانك 2077',
  'The Witcher 3: Wild Hunt': 'ويتشر 3: الصيد البري',
  "Baldur's Gate 3": 'بوابة بالدور 3',
  'Elden Ring': 'إلدن رينغ',
  'Minecraft': 'ماينكرافت',
  'God of War': 'إله الحرب',
  'Horizon Zero Dawn': 'هورايزن زيرو داون',
  "Marvel's Spider-Man": 'الرجل العنكبوت',
  'Bloodborne': 'بلودبورن',
  'The Last of Us': 'ذا لاست أوف أس',
  'Red Dead Redemption': 'ريد ديد ريديمبشن',
  'God of War III': 'إله الحرب 3',
  'Shadow of the Colossus': 'ظل العملاق',
  'God of War II': 'إله الحرب 2',
  'Final Fantasy X': 'فاينل فانتسي 10',
  'Final Fantasy VII': 'فاينل فانتسي 7',
  'Metal Gear Solid': 'ميتال جير سوليد',
  'Castlevania: Symphony of the Night': 'كاسلفانيا: سيمفونية الليل',
}

/** Translate an English game name to Arabic, falling back to the original. */
export function translateGameName(name: string): string {
  return GAME_ARABIC_NAMES[name] || name
}

/** Translation-type filter options used on platform/game/series pages. */
export const TRANSLATION_FILTERS = ['الكل', 'official', 'unofficial'] as const

export const TRANSLATION_LABELS: Record<string, string> = {
  'الكل': 'الكل',
  'official': 'التعريبات الرسمية',
  'unofficial': 'التعريبات غير الرسمية',
}
