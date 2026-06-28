import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lombaService, Lomba } from '@/services/lombaService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { lombaSchema, LombaFormValues } from '@/lib/validations'
import toast, { Toaster } from 'react-hot-toast'

export default function LombaPage() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: competitions, isLoading, error } = useQuery({
    queryKey: ['competitions'],
    queryFn: lombaService.getCompetitions
  })

  const form = useForm<LombaFormValues>({
    resolver: zodResolver(lombaSchema),
    defaultValues: {
      nama_lomba: '', kategori: '', lokasi: '', tanggal: '', jam: '', maksimal_peserta: 10, status: 'draft', deskripsi: ''
    }
  })

  const createMutation = useMutation({
    mutationFn: lombaService.createCompetition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      toast.success('Lomba berhasil ditambahkan')
      setIsOpen(false)
      form.reset()
    },
    onError: (err: any) => toast.error(err.message || 'Gagal menambah lomba')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: LombaFormValues }) => lombaService.updateCompetition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      toast.success('Lomba berhasil diupdate')
      setIsOpen(false)
      setEditingId(null)
      form.reset()
    },
    onError: (err: any) => toast.error(err.message || 'Gagal mengupdate lomba')
  })

  const deleteMutation = useMutation({
    mutationFn: lombaService.deleteCompetition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      toast.success('Lomba berhasil dihapus')
    },
    onError: (err: any) => toast.error(err.message || 'Gagal menghapus lomba')
  })

  const onSubmit = (data: LombaFormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (lomba: Lomba) => {
    setEditingId(lomba.id)
    form.reset({
      nama_lomba: lomba.nama_lomba,
      kategori: lomba.kategori,
      lokasi: lomba.lokasi,
      tanggal: lomba.tanggal,
      jam: lomba.jam,
      maksimal_peserta: lomba.maksimal_peserta,
      status: lomba.status,
      deskripsi: lomba.deskripsi || '',
      pemenang: lomba.pemenang || ''
    })
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus lomba ini? Pendaftaran yang terkait juga akan terhapus.')) {
      deleteMutation.mutate(id)
    }
  }

  const openCreateDialog = () => {
    setEditingId(null)
    form.reset({ nama_lomba: '', kategori: '', lokasi: '', tanggal: '', jam: '', maksimal_peserta: 10, status: 'draft', deskripsi: '', pemenang: '' })
    setIsOpen(true)
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Lomba</h2>
          <p className="text-muted-foreground">Kelola agenda perlombaan 17 Agustus</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Lomba
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Lomba' : 'Tambah Lomba Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nama Lomba</Label>
                <Input {...form.register('nama_lomba')} placeholder="Contoh: Balap Karung" />
                {form.formState.errors.nama_lomba && <p className="text-sm text-destructive">{form.formState.errors.nama_lomba.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Input {...form.register('kategori')} placeholder="Anak-anak / Dewasa" />
                  {form.formState.errors.kategori && <p className="text-sm text-destructive">{form.formState.errors.kategori.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Lokasi</Label>
                  <Input {...form.register('lokasi')} placeholder="Lapangan RT 01" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input type="date" {...form.register('tanggal')} />
                </div>
                <div className="space-y-2">
                  <Label>Jam</Label>
                  <Input type="time" {...form.register('jam')} />
                </div>
                <div className="space-y-2">
                  <Label>Maksimal Peserta</Label>
                  <Input type="number" {...form.register('maksimal_peserta')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status Lomba</Label>
                <Select 
                  onValueChange={(val) => form.setValue('status', val as 'draft' | 'published' | 'completed')}
                  defaultValue={form.getValues('status')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Belum Dibuka)</SelectItem>
                    <SelectItem value="published">Published (Buka Pendaftaran)</SelectItem>
                    <SelectItem value="completed">Completed (Selesai)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.watch('status') === 'completed' && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                  <Label>Pemenang Lomba (Opsional)</Label>
                  <Input {...form.register('pemenang')} placeholder="Contoh: Juara 1: Budi, Juara 2: Ani" />
                </div>
              )}

              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Simpan Perubahan' : 'Tambah Lomba'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border rounded-xl shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">Gagal memuat data lomba.</div>
        ) : competitions?.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-lg font-semibold">Belum ada perlombaan</h3>
            <p className="text-muted-foreground mt-2">Mulai tambahkan perlombaan baru.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Lomba</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Kuota</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitions?.map((lomba) => (
                <TableRow key={lomba.id}>
                  <TableCell className="font-medium">{lomba.nama_lomba}</TableCell>
                  <TableCell>{lomba.kategori}</TableCell>
                  <TableCell>{new Date(lomba.tanggal).toLocaleDateString('id-ID')} {lomba.jam}</TableCell>
                  <TableCell>{lomba.maksimal_peserta} Orang</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${lomba.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : lomba.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 'bg-gray-100 text-gray-700 dark:bg-gray-800'}`}>
                      {lomba.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(lomba)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(lomba.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
