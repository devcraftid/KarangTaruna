import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Clock, Users, Trophy, QrCode, CheckCircle2, Ticket, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSEO } from '@/hooks/useSEO'

export default function EventDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') || 'event' // 'event' or 'lomba'

  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [eventCompetitions, setEventCompetitions] = useState<any[]>([])
  const [selectedLombaForRegistration, setSelectedLombaForRegistration] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    nama_peserta: '',
    nomor_telepon: '',
    instansi: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchEventDetail()
  }, [id, type])

  const fetchEventDetail = async () => {
    try {
      setLoading(true)
      const table = type === 'lomba' ? 'competitions' : 'events'
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single()
      
      if (error) throw error
      if (data) {
        setEvent({
          id: data.id,
          title: data.nama_lomba || data.nama_acara || data.nama_event, // Fixed fallback for nama_acara
          date: data.tanggal || data.tanggal_mulai,
          time: data.jam || data.waktu,
          location: data.lokasi,
          status: data.status,
          desc: data.deskripsi,
          max_participants: data.maksimal_peserta || 0,
          kategori: data.kategori || 'Umum',
          type: type
        })

        if (type === 'event') {
          // Fetch competitions for this event
          const { data: comps } = await supabase.from('competitions').select('*').eq('event_id', id).in('status', ['published', 'completed']).order('tanggal', { ascending: true })
          if (comps) {
            setEventCompetitions(comps)
          }
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useSEO({
    title: event ? event.title : 'Memuat Event...',
    description: event ? event.desc : 'Informasi Acara Karang Taruna'
  })

  const handleSubmitRegistration = async () => {
    if (!formData.nama_peserta || !formData.nomor_telepon) {
      toast.error('Nama dan Nomor Telepon wajib diisi.')
      return
    }

    setSubmitting(true)
    try {
      const payload: any = {
        nama_peserta: formData.nama_peserta,
        nomor_telepon: formData.nomor_telepon,
        instansi: formData.instansi,
        status: 'pending',
        is_paid: false
      }
      
      if (selectedLombaForRegistration) {
        payload.competition_id = selectedLombaForRegistration.id
      } else if (type === 'lomba') {
        payload.competition_id = id
      } else {
        payload.event_id = id
      }

      const { error } = await supabase.from('registrations').insert([payload])
      
      if (error) throw error
      
      toast.success('Pendaftaran berhasil! Tiket Anda telah diterbitkan.')
      setIsRegistered(true)
      setShowRegistrationForm(false)
    } catch (error) {
      console.error(error)
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
  if (!event) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-3xl font-bold mb-2">Event Tidak Ditemukan</h2>
      <Link to="/lomba"><Button>Kembali ke Agenda</Button></Link>
    </div>
  )

  const isLomba = event.type === 'lomba'
  const primaryColor = isLomba ? 'text-orange-600' : 'text-emerald-600'
  const bgColor = isLomba ? 'bg-orange-500' : 'bg-emerald-500'
  const lightBgColor = isLomba ? 'bg-orange-100' : 'bg-emerald-100'

  return (
    <div className="bg-md-surface min-h-screen pb-20 pt-10">
      <Toaster />
      <div className="container mx-auto px-4 max-w-5xl">
        
        <Link to="/lomba" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Agenda
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border-t-8 border-t-emerald-500" style={{ borderTopColor: isLomba ? '#f97316' : '#10b981' }}>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${lightBgColor} ${primaryColor}`}>
                  {isLomba ? 'Kompetisi / Lomba' : 'Kegiatan Warga'}
                </span>
                <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Kategori: {event.kategori}
                </span>
              </div>
              
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
                {event.title}
              </h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-4">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${lightBgColor} ${primaryColor}`}>
                     <Calendar className="w-5 h-5" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Tanggal</p>
                     <p className="font-medium text-slate-900 dark:text-white">
                       {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                     </p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${lightBgColor} ${primaryColor}`}>
                     <Clock className="w-5 h-5" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Waktu</p>
                     <p className="font-medium text-slate-900 dark:text-white">
                       {event.time ? event.time.substring(0,5) : 'Tentatif'} WIB - Selesai
                     </p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${lightBgColor} ${primaryColor}`}>
                     <MapPin className="w-5 h-5" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Lokasi</p>
                     <p className="font-medium text-slate-900 dark:text-white">
                       {event.location}
                     </p>
                   </div>
                </div>
                {event.max_participants > 0 && (
                  <div className="flex items-start gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${lightBgColor} ${primaryColor}`}>
                       <Users className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Kuota</p>
                       <p className="font-medium text-slate-900 dark:text-white">
                         Maksimal {event.max_participants} Peserta
                       </p>
                     </div>
                  </div>
                )}
              </div>

              <hr className="border-slate-100 dark:border-slate-800 my-8" />

              <div>
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Deskripsi Kegiatan</h3>
                <div className="prose dark:prose-invert text-slate-600 dark:text-slate-400 max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed">{event.desc || 'Tidak ada deskripsi rinci untuk kegiatan ini.'}</p>
                </div>
              </div>

              {/* DAFTAR LOMBA LIST */}
              {type === 'event' && eventCompetitions.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-orange-500" />
                    Daftar Lomba Tersedia
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {eventCompetitions.map((lomba) => (
                      <Card key={lomba.id} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow dark:border-slate-800">
                        <CardContent className="p-5 flex flex-col h-full">
                          <div className="flex-1">
                            <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-orange-100 text-orange-600 mb-3 inline-block">
                              {lomba.kategori}
                            </span>
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2 leading-tight">{lomba.nama_lomba}</h4>
                            <div className="flex items-center text-sm text-slate-500 mb-1">
                              <Calendar className="w-4 h-4 mr-2 opacity-70" />
                              {new Date(lomba.tanggal).toLocaleDateString('id-ID')}
                            </div>
                            <div className="flex items-center text-sm text-slate-500 mb-4">
                              <MapPin className="w-4 h-4 mr-2 opacity-70" />
                              {lomba.lokasi}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full mt-4 text-orange-600 border-orange-200 hover:bg-orange-50"
                            onClick={() => {
                              setSelectedLombaForRegistration(lomba)
                              setShowRegistrationForm(true)
                            }}
                          >
                            Daftar Lomba Ini
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Sidebar Ticket/Action */}
          <div className="md:col-span-1">
            <Card className="border-none shadow-xl sticky top-24 overflow-hidden">
              <div className={`h-2 w-full ${bgColor}`}></div>
              <CardContent className="p-6">
                
                {isRegistered ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Terdaftar!</h3>
                    <p className="text-sm text-slate-500 mb-6">Anda telah sukses mendaftar untuk acara ini. Jangan lupa membawa tiket / QR Code Anda.</p>
                    
                    <Button 
                      className={`w-full gap-2 mb-3 ${bgColor} hover:opacity-90`}
                      onClick={() => setShowQR(true)}
                    >
                      <QrCode className="w-4 h-4" /> Tampilkan QR Akses
                    </Button>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Gunakan QR ini untuk Check-in Panitia</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className={`w-16 h-16 ${lightBgColor} ${primaryColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Ticket className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Tertarik Mengikuti?</h3>
                    <p className="text-sm text-slate-500 mb-6">Amankan kursi Anda sekarang. Proses pendaftaran cepat dan gratis.</p>
                    
                    {event.status === 'completed' ? (
                       <Button disabled className="w-full bg-slate-300 text-slate-600">Acara Telah Selesai</Button>
                    ) : (
                       <Button 
                        className={`w-full gap-2 ${bgColor} hover:opacity-90`}
                        onClick={() => {
                          setSelectedLombaForRegistration(null)
                          setShowRegistrationForm(true)
                        }}
                       >
                         Daftar Sekarang
                       </Button>
                    )}
                  </div>
                )}
                
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={showRegistrationForm} onOpenChange={setShowRegistrationForm}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Formulir Pendaftaran</DialogTitle>
            <DialogDescription>
              Silakan lengkapi data diri Anda untuk mendaftar pada {selectedLombaForRegistration ? 'Lomba' : (isLomba ? 'Lomba' : 'Event')} <strong>{selectedLombaForRegistration ? selectedLombaForRegistration.nama_lomba : event?.title}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama Lengkap / Nama Tim</Label>
              <Input 
                value={formData.nama_peserta}
                onChange={(e) => setFormData({...formData, nama_peserta: e.target.value})}
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div className="grid gap-2">
              <Label>Nomor WhatsApp</Label>
              <Input 
                value={formData.nomor_telepon}
                onChange={(e) => setFormData({...formData, nomor_telepon: e.target.value})}
                placeholder="08123456789"
                type="tel"
              />
            </div>
            <div className="grid gap-2">
              <Label>Instansi / Alamat / Perwakilan (Opsional)</Label>
              <Input 
                value={formData.instansi}
                onChange={(e) => setFormData({...formData, instansi: e.target.value})}
                placeholder="Contoh: RT 03 / Sekolah X"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegistrationForm(false)}>Batal</Button>
            <Button onClick={handleSubmitRegistration} disabled={submitting || !formData.nama_peserta || !formData.nomor_telepon}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Kirim Pendaftaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md text-center flex flex-col items-center p-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">E-Ticket Check-in</DialogTitle>
            <DialogDescription className="text-center">Tunjukkan kode QR ini ke panitia di lokasi acara.</DialogDescription>
          </DialogHeader>
          
          <div className="bg-white p-4 rounded-2xl shadow-inner border my-6">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TICKET-KTBP-${event?.id}`} alt="QR Code Ticket" className="w-[200px] h-[200px]" />
          </div>
          
          <div className="bg-slate-100 dark:bg-slate-800 w-full p-4 rounded-xl text-left font-mono text-sm">
             <p className="text-xs text-slate-500 mb-1">Event:</p>
             <p className="font-bold truncate mb-3">{event?.title}</p>
             <p className="text-xs text-slate-500 mb-1">Ticket ID:</p>
             <p className="font-bold">TKT-{event?.id?.substring(0,8).toUpperCase()}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
