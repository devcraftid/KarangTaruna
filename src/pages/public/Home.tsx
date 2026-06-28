import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Calendar, Newspaper, Users, CheckCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { memberService } from '@/services/memberService'
import { lombaService } from '@/services/lombaService'
import { pendaftaranService } from '@/services/pendaftaranService'
import { beritaService } from '@/services/beritaService'

export default function Home() {
  // Fetch real data for stats
  const { data: members } = useQuery({ queryKey: ['members'], queryFn: memberService.getMembers })
  const { data: competitions } = useQuery({ queryKey: ['competitions'], queryFn: lombaService.getCompetitions })
  const { data: registrations } = useQuery({ queryKey: ['registrations'], queryFn: pendaftaranService.getPendaftaran })
  const { data: berita } = useQuery({ queryKey: ['berita'], queryFn: beritaService.getBerita })

  const stats = {
    anggota: members?.length || 0,
    kegiatan: competitions?.length || 0,
    peserta: registrations?.length || 0,
    berita: berita?.length || 0
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] animate-in fade-in duration-700 bg-slate-50 relative overflow-hidden">
      
      {/* Background Shapes */}
      <div className="absolute right-0 top-0 bottom-0 w-[85%] md:w-[65%] bg-primary rounded-tl-[100px] md:rounded-tl-[200px] rounded-bl-[40px] md:rounded-bl-[100px] z-0 overflow-hidden shadow-2xl">
        {/* Banner image overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-60"
          style={{ backgroundImage: "url('/banner.png')" }}
        ></div>
        {/* Gradient overlay to ensure text readability and smooth transition */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent"></div>
        
        {/* Decorative text watermark */}
        <div className="absolute bottom-20 right-10 rotate-[-5deg] text-right z-10 hidden md:block">
          <p className="text-4xl lg:text-6xl font-black text-white/10" style={{ fontFamily: 'cursive' }}>Muda Bergerak<br/>Desa Berdaya</p>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-full h-full pointer-events-none z-10 flex items-center justify-center lg:justify-end lg:pr-[25%] opacity-10 lg:opacity-100">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="w-64 h-64 md:w-96 md:h-96 object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]" 
          onError={(e) => { e.currentTarget.style.display = 'none' }} 
        />
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 z-20 flex-1 flex flex-col justify-center py-20 lg:py-32 relative">
        <div className="max-w-2xl bg-white/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-3xl">
          <h2 className="text-2xl md:text-4xl text-primary font-bold italic tracking-wide mb-1" style={{ fontFamily: 'cursive' }}>Bersatu, Beraksi,</h2>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter uppercase mb-2">
            Berkarya
          </h1>
          <h3 className="text-xl md:text-3xl text-primary font-bold tracking-widest uppercase mb-6">
            Untuk Desa Dan Bangsa
          </h3>
          
          <div className="w-20 h-1.5 bg-primary/80 mb-6 rounded-full"></div>

          <p className="text-slate-700 md:text-slate-800 text-lg md:text-xl leading-relaxed mb-8 font-medium">
            <span className="font-bold text-primary">Rayakan Kemerdekaan ke-81 di Lingkungan Kita.</span><br/>
            Platform manajemen modern untuk RT/RW mengelola lomba, donasi, dan transparansi kegiatan 17-an secara terpadu dan efisien.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="h-14 px-8 text-base bg-[#C8102E] hover:bg-[#A00D24] text-white rounded-full shadow-lg shadow-primary/30">
              <Link to="/lomba">
                <Calendar className="mr-2 h-5 w-5" /> LIHAT AGENDA
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base bg-white border-2 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300 rounded-full shadow-md">
              <Link to="/informasi">
                <Newspaper className="mr-2 h-5 w-5" /> BERITA TERBARU
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="container mx-auto px-4 z-30 pb-12">
        <div className="bg-[#8B1A10] text-white rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 relative z-10 divide-x-0 md:divide-x divide-white/10">
            
            <div className="flex items-center gap-4 px-2 lg:px-6">
              <Users className="w-10 h-10 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold tracking-tight">{stats.anggota}</div>
                <div className="text-[10px] lg:text-xs font-bold tracking-wider uppercase text-yellow-400/90">Warga Terdaftar</div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-2 lg:px-6">
              <Calendar className="w-10 h-10 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold tracking-tight">{stats.kegiatan}</div>
                <div className="text-[10px] lg:text-xs font-bold tracking-wider uppercase text-yellow-400/90">Agenda Lomba</div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-2 lg:px-6">
              <CheckCircle className="w-10 h-10 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold tracking-tight">{stats.peserta}</div>
                <div className="text-[10px] lg:text-xs font-bold tracking-wider uppercase text-yellow-400/90">Pendaftar Lomba</div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-2 lg:px-6">
              <Newspaper className="w-10 h-10 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold tracking-tight">{stats.berita}</div>
                <div className="text-[10px] lg:text-xs font-bold tracking-wider uppercase text-yellow-400/90">Publikasi Berita</div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
