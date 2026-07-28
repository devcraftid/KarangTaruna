import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'
import { Store, Plus, Loader2, Trash2, Edit2, BadgeCheck } from 'lucide-react'

export default function DataUMKM() {
  const [umkms, setUmkms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    nama_usaha: '',
    nama_pemilik: '',
    kategori: 'Kuliner',
    alamat: '',
    kontak: ''
  })

  useEffect(() => {
    fetchUmkms()
  }, [])

  const fetchUmkms = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('umkm_profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setUmkms(data)
    } catch (error) {
      console.error('Error fetching UMKM:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.nama_usaha || !formData.nama_pemilik) return
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('umkm_profiles')
        .insert([formData])
        .select()
      
      if (error) throw error
      if (data) setUmkms([data[0], ...umkms])
      setIsOpen(false)
      setFormData({ nama_usaha: '', nama_pemilik: '', kategori: 'Kuliner', alamat: '', kontak: '' })
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus profil UMKM ini? Data produk dan penjualannya juga mungkin akan terhapus.')) return
    try {
      const { error } = await supabase.from('umkm_profiles').delete().eq('id', id)
      if (error) throw error
      setUmkms(umkms.filter(u => u.id !== id))
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleVerify = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('umkm_profiles').update({ is_verified: !currentStatus }).eq('id', id)
      if (error) throw error
      setUmkms(umkms.map(u => u.id === id ? { ...u, is_verified: !currentStatus } : u))
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Store className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data UMKM & BUMKT</h1>
            <p className="text-muted-foreground">
              Direktori usaha milik warga dan Badan Usaha Milik Karang Taruna.
            </p>
          </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Tambah UMKM</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Daftarkan Usaha Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nama Usaha / Toko</Label>
                <Input value={formData.nama_usaha} onChange={e => setFormData({...formData, nama_usaha: e.target.value})} placeholder="Warung Makan Berkah" />
              </div>
              <div className="space-y-2">
                <Label>Nama Pemilik</Label>
                <Input value={formData.nama_pemilik} onChange={e => setFormData({...formData, nama_pemilik: e.target.value})} placeholder="Bpk. Budi" />
              </div>
              <div className="space-y-2">
                <Label>Kategori Usaha</Label>
                <Select value={formData.kategori} onValueChange={(val) => setFormData({...formData, kategori: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kuliner">F&B / Kuliner</SelectItem>
                    <SelectItem value="Jasa">Jasa & Servis</SelectItem>
                    <SelectItem value="Retail">Retail / Sembako</SelectItem>
                    <SelectItem value="Kerajinan">Kerajinan / Kriya</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nomor WhatsApp</Label>
                <Input value={formData.kontak} onChange={e => setFormData({...formData, kontak: e.target.value})} placeholder="0812..." />
              </div>
              <div className="space-y-2">
                <Label>Alamat / RT RW</Label>
                <Input value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} placeholder="RT 01 / RW 02" />
              </div>
              <Button className="w-full mt-4" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Simpan Data
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Usaha</TableHead>
                <TableHead>Pemilik</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Kontak & Alamat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {umkms.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-12">Belum ada UMKM yang terdaftar.</TableCell></TableRow>
              ) : umkms.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-bold">{u.nama_usaha}</TableCell>
                  <TableCell>{u.nama_pemilik}</TableCell>
                  <TableCell><span className="px-2 py-1 text-xs bg-slate-100 rounded-full">{u.kategori}</span></TableCell>
                  <TableCell>
                    <div className="text-sm">{u.kontak || '-'}</div>
                    <div className="text-xs text-muted-foreground">{u.alamat}</div>
                  </TableCell>
                  <TableCell>
                    {u.is_verified ? (
                      <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                        <BadgeCheck className="w-3 h-3 mr-1" /> Terverifikasi
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
                        Menunggu
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleVerify(u.id, u.is_verified)}>
                      {u.is_verified ? 'Batal Verif' : 'Verifikasi'}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={() => handleDelete(u.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
