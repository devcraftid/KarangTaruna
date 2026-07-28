import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function LombaPublik() {
  const [events, setEvents] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeKategori, setActiveKategori] = useState('Semua Kategori')
  const [activeStatus, setActiveStatus] = useState('Semua Status')

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  // 0 = Monday, 1 = Tuesday ... 6 = Sunday (assuming S S R K J S M format)
  const firstDayOfMonth = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate()

  useEffect(() => {
    fetchAgenda()
  }, [])

  const fetchAgenda = async () => {
    try {
      setLoading(true)
      const [eventsRes, compRes, annRes] = await Promise.all([
        supabase.from('events').select('*').in('status', ['published', 'ongoing', 'completed']).order('tanggal_mulai', { ascending: true }),
        supabase.from('competitions').select('*').in('status', ['published', 'completed']).order('tanggal', { ascending: true }),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3)
      ])
      
      if (eventsRes.data) setEvents(eventsRes.data)
      if (compRes.data) setCompetitions(compRes.data)
      if (annRes.data) setAnnouncements(annRes.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Combine both arrays into one agenda list for display
  let combinedAgenda = [
    ...events.map(e => ({
      id: e.id,
      title: e.nama_acara,
      date: e.tanggal_mulai,
      time: e.waktu,
      location: e.lokasi,
      type: 'event',
      status: e.status,
      desc: e.deskripsi,
      kategori: 'Kegiatan Sosial'
    })),
    ...competitions.map(c => ({
      id: c.id,
      title: c.nama_lomba,
      date: c.tanggal,
      time: c.jam,
      location: c.lokasi,
      type: 'lomba',
      status: c.status,
      desc: c.deskripsi,
      kategori: 'Lomba'
    }))
  ]

  const upcomingEventsList = combinedAgenda
    .filter(item => item.status !== 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const hotEvent = upcomingEventsList.length > 0 ? upcomingEventsList[0] : null

  // Helper to check if a day has an event
  const hasEvent = (day: number) => {
    return combinedAgenda.some(event => {
      const eDate = new Date(event.date)
      return eDate.getDate() === day && eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear
    })
  }

  // Apply filters for the grid
  combinedAgenda = combinedAgenda.filter(item => {
    const matchSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = activeKategori === 'Semua Kategori' || item.kategori.includes(activeKategori)
    let matchStatus = true
    if (activeStatus === 'Mendatang') {
      matchStatus = item.status === 'published' || item.status === 'ongoing'
    } else if (activeStatus === 'Selesai') {
      matchStatus = item.status === 'completed'
    }
    return matchSearch && matchCat && matchStatus
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

  return (
    <div className="bg-md-surface font-inter text-md-on-surface pb-20 selection:bg-md-primary-container selection:text-md-on-primary-container">
      <style>{`
        .glass-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(226, 232, 240, 0.5); }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
        .calendar-day { aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center; font-size: 12px; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
        .calendar-day:hover { background: #d6e3ff; }
        .calendar-day.active { background: #002045; color: white; font-weight: bold; }
        .calendar-day.event { position: relative; }
        .calendar-day.event::after { content: ''; position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%; background: #875200; }
      `}</style>
      
      <main className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 space-y-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm font-medium text-md-outline mb-4">
          <Link to="/" className="hover:text-md-primary">Beranda</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-md-on-surface">Program Kerja</span>
        </nav>

        {/* Hero Section: Bento Grid Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Highlight Event Banner */}
          <div className="lg:col-span-8 relative rounded-xl overflow-hidden shadow-sm group min-h-[400px]">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: "url('https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')"}}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-md-primary/90 via-md-primary/30 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-8 text-md-on-primary">
              <span className="px-3 py-1 bg-md-secondary text-md-on-secondary rounded-full text-xs font-bold mb-4 inline-block tracking-wider">HOT EVENT</span>
              {hotEvent ? (
                <>
                  <h1 className="font-extrabold text-4xl md:text-5xl mb-2">{hotEvent.title}</h1>
                  <p className="text-lg text-white/90 mb-6 max-w-xl leading-relaxed line-clamp-2">{hotEvent.desc || 'Segera daftarkan diri Anda dan saksikan kemeriahannya!'}</p>
                  <div className="flex flex-wrap gap-4">
                    <Link to={`/lomba/${hotEvent.id}?type=${hotEvent.type}`} className="px-8 py-3 bg-md-secondary text-md-on-secondary rounded-lg font-bold text-sm hover:shadow-lg transition-all active:scale-95 flex items-center gap-2">
                      Daftar Sekarang
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                    <Link to={`/lomba/${hotEvent.id}?type=${hotEvent.type}`} className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-lg font-bold text-sm hover:bg-white/20 transition-all">
                      Lihat Detail
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="font-extrabold text-4xl md:text-5xl mb-2">Belum Ada Event Mendatang</h1>
                  <p className="text-lg text-white/90 mb-6 max-w-xl leading-relaxed">Saat ini belum ada event atau lomba besar yang dijadwalkan.</p>
                </>
              )}
            </div>
          </div>
          
          {/* Calendar Sidebar Widget */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-md-surface-container-low p-6 rounded-xl border border-md-outline-variant shadow-sm h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-md-primary">Kalender Kegiatan</h2>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-md-surface-variant rounded-full transition-colors"><span className="material-symbols-outlined text-md-on-surface-variant">chevron_left</span></button>
                  <button className="p-1 hover:bg-md-surface-variant rounded-full transition-colors"><span className="material-symbols-outlined text-md-on-surface-variant">chevron_right</span></button>
                </div>
              </div>
              <div className="mb-4 text-center font-bold text-md-primary">{monthNames[currentMonth]} {currentYear}</div>
              <div className="calendar-grid mb-6">
                <div className="text-center text-xs font-bold text-md-outline">S</div>
                <div className="text-center text-xs font-bold text-md-outline">S</div>
                <div className="text-center text-xs font-bold text-md-outline">R</div>
                <div className="text-center text-xs font-bold text-md-outline">K</div>
                <div className="text-center text-xs font-bold text-md-outline">J</div>
                <div className="text-center text-xs font-bold text-md-outline">S</div>
                <div className="text-center text-xs font-bold text-md-outline">M</div>
                
                {/* Empty cells for previous month */}
                {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                  <div key={`prev-${idx}`} className="calendar-day text-md-outline opacity-30">
                    {prevMonthDays - firstDayOfMonth + idx + 1}
                  </div>
                ))}

                {/* Days of current month */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1
                  const isToday = day === currentDate.getDate()
                  const isEvent = hasEvent(day)
                  return (
                    <div 
                      key={`day-${day}`} 
                      className={`calendar-day ${isToday ? 'active' : ''} ${isEvent ? 'event' : ''}`}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>
              <div className="space-y-3 mt-auto">
                {upcomingEventsList.slice(0, 3).map((ev) => {
                  const eDate = new Date(ev.date)
                  return (
                    <Link to={`/lomba/${ev.id}?type=${ev.type}`} key={ev.id} className="flex items-center gap-3 p-3 bg-md-surface rounded-lg border border-md-outline-variant hover:shadow-sm transition-all group">
                      <div className="w-10 h-10 rounded bg-md-primary-container flex flex-col items-center justify-center text-md-on-primary-container shrink-0 group-hover:bg-md-primary group-hover:text-md-on-primary transition-colors">
                        <span className="text-[10px] font-bold uppercase">{monthNames[eDate.getMonth()].substring(0,3)}</span>
                        <span className="text-sm font-extrabold">{eDate.getDate()}</span>
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-md-primary truncate">{ev.title}</p>
                        <p className="text-[12px] text-md-on-surface-variant">{ev.time ? ev.time.substring(0,5) : 'Tentatif'}</p>
                      </div>
                    </Link>
                  )
                })}
                {upcomingEventsList.length === 0 && (
                  <div className="text-center p-4 text-sm text-md-on-surface-variant border border-dashed border-md-outline-variant rounded-lg">
                    Belum ada kegiatan dalam waktu dekat.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="bg-md-surface-container-lowest p-6 rounded-xl border border-md-outline-variant shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-md-outline">search</span>
            <input 
              className="w-full pl-10 pr-4 py-3 bg-md-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-md-primary/20 transition-all text-sm font-medium outline-none" 
              placeholder="Cari kegiatan..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <select 
              className="bg-md-surface-container-low border-none rounded-lg py-3 px-4 text-sm font-bold text-md-on-surface focus:ring-2 focus:ring-md-primary/20 cursor-pointer outline-none"
              value={activeKategori}
              onChange={(e) => setActiveKategori(e.target.value)}
            >
              <option>Semua Kategori</option>
              <option>Lomba</option>
              <option>Sosial</option>
              <option>Pelatihan</option>
              <option>Rapat</option>
            </select>
            <select 
              className="bg-md-surface-container-low border-none rounded-lg py-3 px-4 text-sm font-bold text-md-on-surface focus:ring-2 focus:ring-md-primary/20 cursor-pointer outline-none"
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
            >
              <option>Semua Status</option>
              <option>Mendatang</option>
              <option>Selesai</option>
            </select>
          </div>
        </section>

        {/* Main Content Area: Listing and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Event Listings */}
          <div className="lg:col-span-8 space-y-6">
            {loading ? (
               <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-md-primary border-t-transparent rounded-full animate-spin"></div></div>
            ) : combinedAgenda.length === 0 ? (
               <div className="text-center p-12 bg-md-surface-container-lowest rounded-xl border border-md-outline-variant shadow-sm">
                  <span className="material-symbols-outlined text-4xl text-md-outline mb-4">event_busy</span>
                  <h3 className="text-lg font-bold text-md-on-surface-variant">Belum ada agenda yang cocok.</h3>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {combinedAgenda.map((item) => {
                  const isCompleted = item.status === 'completed';
                  return (
                    <div key={item.id} className={`bg-md-surface-container-lowest rounded-xl border border-md-outline-variant shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow ${isCompleted ? 'grayscale-[0.5] opacity-80' : ''}`}>
                      <div className="h-48 relative overflow-hidden bg-md-surface-variant">
                        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1523580494112-071d16940d14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')"}}></div>
                        {isCompleted && (
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-lg font-bold text-sm">SELESAI</span>
                           </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.kategori === 'Kegiatan Sosial' ? 'bg-green-100 text-green-700' : item.kategori === 'Lomba' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                            {item.kategori}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-md-primary rounded-full text-[10px] font-bold">
                            {isCompleted ? 'Berakhir' : 'Mendatang'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-md-primary mb-3 leading-snug line-clamp-2">{item.title}</h3>
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-md-on-surface-variant text-sm font-medium">
                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                            {new Date(item.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})} {item.time ? `• ${item.time.substring(0,5)} WIB` : ''}
                          </div>
                          <div className="flex items-start gap-2 text-md-on-surface-variant text-sm font-medium">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            <span className="line-clamp-1">{item.location}</span>
                          </div>
                        </div>
                        
                        <div className="mt-auto flex flex-col gap-3">
                          {!isCompleted && (
                             <Link to={`/lomba/${item.id}?type=${item.type}`} className="w-full py-3 bg-md-primary text-md-on-primary text-center rounded-lg font-bold text-sm hover:bg-md-primary-container hover:text-md-on-primary-container transition-colors">
                               Daftar Sekarang
                             </Link>
                          )}
                          <Link to={`/lomba/${item.id}?type=${item.type}`} className={`block text-center text-sm font-bold hover:underline ${isCompleted ? 'py-3 border-2 border-md-primary text-md-primary rounded-lg hover:bg-md-primary/5' : 'text-md-primary'}`}>
                            {isCompleted ? 'Lihat Dokumentasi' : 'Lihat Detail'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
          </div>
          
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Important Announcements */}
            <div className="bg-md-primary text-md-on-primary rounded-xl p-6 shadow-sm border border-md-primary-container">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-md-secondary">campaign</span>
                <h2 className="text-xl font-bold">Pengumuman Penting</h2>
              </div>
              <div className="space-y-4">
                {announcements.length > 0 ? (
                  announcements.map((ann, idx) => (
                    <div key={ann.id} className={`pb-4 ${idx !== announcements.length - 1 ? 'border-b border-md-on-primary/10' : ''}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${idx === 0 ? 'text-md-secondary-container' : 'text-blue-300'}`}>
                        {idx === 0 ? 'TERBARU' : 'PEMBERITAHUAN'}
                      </p>
                      <h4 className="font-bold text-sm mb-1">{ann.judul}</h4>
                      <p className="text-sm opacity-80 leading-relaxed line-clamp-2">{ann.konten}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm opacity-80 italic">Belum ada pengumuman.</p>
                )}
                
                <Link to="/pengumuman" className="inline-flex items-center gap-2 text-md-secondary font-bold text-sm hover:underline group mt-2">
                  Lihat Semua
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                </Link>
              </div>
            </div>
            
            {/* Social Media Links */}
            <div className="bg-md-surface-container-lowest rounded-xl p-6 border border-md-outline-variant shadow-sm">
              <h2 className="text-xl font-bold text-md-primary mb-6">Ikuti Kami</h2>
              <div className="grid grid-cols-2 gap-4">
                <a href="#" className="flex flex-col items-center justify-center p-4 rounded-xl bg-md-surface-container-low hover:bg-md-primary/5 transition-all border border-transparent hover:border-md-primary/20 group">
                  <div className="w-12 h-12 rounded-full bg-md-primary/10 flex items-center justify-center text-md-primary mb-2 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">photo_camera</span>
                  </div>
                  <span className="text-sm font-bold text-md-on-surface">Instagram</span>
                </a>
                <a href="#" className="flex flex-col items-center justify-center p-4 rounded-xl bg-md-surface-container-low hover:bg-md-primary/5 transition-all border border-transparent hover:border-md-primary/20 group">
                  <div className="w-12 h-12 rounded-full bg-md-primary/10 flex items-center justify-center text-md-primary mb-2 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">videocam</span>
                  </div>
                  <span className="text-sm font-bold text-md-on-surface">YouTube</span>
                </a>
              </div>
            </div>
            
            {/* Newsletter / Join Widget */}
            <div className="relative rounded-xl overflow-hidden p-6 text-md-on-primary">
              <div className="absolute inset-0 bg-md-primary"></div>
              <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '10px 10px'}}></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Ingin Berkontribusi?</h3>
                <p className="text-sm text-white/80 mb-6 leading-relaxed">Gabung menjadi relawan di kegiatan kami berikutnya dan jadilah agen perubahan.</p>
                <Link to="/pendaftaran" className="block text-center w-full py-3 bg-md-secondary text-md-on-secondary rounded-lg font-bold text-sm hover:shadow-lg transition-all active:scale-95">
                  Daftar Relawan
                </Link>
              </div>
            </div>
            
          </aside>
        </div>
      </main>
    </div>
  )
}





