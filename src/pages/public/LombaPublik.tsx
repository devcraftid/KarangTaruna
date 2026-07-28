import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Calendar as CalendarIcon, MapPin, Users, ChevronRight, Trophy, Search, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function LombaPublik() {
  const [events, setEvents] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAgenda()
  }, [])

  const fetchAgenda = async () => {
    try {
      setLoading(true)
      const [eventsRes, compRes] = await Promise.all([
        supabase.from('events').select('*').in('status', ['published', 'ongoing', 'completed']).order('tanggal_mulai', { ascending: true }),
        supabase.from('competitions').select('*').in('status', ['published', 'completed']).order('tanggal', { ascending: true })
      ])
      
      if (eventsRes.data) setEvents(eventsRes.data)
      if (compRes.data) setCompetitions(compRes.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Combine both arrays into one agenda list for display
  const combinedAgenda = [
    ...events.map(e => ({
      id: e.id,
      title: e.nama_acara,
      date: e.tanggal_mulai,
      time: e.waktu,
      location: e.lokasi,
      type: 'event',
      status: e.status,
      desc: e.deskripsi
    })),
    ...competitions.map(c => ({
      id: c.id,
      title: c.nama_lomba,
      date: c.tanggal,
      time: c.jam,
      location: c.lokasi,
      type: 'lomba',
      status: c.status,
      desc: c.deskripsi
    }))
  ].filter(item => (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()))
   .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="bg-md-surface min-h-screen pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-transparent to-transparent"></div>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 uppercase tracking-tight">Agenda & Event</h1>
          <p className="text-lg text-white/80 leading-relaxed mb-8">
            Temukan berbagai acara menarik, kegiatan sosial, dan perlombaan yang diselenggarakan oleh Karang Taruna.
          </p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input 
              placeholder="Cari nama event atau lomba..." 
              className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-full focus-visible:ring-emerald-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 max-w-5xl">
        
        {loading ? (
          <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : combinedAgenda.length === 0 ? (
          <Card className="text-center p-12 border-none shadow-sm">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-500">Belum ada agenda terdekat.</h3>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {combinedAgenda.map((item) => (
              <Link to={`/lomba/${item.id}?type=${item.type}`} key={item.id} className="group">
                <Card className="border-none shadow-lg h-full overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col relative">
                  
                  {/* Decorative Header Banner */}
                  <div className={`h-2 w-full ${item.type === 'lomba' ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                  
                  <div className="absolute top-6 right-6">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'lomba' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                       {item.type === 'lomba' ? <Trophy className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                     </div>
                  </div>

                  <CardContent className="p-6 pt-8 flex-1 flex flex-col">
                    <div className="mb-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm mr-2 ${item.type === 'lomba' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                        {item.type === 'lomba' ? 'Kompetisi' : 'Kegiatan'}
                      </span>
                      {item.status === 'completed' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm bg-slate-100 text-slate-600 dark:bg-slate-800 flex inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Selesai
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-slate-500 mb-6 flex-1">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 shrink-0" />
                        <span>{new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} • {item.time ? item.time.substring(0,5) : ''} WIB</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{item.location}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t dark:border-slate-800 flex items-center justify-between font-bold text-sm">
                      <span className={`${item.type === 'lomba' ? 'text-orange-600' : 'text-emerald-600'}`}>Lihat Detail Acara</span>
                      <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${item.type === 'lomba' ? 'text-orange-600' : 'text-emerald-600'}`} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}





