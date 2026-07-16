'use client'

import Link from 'next/link'
import { ThumbsUp, Download, Eye, Clock, Upload, FileArchive, MoreVertical, Users, Bookmark, Flag } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatNumber, timeAgo, formatDate } from '@/lib/format'
import type { ModSummary } from '@/lib/types'

export type ModCardData = ModSummary

/**
 * variant — يحدد البيانات الإضافية المعروضة في الشريط السفلي للبطاقة.
 * - `default`: التأييدات + التحميلات + المشاهدات (السلوك الافتراضي)
 * - `latest`: شارة جديد/محدّث + التقييمات + التحميلات
 * - `trending`: التحميلات + المشاهدات
 * - `topEndorsed`: التأييدات بس
 */
export type ModCardVariant = 'default' | 'latest' | 'trending' | 'topEndorsed'

// 30 ساعة بالميلي ثانية — الشارة تختفي بعد هذا الوقت
const THIRTY_HOURS_MS = 30 * 60 * 60 * 1000

// ترجمة أسماء الألعاب للعربية
const GAME_ARABIC_NAMES: Record<string, string> = {
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
  // ===== NS =====
  'The Legend of Zelda: Breath of the Wild': 'أسطورة زيلدا: نفحة البرية',
  'The Legend of Zelda: Tears of the Kingdom': 'أسطورة زيلدا: دموع المملكة',
  'Super Mario Odyssey': 'سوبر ماريو أوديسي',
  'Mario Kart 8 Deluxe': 'ماريو كارت 8 ديلوكس',
  'Animal Crossing: New Horizons': 'أنيمال كروسينغ: آفاق جديدة',
  'Super Smash Bros. Ultimate': 'سوبر سماش بروس ألتيميت',
  'Pokémon Scarlet': 'بوكيمون سكارليت',
  'Xenoblade Chronicles 3': 'زينوبليد كرونيكلز 3',
  'Fire Emblem: Three Houses': 'فاير إمبلم: ثلاث بيوت',
}

// ترجمة أسماء الأقسام للعربية
const CATEGORY_ARABIC_NAMES: Record<string, string> = {
  'Armor': 'دروع',
  'Weapons': 'أسلحة',
  'Quests': 'مهام',
  'Characters': 'شخصيات',
  'Gameplay': 'أسلوب اللعب',
  'Graphics': 'رسومات',
  'Magic': 'سحر',
  'Locations': 'أماكن',
  'Vehicles': 'مركبات',
  'UI': 'واجهة المستخدم',
  'Environment': 'البيئة',
  'Cyberware': 'سايبروير',
  'Clothing': 'ملابس',
  'Classes': 'فئات',
  'Items': 'عناصر',
  'Cosmetics': 'تجميليات',
  'Bosses': 'زعماء',
  'Mods': 'تعديلات',
  'Texture Packs': 'حزم أكساء',
  'Maps': 'خرائط',
  'Skins': 'أشكال',
  'Shaders': 'شيدر',
  'Modpacks': 'حزم تعديلات',
  'Saves': 'حفظ',
  'Costumes': 'أزياء',
  // ===== فئات إضافية للألعاب الجديدة =====
  'Simulation': 'محاكاة',
  'Adventure': 'مغامرات',
  'Fighting': 'قتال',
  'Racing': 'سباقات',
}

function translateGameName(name: string): string {
  return GAME_ARABIC_NAMES[name] || name
}

function translateCategoryName(name: string): string {
  return CATEGORY_ARABIC_NAMES[name] || name
}

export function ModCard({ mod, compact = false, variant = 'default' }: { mod: ModCardData; compact?: boolean; variant?: ModCardVariant }) {
  const href = `/?view=mod&slug=${mod.slug}`

  // تحديد نوع الشارة
  const now = Date.now()
  const createdAt = new Date(mod.createdAt).getTime()
  const updatedAt = new Date(mod.updatedAt).getTime()
  const ageSinceCreated = now - createdAt
  const ageSinceUpdated = now - updatedAt

  let statusBadge: { text: string; color: string } | null = null
  if (ageSinceCreated < THIRTY_HOURS_MS) {
    statusBadge = { text: 'جديد', color: 'bg-green-600 text-white' }
  } else if (ageSinceUpdated < THIRTY_HOURS_MS && ageSinceUpdated !== ageSinceCreated) {
    statusBadge = { text: `محدّث ${timeAgo(mod.updatedAt)}`, color: 'bg-blue-600 text-white' }
  }

  // شارة المنصة من بيانات اللعبة
  const platform = mod.game?.platform || ''

  return (
    <Card className="mod-card group relative flex min-h-[380px] flex-col gap-0 overflow-hidden border-border bg-card p-0 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5" dir="rtl">
      {/* صورة landscape */}
      <div className="relative">
        <Link href={href} className="block">
          <div className="relative z-0 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-t bg-secondary">
            <img
              src={mod.thumbnailUrl}
              alt={mod.name}
              loading="lazy"
              className="mod-card-image absolute z-2 max-h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
        {/* الشارات — يمين الصورة: شارة المنصة + شارة جديد/محدّث بجوارها */}
        <div className="absolute right-2 top-2 z-10 flex gap-1.5">
          {platform && (
            <Badge variant="outline" className="border-border bg-background/80 backdrop-blur shadow-md">
              {platform}
            </Badge>
          )}
          {statusBadge && (
            <Badge className={`${statusBadge.color} shadow-md`}>
              {statusBadge.text}
            </Badge>
          )}
        </div>
        {/* زر الخيارات — يسار الصورة (dropdown فيه حفظ في المفضلة + إبلاغ عن مشكلة) */}
        <div className="absolute left-1.5 top-1.5 z-20 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="grid h-7 w-7 place-items-center rounded-full bg-background/60 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
                aria-label="خيارات التعريب"
                onClick={(e) => e.preventDefault()}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  console.log('حفظ في المفضلة:', mod.slug)
                }}
              >
                <Bookmark className="ml-2 h-4 w-4" />
                حفظ في المفضلة
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  console.log('إبلاغ عن مشكلة:', mod.slug)
                }}
              >
                <Flag className="ml-2 h-4 w-4" />
                إبلاغ عن مشكلة
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* قسم المحتوى — العنوان فوق المؤلف */}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        {/* العنوان — فوق المؤلف */}
        <Link
          href={href}
          className="line-clamp-2 text-sm font-semibold leading-tight transition-colors hover:text-primary"
        >
          {mod.name}
        </Link>

        {/* المؤلف — تحت العنوان */}
        {mod.author && (
          <Link
            href={`/?view=profile&user=${mod.author.username}`}
            className="mt-2 flex items-center gap-1.5 border-b border-border pb-2.5 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            {mod.author.avatarUrl && (
              <img
                src={mod.author.avatarUrl}
                alt=""
                className="h-4 w-4 shrink-0 rounded-full object-cover"
                loading="lazy"
              />
            )}
            <span className="truncate">{mod.author.username}</span>
          </Link>
        )}

        {/* البيانات تحت المؤلف — بمساحة أوسع بين العناصر */}
        <div className="flex flex-col gap-y-2 border-b border-border py-2.5 text-xs text-muted-foreground">
          {/* تاريخ النشر */}
          <div className="flex items-center gap-x-1">
            <Upload className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span>تاريخ النشر: {formatDate(mod.releaseDate)}</span>
          </div>
          {/* آخر تحديث — يتعرض بس لو التعريب اتحدث فعلاً (updatedAt ≠ createdAt) */}
          {new Date(mod.updatedAt).getTime() !== new Date(mod.createdAt).getTime() && (
            <div className="flex items-center gap-x-1">
              <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>آخر تحديث: {timeAgo(mod.updatedAt)}</span>
            </div>
          )}
          {/* الفريق التعريب */}
          {mod.translationTeam && (
            <div className="flex items-center gap-x-1">
              <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>الفريق التعريب: {mod.translationTeam}</span>
            </div>
          )}
          {/* الحجم */}
          <div className="flex items-center gap-x-1">
            <FileArchive className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span>الحجم: {mod.fileSize} .{mod.fileFormat}</span>
          </div>
        </div>

        {/* الوصف */}
        {!compact && (
          <p className="line-clamp-4 break-words pt-2 text-xs text-muted-foreground">
            {mod.summary}
          </p>
        )}
      </div>

      {/* الشريط السفلي — الإحصائيات (تختلف حسب variant).
          كل الأيقونات برتقالي (text-primary) للتوحيد في كل الموقع. */}
      <div className="mt-auto flex min-h-9 items-center justify-center gap-x-4 rounded-b bg-secondary/50 px-3">
        {variant === 'latest' && (
          <>
            {/* شارة جديد/محدّث + التأييدات (لايك) + التحميلات */}
            {statusBadge && (
              <span className={`flex items-center gap-x-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${statusBadge.color}`} title="الحالة">
                {statusBadge.text}
              </span>
            )}
            <span className="flex items-center gap-x-1 text-xs text-muted-foreground" title="التأييدات">
              <ThumbsUp className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="sr-only">التأييدات </span>
              <span>{formatNumber(mod.endorsements)}</span>
            </span>
            <span className="flex items-center gap-x-1 text-xs text-muted-foreground" title="التحميلات">
              <Download className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="sr-only">التحميلات </span>
              <span>{formatNumber(mod.downloads)}</span>
            </span>
          </>
        )}
        {variant === 'trending' && (
          <>
            {/* التحميلات + المشاهدات */}
            <span className="flex items-center gap-x-1 text-xs text-muted-foreground" title="التحميلات">
              <Download className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="sr-only">التحميلات </span>
              <span>{formatNumber(mod.downloads)}</span>
            </span>
            <span className="flex items-center gap-x-1 text-xs text-muted-foreground" title="المشاهدات">
              <Eye className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="sr-only">المشاهدات </span>
              <span>{formatNumber(mod.views)}</span>
            </span>
          </>
        )}
        {variant === 'topEndorsed' && (
          <>
            {/* التأييدات بس */}
            <span className="flex items-center gap-x-1 text-xs text-muted-foreground" title="التأييدات">
              <ThumbsUp className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="sr-only">التأييدات </span>
              <span>{formatNumber(mod.endorsements)}</span>
            </span>
          </>
        )}
        {variant === 'default' && (
          <>
            {/* التأييدات + التحميلات + المشاهدات */}
            <span className="flex items-center gap-x-1 text-xs text-muted-foreground" title="التأييدات">
              <ThumbsUp className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="sr-only">التأييدات </span>
              <span>{formatNumber(mod.endorsements)}</span>
            </span>
            <span className="flex items-center gap-x-1 text-xs text-muted-foreground" title="التحميلات">
              <Download className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="sr-only">التحميلات </span>
              <span>{formatNumber(mod.downloads)}</span>
            </span>
            <span className="flex items-center gap-x-1 text-xs text-muted-foreground" title="المشاهدات">
              <Eye className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="sr-only">المشاهدات </span>
              <span>{formatNumber(mod.views)}</span>
            </span>
          </>
        )}
      </div>
    </Card>
  )
}

export function ModCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card p-0">
      <div className="aspect-video animate-pulse bg-secondary" />
      <div className="space-y-2 px-3 pb-3 pt-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-secondary pt-1" />
        <div className="space-y-1 pt-1">
          <div className="h-3 w-1/3 animate-pulse rounded bg-secondary" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-secondary" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-secondary" />
        </div>
        <div className="h-8 w-full animate-pulse rounded bg-secondary pt-1" />
      </div>
      <div className="h-9 animate-pulse rounded-b bg-secondary" />
    </Card>
  )
}
