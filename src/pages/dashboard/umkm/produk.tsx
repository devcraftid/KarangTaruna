// @ts-nocheck
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'
import { PackageSearch, Plus, Loader2, Trash2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function KatalogProduk() {
  const [products, setProducts] = useState<any[]>([])
  const [umkms, setUmkms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    umkm_id: '',
    nama_produk: '',
    deskripsi: '',
    harga: 0,
    stok: 0,
    is_active: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [prodRes, umkmRes] = await Promise.all([
        supabase
          .from('products')
          .select(`*, umkm_profiles(nama_usaha)`)
          .order('created_at', { ascending: false }),
        supabase
          .from('umkm_profiles')
          .select('id, nama_usaha')
          .eq('is_verified', true)
      ])
      
      if (prodRes.error) throw prodRes.error
      if (umkmRes.error) throw umkmRes.error
      
      setProducts(prodRes.data || [])
      setUmkms(umkmRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.nama_produk || !formData.umkm_id) return
    setSaving(true)
    try {
      let gambar = ''
      
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage.from('bumkt').upload(fileName, file)
        if (uploadError) throw uploadError
        
        const { data: urlData } = supabase.storage.from('bumkt').getPublicUrl(fileName)
        gambar = urlData.publicUrl
      }

      const payload = { ...formData, gambar }

      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select(`*, umkm_profiles(nama_usaha)`)
      
      if (error) throw error
      if (data) setProducts([data[0], ...products])
      
      setIsOpen(false)
      setFormData({ umkm_id: '', nama_produk: '', deskripsi: '', harga: 0, stok: 0, is_active: true })
      setFile(null)
      toast.success('Produk berhasil ditambahkan!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      setProducts(products.filter(p => p.id !== id))
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4 md:p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PackageSearch className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Katalog Produk</h1>
            <p className="text-muted-foreground">
              Manajemen inventori barang dan jasa UMKM warga.
            </p>
          </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Tambah Produk</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Input Produk UMKM</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Pilih Usaha / UMKM</Label>
                <Select value={formData.umkm_id} onValueChange={(val) => setFormData({...formData, umkm_id: val})}>
                  <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                  <SelectContent>
                    {umkms.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.nama_usaha}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nama Produk</Label>
                <Input value={formData.nama_produk} onChange={e => setFormData({...formData, nama_produk: e.target.value})} placeholder="Misal: Keripik Singkong" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Harga (Rp)</Label>
                  <Input type="number" value={formData.harga} onChange={e => setFormData({...formData, harga: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <Label>Stok</Label>
                  <Input type="number" value={formData.stok} onChange={e => setFormData({...formData, stok: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Foto Produk</Label>
                <div className="flex items-center gap-4">
                  <Button type="button" variant="outline" className="w-full relative overflow-hidden" onClick={() => document.getElementById('file-upload')?.click()}>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {file ? file.name : 'Upload Foto'}
                    <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </Button>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={handleSave} disabled={saving || !formData.umkm_id}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Simpan Produk
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
                <TableHead>Produk</TableHead>
                <TableHead>Pemilik / UMKM</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-center">Stok</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-12">Belum ada produk terdaftar.</TableCell></TableRow>
              ) : products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.gambar ? (
                        <img src={p.gambar} alt={p.nama_produk} className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <span className="font-bold">{p.nama_produk}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {p.umkm_profiles?.nama_usaha || 'Tidak Diketahui'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-600">{formatRupiah(p.harga)}</TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stok > 0 ? 'bg-slate-100' : 'bg-red-100 text-red-700'}`}>
                      {p.stok > 0 ? p.stok : 'Habis'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={() => handleDelete(p.id)}>
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
