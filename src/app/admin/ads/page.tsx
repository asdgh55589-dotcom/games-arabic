'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Eye, EyeOff, Loader2, Youtube, Image as ImageIcon, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface Ad {
  id: string
  type: string
  url: string
  title: string
  description: string
  link: string | null
  size: string
  order: number
  visible: boolean
}

const AD_TYPES = [
  { value: 'youtube', label: 'فيديو يوتيوب', icon: Youtube },
  { value: 'image', label: 'صورة إعلانية', icon: ImageIcon },
  { value: 'html', label: 'HTML مخصص', icon: Code },
]

const AD_SIZES = [
  { value: 'small', label: 'صغير (300×150)' },
  { value: 'medium', label: 'متوسط (16:9)' },
  { value: 'large', label: 'كبير (16:9 أكبر)' },
  { value: 'full', label: 'كامل العرض (21:9)' },
]

export default function AdminAdsPage() {
  const { toast } = useToast()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // نموذج إعلان جديد
  const [type, setType] = useState('youtube')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [size, setSize] = useState('medium')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/ads')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => data?.ads ? setAds(data.ads) : null)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const onAdd = async () => {
    if (!url) {
      toast({ title: 'بيانات ناقصة', description: 'الرابط مطلوب', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type, url, title, description,
          link: link || null,
          size,
          order: ads.length,
          visible: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'فشل')

      toast({ title: 'تم إضافة الإعلان' })
      setAds((prev) => [...prev, data.ad])
      setUrl(''); setTitle(''); setDescription(''); setLink(''); setType('youtube'); setSize('medium')
      setShowForm(false)
    } catch (err) {
      toast({
        title: 'خطأ',
        description: err instanceof Error ? err.message : 'فشل',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const onToggle = async (ad: Ad) => {
    try {
      await fetch(`/api/admin/ads/${ad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !ad.visible }),
      })
      setAds((prev) => prev.map((a) => a.id === ad.id ? { ...a, visible: !a.visible } : a))
    } catch {
      toast({ title: 'خطأ', variant: 'destructive' })
    }
  }

  const onDelete = async (ad: Ad) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return
    try {
      await fetch(`/api/admin/ads/${ad.id}`, { method: 'DELETE' })
      toast({ title: 'تم الحذف' })
      setAds((prev) => prev.filter((a) => a.id !== ad.id))
    } catch {
      toast({ title: 'خطأ', variant: 'destructive' })
    }
  }

  if (loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إعلانات الصفحة الرئيسية</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            تظهر فوق الشريط الجانبي — كل ما تضيف إعلان، الأقسام تنزل لتحت
          </p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus className="ml-2 h-4 w-4" /> إضافة إعلان
        </Button>
      </div>

      {/* نموذج إضافة */}
      {showForm && (
        <div className="space-y-4 rounded-xl border border-border bg-card/40 p-5">
          <h3 className="text-sm font-bold">إعلان جديد</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>نوع الإعلان</Label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm">
                {AD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <Label>المقاس</Label>
              <select value={size} onChange={(e) => setSize(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm">
                {AD_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <Label>الرابط {type === 'youtube' ? '(رابط يوتيوب)' : type === 'image' ? '(رابط الصورة)' : '(كود HTML)'}</Label>
            {type === 'html' ? (
              <Textarea value={url} onChange={(e) => setUrl(e.target.value)} rows={4} placeholder="<div>...</div>" className="mt-1" />
            ) : (
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://...'} className="mt-1" />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>العنوان (اختياري)</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>الوصف (اختياري)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
            </div>
          </div>

          {type === 'image' && (
            <div>
              <Label>رابط عند الضغط (اختياري)</Label>
              <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className="mt-1" />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button onClick={onAdd} disabled={saving}>
              {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Plus className="ml-2 h-4 w-4" />}
              إضافة
            </Button>
          </div>
        </div>
      )}

      {/* قائمة الإعلانات */}
      {ads.length === 0 ? (
        <div className="grid place-items-center py-20 text-center">
          <ImageIcon className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">لا توجد إعلانات</h3>
          <p className="mt-1 text-sm text-muted-foreground">اضغط "إضافة إعلان" لإنشاء أول إعلان</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => {
            const typeInfo = AD_TYPES.find((t) => t.value === ad.type)
            const Icon = typeInfo?.icon || ImageIcon
            return (
              <div key={ad.id} className="flex items-center gap-4 rounded-xl border border-border bg-card/40 p-4">
                {/* معاينة مصغّرة */}
                <div className="h-16 w-28 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {ad.type === 'youtube' && ad.url.includes('youtube') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`https://i.ytimg.com/vi/${ad.url.match(/(?:v=|be\/|embed\/)([\w-]{11})/)?.[1] || ''}/mqdefault.jpg`} alt="" className="h-full w-full object-cover" />
                  ) : ad.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ad.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center"><Icon className="h-6 w-6 text-muted-foreground" /></div>
                  )}
                </div>

                {/* معلومات */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate font-medium">{ad.title || ad.url.slice(0, 50)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">{typeInfo?.label}</Badge>
                    <Badge variant="outline" className="text-[10px]">{ad.size}</Badge>
                    {ad.description && <span className="truncate">· {ad.description}</span>}
                  </div>
                </div>

                {/* أزرار */}
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onToggle(ad)} title={ad.visible ? 'إخفاء' : 'إظهار'}>
                    {ad.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-500/10" onClick={() => onDelete(ad)} title="حذف">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
