import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { keuanganService } from '@/services/keuanganService'
import { storageService } from '@/services/storageService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { kasKeluarSchema, KasKeluarFormValues } from '@/lib/validations'
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

export default function KasKeluar() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: keuanganService.getExpenses
  })

  const { data: categories } = useQuery({
    queryKey: ['expense_categories'],
    queryFn: keuanganService.getKategoriPengeluaran
  })

  const form = useForm<KasKeluarFormValues>({
    resolver: zodResolver(kasKeluarSchema),
    defaultValues: {
      category_id: '', nama_pengeluaran: '', nominal: 0, tanggal: new Date().toISOString().split('T')[0], keterangan: '', bukti_nota: ''
    }
  })

  const createMutation = useMutation({
    mutationFn: (data: KasKeluarFormValues) => keuanganService.createExpense({ ...data, created_by: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Pengeluaran ditambahkan')
      setIsOpen(false)
      form.reset()
      setSelectedFile(null)
    },
    onError: (err: any) => toast.error(err.message)
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: KasKeluarFormValues }) => keuanganService.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Pengeluaran diupdate')
      setIsOpen(false)
      setEditingId(null)
      form.reset()
      setSelectedFile(null)
    },
    onError: (err: any) => toast.error(err.message)
  })

  const deleteMutation = useMutation({
    mutationFn: keuanganService.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Pengeluaran dihapus')
    }
  })

  const onSubmit = async (data: KasKeluarFormValues) => {
    let finalBukti = data.bukti_nota

    if (selectedFile) {
      try {
        setIsUploading(true)
        const url = await storageService.uploadFile('nota', selectedFile)
        finalBukti = url
      } catch (error: any) {
        toast.error(error.message)
        setIsUploading(false)
        return
      } finally {
        setIsUploading(false)
      }
    }

    const finalData = { ...data, bukti_nota: finalBukti }

    if (editingId) updateMutation.mutate({ id: editingId, data: finalData })
    else createMutation.mutate(finalData)
  }

  const openCreateDialog = () => {
    setEditingId(null)
    setSelectedFile(null)
    form.reset({ category_id: categories?.[0]?.id || '', nama_pengeluaran: '', nominal: 0, tanggal: new Date().toISOString().split('T')[0], keterangan: '', bukti_nota: '' })
    setIsOpen(true)
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kas Keluar</h2>
          <p className="text-muted-foreground">Kelola pencatatan pengeluaran kas</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Pengeluaran
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select onValueChange={(val) => form.setValue('category_id', val)} defaultValue={form.getValues('category_id')}>
                    <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nominal (Rp)</Label>
                  <Input type="number" {...form.register('nominal')} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Pengeluaran</Label>
                  <Input {...form.register('nama_pengeluaran')} placeholder="Beli piala, konsumsi, dll" />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input type="date" {...form.register('tanggal')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Keterangan</Label>
                <Input {...form.register('keterangan')} />
              </div>

              <div className="space-y-2">
                <Label>Bukti Nota (Opsional)</Label>
                <Input type="file" accept="image/*,application/pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                {form.watch('bukti_nota') && !selectedFile && <p className="text-xs text-muted-foreground mt-1">Sudah ada nota terlampir.</p>}
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || isUploading}>
                  {isUploading ? 'Mengunggah...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border rounded-xl shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Pengeluaran</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-4">Memuat...</TableCell></TableRow>
            ) : expenses?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>{item.expense_categories?.nama}</TableCell>
                <TableCell>{item.nama_pengeluaran}</TableCell>
                <TableCell className="font-medium text-red-600">Rp {item.nominal.toLocaleString('id-ID')}</TableCell>
                <TableCell className="text-right space-x-2">
                  {profile?.role === 'admin' && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingId(item.id)
                        form.reset({ category_id: item.category_id, nama_pengeluaran: item.nama_pengeluaran, nominal: item.nominal, tanggal: item.tanggal, keterangan: item.keterangan || '' })
                        setIsOpen(true)
                      }}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                        if (window.confirm('Hapus pengeluaran ini?')) deleteMutation.mutate(item.id)
                      }}><Trash2 className="h-4 w-4" /></Button>
                    </>
                  )}
                  {profile?.role !== 'admin' && (
                    <span className="text-xs text-muted-foreground italic">Akses Terbatas</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
