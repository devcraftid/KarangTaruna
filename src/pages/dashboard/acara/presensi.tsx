// @ts-nocheck
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { CheckSquare, ScanLine, Loader2, UserCheck, Clock } from 'lucide-react'
import type { Event, EventAttendance } from '@/types'

export default function PresensiEvent() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [attendances, setAttendances] = useState<EventAttendance[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [memberId, setMemberId] = useState('')

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedEventId) {
      fetchAttendances(selectedEventId)
    } else {
      setAttendances([])
    }
  }, [selectedEventId])

  const fetchInitialData = async () => {
    setFetching(true)
    try {
      const [eventsRes, membersRes] = await Promise.all([
        supabase.from('events').select('*').in('status', ['published', 'ongoing']).order('tanggal_mulai', { ascending: false }),
        supabase.from('members').select('id, nama, nomor_anggota').order('nama')
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

  const fetchAttendances = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_attendances')
        .select('*, members(nama)')
        .eq('event_id', eventId)
        .order('waktu_check_in', { ascending: false })
        
      if (error) throw error
      if (data) setAttendances(data)
    } catch (error) {
      console.error('Error fetching attendances:', error)
    }
  }

  const handleManualCheckIn = async () => {
    if (!selectedEventId || !memberId) return
    handleCheckIn(memberId, 'manual')
  }

  const handleSimulateQR = () => {
    if (!selectedEventId) {
       alert("Pilih acara terlebih dahulu")
       return
    }
    // Simulate finding a random member
    const randomMember = members[Math.floor(Math.random() * members.length)]
    if (randomMember) {
      alert(`Simulasi Scan QR Sukses untuk: ${randomMember.nama}`)
      handleCheckIn(randomMember.id, 'qr')
    }
  }

  const handleCheckIn = async (memId: string, metode: string) => {
    setLoading(true)
    try {
      // Check if already checked in
      const existing = attendances.find(a => a.member_id === memId)
      if (existing) {
        alert('Anggota ini sudah melakukan check-in pada acara ini.')
        return
      }

      const { data, error } = await supabase
        .from('event_attendances')
        .insert([{
          event_id: selectedEventId,
          member_id: memId,
          metode_check_in: metode
        }])
        .select('*, members(nama)')
        
      if (error) {
        if (error.code === '23505') { // Unique violation
           alert('Anggota ini sudah terdaftar check-in (dari perangkat lain).')
        } else {
           throw error
        }
      }
      if (data) {
        setAttendances([data[0], ...attendances])
        setMemberId('')
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CheckSquare className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Presensi Event</h1>
          <p className="text-muted-foreground">Sistem check-in panitia dan peserta acara.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        <div className="w-full lg:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acara Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger><SelectValue placeholder="Pilih Acara yang Sedang Berjalan" /></SelectTrigger>
                <SelectContent>
                  {events.length === 0 && <SelectItem value="none" disabled>Tidak ada acara aktif</SelectItem>}
                  {events.map(e => <SelectItem key={e.id} value={e.id}>{e.nama_acara}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ScanLine className="w-5 h-5" /> QR Scanner</CardTitle>
              <CardDescription>Arahkan kamera ke QR Code di KTA.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-full aspect-square bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center mb-4 relative overflow-hidden group">
                 <div className="text-center p-4">
                    <ScanLine className="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">Kamera tidak aktif</p>
                 </div>
                 {/* Simulate Scanner Beam */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 shadow-[0_0_10px_theme('colors.primary.DEFAULT')] hidden group-hover:block animate-scan"></div>
              </div>
              <Button onClick={handleSimulateQR} variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/5">
                Simulasi Scan QR
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Check-in Manual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pilih Nama</Label>
                <Select value={memberId} onValueChange={setMemberId}>
                  <SelectTrigger><SelectValue placeholder="Cari Nama Anggota..." /></SelectTrigger>
                  <SelectContent>
                    {members.map(m => <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleManualCheckIn} disabled={loading || !memberId || !selectedEventId} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserCheck className="w-4 h-4 mr-2" />}
                Catat Kehadiran
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Log Kehadiran</CardTitle>
              <CardDescription>
                {attendances.length} orang telah hadir
              </CardDescription>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
              {attendances.length}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Peserta</TableHead>
                  <TableHead>Waktu Check-in</TableHead>
                  <TableHead>Metode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!selectedEventId ? (
                   <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">Pilih acara terlebih dahulu.</TableCell></TableRow>
                ) : attendances.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">Belum ada peserta yang check-in.</TableCell></TableRow>
                ) : attendances.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-semibold">{a.members?.nama}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                        {new Date(a.waktu_check_in).toLocaleTimeString('id-ID')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase
                        ${a.metode_check_in === 'qr' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                        {a.metode_check_in}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}} />
    </div>
  )
}
