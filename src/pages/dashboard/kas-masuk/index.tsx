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
import { kasMasukSchema, KasMasukFormValues } from '@/lib/validations'
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

export default function KasMasuk() {
  const queryClient = useQueryClient()
  const { user, profile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { data: income, isLoading } = useQuery({
    queryKey: ['income'],
    queryFn: keuanganService.getIncome
  })

  const { data: categories } = useQuery({
    queryKey: ['income_categories'],
    queryFn: keuanganService.getKategoriPemasukan
  })

  const form = useForm<KasMasukFormValues>({
    resolver: zodResolver(kasMasukSchema),
    defaultValues: {
      category_id: '', nama_donatur: '', jenis_donatur: 'Warga', nominal: 0, tanggal: new Date().toISOString().split('T')[0], metode_pembayaran: 'Tunai', status: 'verified', keterangan: '', bukti_transfer: ''
    }
  })

  const createMutation = useMutation({
    mutationFn: (data: KasMasukFormValues) => keuanganService.createIncome({ ...data, created_by: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] })
      toast.success('Pemasukan ditambahkan')
      setIsOpen(false)
      form.reset()
      setSelectedFile(null)
    },
    onError: (err: any) => toast.error(err.message)
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: KasMasukFormValues }) => keuanganService.updateIncome(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] })
      toast.success('Pemasukan diupdate')
      setIsOpen(false)
      setEditingId(null)
      form.reset()
      setSelectedFile(null)
    },
    onError: (err: any) => toast.error(err.message)
  })

  const deleteMutation = useMutation({
    mutationFn: keuanganService.deleteIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] })
      toast.success('Pemasukan dihapus')
    }
  })

  const onSubmit = async (data: KasMasukFormValues) => {
    let finalBukti = data.bukti_transfer

    if (selectedFile) {
      try {
        setIsUploading(true)
        const url = await storageService.uploadFile('transfer', selectedFile)
        finalBukti = url
      } catch (error: any) {
        toast.error(error.message)
        setIsUploading(false)
        return
      } finally {
        setIsUploading(false)
      }
    }

    const finalData = { ...data, bukti_transfer: finalBukti }

    if (editingId) updateMutation.mutate({ id: editingId, data: finalData })
    else createMutation.mutate(finalData)
  }

  const openCreateDialog = () => {
    setEditingId(null)
    setSelectedFile(null)
    form.reset({ category_id: categories?.[0]?.id || '', nama_donatur: '', jenis_donatur: 'Warga', nominal: 0, tanggal: new Date().toISOString().split('T')[0], metode_pembayaran: 'Tunai', status: 'verified', keterangan: '', bukti_transfer: '' })
    setIsOpen(true)
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kas Masuk</h2>
          <p className="text-muted-foreground">Kelola pencatatan donasi dan pemasukan</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Pemasukan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Pemasukan' : 'Tambah Pemasukan'}</DialogTitle>
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
                  <Label>Nama Donatur/Sumber</Label>
                  <Input {...form.register('nama_donatur')} />
                </div>
                <div className="space-y-2">
                  <Label>Jenis Donatur</Label>
                  <Select onValueChange={(val) => form.setValue('jenis_donatur', val as any)} defaultValue={form.getValues('jenis_donatur')}>
                    <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Warga">Warga</SelectItem>
                      <SelectItem value="Perusahaan">Perusahaan</SelectItem>
                      <SelectItem value="Sponsor">Sponsor</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input type="date" {...form.register('tanggal')} />
                </div>
                <div className="space-y-2">
                  <Label>Metode Pembayaran</Label>
                  <Input {...form.register('metode_pembayaran')} placeholder="Tunai / Transfer BCA" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Keterangan</Label>
                <Input {...form.register('keterangan')} />
              </div>

              <div className="space-y-2">
                <Label>Bukti Transfer / Pembayaran (Opsional)</Label>
                <Input type="file" accept="image/*,application/pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                {form.watch('bukti_transfer') && !selectedFile && <p className="text-xs text-muted-foreground mt-1">Sudah ada bukti terlampir.</p>}
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
              <TableHead>Donatur</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-4">Memuat...</TableCell></TableRow>
            ) : income?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>{item.income_categories?.nama}</TableCell>
                <TableCell>{item.nama_donatur}</TableCell>
                <TableCell className="font-medium text-green-600">Rp {item.nominal.toLocaleString('id-ID')}</TableCell>
                <TableCell>{item.metode_pembayaran}</TableCell>
                <TableCell className="text-right space-x-2">
                  {profile?.role === 'admin' && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingId(item.id)
                        form.reset({ category_id: item.category_id, nama_donatur: item.nama_donatur, jenis_donatur: item.jenis_donatur as any, nominal: item.nominal, tanggal: item.tanggal, metode_pembayaran: item.metode_pembayaran, status: item.status as any, keterangan: item.keterangan || '' })
                        setIsOpen(true)
                      }}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                        if (window.confirm('Hapus pemasukan ini?')) deleteMutation.mutate(item.id)
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
