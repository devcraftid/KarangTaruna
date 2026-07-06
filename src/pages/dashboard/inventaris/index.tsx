import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Archive, Plus, Trash2, Edit2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import toast from 'react-hot-toast'
import { InventoryItem } from '@/types'

export default function Inventaris() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    nama_barang: '',
    jumlah: 0,
    kondisi: 'baik',
    lokasi: '',
    keterangan: ''
  })

  const { data: items, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory_items').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as InventoryItem[]
    }
  })

  const saveMutation = useMutation({
    mutationFn: async (newData: any) => {
      if (editingId) {
        const { error } = await supabase.from('inventory_items').update(newData).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('inventory_items').insert([newData])
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(`Barang berhasil ${editingId ? 'diperbarui' : 'ditambahkan'}`)
      resetForm()
    },
    onError: (error) => toast.error('Gagal menyimpan barang: ' + error.message)
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inventory_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Barang berhasil dihapus')
    }
  })

  const resetForm = () => {
    setIsOpen(false)
    setEditingId(null)
    setFormData({ nama_barang: '', jumlah: 0, kondisi: 'baik', lokasi: '', keterangan: '' })
  }

  const handleEdit = (item: InventoryItem) => {
    setFormData({
      nama_barang: item.nama_barang,
      jumlah: item.jumlah,
      kondisi: item.kondisi,
      lokasi: item.lokasi || '',
      keterangan: item.keterangan || ''
    })
    setEditingId(item.id)
    setIsOpen(true)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Archive className="h-6 w-6 text-primary" />
            Inventaris Barang
          </h1>
          <p className="text-muted-foreground">Manajemen aset dan barang Karang Taruna</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={(open) => { if(!open) resetForm(); else setIsOpen(true) }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Tambah Barang</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Barang' : 'Tambah Barang'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData) }} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nama Barang</Label>
                <Input required value={formData.nama_barang} onChange={e => setFormData({...formData, nama_barang: e.target.value})} placeholder="Tenda Pramuka" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jumlah</Label>
                  <Input type="number" required min="0" value={formData.jumlah} onChange={e => setFormData({...formData, jumlah: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Kondisi</Label>
                  <Select value={formData.kondisi} onValueChange={(val) => setFormData({...formData, kondisi: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baik">Baik</SelectItem>
                      <SelectItem value="rusak">Rusak</SelectItem>
                      <SelectItem value="hilang">Hilang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Lokasi Penyimpanan</Label>
                <Input value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} placeholder="Gudang Sekretariat" />
              </div>
              <div className="space-y-2">
                <Label>Keterangan</Label>
                <Input value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} />
              </div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
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
              <TableHead>Nama Barang</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Kondisi</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : items?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Belum ada barang di inventaris</TableCell></TableRow>
            ) : (
              items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nama_barang}</TableCell>
                  <TableCell>{item.jumlah}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.kondisi === 'baik' ? 'bg-green-100 text-green-700' :
                      item.kondisi === 'rusak' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.kondisi.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>{item.lokasi || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit2 className="w-4 h-4 text-blue-500" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if(confirm('Yakin ingin menghapus?')) deleteMutation.mutate(item.id) }}>
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
