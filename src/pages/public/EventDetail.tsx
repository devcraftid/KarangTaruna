import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-md-surface"><Loader2 className="w-8 h-8 text-md-primary animate-spin" /></div>
  if (!event) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-md-surface">
      <h2 className="text-3xl font-bold mb-2">Event Tidak Ditemukan</h2>
      <Link to="/lomba"><Button>Kembali ke Agenda</Button></Link>
    </div>
  )

  const isLomba = event.type === 'lomba'

  return (
    <div className="bg-md-surface font-inter text-md-on-surface min-h-screen">
      <Toaster />
      <main className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm font-medium text-md-outline mb-6">
          <Link to="/" className="hover:text-md-primary">Beranda</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link to="/lomba" className="hover:text-md-primary">Program Kerja</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-md-on-surface">{event.title}</span>
        </nav>

        {/* Hero Section */}
        <section className="mb-12 relative overflow-hidden rounded-xl bg-md-primary-container min-h-[400px] flex flex-col justify-end p-8 text-white">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              className="w-full h-full object-cover opacity-60" 
              alt="Event Cover" 
            />
          </div>
          <div className="relative z-10 space-y-4 max-w-2xl">
            <span className="inline-block px-4 py-1 bg-md-secondary text-md-on-secondary rounded-full text-sm font-bold uppercase tracking-wider">
              {event.status === 'completed' ? 'Acara Selesai' : 'Acara Mendatang'}
            </span>
            <h1 className="font-extrabold text-4xl md:text-5xl">{event.title}</h1>
            <p className="text-lg text-white/90 leading-relaxed max-w-xl truncate">{event.desc || 'Acara Karang Taruna'}</p>
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Main Information */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Description */}
            <article className="bg-md-surface-container-lowest p-8 rounded-xl shadow-sm border border-md-outline-variant">
              <h2 className="text-2xl font-bold mb-4 text-md-primary">Tentang Acara</h2>
              <div className="space-y-4 text-md-on-surface-variant text-base leading-relaxed whitespace-pre-wrap">
                {event.desc || 'Tidak ada deskripsi rinci untuk kegiatan ini.'}
              </div>
            </article>

            {/* DAFTAR LOMBA LIST */}
            {type === 'event' && eventCompetitions.length > 0 && (
              <section className="bg-md-surface-container-lowest p-8 rounded-xl shadow-sm border border-md-outline-variant">
                <h2 className="text-2xl font-bold mb-6 text-md-primary flex items-center gap-3">
                  <span className="material-symbols-outlined text-md-secondary">emoji_events</span>
                  Daftar Perlombaan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {eventCompetitions.map((lomba) => (
                    <div key={lomba.id} className="border border-md-outline-variant rounded-lg p-5 flex flex-col h-full bg-md-surface hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-orange-100 text-orange-600 mb-3 inline-block">
                          {lomba.kategori}
                        </span>
                        <h4 className="font-bold text-lg text-md-on-surface mb-2 leading-tight">{lomba.nama_lomba}</h4>
                        <div className="flex items-center text-sm text-md-on-surface-variant mb-1">
                          <span className="material-symbols-outlined text-[16px] mr-2">calendar_today</span>
                          {new Date(lomba.tanggal).toLocaleDateString('id-ID')}
                        </div>
                        <div className="flex items-center text-sm text-md-on-surface-variant mb-4">
                          <span className="material-symbols-outlined text-[16px] mr-2">location_on</span>
                          {lomba.lokasi}
                        </div>
                      </div>
                      <button 
                        className="w-full mt-4 py-2 border-2 border-md-secondary text-md-secondary font-bold rounded-lg hover:bg-md-secondary/5 transition-colors"
                        onClick={() => {
                          setSelectedLombaForRegistration(lomba)
                          setShowRegistrationForm(true)
                        }}
                      >
                        Daftar Lomba Ini
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: Floating Widget */}
          <aside className="lg:col-span-4">
            <div className="bg-md-surface-container-lowest rounded-xl shadow-sm border border-md-outline-variant sticky top-24 overflow-hidden">
              <div className="h-2 w-full bg-md-primary"></div>
              <div className="p-6">
                
                {/* Status or Registration Call to Action */}
                {isRegistered ? (
                  <div className="text-center mb-8 pb-6 border-b border-md-outline-variant">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-3xl">check_circle</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Terdaftar!</h3>
                    <p className="text-sm text-md-on-surface-variant mb-6">Anda telah sukses mendaftar untuk acara ini. Jangan lupa membawa tiket / QR Code Anda.</p>
                    
                    <button 
                      className="w-full py-3 bg-md-primary text-md-on-primary rounded-lg font-bold flex justify-center items-center gap-2 hover:shadow-lg transition-all"
                      onClick={() => setShowQR(true)}
                    >
                      <span className="material-symbols-outlined">qr_code</span> Tampilkan QR Akses
                    </button>
                    <p className="text-[10px] text-md-outline uppercase tracking-widest mt-2">Gunakan QR ini untuk Check-in Panitia</p>
                  </div>
                ) : (
                  <div className="text-center mb-8 pb-6 border-b border-md-outline-variant">
                    <div className="w-16 h-16 bg-md-primary-container text-md-on-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-3xl">confirmation_number</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Tertarik Mengikuti?</h3>
                    <p className="text-sm text-md-on-surface-variant mb-6">Amankan kursi Anda sekarang. Proses pendaftaran cepat dan gratis.</p>
                    
                    {event.status === 'completed' ? (
                       <button disabled className="w-full py-3 bg-md-surface-variant text-md-on-surface-variant rounded-lg font-bold opacity-60 cursor-not-allowed">
                         Acara Telah Selesai
                       </button>
                    ) : (
                       <button 
                        className="w-full py-3 bg-md-primary text-md-on-primary rounded-lg font-bold hover:shadow-lg transition-all active:scale-95"
                        onClick={() => {
                          setSelectedLombaForRegistration(null)
                          setShowRegistrationForm(true)
                        }}
                       >
                         Daftar Sekarang
                       </button>
                    )}
                  </div>
                )}

                {/* Event Details info */}
                <h4 className="font-bold text-md-on-surface mb-4">Informasi Pelaksanaan</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-md-surface-container flex items-center justify-center shrink-0 text-md-primary">
                       <span className="material-symbols-outlined">calendar_month</span>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-md-outline uppercase tracking-widest mb-1">Tanggal</p>
                       <p className="font-medium text-md-on-surface text-sm">
                         {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                       </p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-md-surface-container flex items-center justify-center shrink-0 text-md-primary">
                       <span className="material-symbols-outlined">schedule</span>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-md-outline uppercase tracking-widest mb-1">Waktu</p>
                       <p className="font-medium text-md-on-surface text-sm">
                         {event.time ? event.time.substring(0,5) : 'Tentatif'} WIB - Selesai
                       </p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-md-surface-container flex items-center justify-center shrink-0 text-md-primary">
                       <span className="material-symbols-outlined">location_on</span>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-md-outline uppercase tracking-widest mb-1">Lokasi</p>
                       <p className="font-medium text-md-on-surface text-sm">
                         {event.location}
                       </p>
                     </div>
                  </div>
                  {event.max_participants > 0 && (
                    <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-full bg-md-surface-container flex items-center justify-center shrink-0 text-md-primary">
                         <span className="material-symbols-outlined">group</span>
                       </div>
                       <div>
                         <p className="text-xs font-bold text-md-outline uppercase tracking-widest mb-1">Kuota</p>
                         <p className="font-medium text-md-on-surface text-sm">
                           Maksimal {event.max_participants} Peserta
                         </p>
                       </div>
                    </div>
                  )}
                </div>
                
              </div>
            </div>
          </aside>
        </div>
      </main>

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
            <Button className="bg-md-primary text-md-on-primary hover:bg-md-primary/90" onClick={handleSubmitRegistration} disabled={submitting || !formData.nama_peserta || !formData.nomor_telepon}>
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
          
          <div className="bg-md-surface-container-low w-full p-4 rounded-xl text-left font-mono text-sm border border-md-outline-variant">
             <p className="text-xs text-md-on-surface-variant mb-1">Event:</p>
             <p className="font-bold truncate mb-3">{event?.title}</p>
             <p className="text-xs text-md-on-surface-variant mb-1">Ticket ID:</p>
             <p className="font-bold">TKT-{event?.id?.substring(0,8).toUpperCase()}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
