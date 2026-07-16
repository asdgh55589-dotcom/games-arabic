'use client'

import { useEffect, useState } from 'react'
import { Loader2, Layers, Trash2, Edit2, Plus, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatNumber } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'

interface SeriesItem {
  name: string
  count: number
  downloads: number
  endorsements: number
  thumbnailUrl: string
}

export default function AdminSeriesPage() {
  const { toast } = useToast()
  const [series, setSeries] = useState<SeriesItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetch('/api/admin/series')
      .then((r) => {
        if (!r.ok) throw new Error('Failed')
        return r.json()
      })
      .then((data) => data?.series ? setSeries(data.series) : null)
      .catch(() => setError('فشل تحميل السلاسل'))
      .finally(() => setLoading(false))
  }, [])

  const onRename = async (oldName: string) => {
    if (!editValue.trim() || editValue === oldName) {
      setEditingName(null)
      return
    }
    try {
      const res = await fetch(`/api/admin/series/${encodeURIComponent(oldName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editValue.trim() }),
      })
      if (!res.ok) throw new Error('فشل التحديث')
      toast({ title: 'تم التحديث' })
      setSeries((p) => p.map((s) => s.name === oldName ? { ...s, name: editValue.trim() } : s))
      setEditingName(null)
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'فشل', variant: 'destructive' })
    }
  }

  const onDelete = async (name: string) => {
    if (!confirm(`هل أنت متأكد من حذف السلسلة "${name}"؟ سيتم تفريغ حقل السلسلة من كل التعريبات.`)) return
    try {
      const res = await fetch(`/api/admin/series/${encodeURIComponent(name)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل الحذف')
      toast({ title: 'تم الحذف' })
      setSeries((p) => p.filter((s) => s.name !== name))
    } catch (err) {
      toast({ title: 'خطأ', description: err instanceof Error ? err.message : 'فشل', variant: 'destructive' })
    }
  }

  if (loading) {
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
        <h1 className="text-2xl font-bold tracking-tight">السلاسل</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {series.length} سلسلة — السلاسل بتتولّد تلقائياً من تعريبات المنصات
        </p>
      </div>

      {series.length === 0 ? (
        <div className="grid place-items-center py-20 text-center">
          <Layers className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">لا توجد سلاسل</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-right">
            <thead className="border-b border-border bg-card/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">السلسلة</th>
                <th className="px-4 py-3 font-semibold">التعريبات</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">التحميلات</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">التأييدات</th>
                <th className="px-4 py-3 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {series.map((s) => (
                <tr key={s.name} className="text-sm transition-colors hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.thumbnailUrl} alt="" className="h-8 w-12 rounded object-cover" />
                      {editingName === s.name ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 w-48 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') onRename(s.name)
                              if (e.key === 'Escape') setEditingName(null)
                            }}
                          />
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500" onClick={() => onRename(s.name)}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingName(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="font-medium">{s.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{s.count}</td>
                  <td className="hidden px-4 py-3 text-xs sm:table-cell">{formatNumber(s.downloads)}</td>
                  <td className="hidden px-4 py-3 text-xs md:table-cell">{formatNumber(s.endorsements)}</td>
                  <td className="px-4 py-3">
                    {editingName !== s.name && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => { setEditingName(s.name); setEditValue(s.name) }}
                          title="تعديل"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                          onClick={() => onDelete(s.name)}
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
