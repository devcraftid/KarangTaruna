import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Calendar as CalendarIcon, Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import toast from 'react-hot-toast'
import { WorkProgram } from '@/types'

export default function Proker() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    nama_program: '',
    deskripsi: '',
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_selesai: new Date().toISOString().split('T')[0],
    penanggung_jawab: '',
    status: 'planned'
  })

  const { data: proker, isLoading } = useQuery({
    queryKey: ['proker'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_programs').select('*').order('tanggal_mulai', { ascending: true })
      if (error) throw error
      return data as WorkProgram[]
    }
  })

  const saveMutation = useMutation({
    mutationFn: async (newData: any) => {
      const { error } = await supabase.from('work_programs').insert([newData])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proker'] })
      toast.success('Program kerja berhasil ditambahkan')
      setIsOpen(false)
      setFormData({
        nama_program: '', deskripsi: '',
        tanggal_mulai: new Date().toISOString().split('T')[0],
        tanggal_selesai: new Date().toISOString().split('T')[0],
        penanggung_jawab: '', status: 'planned'
      })
    },
    onError: (error) => toast.error('Gagal menyimpan proker: ' + error.message)
  })

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase.from('work_programs').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proker'] })
      toast.success('Status berhasil diperbarui')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('work_programs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proker'] })
      toast.success('Program kerja dihapus')
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Program Kerja (Proker)
          </h1>
          <p className="text-muted-foreground">Jadwal kegiatan dan program kerja Karang Taruna</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={(val) => {
          setIsOpen(val)
          if (!val) {
            setFormData({
              nama_program: '', deskripsi: '',
              tanggal_mulai: new Date().toISOString().split('T')[0],
              tanggal_selesai: new Date().toISOString().split('T')[0],
              penanggung_jawab: '', status: 'planned'
            })
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Tambah Proker</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Program Kerja</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData) }} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nama Program</Label>
                <Input required value={formData.nama_program} onChange={e => setFormData({...formData, nama_program: e.target.value})} placeholder="Rapat Bulanan" />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Input value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mulai</Label>
                  <Input type="date" required value={formData.tanggal_mulai} onChange={e => setFormData({...formData, tanggal_mulai: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Selesai</Label>
                  <Input type="date" required value={formData.tanggal_selesai} onChange={e => setFormData({...formData, tanggal_selesai: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Penanggung Jawab (PJ)</Label>
                <Input value={formData.penanggung_jawab} onChange={e => setFormData({...formData, penanggung_jawab: e.target.value})} />
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
              <TableHead>Nama Program</TableHead>
              <TableHead>Tgl Mulai</TableHead>
              <TableHead>Tgl Selesai</TableHead>
              <TableHead>PJ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : proker?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Belum ada program kerja</TableCell></TableRow>
            ) : (
              proker?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nama_program}</TableCell>
                  <TableCell>{new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{new Date(item.tanggal_selesai).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{item.penanggung_jawab || '-'}</TableCell>
                  <TableCell>
                    <Select value={item.status} onValueChange={(val) => statusMutation.mutate({ id: item.id, status: val })}>
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Direncanakan</SelectItem>
                        <SelectItem value="ongoing">Sedang Berjalan</SelectItem>
                        <SelectItem value="completed">Selesai</SelectItem>
                        <SelectItem value="cancelled">Batal</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { if(confirm('Hapus proker?')) deleteMutation.mutate(item.id) }}>
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
