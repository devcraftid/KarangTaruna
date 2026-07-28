import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { supabase } from '@/lib/supabase'
import { MessageSquare, Plus, Loader2, Trash2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AspirasiWarga() {
  const [aspirations, setAspirations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isAnonim, setIsAnonim] = useState(false)
  
  const [formData, setFormData] = useState({
    nama: '',
    topik: '',
    pesan: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('aspirations')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setAspirations(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.topik || !formData.pesan) return
    setSaving(true)
    try {
      const payload = {
        nama: isAnonim ? 'Anonim (Warga)' : (formData.nama || 'Warga'),
        topik: formData.topik,
        pesan: formData.pesan,
        status: 'pending'
      }

      const { data, error } = await supabase
        .from('aspirations')
        .insert([payload])
        .select()
      
      if (error) throw error
      if (data) setAspirations([data[0], ...aspirations])
      
      setIsOpen(false)
      setFormData({ nama: '', topik: '', pesan: '' })
      setIsAnonim(false)
      toast.success('Aspirasi berhasil dikirimkan!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id: string, currentStatus: string) => {
    let newStatus = 'pending'
    if (currentStatus === 'pending') newStatus = 'diproses'
    else if (currentStatus === 'diproses') newStatus = 'selesai'
    else if (currentStatus === 'selesai') newStatus = 'pending' // loop back

    try {
      const { error } = await supabase.from('aspirations').update({ status: newStatus }).eq('id', id)
      if (error) throw error
      setAspirations(aspirations.map(a => a.id === id ? { ...a, status: newStatus } : a))
      toast.success(`Status tiket diubah menjadi ${newStatus}`)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus tiket aspirasi ini?')) return
    try {
      const { error } = await supabase.from('aspirations').delete().eq('id', id)
      if (error) throw error
      setAspirations(aspirations.filter(a => a.id !== id))
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Layanan Aspirasi</h1>
            <p className="text-muted-foreground">
              Sistem tiket untuk kritik, saran, dan pengaduan warga.
            </p>
          </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" /> Tulis Aspirasi</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sampaikan Suara Anda</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="space-y-0.5">
                  <Label>Kirim sebagai Anonim</Label>
                  <p className="text-xs text-muted-foreground">Sembunyikan identitas Anda</p>
                </div>
                <Switch checked={isAnonim} onCheckedChange={setIsAnonim} />
              </div>
              
              {!isAnonim && (
                <div className="space-y-2">
                  <Label>Nama Anda</Label>
                  <Input value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} placeholder="Opsional" />
                </div>
              )}

              <div className="space-y-2">
                <Label>Topik Aduan / Saran</Label>
                <Input value={formData.topik} onChange={e => setFormData({...formData, topik: e.target.value})} placeholder="Lampu Jalan Mati / Usulan Kegiatan" />
              </div>
              
              <div className="space-y-2">
                <Label>Detail Pesan</Label>
                <Textarea 
                  className="min-h-[120px]"
                  value={formData.pesan} 
                  onChange={e => setFormData({...formData, pesan: e.target.value})} 
                  placeholder="Deskripsikan selengkapnya..." 
                />
              </div>

              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={saving || !formData.topik || !formData.pesan}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />} Kirim Tiket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {aspirations.length === 0 ? (
          <div className="col-span-full p-12 text-center border-2 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <p className="text-muted-foreground">Belum ada tiket aspirasi yang masuk.</p>
          </div>
        ) : aspirations.map((item) => (
          <Card key={item.id} className="relative overflow-hidden flex flex-col">
            <div className={`absolute top-0 left-0 w-1 h-full 
              ${item.status === 'selesai' ? 'bg-green-500' : item.status === 'diproses' ? 'bg-amber-500' : 'bg-red-500'}
            `} />
            <CardHeader className="pb-3 pl-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                      ${item.status === 'selesai' ? 'bg-green-100 text-green-700' : item.status === 'diproses' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}
                    `}>
                      {item.status}
                    </span>
                  </div>
                  <CardTitle className="text-base leading-tight">{item.topik}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-5 flex-1 flex flex-col">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-1 whitespace-pre-wrap">{item.pesan}</p>
              
              <div className="pt-4 mt-auto border-t flex justify-between items-center text-xs text-muted-foreground">
                <span className="font-medium text-slate-800 dark:text-slate-200">Pengirim: {item.nama}</span>
                <span>{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
              </div>
              
              <div className="pt-3 mt-3 flex justify-between gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => updateStatus(item.id, item.status)}>
                  {item.status === 'pending' ? 'Proses Tiket' : item.status === 'diproses' ? 'Tandai Selesai' : 'Buka Kembali'}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
