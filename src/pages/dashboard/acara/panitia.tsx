import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { Users, Plus, Loader2, Trash2 } from 'lucide-react'
import type { Event, EventCommittee } from '@/types'

export default function Kepanitiaan() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [committees, setCommittees] = useState<EventCommittee[]>([])
  const [members, setMembers] = useState<any[]>([])
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [formData, setFormData] = useState({
    member_id: '',
    divisi: '',
    jabatan: '',
    tugas: ''
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedEventId) {
      fetchCommittees(selectedEventId)
    } else {
      setCommittees([])
    }
  }, [selectedEventId])

  const fetchInitialData = async () => {
    setFetching(true)
    try {
      const [eventsRes, membersRes] = await Promise.all([
        supabase.from('events').select('*').order('tanggal_mulai', { ascending: false }),
        supabase.from('members').select('id, nama').eq('status_keanggotaan', 'aktif').order('nama')
      ])
      
      if (eventsRes.data) {
        setEvents(eventsRes.data)
        if (eventsRes.data.length > 0) setSelectedEventId(eventsRes.data[0].id)
      }
      if (membersRes.data) setMembers(membersRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setFetching(false)
    }
  }

  const fetchCommittees = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_committees')
        .select('*, members(nama)')
        .eq('event_id', eventId)
        
      if (error) throw error
      if (data) setCommittees(data)
    } catch (error) {
      console.error('Error fetching committees:', error)
    }
  }

  const handleAdd = async () => {
    if (!selectedEventId || !formData.member_id || !formData.divisi || !formData.jabatan) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('event_committees')
        .insert([{
          event_id: selectedEventId,
          ...formData
        }])
        .select('*, members(nama)')
        
      if (error) throw error
      if (data) setCommittees([...committees, data[0]])
      setFormData({ member_id: '', divisi: '', jabatan: '', tugas: '' })
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus panitia ini?')) return
    try {
      const { error } = await supabase.from('event_committees').delete().eq('id', id)
      if (error) throw error
      setCommittees(committees.filter(c => c.id !== id))
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (fetching) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kepanitiaan & Volunteer</h1>
          <p className="text-muted-foreground">Delegasi tugas panitia untuk setiap acara.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Form Tambah Panitia */}
        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle>Tambah Panitia</CardTitle>
            <CardDescription>Pilih anggota dan berikan tugas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pilih Acara</Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger><SelectValue placeholder="Pilih Acara" /></SelectTrigger>
                <SelectContent>
                  {events.map(e => <SelectItem key={e.id} value={e.id}>{e.nama_acara}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Pilih Anggota</Label>
              <Select value={formData.member_id} onValueChange={v => setFormData({...formData, member_id: v})}>
                <SelectTrigger><SelectValue placeholder="Pilih Anggota Aktif" /></SelectTrigger>
                <SelectContent>
                  {members.map(m => <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Divisi/Seksi</Label>
                <Select value={formData.divisi} onValueChange={v => setFormData({...formData, divisi: v})}>
                  <SelectTrigger><SelectValue placeholder="Divisi" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Acara">Acara</SelectItem>
                    <SelectItem value="Humas">Humas</SelectItem>
                    <SelectItem value="Konsumsi">Konsumsi</SelectItem>
                    <SelectItem value="Perlengkapan">Perlengkapan</SelectItem>
                    <SelectItem value="Pubdok">Pubdok</SelectItem>
                    <SelectItem value="Keamanan">Keamanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jabatan</Label>
                <Select value={formData.jabatan} onValueChange={v => setFormData({...formData, jabatan: v})}>
                  <SelectTrigger><SelectValue placeholder="Jabatan" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ketua">Ketua</SelectItem>
                    <SelectItem value="Wakil Ketua">Wakil</SelectItem>
                    <SelectItem value="Koordinator">Koord.</SelectItem>
                    <SelectItem value="Anggota">Anggota</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi Tugas Pokok (Opsional)</Label>
              <Input value={formData.tugas} onChange={e => setFormData({...formData, tugas: e.target.value})} placeholder="Menyiapkan sound system..." />
            </div>

            <Button onClick={handleAdd} disabled={loading || !selectedEventId} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Tambahkan
            </Button>
          </CardContent>
        </Card>

        {/* Tabel Daftar Panitia */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Susunan Panitia</CardTitle>
            <CardDescription>
              {events.find(e => e.id === selectedEventId)?.nama_acara || 'Pilih acara terlebih dahulu'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Anggota</TableHead>
                  <TableHead>Divisi</TableHead>
                  <TableHead>Jabatan</TableHead>
                  <TableHead>Tugas Pokok</TableHead>
                  <TableHead className="w-[80px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!selectedEventId ? (
                   <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Pilih acara untuk melihat susunan panitia.</TableCell></TableRow>
                ) : committees.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Belum ada panitia untuk acara ini.</TableCell></TableRow>
                ) : committees.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold">{c.members?.nama}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-slate-100 rounded-full text-xs font-medium">{c.divisi}</span>
                    </TableCell>
                    <TableCell className="font-medium">{c.jabatan}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.tugas || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={() => handleDelete(c.id)}>
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
    </div>
  )
}
