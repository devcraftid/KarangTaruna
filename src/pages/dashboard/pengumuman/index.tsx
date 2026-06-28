import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pengumumanService } from '@/services/pengumumanService'
import { storageService } from '@/services/storageService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pengumumanSchema, PengumumanFormValues } from '@/lib/validations'
import toast, { Toaster } from 'react-hot-toast'

export default function Pengumuman() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: pengumumanService.getPengumuman
  })

  const form = useForm<PengumumanFormValues>({
    resolver: zodResolver(pengumumanSchema),
    defaultValues: { judul: '', isi: '', gambar: '' }
  })

  const createMutation = useMutation({
    mutationFn: pengumumanService.createPengumuman,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Pengumuman ditambahkan')
      setIsOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: PengumumanFormValues }) => pengumumanService.updatePengumuman(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Pengumuman diupdate')
      setIsOpen(false)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: pengumumanService.deletePengumuman,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Pengumuman dihapus')
    }
  })

  const onSubmit = async (data: PengumumanFormValues) => {
    let finalGambar = data.gambar

    if (selectedFile) {
      try {
        setIsUploading(true)
        const url = await storageService.uploadFile('news', selectedFile)
        finalGambar = url
      } catch (error: any) {
        toast.error(error.message)
        setIsUploading(false)
        return
      } finally {
        setIsUploading(false)
      }
    }

    const finalData = { ...data, gambar: finalGambar }

    if (editingId) updateMutation.mutate({ id: editingId, data: finalData })
    else createMutation.mutate(finalData)
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pengumuman</h2>
          <p className="text-muted-foreground">Kelola pengumuman untuk warga</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setSelectedFile(null); form.reset({ judul: '', isi: '', gambar: '' }); setIsOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Tambah
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Edit Pengumuman' : 'Tambah Pengumuman'}</DialogTitle></DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input {...form.register('judul')} />
              </div>
              <div className="space-y-2">
                <Label>Isi Pengumuman</Label>
                <textarea 
                  {...form.register('isi')} 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Gambar Lampiran (Opsional)</Label>
                <Input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                {form.watch('gambar') && !selectedFile && <p className="text-xs text-muted-foreground mt-1">Sudah ada gambar terlampir.</p>}
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
              <TableHead>Judul</TableHead>
              <TableHead>Isi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-4">Memuat...</TableCell></TableRow>
            ) : announcements?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="w-[150px]">{new Date(item.created_at).toLocaleDateString('id-ID')}</TableCell>
                <TableCell className="font-medium">{item.judul}</TableCell>
                <TableCell className="truncate max-w-[300px]">{item.isi}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => {
                    setEditingId(item.id)
                    form.reset({ judul: item.judul, isi: item.isi, gambar: item.gambar || '' })
                    setIsOpen(true)
                  }}><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                    if (window.confirm('Hapus pengumuman ini?')) deleteMutation.mutate(item.id)
                  }}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
