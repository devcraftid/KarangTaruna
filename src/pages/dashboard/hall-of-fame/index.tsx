import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'
import { Award, Plus, Loader2, Trash2, Calendar, User, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'

export default function HallOfFame() {
  const [achievements, setAchievements] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    member_id: '',
    judul_prestasi: '',
    tingkat: 'Lokal',
    tahun: new Date().getFullYear().toString(),
    deskripsi: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [achRes, memRes] = await Promise.all([
        supabase
          .from('member_achievements')
          .select(`*, members(nama_lengkap, foto_url)`)
          .order('tahun', { ascending: false }),
        supabase
          .from('members')
          .select('id, nama_lengkap')
          .order('nama_lengkap')
      ])
      
      if (achRes.error) throw achRes.error
      if (memRes.error) throw memRes.error
      
      setAchievements(achRes.data || [])
      setMembers(memRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.member_id || !formData.judul_prestasi) return
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('member_achievements')
        .insert([formData])
        .select(`*, members(nama_lengkap, foto_url)`)
      
      if (error) throw error
      if (data) setAchievements([data[0], ...achievements])
      
      setIsOpen(false)
      setFormData({ member_id: '', judul_prestasi: '', tingkat: 'Lokal', tahun: new Date().getFullYear().toString(), deskripsi: '' })
      toast.success('Prestasi berhasil dicatat!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus prestasi ini?')) return
    try {
      const { error } = await supabase.from('member_achievements').delete().eq('id', id)
      if (error) throw error
      setAchievements(achievements.filter(a => a.id !== id))
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4 md:p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  const getTingkatColor = (tingkat: string) => {
    switch (tingkat.toLowerCase()) {
      case 'internasional': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'nasional': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'provinsi': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'kabupaten': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dinding Prestasi</h1>
            <p className="text-muted-foreground">
              Apresiasi dan rekam jejak prestasi anggota Karang Taruna.
            </p>
          </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Tambah Prestasi</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Catat Prestasi Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nama Anggota</Label>
                <Select value={formData.member_id} onValueChange={(val) => setFormData({...formData, member_id: val})}>
                  <SelectTrigger><SelectValue placeholder="Pilih anggota..." /></SelectTrigger>
                  <SelectContent>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.nama_lengkap}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Judul Prestasi / Penghargaan</Label>
                <Input value={formData.judul_prestasi} onChange={e => setFormData({...formData, judul_prestasi: e.target.value})} placeholder="Juara 1 Lomba Cerdas Cermat" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tingkat</Label>
                  <Select value={formData.tingkat} onValueChange={(val) => setFormData({...formData, tingkat: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internasional">Internasional</SelectItem>
                      <SelectItem value="Nasional">Nasional</SelectItem>
                      <SelectItem value="Provinsi">Provinsi</SelectItem>
                      <SelectItem value="Kabupaten">Kabupaten / Kota</SelectItem>
                      <SelectItem value="Kecamatan">Kecamatan</SelectItem>
                      <SelectItem value="Lokal">Lokal / Desa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tahun</Label>
                  <Input type="number" value={formData.tahun} onChange={e => setFormData({...formData, tahun: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deskripsi Singkat (Opsional)</Label>
                <Input value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} placeholder="Penyelenggara: Kemenpora" />
              </div>
              <Button className="w-full mt-4" onClick={handleSave} disabled={saving || !formData.member_id || !formData.judul_prestasi}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Simpan Data
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {achievements.length === 0 ? (
          <div className="col-span-full p-12 text-center border-2 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-muted-foreground">Belum ada catatan prestasi.</p>
          </div>
        ) : achievements.map((ach) => (
          <Card key={ach.id} className="overflow-hidden group hover:shadow-md transition-all relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(ach.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-inner">
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate" title={ach.judul_prestasi}>{ach.judul_prestasi}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getTingkatColor(ach.tingkat)}`}>
                      {ach.tingkat}
                    </span>
                    <span className="flex items-center text-xs">
                      <Calendar className="w-3 h-3 mr-1" /> {ach.tahun}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-md border mt-2">
                {ach.members?.foto_url ? (
                  <img src={ach.members.foto_url} alt="Profil" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground leading-none">Peraih Penghargaan</p>
                  <p className="text-sm font-semibold mt-1">{ach.members?.nama_lengkap || 'Anggota Tidak Dikenal'}</p>
                </div>
              </div>
              {ach.deskripsi && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 line-clamp-2">"{ach.deskripsi}"</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
