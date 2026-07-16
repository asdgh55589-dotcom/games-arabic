'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Package,
  Loader2,
  Edit2,
  Trash2,
  Eye,
  Star,
  Flame,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatNumber, formatArabicDate, timeAgo } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'

interface ModListItem {
  id: string
  slug: string
  name: string
  summary: string
  version: string
  downloads: number
  endorsements: number
  views: number
  isFeatured: boolean
  isTrending: boolean
  isLatest: boolean
  createdAt: string
  updatedAt: string
  author: { id: string; username: string; avatarUrl: string | null }
  game: { id: string; name: string; slug: string; platform: string }
  category: { id: string; name: string; slug: string } | null
  _count: { files: number; commentsRecords: number; teamMembers: number }
}

const PLATFORMS = ['all', 'PC', 'NS', 'PS4', 'PS3', 'PS2', 'PS1'] as const
const SORTS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'oldest', label: 'الأقدم' },
  { value: 'downloads', label: 'الأكثر تحميلاً' },
  { value: 'endorsements', label: 'الأكثر تأييداً' },
  { value: 'views', label: 'الأكثر مشاهدة' },
  { value: 'name', label: 'الاسم' },
] as const

export default function AdminModsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mods, setMods] = useState<ModListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState<string>('all')
  const [sort, setSort] = useState<string>('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const url = useMemo(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('sort', sort)
    params.set('page', String(page))
    params.set('limit', '24')
    if (platform !== 'all') params.set('platform', platform)
    return `/api/admin/mods?${params.toString()}`
  }, [search, sort, page, platform])

  useEffect(() => {
    setLoading(true)
    fetch(url)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setMods(data.mods)
          setTotalPages(data.totalPages)
          setTotal(data.total)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [url])

  const onDelete = async (mod: ModListItem) => {
    if (!confirm(`هل أنت متأكد من حذف التعريب "${mod.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) return

    try {
      const res = await fetch(`/api/admin/mods/${mod.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'فشل الحذف')
      }
      toast({ title: 'تم الحذف', description: `تم حذف "${mod.name}" بنجاح` })
      setMods((prev) => prev.filter((m) => m.id !== mod.id))
      setTotal((t) => t - 1)
    } catch (err) {
      toast({
        title: 'خطأ',
        description: err instanceof Error ? err.message : 'فشل الحذف',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">التعريبات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} تعريب إجمالي
          </p>
        </div>
        <Button onClick={() => router.push('/admin/mods/new')}>
          <Plus className="ml-2 h-4 w-4" />
          نشر تعريب جديد
        </Button>
      </div>

      {/* الفلاتر */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="ابحث عن تعريب بالاسم أو الوسوم أو السلسلة…"
            className="h-10 pr-10"
          />
        </div>

        <select
          value={platform}
          onChange={(e) => { setPlatform(e.target.value); setPage(1) }}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p === 'all' ? 'كل المنصات' : `ARABIC ${p}`}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1) }}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* القائمة */}
      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : mods.length === 0 ? (
        <div className="grid place-items-center py-20 text-center">
          <Package className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">لا توجد تعريبات</h3>
          <p className="mt-1 text-sm text-muted-foreground">جرّب تغيير الفلاتر أو أنشئ تعريباً جديداً</p>
        </div>
      ) : (
        <>
          {/* جدول التعريبات */}
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-right">
              <thead className="border-b border-border bg-card/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">التعريب</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">اللعبة</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">التحميلات</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">التأييدات</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">تاريخ النشر</th>
                  <th className="px-4 py-3 font-semibold">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mods.map((mod) => (
                  <tr key={mod.id} className="text-sm transition-colors hover:bg-accent/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mod.author.avatarUrl || ''}
                          alt=""
                          className="hidden h-8 w-8 rounded object-cover sm:block"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="truncate font-medium">{mod.name}</span>
                            {mod.isFeatured && <Star className="h-3 w-3 shrink-0 text-amber-500" />}
                            {mod.isTrending && <Flame className="h-3 w-3 shrink-0 text-primary" />}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            v{mod.version} · {mod.author.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="text-xs">
                        <div className="font-medium">{mod.game.name}</div>
                        <Badge variant="outline" className="mt-1 text-[10px]">{mod.game.platform}</Badge>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs sm:table-cell">{formatNumber(mod.downloads)}</td>
                    <td className="hidden px-4 py-3 text-xs lg:table-cell">{formatNumber(mod.endorsements)}</td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                      {timeAgo(mod.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                          <Link href={`/admin/mods/${mod.id}/edit`} title="تعديل">
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                          <a
                            href={`/?view=mod&slug=${mod.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="عرض"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => onDelete(mod)}
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                السابق
              </Button>
              <span className="text-sm text-muted-foreground">
                صفحة {page} من {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                التالي
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
