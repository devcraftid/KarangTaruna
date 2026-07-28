// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { Award, Loader2, Printer, CheckSquare } from 'lucide-react'
import type { Event, EventCommittee, EventAttendance } from '@/types'

export default function SertifikatDigital() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  
  // Tabs for switching between Committees (Panitia) and Attendees (Peserta)
  const [viewMode, setViewMode] = useState<'panitia' | 'peserta'>('panitia')
  const [committees, setCommittees] = useState<EventCommittee[]>([])
  const [attendances, setAttendances] = useState<EventAttendance[]>([])
  
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedEventId) {
      if (viewMode === 'panitia') fetchCommittees(selectedEventId)
      else fetchAttendances(selectedEventId)
    } else {
      setCommittees([])
      setAttendances([])
    }
  }, [selectedEventId, viewMode])

  const fetchInitialData = async () => {
    setFetching(true)
    try {
      const { data, error } = await supabase.from('events').select('*').in('status', ['published', 'ongoing', 'completed']).order('tanggal_mulai', { ascending: false })
      if (error) throw error
      if (data) {
        setEvents(data)
        if (data.length > 0) setSelectedEventId(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setFetching(false)
    }
  }

  const fetchCommittees = async (eventId: string) => {
    setFetching(true)
    try {
      const { data, error } = await supabase
        .from('event_committees')
        .select('*, members(nama)')
        .eq('event_id', eventId)
      if (error) throw error
      if (data) setCommittees(data)
    } catch (error) {
      console.error(error)
    } finally {
      setFetching(false)
    }
  }

  const fetchAttendances = async (eventId: string) => {
    setFetching(true)
    try {
      const { data, error } = await supabase
        .from('event_attendances')
        .select('*, members(nama)')
        .eq('event_id', eventId)
      if (error) throw error
      if (data) setAttendances(data)
    } catch (error) {
      console.error(error)
    } finally {
      setFetching(false)
    }
  }

  const handlePrintAll = () => {
    window.print()
  }

  const selectedEvent = events.find(e => e.id === selectedEventId)

  if (fetching && events.length === 0) {
    return <div className="flex justify-center p-4 md:p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sertifikat Digital</h1>
            <p className="text-muted-foreground">Generator E-Sertifikat Panitia & Peserta.</p>
          </div>
        </div>
        <Button onClick={handlePrintAll} disabled={!selectedEventId}>
          <Printer className="mr-2 h-4 w-4" /> Cetak Semua PDF
        </Button>
      </div>

      <Card className="print:hidden">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pilih Acara</Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger><SelectValue placeholder="Pilih Acara..." /></SelectTrigger>
                <SelectContent>
                  {events.map(e => <SelectItem key={e.id} value={e.id}>{e.nama_acara}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kategori Penerima</Label>
              <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="panitia">Panitia Penyelenggara</SelectItem>
                  <SelectItem value="peserta">Peserta Acara (Hadir)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-slate-100 border p-4 rounded-xl print:hidden overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
        <div className="mb-4 flex items-center justify-between">
           <h3 className="font-semibold">Pratinjau Daftar Penerima</h3>
           <span className="text-sm text-muted-foreground">
             Total: {viewMode === 'panitia' ? committees.length : attendances.length} Sertifikat
           </span>
        </div>
        <Table className="bg-white rounded-lg overflow-hidden border">
          <TableHeader>
            <TableRow>
              <TableHead>Nama Penerima</TableHead>
              <TableHead>Sebagai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {viewMode === 'panitia' ? (
              committees.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.members?.nama}</TableCell>
                  <TableCell>Panitia - {c.jabatan} {c.divisi}</TableCell>
                </TableRow>
              ))
            ) : (
              attendances.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.members?.nama}</TableCell>
                  <TableCell>Peserta Acara</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* PRINT TEMPLATE SECTION */}
      {selectedEvent && (
        <div id="print-section" className="hidden print:block w-full">
          {viewMode === 'panitia' ? (
            committees.map(c => (
              <CertificateTemplate 
                key={c.id} 
                nama={c.members?.nama || ''} 
                sebagai={`Panitia (${c.jabatan} ${c.divisi})`} 
                acara={selectedEvent.nama_acara} 
                tanggal={new Date(selectedEvent.tanggal_mulai).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              />
            ))
          ) : (
            attendances.map(a => (
              <CertificateTemplate 
                key={a.id} 
                nama={a.members?.nama || ''} 
                sebagai="Peserta" 
                acara={selectedEvent.nama_acara} 
                tanggal={new Date(selectedEvent.tanggal_mulai).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              />
            ))
          )}
        </div>
      )}

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: landscape; margin: 0; }
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section {
            position: absolute;
            left: 0; top: 0;
            width: 100%;
          }
          .cert-page {
            width: 297mm;
            height: 209mm;
            page-break-after: always;
            position: relative;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      `}} />
    </div>
  )
}

function CertificateTemplate({ nama, sebagai, acara, tanggal }: { nama: string, sebagai: string, acara: string, tanggal: string }) {
  return (
    <div className="cert-page relative overflow-hidden bg-white text-center w-full aspect-[1.414/1] md:w-[297mm] md:h-[210mm] p-[20mm] border-[10px] border-[#1e3a8a] shadow-lg mb-8 mx-auto print:mb-0 print:border-none print:shadow-none font-serif">
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-amber-500"></div>
      <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-amber-500"></div>
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-amber-500"></div>
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-amber-500"></div>
      
      <div className="flex flex-col items-center justify-center h-full space-y-8">
        <div>
          <h1 className="text-5xl font-bold tracking-widest text-slate-800 uppercase mb-2">Sertifikat Penghargaan</h1>
          <p className="text-lg text-slate-500 tracking-wider">Diberikan Oleh Karang Taruna</p>
        </div>

        <div className="w-full">
          <p className="text-xl text-slate-600 mb-4 italic">Diberikan kepada:</p>
          <h2 className="text-6xl font-bold text-[#1e3a8a] mb-6 border-b-2 border-amber-500 inline-block px-12 pb-2">
            {nama}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-2xl text-slate-700">
            Atas partisipasi dan dedikasinya sebagai <strong className="text-amber-600">{sebagai}</strong>
          </p>
          <p className="text-2xl text-slate-700">
            pada penyelenggaraan acara:
          </p>
          <h3 className="text-4xl font-bold text-slate-800">{acara}</h3>
        </div>

        <div className="absolute bottom-[20mm] left-0 w-full flex justify-around items-end">
          <div className="text-center">
            <p className="text-lg text-slate-600 mb-16">{tanggal}</p>
            <div className="w-48 border-b border-slate-800 mb-2"></div>
            <p className="font-bold text-lg">Ketua Karang Taruna</p>
          </div>
          <div className="text-center">
            <div className="w-32 h-32 rounded-full border-4 border-amber-500 flex items-center justify-center text-amber-600 rotate-12 mb-8">
              <span className="font-bold text-2xl uppercase text-center leading-tight">Official<br/>Seal</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg text-slate-600 mb-16">Mengetahui</p>
            <div className="w-48 border-b border-slate-800 mb-2"></div>
            <p className="font-bold text-lg">Ketua Panitia Acara</p>
          </div>
        </div>
      </div>
    </div>
  )
}
