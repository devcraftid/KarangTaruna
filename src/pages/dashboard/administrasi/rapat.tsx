// @ts-nocheck
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from '@/lib/supabase'
import { ClipboardList, Plus, Loader2, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/context/AuthContext'

export default function Rapat() {
  const { profile } = useAuth()
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const [formData, setFormData] = useState({
    judul_rapat: '',
    tanggal: '',
    lokasi: '',
    agenda: '',
    notulen_hasil: '',
    dokumentasi_url: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setFetching(true)
    try {
      const { data, error } = await supabase.from('meetings').select('*').order('tanggal', { ascending: false })
      if (error) throw error
      if (data) setMeetings(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleAdd = async () => {
    if (!formData.judul_rapat || !formData.tanggal) return
    setLoading(true)
    try {
      const { data, error } = await supabase.from('meetings').insert([{...formData, created_by: profile?.id}]).select()
      if (error) throw error
      if (data) setMeetings([data[0], ...meetings])
      setFormData({ judul_rapat: '', tanggal: '', lokasi: '', agenda: '', notulen_hasil: '', dokumentasi_url: '' })
      setIsOpen(false)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus notulen rapat ini?')) return
    try {
      const { error } = await supabase.from('meetings').delete().eq('id', id)
      if (error) throw error
      setMeetings(meetings.filter(m => m.id !== id))
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (fetching) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda & Notulen Rapat</h1>
            <p className="text-muted-foreground">Catatan jadwal dan hasil keputusan rapat.</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Tambah Notulen</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buat Notulen Rapat</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Judul Rapat</Label>
                <Input value={formData.judul_rapat} onChange={e => setFormData({...formData, judul_rapat: e.target.value})} placeholder="Rapat Persiapan 17-an" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal & Waktu</Label>
                  <Input type="datetime-local" value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Lokasi</Label>
                  <Input value={formData.lokasi} onChange={e => setFormData({...formData, lokasi: e.target.value})} placeholder="Balai RW / Google Meet" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Agenda Utama</Label>
                <Textarea value={formData.agenda} onChange={e => setFormData({...formData, agenda: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Hasil Keputusan (Notulen)</Label>
                <Textarea rows={4} value={formData.notulen_hasil} onChange={e => setFormData({...formData, notulen_hasil: e.target.value})} placeholder="1. Disepakati bahwa..." />
              </div>
              <Button onClick={handleAdd} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Simpan Notulen
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
                <TableHead>Tanggal</TableHead>
                <TableHead>Judul Rapat</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Notulen Singkat</TableHead>
                <TableHead className="w-[80px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Belum ada catatan rapat.</TableCell></TableRow>
              ) : meetings.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap">{new Date(m.tanggal).toLocaleString('id-ID')}</TableCell>
                  <TableCell className="font-semibold">{m.judul_rapat}</TableCell>
                  <TableCell>{m.lokasi}</TableCell>
                  <TableCell className="max-w-[250px] truncate">{m.notulen_hasil || m.agenda}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
