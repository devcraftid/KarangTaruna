// @ts-nocheck
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { Calendar, Plus, Loader2, Trash2, Edit2, Activity } from 'lucide-react'
import type { Event } from '@/types'
import { useAuth } from '@/context/AuthContext'

export default function Events() {
  const { profile } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const [formData, setFormData] = useState({
    nama_acara: '',
    deskripsi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    lokasi: '',
    status: 'draft'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setFetching(true)
    try {
      const { data, error } = await supabase.from('events').select('*').order('tanggal_mulai', { ascending: false })
      if (error) throw error
      if (data) setEvents(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async () => {
    if (!formData.nama_acara || !formData.tanggal_mulai || !formData.lokasi) return
    setLoading(true)
    try {
      if (editingEvent) {
        const { data, error } = await supabase.from('events').update(formData).eq('id', editingEvent.id).select()
        if (error) throw error
        setEvents(events.map(e => e.id === editingEvent.id ? data[0] : e))
      } else {
        const { data, error } = await supabase.from('events').insert([{...formData, created_by: profile?.id}]).select()
        if (error) throw error
        if (data) setEvents([data[0], ...events])
      }
      setIsOpen(false)
      resetForm()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus acara ini?')) return
    try {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw error
      setEvents(events.filter(e => e.id !== id))
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      nama_acara: event.nama_acara,
      deskripsi: event.deskripsi || '',
      tanggal_mulai: event.tanggal_mulai.split('T')[0],
      tanggal_selesai: event.tanggal_selesai.split('T')[0],
      lokasi: event.lokasi,
      status: event.status
    })
    setIsOpen(true)
  }

  const resetForm = () => {
    setFormData({ nama_acara: '', deskripsi: '', tanggal_mulai: '', tanggal_selesai: '', lokasi: '', status: 'draft' })
    setEditingEvent(null)
  }

  if (fetching) {
    return <div className="flex justify-center p-4 md:p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manajemen Acara</h1>
            <p className="text-muted-foreground">Kelola daftar acara dan event organisasi.</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Tambah Acara</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Acara' : 'Tambah Acara Baru'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nama Acara</Label>
                <Input value={formData.nama_acara} onChange={e => setFormData({...formData, nama_acara: e.target.value})} placeholder="Pentas Seni 17-an" />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi Acara</Label>
                <Input value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Lokasi</Label>
                <Input value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} placeholder="Lapangan Utama" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Input type="date" value={formData.tanggal_mulai} onChange={e => setFormData({...formData, tanggal_mulai: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Selesai</Label>
                  <Input type="date" value={formData.tanggal_selesai} onChange={e => setFormData({...formData, tanggal_selesai: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Perencanaan)</SelectItem>
                    <SelectItem value="published">Published (Dipublikasi)</SelectItem>
                    <SelectItem value="ongoing">Ongoing (Sedang Berjalan)</SelectItem>
                    <SelectItem value="completed">Completed (Selesai)</SelectItem>
                    <SelectItem value="cancelled">Cancelled (Dibatalkan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Simpan
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
                <TableHead>Nama Acara</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Tanggal Pelaksanaan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Belum ada daftar acara.</TableCell></TableRow>
              ) : events.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-semibold">
                    {e.nama_acara}
                    {e.deskripsi && <p className="text-xs text-muted-foreground font-normal">{e.deskripsi}</p>}
                  </TableCell>
                  <TableCell>{e.lokasi}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(e.tanggal_mulai).toLocaleDateString('id-ID')}
                    {e.tanggal_mulai !== e.tanggal_selesai && ` - ${new Date(e.tanggal_selesai).toLocaleDateString('id-ID')}`}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full uppercase
                      ${e.status === 'completed' ? 'bg-green-100 text-green-700' :
                        e.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                        e.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                      {e.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(e)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(e.id)}><Trash2 className="w-4 h-4" /></Button>
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
