import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/services/eventService'
import type { Event } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit2, Trash2, Calendar, Activity } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import toast, { Toaster } from 'react-hot-toast'

export default function Events() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  
  const [formData, setFormData] = useState({
    nama_acara: '',
    deskripsi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    is_active: true
  })

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents
  })

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Acara berhasil ditambahkan')
      setIsOpen(false)
      resetForm()
    },
    onError: (err: any) => toast.error(err.message || 'Gagal menambah acara')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Event> }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Acara berhasil diupdate')
      setIsOpen(false)
      setEditingEvent(null)
      resetForm()
    },
    onError: (err: any) => toast.error(err.message || 'Gagal mengupdate acara')
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Acara berhasil dihapus')
    },
    onError: (err: any) => toast.error(err.message || 'Gagal menghapus acara')
  })

  const resetForm = () => {
    setFormData({
      nama_acara: '',
      deskripsi: '',
      tanggal_mulai: '',
      tanggal_selesai: '',
      is_active: true
    })
    setEditingEvent(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      nama_acara: event.nama_acara,
      deskripsi: event.deskripsi || '',
      tanggal_mulai: event.tanggal_mulai,
      tanggal_selesai: event.tanggal_selesai,
      is_active: event.is_active
    })
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus acara ini? Data terkait keuangan acara ini mungkin akan kehilangan referensinya.')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Acara & Kepanitiaan</h2>
          <p className="text-muted-foreground">Kelola daftar acara untuk pelaporan keuangan terpisah</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tambah Acara
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Acara' : 'Tambah Acara Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nama Acara</Label>
                <Input 
                  required 
                  value={formData.nama_acara}
                  onChange={(e) => setFormData({...formData, nama_acara: e.target.value})}
                  placeholder="Misal: HUT RI ke-81 Tahun 2026" 
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi Acara</Label>
                <Input 
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                  placeholder="Keterangan singkat acara..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Input 
                    type="date" 
                    required 
                    value={formData.tanggal_mulai}
                    onChange={(e) => setFormData({...formData, tanggal_mulai: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Selesai</Label>
                  <Input 
                    type="date" 
                    required 
                    value={formData.tanggal_selesai}
                    onChange={(e) => setFormData({...formData, tanggal_selesai: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  id="is_active" 
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={formData.is_active} 
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})} 
                />
                <Label htmlFor="is_active" className="cursor-pointer">Acara Sedang Berjalan (Active)</Label>
              </div>
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingEvent ? 'Simpan Perubahan' : 'Tambah Acara'}
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
          <div className="p-8 text-center text-destructive">Gagal memuat acara.</div>
        ) : events?.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-lg font-semibold">Belum ada acara</h3>
            <p className="text-muted-foreground mt-2">Mulai buat acara pertama Anda.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Acara</TableHead>
                <TableHead>Tanggal Pelaksanaan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events?.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    {event.nama_acara}
                    {event.deskripsi && <p className="text-xs text-muted-foreground mt-1">{event.deskripsi}</p>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      {new Date(event.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(event.tanggal_selesai).toLocaleDateString('id-ID')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.is_active ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Activity className="w-3 h-3 mr-1" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        Selesai
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(event.id)}>
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
