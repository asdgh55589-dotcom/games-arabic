'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ThumbsUp, Eye, Heart, MapPin, Clock, Calendar, Star, Mail, CreditCard, Package, BookOpen, Image as ImageIcon, Crown, Shield, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ModCard, ModCardSkeleton } from '@/components/mod-card'
import { useFetch } from '@/hooks/use-fetch'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useToast } from '@/hooks/use-toast'
import { formatNumber, formatArabicDate } from '@/lib/format'
import type { AuthorModsResponse } from '@/lib/types'

const FALLBACK_USER = {
  username: 'Momen Hani',
  avatarUrl: 'https://i.pravatar.cc/300?img=68',
  bio: 'مترجم و معرب ألعاب. متخصص في تعريب ألعاب PC و PlayStation. مؤسس منصة ألعاب بالعربي.',
  joinedAt: '2024-05-25T00:00:00.000Z',
  role: 'owner',
}

const ROLE_BADGE: Record<string, { label: string; icon: React.ReactNode; className: string; ring: string }> = {
  owner:     { label: 'مالك الموقع', icon: <Crown className="h-3 w-3" />, className: 'bg-amber-500 text-white',     ring: 'ring-amber-500/50' },
  admin:     { label: 'مدير',         icon: <Shield className="h-3 w-3" />, className: 'bg-red-500 text-white',       ring: 'ring-red-500/50' },
  moderator: { label: 'مشرف',         icon: <Star className="h-3 w-3" />,  className: 'bg-purple-500 text-white',    ring: 'ring-purple-500/50' },
  member:    { label: 'عضو',          icon: <User className="h-3 w-3" />,  className: 'bg-blue-500 text-white',      ring: 'ring-blue-500/50' },
}

export function ProfilePage() {
  const searchParams = useSearchParams()
  const username = searchParams.get('user') || FALLBACK_USER.username
  const { toast } = useToast()
  const [tracked, setTracked] = useState(false)
  const [kudos, setKudos] = useState(false)

  const authorUrl = useMemo(() => `/api/authors/${encodeURIComponent(username)}/mods`, [username])
  const { data, loading } = useFetch<AuthorModsResponse>(authorUrl, [authorUrl])

  const author = data?.author ?? FALLBACK_USER
  const mods = data?.mods ?? []
  const totalDownloads = mods.reduce((s, m) => s + (m.downloads || 0), 0)
  const totalEndorsements = mods.reduce((s, m) => s + (m.endorsements || 0), 0)
  const totalViews = mods.reduce((s, m) => s + (m.views || 0), 0)

  useDocumentTitle(author.username)

  const isOwner = !searchParams.get('user') || searchParams.get('user') === FALLBACK_USER.username

  const [lastUsername, setLastUsername] = useState(username)
  if (username !== lastUsername) {
    setLastUsername(username)
    setTracked(false)
    setKudos(false)
  }

  const roleBadge = ROLE_BADGE[author.role] || ROLE_BADGE.member

  return (
    <div className="min-h-screen bg-[#121212] text-white" dir="rtl">
      {/* ===== Banner ===== */}
      <div className="relative h-[280px] overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#b3541e]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
      </div>

      {/* ===== معلومات المستخدم ===== */}
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        <div style={{ marginTop: '-80px' }} className="relative z-10">
          <div className="flex gap-6">
            {/* Avatar + شارة الرتبة */}
            <div className="shrink-0">
              <div className="relative">
                <Avatar className={`h-20 w-20 border-2 border-[#333] shadow-xl ring-4 ${roleBadge.ring}`}>
                  <AvatarImage src={author.avatarUrl || undefined} />
                  <AvatarFallback className="bg-[#1a1a1a] text-2xl font-bold text-[#ff8c00]">
                    {author.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold shadow-lg ${roleBadge.className}`}>
                  <span className="flex items-center gap-1">
                    {roleBadge.icon}
                    {roleBadge.label}
                  </span>
                </div>
              </div>
            </div>

            {/* الاسم + الأزرار */}
            <div className="flex-1 pt-1">
              <h1 className="text-2xl font-bold text-white">{author.username}</h1>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                <svg className="h-3.5 w-3.5 text-[#ff8c00]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>مؤلف تعريبات موثّق</span>
              </div>

              {/* أزرار — بدون زرار رفع تعريب */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant={tracked ? 'default' : 'outline'} className={`h-8 gap-1.5 text-xs ${tracked ? 'bg-[#ff8c00] text-white' : 'border-[#333] text-gray-300 hover:bg-[#222]'}`} onClick={() => { setTracked(t => !t); toast({ title: tracked ? 'تم إلغاء التتبع' : 'تم التتبع' }) }}>
                  <Star className="h-3.5 w-3.5" />{tracked ? 'مُتابَع' : 'تتبع'}
                </Button>
                <Button size="sm" variant="outline" className={`h-8 gap-1.5 text-xs ${kudos ? 'border-[#ff8c00] text-[#ff8c00]' : 'border-[#333] text-gray-300 hover:bg-[#222]'}`} onClick={() => { setKudos(k => !k); toast({ title: kudos ? 'تم إلغاء الإعجاب' : 'تم الإعجاب' }) }}>
                  <Heart className={`h-3.5 w-3.5 ${kudos ? 'fill-[#ff8c00]' : ''}`} />إعجاب
                </Button>
                {!isOwner && (
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 border-[#333] text-xs text-gray-300 hover:bg-[#222]" onClick={() => toast({ title: 'رسالة', description: 'قريباً' })}>
                    <Mail className="h-3.5 w-3.5" />رسالة
                  </Button>
                )}
                {!isOwner && (
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 border-[#333] text-xs text-gray-300 hover:bg-[#222]" onClick={() => toast({ title: 'تبرع', description: 'قريباً' })}>
                    <CreditCard className="h-3.5 w-3.5" />تبرع
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== فراغ + خط فاصل ===== */}
        <div className="mt-8 h-px bg-[#333]" />

        {/* ===== الإحصائيات ===== */}
        <div className="mx-auto mt-6 grid max-w-[800px] grid-cols-3 gap-4">
          <StatBox icon={<ThumbsUp className="h-5 w-5 text-gray-400" />} label="تأييدات" value={formatNumber(mods.length * 10)} />
          <StatBox icon={<Eye className="h-5 w-5 text-gray-400" />} label="مشاهدات الملف" value={formatNumber(totalViews)} />
          <StatBox icon={<Heart className="h-5 w-5 text-gray-400" />} label="إعجابات" value={formatNumber(Math.floor(totalEndorsements / 1000))} />
        </div>

        {/* ===== معلومات المستخدم ===== */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />مصر</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />آخر ظهور {formatArabicDate(new Date().toISOString())}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />انضم في {formatArabicDate(author.joinedAt)}</span>
        </div>

        {/* ===== فراغ + خط فاصل ===== */}
        <div className="mt-6 h-px bg-[#333]" />

        {/* ===== التبويبات — على اليمين (RTL): نبذة عني → تعريبات → وسائط → مجموعات ===== */}
        <Tabs defaultValue="about" className="mt-6">
          <TabsList className="w-full flex-row justify-start border-b border-[#333] bg-transparent p-0" style={{ direction: 'rtl' }}>
            <TabsTrigger value="about" className="rounded-none border-b-2 border-transparent bg-transparent text-gray-500 data-[state=active]:border-[#ff8c00] data-[state=active]:text-white">نبذة عني</TabsTrigger>
            <TabsTrigger value="mods" className="rounded-none border-b-2 border-transparent bg-transparent text-gray-500 data-[state=active]:border-[#ff8c00] data-[state=active]:text-white">التعريبات ({mods.length})</TabsTrigger>
            <TabsTrigger value="media" className="rounded-none border-b-2 border-transparent bg-transparent text-gray-500 data-[state=active]:border-[#ff8c00] data-[state=active]:text-white">الوسائط (0)</TabsTrigger>
            <TabsTrigger value="collections" className="rounded-none border-b-2 border-transparent bg-transparent text-gray-500 data-[state=active]:border-[#ff8c00] data-[state=active]:text-white">المجموعات (0)</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-6">
            <div className="rounded-lg bg-[#1a1a1a] p-6" dir="rtl">
              <p className="text-right text-sm leading-relaxed text-gray-300">{author.bio || 'لا توجد نبذة.'}</p>
            </div>
          </TabsContent>

          <TabsContent value="mods" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => <ModCardSkeleton key={i} />)}
              </div>
            ) : mods.length === 0 ? (
              <div className="grid place-items-center py-16 text-center">
                <Package className="mb-3 h-12 w-12 text-gray-600" />
                <p className="text-sm text-gray-500">لا يوجد محتوى بعد</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {mods.map((m) => <ModCard key={m.id} mod={m} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <div className="grid place-items-center py-16 text-center">
              <ImageIcon className="mb-3 h-12 w-12 text-gray-600" />
              <p className="text-sm text-gray-500">لا يوجد محتوى بعد</p>
            </div>
          </TabsContent>

          <TabsContent value="collections" className="mt-6">
            <div className="grid place-items-center py-16 text-center">
              <BookOpen className="mb-3 h-12 w-12 text-gray-600" />
              <p className="text-sm text-gray-500">لا يوجد محتوى بعد</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#222] p-4 text-center">
      <div className="mb-2 flex items-center justify-center gap-2">
        {icon}
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  )
}
