import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Store, Plus, Trash2, Edit2, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import toast from 'react-hot-toast'
import { Product } from '@/types'
import { useAuth } from '@/context/AuthContext'

export default function Bumkt() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    nama_produk: '',
    deskripsi: '',
    harga: 0,
    stok: 0,
    is_active: true
  })

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as Product[]
    }
  })

  const saveMutation = useMutation({
    mutationFn: async (newData: any) => {
      let gambar = newData.gambar || ''
      
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage.from('bumkt').upload(fileName, file)
        if (uploadError) throw uploadError
        
        const { data: urlData } = supabase.storage.from('bumkt').getPublicUrl(fileName)
        gambar = urlData.publicUrl
      }

      const payload = { ...newData, gambar, created_by: profile?.id }

      if (editingId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert([payload])
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(`Produk berhasil ${editingId ? 'diperbarui' : 'ditambahkan'}`)
      resetForm()
    },
    onError: (error) => toast.error('Gagal menyimpan produk: ' + error.message)
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      const { error } = await supabase.from('products').update({ is_active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produk berhasil dihapus')
    }
  })

  const resetForm = () => {
    setIsOpen(false)
    setEditingId(null)
    setFile(null)
    setFormData({ nama_produk: '', deskripsi: '', harga: 0, stok: 0, is_active: true })
  }

  const handleEdit = (item: Product) => {
    setFormData({
      nama_produk: item.nama_produk,
      deskripsi: item.deskripsi || '',
      harga: item.harga,
      stok: item.stok,
      is_active: item.is_active
    })
    // Note: We don't load the existing image into `file` state, we just keep the URL in the DB if no new file is selected.
    setEditingId(item.id)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    const existingGambar = editingId ? products?.find(p => p.id === editingId)?.gambar : undefined
    await saveMutation.mutateAsync({ ...formData, gambar: existingGambar })
    setUploading(false)
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            Etalase BUMKT
          </h1>
          <p className="text-muted-foreground">Kelola produk dan layanan Badan Usaha Milik Karang Taruna</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={(open) => { if(!open) resetForm(); else setIsOpen(true) }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Tambah Produk</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nama Produk</Label>
                <Input required value={formData.nama_produk} onChange={e => setFormData({...formData, nama_produk: e.target.value})} placeholder="Kaos Karang Taruna" />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Input value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Harga (Rp)</Label>
                  <Input type="number" required min="0" value={formData.harga} onChange={e => setFormData({...formData, harga: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <Label>Stok</Label>
                  <Input type="number" required min="0" value={formData.stok} onChange={e => setFormData({...formData, stok: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gambar Produk (Opsional)</Label>
                <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={(c: boolean) => setFormData({...formData, is_active: c})} 
                  id="active-mode" 
                />
                <Label htmlFor="active-mode">Tampilkan di Etalase Publik</Label>
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Simpan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-card border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : products?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Belum ada produk di etalase</TableCell></TableRow>
            ) : (
              products?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.gambar ? (
                        <img src={item.gambar} alt={item.nama_produk} className="w-10 h-10 rounded-md object-cover border" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center border">
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.nama_produk}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.deskripsi}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{formatRupiah(item.harga)}</TableCell>
                  <TableCell>{item.stok}</TableCell>
                  <TableCell>
                     <Switch 
                        checked={item.is_active} 
                        onCheckedChange={(c: boolean) => toggleStatusMutation.mutate({ id: item.id, is_active: c })} 
                     />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit2 className="w-4 h-4 text-blue-500" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if(confirm('Hapus produk?')) deleteMutation.mutate(item.id) }}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
