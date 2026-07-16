'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ThumbsUp,
  Calendar,
  FileArchive,
  Tag,
  FileText,
  Youtube,
  Twitter,
  MessageCircle,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useFetch } from '@/hooks/use-fetch'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { ModCard, ModCardSkeleton } from '@/components/mod-card'
import { ModStatsBadges } from '@/components/mod-stats'
import { translateGameName, translateType } from '@/lib/arabic-names'
import { formatNumber, formatDate, formatArabicDate, timeAgo, parseGalleryUrls, parseTags } from '@/lib/format'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { apiFetch } from '@/lib/api-client'
import type { ModDetail, PaginatedMods, EndorseResponse } from '@/lib/types'

export function ModDetailPage() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug') || ''
  const [tab, setTab] = useState('description')
  const [endorsed, setEndorsed] = useState(false)
  const [endorsementCount, setEndorsementCount] = useState<number | null>(null)
  const [downloadCount, setDownloadCount] = useState<number | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const { toast } = useToast()
  const downloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const galleryScrollRef = useRef<HTMLDivElement>(null)

  const { data, loading, refetch } = useFetch<{ mod: ModDetail }>(slug ? `/api/mods/${slug}` : null, [slug])

  const [lastSlug, setLastSlug] = useState(slug)
  if (slug !== lastSlug) {
    setLastSlug(slug)
    setActiveImage(0)
    setEndorsed(false)
    setEndorsementCount(null)
    setDownloadCount(null)
  }

  useEffect(() => {
    return () => {
      if (downloadTimeoutRef.current) {
        clearTimeout(downloadTimeoutRef.current)
        downloadTimeoutRef.current = null
      }
    }
  }, [])

  const mod = data?.mod
  useDocumentTitle(mod?.name ?? null)

  const relatedUrl = useMemo(() => {
    if (!mod?.game?.slug) return null
    return `/api/games/${mod.game.slug}/mods?sort=downloads&limit=6`
  }, [mod?.game?.slug])
  const { data: relatedData, loading: relatedLoading } = useFetch<PaginatedMods>(relatedUrl, [relatedUrl])

  if (!loading && !mod) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">التعريب غير موجود</h1>
        <Button asChild className="mt-4">
          <Link href="/?view=mods">العودة للتعديلات</Link>
        </Button>
      </div>
    )
  }

  const gallery = mod ? parseGalleryUrls(mod.galleryUrls) : []
  const tags = mod ? parseTags(mod.tags) : []
  const safeActiveImage = Math.min(activeImage, Math.max(0, gallery.length - 1))
  // Banner = first gallery image (the header image in nexusmods)
  const bannerImage = gallery[0] || mod?.imageUrl || ''

  const shownEndorsements = endorsementCount ?? mod?.endorsements ?? 0
  const shownDownloads = downloadCount ?? mod?.downloads ?? 0
  const shownViews = mod?.views ?? 0

  const onEndorse = async () => {
    if (!mod) return
    try {
      const result = await apiFetch<EndorseResponse>(
        `/api/mods/${mod.slug}/endorse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'demo-user-id' }),
        }
      )
      setEndorsed(result.endorsed)
      setEndorsementCount(result.endorsements)
      toast({
        title: result.endorsed ? 'Endorsed!' : 'Endorsement removed',
        description: result.endorsed
          ? 'Thanks for supporting this mod author.'
          : 'Your endorsement has been removed.',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not update endorsement'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    }
  }

  const onDownload = async () => {
    if (!mod || downloading) return
    setDownloading(true)
    try {
      const result = await apiFetch<{ downloads: number }>(
        `/api/mods/${mod.slug}/download`,
        { method: 'POST' }
      )
      setDownloadCount(result.downloads)
      toast({
        title: 'Download started',
        description: `${mod.name} v${mod.version} (${mod.fileSize})`,
      })
      if (downloadTimeoutRef.current) clearTimeout(downloadTimeoutRef.current)
      downloadTimeoutRef.current = setTimeout(() => {
        setDownloading(false)
        toast({
          title: 'Download complete',
          description: `${formatNumber(result.downloads)} total downloads`,
        })
        downloadTimeoutRef.current = null
      }, 2000)
    } catch (err) {
      setDownloading(false)
      const message = err instanceof Error ? err.message : 'Download failed'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    }
  }

  const scrollGallery = (dir: 'prev' | 'next') => {
    if (!galleryScrollRef.current) return
    const scrollAmount = 300
    galleryScrollRef.current.scrollBy({
      left: dir === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <div>
      {loading ? (
        <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-6">
          <div className="aspect-[21/9] animate-pulse rounded-lg bg-muted" />
          <div className="mt-6 h-24 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-10 animate-pulse rounded bg-muted" />
        </div>
      ) : mod ? (
        <>
          {/* ===== HEADER: banner background + breadcrumb + title + stats ===== */}
          {/* البنر الخلفي طويل — يحتوي شريط التنقل + العنوان + شريط الإحصائيات.
              البنر كبير بحدود واضحة (border-bottom) عشان يتحدد بصرياً.
              المحتوى الرئيسي (الصورة + البطاقة) يبدأ بعد البنر مباشرة. */}
          <div className="relative overflow-hidden" dir="rtl" style={{ minHeight: '560px' }}>
            {/* الصورة الخلفية */}
            <div className="absolute inset-0">
              <img
                src={mod.imageUrl}
                alt=""
                className="h-full w-full object-cover"
                fetchPriority="high"
              />
              {/* gradient داكن لأسفل + overlays جانبية لضمان قراءة النص */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/50" />
              <div className="absolute inset-0 bg-background/30" />
            </div>

            {/* المحتوى فوق البنر — محاذاة للأسفل مع padding سفلي متوسط
                عشان الإحصائيات تكون قريبة من الحد السفلي للبنر و بالتالي قريبة من الصورة. */}
            <div className="relative mx-auto flex min-h-[560px] max-w-[1200px] flex-col justify-end px-4 pb-10 pt-14 lg:px-6 lg:pb-12 lg:pt-16">
              {/* Breadcrumb — يبدأ من اليمين في RTL: التعديلات / اللعبة / القسم / اسم التعريب */}
              <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-foreground/70" aria-label="مسار التنقل">
                <Link href="/?view=mods" className="transition-colors hover:text-foreground">
                  التعديلات
                </Link>
                <span className="text-foreground/40">/</span>
                <Link href={`/?view=game&slug=${mod.game.slug}`} className="transition-colors hover:text-foreground">
                  {mod.game.name}
                </Link>
                {mod.category && (
                  <>
                    <span className="text-foreground/40">/</span>
                    <Link href={`/?view=game&slug=${mod.game.slug}&cat=${mod.category.slug}`} className="transition-colors hover:text-foreground">
                      {mod.category.name}
                    </Link>
                  </>
                )}
                <span className="text-foreground/40">/</span>
                <span className="truncate font-medium text-foreground">{mod.name}</span>
              </nav>

              {/* العنوان — اسم التعريب فقط، بدون لمحة/ملخص */}
              <h1 className="text-4xl font-bold tracking-tight text-foreground drop-shadow-2xl sm:text-5xl lg:text-6xl">
                {mod.name}
              </h1>

              {/* شريط الإحصائيات — نفس النظام الموحّد المستخدم في ModCard (ModStatsBadges)
                  عشان الأرقام تتطابق 100% مع البطاقة في باقي الموقع، بالإضافة لمعلومات
                  الإصدار والتاريخ والسلسلة كشارات تكميلية (مش أرقام إحصائية). */}
              <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2">
                <ModStatsBadges mod={{ endorsements: shownEndorsements, downloads: shownDownloads, views: shownViews }} />
                <span className="text-foreground/30">•</span>
                <StatBadge
                  icon={<FileText className="h-3.5 w-3.5" />}
                  value={mod.version}
                  label="الإصدار"
                />
                <span className="text-foreground/30">•</span>
                <StatBadge
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  value={formatArabicDate(mod.releaseDate)}
                  label="تاريخ النشر"
                />
                {mod.series && (
                  <>
                    <span className="text-foreground/30">•</span>
                    <Link
                      href={`/?view=series-detail&series=${encodeURIComponent(mod.series)}`}
                      className="flex items-center gap-1.5 rounded-md border border-white/10 bg-background/40 px-2 py-1 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-primary/10"
                    >
                      <span className="text-primary">
                        <Tag className="h-3.5 w-3.5" />
                      </span>
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-foreground">{mod.series}</span>
                        <span className="text-[10px] text-muted-foreground">السلسلة</span>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* المحتوى الرئيسي — نرفعه فوق بقيمة سالبة margin-top
              عشان الصورة تقرّب من الإحصائيات و تبان متصلة بالبنر. */}
          <div className="relative z-10 mx-auto max-w-[1200px] px-4 lg:px-6" dir="rtl" style={{ marginTop: '-32px' }}>
            {/* ===== صورة كبيرة + بطاقة بيانات بجوارها ===== */}
            {/* الصورة الرئيسية = صورة واحدة فقط (mod.imageUrl) بدون معرض أو أسهم */}
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
              {/* الصورة الكبيرة — على اليمين في RTL، صورة واحدة فقط
                  + بطاقة الناشر الطولية تحتها مباشرة (نقطة 6) */}
              <div className="flex flex-col gap-4 sm:w-[65%]">
                <div className="relative shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                  <img
                    src={mod.imageUrl}
                    alt={mod.name}
                    className="aspect-video h-full w-full object-cover"
                  />
                  {/* شارات على الصورة */}
                  <div className="absolute right-3 top-3 flex gap-2">
                    {mod.game?.platform && (
                      <Badge variant="outline" className="border-border bg-background/80 backdrop-blur shadow-md">
                        {mod.game.platform}
                      </Badge>
                    )}
                  </div>
                </div>

                <PublisherCard author={mod.author} />
              </div>

              {/* بطاقة "معلومات التعريب" — على اليسار في RTL */}
              <div className="flex flex-1 flex-col rounded-lg border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-bold">معلومات التعريب</h2>
                <div className="space-y-4 text-sm">
                  <DataRow label="اللعبة" value={mod.game.name} />
                  <DataRow label="العنوان بالعربي" value={translateGameName(mod.game.name)} />
                  <DataRow label="المنصّة" value={mod.game.platform} />
                  <DataRow label="سلسلة" value={mod.series || '—'} />
                  <DataRow label="تاريخ الإصدار/التعريب" value={formatDate(mod.releaseDate)} />
                  <DataRow label="نوع التعريب" value={translateType(mod.translationType)} />
                  <DataRow label="إصدار التعريب" value={`v${mod.version}`} />
                  <DataRow label="التوافق" value={mod.compatibility || '—'} />
                  <DataRow label="فريق التعريب" value={mod.translationTeam || mod.author.username} />
                </div>
              </div>
            </div>

            {/* ===== الوسوم ===== */}
            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">الوسوم:</span>
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    <Tag className="h-3 w-3" /> {t}
                  </Badge>
                ))}
              </div>
            )}

            {/* ===== الأقسام (Tabs) ===== */}
            <div className="mt-6">
              <div className="min-w-0">
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="description">الوصف</TabsTrigger>
                    <TabsTrigger value="files">
                      تحميل <span className="ml-1 text-xs text-muted-foreground">1</span>
                    </TabsTrigger>
                    <TabsTrigger value="images">
                      معرض الصور <span className="ml-1 text-xs text-muted-foreground">({gallery.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="changelog">سجل التغييرات</TabsTrigger>
                    <TabsTrigger value="comments">
                      تعليقات <span className="ml-1 text-xs text-muted-foreground">({formatNumber(mod.comments)})</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Description tab */}
                  <TabsContent value="description" className="mt-4">
                    <Card className="p-6">
                      <h2 className="mb-4 text-xl font-bold">عن هذا التعريب</h2>
                      <p className="mb-4 text-muted-foreground">{mod.summary}</p>
                      <Separator className="my-4" />
                      <MarkdownRenderer content={mod.description} />
                    </Card>
                  </TabsContent>

                  {/* Files tab */}
                  <TabsContent value="files" className="mt-4">
                    <Card className="p-6">
                      <h2 className="mb-4 text-xl font-bold">الملفات</h2>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                              <FileArchive className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {mod.name.replace(/[^a-z0-9]+/gi, '_')}_v{mod.version}.{mod.fileFormat}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                الإصدار {mod.version} · {mod.fileSize} · .{mod.fileFormat}
                              </div>
                            </div>
                          </div>
                          <Button onClick={onDownload} disabled={downloading}>
                            {downloading ? 'جارٍ التحميل…' : 'تحميل يدوي'}
                          </Button>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                        <DataRow label="صيغة الملف" value={`.${mod.fileFormat}`} />
                        <DataRow label="حجم الملف" value={mod.fileSize} />
                        <DataRow label="تاريخ الإصدار" value={formatDate(mod.releaseDate)} />
                        <DataRow label="آخر تحديث" value={timeAgo(mod.updatedAt)} />
                      </div>
                    </Card>
                  </TabsContent>

                  {/* Images tab — shows the active image large + all thumbnails */}
                  <TabsContent value="images" className="mt-4">
                    <Card className="overflow-hidden p-0">
                      <div className="relative aspect-video bg-muted">
                        <img
                          src={gallery[safeActiveImage] || mod.imageUrl}
                          alt={`${mod.name} screenshot ${safeActiveImage + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                          {gallery.map((g, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveImage(i)}
                              className={`relative aspect-video overflow-hidden rounded border-2 transition-colors ${
                                i === safeActiveImage ? 'border-primary' : 'border-border hover:border-primary/40'
                              }`}
                            >
                              <img src={g} alt="" className="h-full w-full object-cover" loading="lazy" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  {/* Changelog tab */}
                  <TabsContent value="changelog" className="mt-4">
                    <Card className="p-6">
                      <h2 className="mb-4 text-xl font-bold">الإصدار {mod.version}</h2>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2"><span className="text-primary">•</span> Initial public release</li>
                        <li className="flex gap-2"><span className="text-primary">•</span> Compatibility patches for popular overhaul mods</li>
                        <li className="flex gap-2"><span className="text-primary">•</span> Performance optimizations for low-end systems</li>
                        <li className="flex gap-2"><span className="text-primary">•</span> Bug fixes for edge cases reported by the community</li>
                      </ul>
                    </Card>
                  </TabsContent>

                  {/* Comments tab */}
                  <TabsContent value="comments" className="mt-4">
                    <Card className="p-6">
                      <h2 className="mb-4 text-xl font-bold">تعليقات المجتمع</h2>
                      <CommentList />
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Related mods */}
                <div className="mt-8">
                  <h2 className="mb-4 text-xl font-bold">المزيد من {mod.game.name}</h2>
                  {relatedLoading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, i) => <ModCardSkeleton key={i} />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {relatedData?.mods
                        ?.filter((m) => m.id !== mod.id)
                        .slice(0, 4)
                        .map((m) => <ModCard key={m.id} mod={m} />)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

/** صف بيانات: تسمة على اليمين + قيمة على اليسار (RTL) */
function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

/** عنصر إحصائية في صف الإحصائيات تحت العنوان: أيقونة + قيمة كبيرة + تسمية صغيرة */
function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <div className="flex flex-col">
        <span className="text-base font-bold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

/** بطاقة إحصائية احترافية فوق البنر — خلفية شفافة بـ backdrop blur،
 *  حدود رفيعة، أيقونة ملونة + قيمة كبيرة + تسمية صغيرة.
 *  تصميم مدمج (compact) عشان البطاقات تبان قريبة من بعض و ما تأخذش مساحة كبيرة. */
function StatBadge({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-background/40 px-2 py-1 backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-background/60">
      <span className="text-primary">{icon}</span>
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-bold text-foreground">{value}</span>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

/** بطاقة الناشر — تصميم عريض (أفقي): صورة على اليمين، الاسم والنبذة في النص،
 *  وزرار "تصفح الملف الشخصي" + أيقونات التواصل الاجتماعي على اليسار. */
function PublisherCard({ author }: { author: ModDetail['author'] }) {
  const socialLinks = [
    author.youtubeUrl && { href: author.youtubeUrl, label: 'يوتيوب', icon: Youtube, color: 'text-red-500' },
    author.twitterUrl && { href: author.twitterUrl, label: 'تويتر/X', icon: Twitter, color: 'text-sky-400' },
    author.discordUrl && { href: author.discordUrl, label: 'ديسكورد', icon: MessageCircle, color: 'text-indigo-400' },
  ].filter(Boolean) as { href: string; label: string; icon: typeof Youtube; color: string }[]

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row" dir="rtl">
      <Avatar className="h-16 w-16 shrink-0 ring-2 ring-primary/30">
        <AvatarImage src={author.avatarUrl || undefined} alt={author.username} />
        <AvatarFallback>
          <UserRound className="h-7 w-7 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 text-center sm:text-right">
        <p className="text-xs text-muted-foreground">نشره</p>
        <h3 className="truncate text-base font-bold text-foreground">{author.username}</h3>
        {author.bio && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{author.bio}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {socialLinks.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            title={s.label}
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-secondary/40 transition-colors hover:border-primary/40 hover:bg-secondary"
          >
            <s.icon className={`h-4 w-4 ${s.color}`} />
          </a>
        ))}
        <Button asChild size="sm" variant="outline">
          <Link href={`/?view=profile&user=${author.username}`}>
            <UserRound className="h-3.5 w-3.5" />
            الملف الشخصي
          </Link>
        </Button>
      </div>
    </div>
  )
}

/** صندوق إحصائية: أيقونة + قيمة + تسمية */
function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2">
      <span className="text-primary">{icon}</span>
      <div>
        <div className="text-sm font-bold text-foreground">{value}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

const SAMPLE_COMMENTS = [
  {
    user: 'ModFan2024',
    avatar: 'https://i.pravatar.cc/100?img=1',
    time: '2 days ago',
    text: 'This mod completely transformed my playthrough. The attention to detail is incredible and it integrates seamlessly with my other mods. Highly recommended for anyone looking to enhance their experience.',
    likes: 47,
  },
  {
    user: 'QuietRanger',
    avatar: 'https://i.pravatar.cc/100?img=2',
    time: '5 days ago',
    text: 'Works perfectly with the latest patch. Performance is smooth even on my older system. Thank you for keeping this maintained!',
    likes: 23,
  },
  {
    user: 'Nightblade',
    avatar: 'https://i.pravatar.cc/100?img=3',
    time: '1 week ago',
    text: 'The visual overhaul alone is worth the install. Took me a few minutes to set up with Vortex, no issues at all.',
    likes: 12,
  },
] as const

function CommentList() {
  const { toast } = useToast()
  const [liked, setLiked] = useState<Set<number>>(new Set())

  const toggleLike = (i: number) => {
    setLiked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const onReply = (user: string) => {
    toast({
      title: 'Replies coming soon',
      description: `Replying to ${user} is not yet implemented in the demo.`,
    })
  }

  return (
    <div className="space-y-4">
      {SAMPLE_COMMENTS.map((c, i) => {
        const isLiked = liked.has(i)
        const displayLikes = c.likes + (isLiked ? 1 : 0)
        return (
          <div key={i} className="flex gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={c.avatar} alt={c.user} />
              <AvatarFallback>{c.user[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-medium">{c.user}</span>
                <span className="text-xs text-muted-foreground">{c.time}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                <button
                  onClick={() => toggleLike(i)}
                  className={`inline-flex items-center gap-1 transition-colors hover:text-primary ${
                    isLiked ? 'text-primary' : ''
                  }`}
                  aria-pressed={isLiked}
                  aria-label={`${isLiked ? 'Unlike' : 'Like'} comment by ${c.user}`}
                >
                  <ThumbsUp className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} /> {displayLikes}
                </button>
                <button
                  onClick={() => onReply(c.user)}
                  className="hover:text-primary"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
