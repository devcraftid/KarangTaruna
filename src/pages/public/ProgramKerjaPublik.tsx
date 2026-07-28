import { useState, useEffect } from 'react'
import { Calendar, MapPin, Eye, Award } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Proker = { id: string; nama_program: string; deskripsi: string; bidang: string; status: string }
type EventItem = { id: string; nama_acara: string; tanggal_mulai: string; lokasi: string; deskripsi: string; is_active: boolean }
type GalleryItem = { id: string; judul: string; gambar: string; kategori: string }
type FameItem = { id: string; judul: string; deskripsi: string; tahun: string; kategori: string }

export default function ProgramKerjaPublik() {
  const [prokers, setProkers] = useState<Proker[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [galleries, setGalleries] = useState<GalleryItem[]>([])
  const [fames, setFames] = useState<FameItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [prokersRes, eventsRes, galleriesRes, famesRes] = await Promise.all([
        supabase.from('work_programs').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('events').select('*').order('tanggal_mulai', { ascending: true }).limit(5),
        supabase.from('gallery').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('hall_of_fame').select('*').order('tahun', { ascending: false }).limit(4)
      ])
      
      if (prokersRes.data) setProkers(prokersRes.data)
      if (eventsRes.data) setEvents(eventsRes.data)
      if (galleriesRes.data) setGalleries(galleriesRes.data)
      if (famesRes.data) setFames(famesRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getProgress = (status: string) => {
    if (status === 'completed') return { percent: 100, label: 'Done', color: 'bg-blue-100 text-blue-700', bar: 'bg-md-primary-container' }
    if (status === 'ongoing') return { percent: 50, label: 'Active', color: 'bg-green-100 text-green-700', bar: 'bg-primary' }
    return { percent: 10, label: 'Planned', color: 'bg-yellow-100 text-yellow-700', bar: 'bg-md-secondary' }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
  }

  const highlightEvent = events.length > 0 ? events[0] : null
  const upcomingEvents = events.slice(1, 3)

  return (
    <div className="bg-md-surface text-md-on-surface font-inter selection:bg-md-primary-fixed selection:text-md-on-primary-fixed">
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12 space-y-12">
        {/* Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <span className="px-3 py-1 bg-md-secondary-container text-md-on-secondary-container rounded-full text-sm font-bold uppercase tracking-wider inline-block">Agenda Komunitas</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2 leading-tight">Bergerak Maju Melalui Program Berkelanjutan</h1>
            <p className="text-lg text-md-on-surface-variant max-w-lg">Jelajahi inisiatif kami dalam pemberdayaan pemuda, kegiatan sosial, dan pengembangan ekonomi lokal yang dirancang untuk masa depan desa yang lebih baik.</p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
                <Calendar className="w-5 h-5" />
                Lihat Kalender
              </button>
              <button className="border-2 border-primary text-primary px-6 py-3 rounded-xl font-medium hover:bg-primary/5 transition-all">
                Unduh Proker 2024
              </button>
            </div>
          </div>
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-xl animate-float bg-md-surface-container-highest">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/30 to-primary/10 z-10"></div>
            {/* Hero image can be uploaded by admin later */}
          </div>
        </section>

        {/* Program Kerja (Progress Section) */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-md-on-surface">Pilar Program Kerja</h2>
              <p className="text-md-on-surface-variant">Status pelaksanaan program strategis Karang Taruna periode ini.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {prokers.map((proker, idx) => {
              const prog = getProgress(proker.status)
              const icons = ['school', 'storefront', 'volunteer_activism']
              const colorClasses = [
                'bg-md-primary-fixed text-primary',
                'bg-md-secondary-fixed text-md-secondary',
                'bg-md-tertiary-fixed text-md-on-tertiary-fixed-variant'
              ]
              return (
                <div key={proker.id} className="bg-white p-6 rounded-2xl border border-md-outline-variant/30 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${colorClasses[idx % 3]}`}>
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icons[idx % 3]}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${prog.color}`}>{prog.label}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{proker.nama_program}</h3>
                  <p className="text-base text-md-on-surface-variant mb-6 line-clamp-2">{proker.deskripsi}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span>Progress</span>
                      <span>{prog.percent}%</span>
                    </div>
                    <div className="w-full bg-md-surface-container h-2.5 rounded-full overflow-hidden">
                      <div className={`${prog.bar} h-full transition-all duration-1000`} style={{ width: `${prog.percent}%` }}></div>
                    </div>
                  </div>
                </div>
              )
            })}
            {prokers.length === 0 && (
              <p className="col-span-3 text-center text-md-on-surface-variant py-8">Belum ada program kerja.</p>
            )}
          </div>
        </section>

        {/* Calendar & Upcoming Events */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Widget (Simplified for dynamic context) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-md-outline-variant/30 flex flex-col justify-center text-center">
             <Calendar className="w-20 h-20 text-md-outline mx-auto mb-4 opacity-50" />
             <h3 className="text-2xl font-bold mb-2">Jadwal Komunitas</h3>
             <p className="text-md-on-surface-variant mb-6">Pantau terus jadwal kegiatan Karang Taruna agar tidak ketinggalan momen penting.</p>
             <button className="bg-primary text-white font-bold py-3 px-6 rounded-xl w-full hover:shadow-lg transition-all">Lihat Kalender Penuh</button>
          </div>
          {/* Event Cards */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-2xl font-bold mb-2">Kegiatan Mendatang</h3>
            {upcomingEvents.map(event => (
              <div key={event.id} className="bg-white rounded-3xl overflow-hidden border border-md-outline-variant/30 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:h-[180px]">
                <div className="md:w-1/3 h-48 md:h-full relative bg-md-surface-container flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-md-outline opacity-50" />
                </div>
                <div className="p-4 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-xl font-bold text-primary">{event.nama_acara}</h4>
                      <span className="bg-md-surface-container-high px-3 py-1 rounded-full text-xs font-bold">Event</span>
                    </div>
                    <div className="flex gap-4 mt-2 text-md-on-surface-variant text-sm font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(event.tanggal_mulai)}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.lokasi}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all ml-auto">Daftar Sekarang</button>
                  </div>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-md-on-surface-variant py-8">Belum ada kegiatan mendatang.</p>
            )}
          </div>
        </section>

        {/* Detailed Event Preview (Interactive Section) */}
        {highlightEvent && (
          <section className="bg-primary rounded-[40px] p-6 lg:p-12 text-primary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[300px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            </div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <span className="px-4 py-2 bg-md-on-primary-container text-md-surface rounded-xl text-sm font-bold inline-block">Highlight Event</span>
                <h2 className="text-3xl md:text-4xl font-bold">{highlightEvent.nama_acara}</h2>
                <p className="text-lg text-white/80 line-clamp-3">{highlightEvent.deskripsi || 'Tidak ada deskripsi'}</p>
                <div className="space-y-4 mt-6">
                  <h4 className="text-base font-bold uppercase tracking-widest text-md-secondary-fixed">Waktu & Tanggal</h4>
                  <div className="flex gap-4 items-center bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="font-bold text-md-secondary-fixed">{formatDate(highlightEvent.tanggal_mulai)}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white/5 rounded-3xl p-4 border border-white/10">
                  <h4 className="text-sm font-bold text-md-secondary-fixed mb-4">Lokasi Pelaksanaan</h4>
                  <div className="w-full h-48 rounded-xl overflow-hidden grayscale contrast-125 mb-3">
                    <div className="w-full h-full bg-md-surface-container flex items-center justify-center text-primary">
                      <MapPin className="w-12 h-12" />
                    </div>
                  </div>
                  <p className="text-sm font-medium">{highlightEvent.lokasi}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Past Event Gallery */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-end">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Galeri Dokumentasi</h2>
              <p className="text-md-on-surface-variant">Momen-momen berkesan dari kegiatan sebelumnya.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleries.map((gal, idx) => (
              <div key={gal.id} className={`aspect-square rounded-2xl overflow-hidden group relative ${idx === 2 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                {gal.gambar ? (
                  <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={gal.judul} src={gal.gambar} />
                ) : (
                   <div className="w-full h-full bg-md-surface-container flex items-center justify-center">
                     <Eye className="text-md-outline w-12 h-12 opacity-30" />
                   </div>
                )}
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                  <Eye className="text-white w-8 h-8 mb-2" />
                  <span className="text-white font-bold text-sm">{gal.judul}</span>
                </div>
              </div>
            ))}
            {galleries.length === 0 && (
               <p className="col-span-4 text-center text-md-on-surface-variant py-8">Belum ada dokumentasi.</p>
            )}
          </div>
        </section>

        {/* Hall of Fame (Prestasi) */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Hall of Fame</h2>
            <p className="text-md-on-surface-variant">Penghargaan dan apresiasi atas dedikasi serta prestasi luar biasa anggota Karang Taruna.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {fames.map((fame, idx) => {
              const borderColors = ['border-md-secondary', 'border-primary', 'border-md-tertiary', 'border-primary']
              const bgColors = ['bg-md-secondary-fixed text-md-secondary', 'bg-md-primary-fixed text-primary', 'bg-md-tertiary-fixed text-md-on-tertiary-fixed-variant', 'bg-md-surface-container-highest text-primary']
              return (
                <div key={fame.id} className={`bg-md-surface-container-low p-4 rounded-2xl text-center border-b-4 ${borderColors[idx % 4]} transition-all hover:-translate-y-2`}>
                  <div className={`w-20 h-20 ${bgColors[idx % 4]} mx-auto rounded-full flex items-center justify-center mb-4`}>
                    <Award className="w-10 h-10" />
                  </div>
                  <h4 className="font-bold text-primary mb-1">{fame.judul}</h4>
                  <p className="text-sm font-medium text-md-on-surface-variant mb-3">{fame.tahun} - {fame.kategori}</p>
                  <div className="h-px bg-md-outline-variant/30 w-full mb-3"></div>
                  <p className="text-sm font-medium italic text-md-on-surface">"{fame.deskripsi}"</p>
                </div>
              )
            })}
            {fames.length === 0 && (
               <p className="col-span-4 text-center text-md-on-surface-variant py-8">Belum ada data prestasi.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
