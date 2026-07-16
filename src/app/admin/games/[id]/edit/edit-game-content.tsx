'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

const PLATFORMS = ['PC', 'NS', 'PS1', 'PS2', 'PS3', 'PS4'] as const
const CATEGORIES = ['RPG', 'FPS', 'Strategy', 'Sandbox', 'Adventure', 'Simulation', 'Action', 'Fighting', 'Racing']

export default function EditGameContent({ id }: { id: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [platform, setPlatform] = useState('PC')
  const [category, setCategory] = useState('RPG')
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear())
  const [bannerUrl, setBannerUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [featured, setFeatured] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetch(`/api/admin/games/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.game) return
        const g = data.game
        setName(g.name || '')
        setTagline(g.tagline || '')
        setDescription(g.description || '')
        setPlatform(g.platform || 'PC')
        setCategory(g.category || 'RPG')
        setReleaseYear(g.releaseYear || new Date().getFullYear())
        setBannerUrl(g.bannerUrl || '')
        setThumbnailUrl(g.thumbnailUrl || '')
        setLogoUrl(g.logoUrl || '')
        setFeatured(g.featured || false)
        setCategories(g.categories?.map((c: any) => c.name) || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const onSave = async () => {
    if (!name || !tagline || !description) {
      toast({ title: 'بيانات ناقصة', description: 'الاسم والوصف مطلوبان', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/games/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, tagline, description, platform, category,
          releaseYear, bannerUrl, thumbnailUrl, logoUrl, featured,
          categories: categories.filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'فشل الحفظ')
      toast({ title: 'تم الحفظ', description: 'تم تحديث اللعبة' })
      router.push('/admin/games')
    } catch (err) {
      toast({
        title: 'خطأ',
        description: err instanceof Error ? err.message : 'فشل الحفظ',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">تعديل اللعبة</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href="/admin/games">إلغاء</Link></Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            حفظ التعديلات
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card/30 p-5">
        <div>
          <Label>اسم اللعبة *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>الجملة التعريفية *</Label>
          <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </div>
        <div>
          <Label>الوصف الكامل *</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label>المنصة</Label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm">
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <Label>الفئة</Label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label>سنة الإصدار</Label>
            <Input type="number" value={releaseYear} onChange={(e) => setReleaseYear(Number(e.target.value))} />
          </div>
        </div>
        <div>
          <Label>رابط البانر</Label>
          <Input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} />
        </div>
        <div>
          <Label>رابط الصورة المصغّرة</Label>
          <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
        </div>
        <div>
          <Label>رابط الشعار</Label>
          <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
        </div>
        <div>
          <Label>الأقسام</Label>
          <Input
            value={categories.join(', ')}
            onChange={(e) => setCategories(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4" />
          مميّزة
        </label>
      </div>
    </div>
  )
}
