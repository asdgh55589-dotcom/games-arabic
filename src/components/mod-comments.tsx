'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ThumbsUp,
  ThumbsDown,
  Reply,
  Flag,
  Edit2,
  MoreVertical,
  Send,
  MessageSquare,
  Pin,
  Heart,
  Loader2,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { formatNumber, timeAgo } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'
import type { ModCommentType } from '@/lib/types'

interface ModCommentsProps {
  modSlug: string
  modOwnerName?: string
}

type SortMode = 'newest' | 'popular' | 'oldest'

/**
 * ModComments — نظام تعليقات قوي وجميل.
 * بقرأ التعليقات من API: GET /api/mods/[slug]/comments
 * بيبعت تعليقات جديدة: POST /api/mods/[slug]/comments
 * like/dislike عبر: POST /api/comments/[id]/like | /dislike
 */
export function ModComments({ modSlug, modOwnerName }: ModCommentsProps) {
  const { toast } = useToast()
  const [comments, setComments] = useState<ModCommentType[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [newComment, setNewComment] = useState('')
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [dislikedIds, setDislikedIds] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // جلب التعليقات
  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/mods/${modSlug}/comments?sort=${sortMode}`)
      if (!res.ok) return
      const data = await res.json()
      setComments(data.comments || [])
      setTotalCount(data.total || 0)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [modSlug, sortMode])

  useEffect(() => {
    setLoading(true)
    fetchComments()
  }, [fetchComments])

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else {
        next.add(id)
        setDislikedIds((d) => {
          const dn = new Set(d)
          dn.delete(id)
          return dn
        })
      }
      return next
    })
    // POST للـ API (fire-and-forget)
    fetch(`/api/comments/${id}/like`, { method: 'POST' }).catch(() => {})
  }

  const toggleDislike = (id: string) => {
    setDislikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else {
        next.add(id)
        setLikedIds((l) => {
          const ln = new Set(l)
          ln.delete(id)
          return ln
        })
      }
      return next
    })
    fetch(`/api/comments/${id}/dislike`, { method: 'POST' }).catch(() => {})
  }

  const onSubmitComment = async () => {
    if (!newComment.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/mods/${modSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newComment.trim(),
          guestName: 'زائر',
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'فشل النشر')
      }
      setNewComment('')
      toast({ title: 'تم نشر التعليق', description: 'تعليقك تم نشره بنجاح' })
      await fetchComments()
    } catch (err) {
      toast({
        title: 'خطأ',
        description: err instanceof Error ? err.message : 'فشل النشر',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const onSubmitReply = async (parentId: string) => {
    if (!replyText.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/mods/${modSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: replyText.trim(),
          parentId,
          guestName: 'زائر',
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'فشل النشر')
      }
      setReplyText('')
      setReplyingTo(null)
      toast({ title: 'تم نشر الرد', description: 'ردك تم نشره بنجاح' })
      await fetchComments()
    } catch (err) {
      toast({
        title: 'خطأ',
        description: err instanceof Error ? err.message : 'فشل النشر',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const onReport = (name: string) => {
    toast({
      title: 'تم إرسال البلاغ',
      description: `سيتم مراجعة بلاغك على تعليق ${name}.`,
    })
  }

  const SORT_OPTIONS: { value: SortMode; label: string }[] = [
    { value: 'newest', label: 'الأحدث' },
    { value: 'popular', label: 'الأكثر إعجاباً' },
    { value: 'oldest', label: 'الأقدم' },
  ]

  return (
    <div>
      {/* رأس القسم */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <MessageSquare className="h-5 w-5 text-primary" />
          التعليقات
          <Badge variant="secondary" className="mr-1">{formatNumber(totalCount)}</Badge>
        </h2>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">ترتيب:</span>
          <div className="flex gap-1 rounded-md border border-border p-0.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortMode(opt.value)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  sortMode === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* صندوق كتابة تعليق جديد */}
      <div className="mb-6 flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback>ز</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليقك هنا..."
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="mt-2 flex justify-end">
            <Button
              onClick={onSubmitComment}
              disabled={!newComment.trim() || submitting}
              size="sm"
            >
              {submitting ? <Loader2 className="ml-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="ml-1.5 h-3.5 w-3.5" />}
              نشر التعليق
            </Button>
          </div>
        </div>
      </div>

      {/* قائمة التعليقات */}
      {loading ? (
        <div className="grid place-items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <div className="grid place-items-center py-12 text-center">
          <MessageSquare className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">لا توجد تعليقات</h3>
          <p className="mt-1 text-sm text-muted-foreground">كن أول من يعلّق على هذا التعريب!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              modOwnerName={modOwnerName}
              liked={likedIds.has(comment.id)}
              disliked={dislikedIds.has(comment.id)}
              onLike={() => toggleLike(comment.id)}
              onDislike={() => toggleDislike(comment.id)}
              onReply={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              onReport={() => onReport(comment.guestName)}
              replyingTo={replyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onSubmitReply={() => onSubmitReply(comment.id)}
              onCancelReply={() => {
                setReplyingTo(null)
                setReplyText('')
              }}
              likedIds={likedIds}
              dislikedIds={dislikedIds}
              toggleLike={toggleLike}
              toggleDislike={toggleDislike}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/** عنصر تعليق واحد — مع ردود متداخلة */
function CommentItem({
  comment,
  modOwnerName,
  liked,
  disliked,
  onLike,
  onDislike,
  onReply,
  onReport,
  replyingTo,
  replyText,
  setReplyText,
  onSubmitReply,
  onCancelReply,
  likedIds,
  dislikedIds,
  toggleLike,
  toggleDislike,
}: {
  comment: ModCommentType
  modOwnerName?: string
  liked: boolean
  disliked: boolean
  onLike: () => void
  onDislike: () => void
  onReply: () => void
  onReport: () => void
  replyingTo: string | null
  replyText: string
  setReplyText: (s: string) => void
  onSubmitReply: () => void
  onCancelReply: () => void
  likedIds: Set<string>
  dislikedIds: Set<string>
  toggleLike: (id: string) => void
  toggleDislike: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className={`flex gap-3 ${comment.isPinned ? 'rounded-lg border border-primary/30 bg-primary/5 p-3' : ''}`}>
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={comment.guestAvatar || undefined} alt={comment.guestName} />
          <AvatarFallback>{comment.guestName[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          {/* رأس التعليق */}
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">{comment.guestName}</span>
            {comment.isPinned && (
              <Badge variant="secondary" className="gap-1 bg-primary/15 text-primary">
                <Pin className="h-3 w-3" />
                مثبّت
              </Badge>
            )}
            {modOwnerName && comment.guestName === modOwnerName && (
              <Badge variant="secondary" className="gap-1 bg-amber-500/15 text-amber-500">
                <Heart className="h-3 w-3" />
                المؤلف
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
            {comment.isEdited && (
              <span className="text-[11px] text-muted-foreground/70">(تم التعديل)</span>
            )}
            <div className="mr-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label="خيارات"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem onClick={onReply}>
                    <Reply className="ml-2 h-4 w-4" />
                    رد
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit2 className="ml-2 h-4 w-4" />
                    تعديل
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onReport}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Flag className="ml-2 h-4 w-4" />
                    إبلاغ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* نص التعليق */}
          <p className="mb-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{comment.text}</p>

          {/* أزرار التفاعل */}
          <div className="flex items-center gap-1">
            <button
              onClick={onLike}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                liked ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              aria-pressed={liked}
            >
              <ThumbsUp className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
              {formatNumber(comment.likes + (liked ? 1 : 0))}
            </button>
            <button
              onClick={onDislike}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                disliked ? 'bg-red-500/15 text-red-500' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              aria-pressed={disliked}
            >
              <ThumbsDown className={`h-3.5 w-3.5 ${disliked ? 'fill-current' : ''}`} />
              {formatNumber(comment.dislikes + (disliked ? 1 : 0))}
            </button>
            <span className="mx-1 h-4 w-px bg-border" />
            <button
              onClick={onReply}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Reply className="h-3.5 w-3.5" />
              رد
            </button>
          </div>

          {/* صندوق الرد */}
          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>ز</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`الرد على ${comment.guestName}...`}
                  rows={2}
                  autoFocus
                  className="w-full resize-none rounded-lg border border-border bg-card p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="mt-1.5 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={onCancelReply}>
                    إلغاء
                  </Button>
                  <Button size="sm" onClick={onSubmitReply} disabled={!replyText.trim()}>
                    <Send className="ml-1.5 h-3.5 w-3.5" />
                    نشر الرد
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* الردود المتداخلة */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mr-10 space-y-4 border-r-2 border-border/50 pr-4">
          {comment.replies.map((reply) => {
            const rLiked = likedIds.has(reply.id)
            const rDisliked = dislikedIds.has(reply.id)
            return (
              <div key={reply.id} className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={reply.guestAvatar || undefined} alt={reply.guestName} />
                  <AvatarFallback>{reply.guestName[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{reply.guestName}</span>
                    {modOwnerName && reply.guestName === modOwnerName && (
                      <Badge variant="secondary" className="gap-1 bg-amber-500/15 text-amber-500">
                        <Heart className="h-3 w-3" />
                        المؤلف
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{timeAgo(reply.createdAt)}</span>
                    {reply.isEdited && (
                      <span className="text-[11px] text-muted-foreground/70">(تم التعديل)</span>
                    )}
                  </div>
                  <p className="mb-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{reply.text}</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleLike(reply.id)}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                        rLiked ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${rLiked ? 'fill-current' : ''}`} />
                      {formatNumber(reply.likes + (rLiked ? 1 : 0))}
                    </button>
                    <button
                      onClick={() => toggleDislike(reply.id)}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                        rDisliked ? 'bg-red-500/15 text-red-500' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <ThumbsDown className={`h-3.5 w-3.5 ${rDisliked ? 'fill-current' : ''}`} />
                      {formatNumber(reply.dislikes + (rDisliked ? 1 : 0))}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
