import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { keuanganService } from '@/services/keuanganService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit2, Trash2, FileText, Download, Search } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import toast, { Toaster } from 'react-hot-toast'
import { exportToExcel, exportToPDF } from '@/lib/exportUtils'

export default function KategoriPengeluaran() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nama, setNama] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: categories, isLoading } = useQuery({
    queryKey: ['expense_categories'],
    queryFn: keuanganService.getKategoriPengeluaran
  })

  const createMutation = useMutation({
    mutationFn: keuanganService.createKategoriPengeluaran,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_categories'] })
      toast.success('Kategori ditambahkan')
      setIsOpen(false)
      setNama('')
    },
    onError: (err: any) => toast.error(err.message)
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: { nama: string } }) => keuanganService.updateKategoriPengeluaran(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_categories'] })
      toast.success('Kategori diupdate')
      setIsOpen(false)
      setEditingId(null)
      setNama('')
    },
    onError: (err: any) => toast.error(err.message)
  })

  const deleteMutation = useMutation({
    mutationFn: keuanganService.deleteKategoriPengeluaran,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_categories'] })
      toast.success('Kategori dihapus')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama.trim()) return
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { nama } })
    } else {
      createMutation.mutate({ nama })
    }
  }

  const openCreateDialog = () => {
    setEditingId(null)
    setNama('')
    setIsOpen(true)
  }

  const openEditDialog = (id: string, currentNama: string) => {
    setEditingId(id)
    setNama(currentNama)
    setIsOpen(true)
  }

  const filteredCategories = categories?.filter(cat => cat.nama.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleExportExcel = () => {
    if (!filteredCategories) return
    const data = filteredCategories.map((c, i) => [i + 1, c.nama])
    exportToExcel('Data Kategori Pengeluaran', ['Nomor', 'Nama Kategori'], data)
    toast.success('File Excel berhasil diunduh')
  }

  const handleExportPDF = () => {
    if (!filteredCategories) return
    const data = filteredCategories.map((c, i) => [i + 1, c.nama])
    exportToPDF('Data Kategori Pengeluaran', ['Nomor', 'Nama Kategori'], data)
    toast.success('File PDF berhasil diunduh')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <Toaster />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kategori Pengeluaran</h2>
          <p className="text-muted-foreground">Kelola kategori untuk pengeluaran kas</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari kategori..." 
              className="pl-8 w-[200px]" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleExportExcel} className="hidden sm:flex" title="Export Excel">
            <FileText className="mr-2 h-4 w-4 text-green-600" /> Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="hidden sm:flex" title="Export PDF">
            <Download className="mr-2 h-4 w-4 text-red-600" /> PDF
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" /> Tambah
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nama Kategori</Label>
                  <Input value={nama} onChange={e => setNama(e.target.value)} placeholder="Contoh: Konsumsi Lomba" required />
                </div>
                <div className="pt-4 flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-center">Nomor</TableHead>
              <TableHead>Nama Kategori</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-4">Memuat...</TableCell></TableRow>
            ) : filteredCategories?.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Kategori tidak ditemukan</TableCell></TableRow>
            ) : filteredCategories?.map((cat, index) => (
              <TableRow key={cat.id}>
                <TableCell className="text-center font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{cat.nama}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(cat.id, cat.nama)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" 
                    onClick={() => {
                      if (window.confirm('Hapus kategori ini? Data kas yang menggunakan kategori ini mungkin terpengaruh.')) deleteMutation.mutate(cat.id)
                    }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
