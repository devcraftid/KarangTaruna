// @ts-nocheck
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from '@/lib/supabase'
import { Megaphone, Plus, Loader2, Trash2, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Pengumuman() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    judul: '',
    konten: '',
    kategori: 'Pengumuman'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('kategori', 'Pengumuman')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setNews(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.judul || !formData.konten) return
    setSaving(true)
    try {
      const slug = formData.judul.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000)
      
      const payload = { ...formData, slug }

      const { data, error } = await supabase
        .from('news')
        .insert([payload])
        .select()
      
      if (error) throw error
      if (data) setNews([data[0], ...news])
      
      setIsOpen(false)
      setFormData({ judul: '', konten: '', kategori: 'Pengumuman' })
      toast.success('Pengumuman berhasil disiarkan!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pengumuman ini?')) return
    try {
      const { error } = await supabase.from('news').delete().eq('id', id)
      if (error) throw error
      setNews(news.filter(n => n.id !== id))
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4 md:p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <Megaphone className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pusat Pengumuman</h1>
            <p className="text-muted-foreground">
              Broadcast informasi penting ke seluruh warga.
            </p>
          </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white"><Plus className="w-4 h-4 mr-2" /> Buat Pengumuman</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Siarkan Pengumuman Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Judul Pengumuman</Label>
                <Input value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} placeholder="Kerja Bakti Rutin RT 02" />
              </div>
              <div className="space-y-2">
                <Label>Isi Pengumuman</Label>
                <Textarea 
                  className="min-h-[150px]"
                  value={formData.konten} 
                  onChange={e => setFormData({...formData, konten: e.target.value})} 
                  placeholder="Diberitahukan kepada seluruh warga..." 
                />
              </div>
              <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white" onClick={handleSave} disabled={saving || !formData.judul || !formData.konten}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Megaphone className="w-4 h-4 mr-2" />} Siarkan Sekarang
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {news.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Megaphone className="w-12 h-12 text-slate-300 mb-4" />
              <p>Belum ada pengumuman yang disiarkan.</p>
            </CardContent>
          </Card>
        ) : news.map((item) => (
          <Card key={item.id} className="overflow-hidden group hover:border-orange-200 dark:hover:border-orange-900 transition-colors">
            <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-orange-700 dark:text-orange-400">{item.judul}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4" /> {new Date(item.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">{item.konten}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
