'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, MessageSquare, Trash2, Pin, PinOff, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatNumber, timeAgo } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'

interface Comment {
  id: string
  text: string
  guestName: string
  likes: number
  dislikes: number
  isPinned: boolean
  createdAt: string
  mod: { id: string; name: string; slug: string }
  user: { id: string; username: string; avatarUrl: string | null } | null
}

export default function AdminCommentsPage() {
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchComments = useCallback(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('page', String(page))
    params.set('limit', '50')
    fetch(`/api/admin/comments?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed')
        return r.json()
      })
      .then((data) => {
        setComments(data.comments)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      })
      .catch(() => setError('فشل تحميل التعليقات'))
      .finally(() => setLoading(false))
  }, [search, page])

  useEffect(() => { fetchComments() }, [page, search])

  const onDelete = async (comment: Comment) => {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return
    try {
      const res = await fetch(`/api/admin/comments/${comment.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل الحذف')
      toast({ title: 'تم الحذف' })
      setComments((p) => p.filter((c) => c.id !== comment.id))
      setTotal((t) => t - 1)
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'فشل', variant: 'destructive' })
    }
  }

  const onTogglePin = async (comment: Comment) => {
    try {
      const res = await fetch(`/api/admin/comments/${comment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !comment.isPinned }),
      })
      if (!res.ok) throw new Error('فشل التحديث')
      toast({ title: comment.isPinned ? 'تم إلغاء التثبيت' : 'تم التثبيت' })
      setComments((p) => p.map((c) => c.id === comment.id ? { ...c, isPinned: !c.isPinned } : c))
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'فشل', variant: 'destructive' })
    }
  }

  if (loading && comments.length === 0) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (error) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">التعليقات</h1>
        <p className="mt-1 text-sm text-muted-foreground">{total} تعليق إجمالي</p>
      </div>

      {/* البحث */}
      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="ابحث في التعليقات..."
          className="h-10 pr-10"
        />
      </div>

      {/* القائمة */}
      {comments.length === 0 ? (
        <div className="grid place-items-center py-20 text-center">
          <MessageSquare className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">لا توجد تعليقات</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className={`rounded-xl border bg-card/40 p-4 ${c.isPinned ? 'border-primary/40' : 'border-border'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{c.guestName}</span>
                    {c.isPinned && <Pin className="h-3 w-3 text-primary" />}
                    <span className="text-xs text-muted-foreground">على {c.mod.name}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground/70">
                    <span>👍 {formatNumber(c.likes)}</span>
                    <span>👎 {formatNumber(c.dislikes)}</span>
                    <span>{timeAgo(c.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onTogglePin(c)} title={c.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}>
                    {c.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-500/10" onClick={() => onDelete(c)} title="حذف">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>السابق</Button>
          <span className="text-sm text-muted-foreground">صفحة {page} من {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>التالي</Button>
        </div>
      )}
    </div>
  )
}
