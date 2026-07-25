import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Calendar, Newspaper, Users, CheckCircle, ArrowRight, Award, Trophy, PieChart, Image as ImageIcon, MapPin, Store } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { lombaService } from '@/services/lombaService'
import { beritaService } from '@/services/beritaService'
import { getHouseholds } from '@/services/householdService'
import { getEvents } from '@/services/eventService'
import { Card, CardContent } from '@/components/ui/card'

export default function Home() {
  const { data: competitions } = useQuery({ queryKey: ['competitions'], queryFn: lombaService.getCompetitions })
  const { data: households } = useQuery({ queryKey: ['households'], queryFn: getHouseholds })
  const { data: berita } = useQuery({ queryKey: ['berita'], queryFn: beritaService.getBerita })
  const { data: events } = useQuery({ queryKey: ['events'], queryFn: getEvents })

  const stats = {
    warga: households?.length || 0,
    kegiatan: events?.length || competitions?.length || 0,
    peserta: events?.length ? competitions?.length || 0 : competitions?.length || 0,
    berita: berita?.length || 0
  }

  const latestBerita = berita?.slice(0, 3) || []

  const features = [
    { title: 'Agenda & Lomba', icon: Trophy, imageSrc: '/agenda-icon.png', desc: 'Ikuti berbagai lomba dan kegiatan menarik tingkat RW.', to: '/lomba', color: 'bg-orange-50' },
    { title: 'Transparansi Kas', icon: PieChart, desc: 'Pantau laporan keuangan dan penggunaan dana kas warga.', to: '/transparansi', color: 'bg-emerald-100 text-emerald-600' },
    { title: 'Hall of Fame', icon: Award, desc: 'Apresiasi dan sejarah perjalanan Karang Taruna kami.', to: '/hall-of-fame', color: 'bg-indigo-100 text-indigo-600' },
    { title: 'Galeri Kegiatan', icon: ImageIcon, desc: 'Dokumentasi foto dan video dari setiap program kami.', to: '/galeri', color: 'bg-pink-100 text-pink-600' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-background overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center pt-28 pb-32 lg:pt-20 lg:pb-40">
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[65%] bg-primary rounded-bl-[60px] md:rounded-bl-[120px] lg:rounded-bl-[200px] z-0 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-50" style={{ backgroundImage: "url('/banner.png')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent lg:bg-gradient-to-r lg:from-primary lg:via-primary/80 lg:to-transparent"></div>
          <div className="absolute bottom-20 right-10 rotate-[-5deg] text-right z-10 hidden lg:block opacity-10">
            <p className="text-6xl xl:text-8xl font-black text-white" style={{ fontFamily: 'cursive' }}>Muda Bergerak<br/>Desa Berdaya</p>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-full h-full pointer-events-none z-10 flex items-center justify-center lg:justify-end lg:pr-[20%] opacity-5 lg:opacity-100">
          <img src="/logo.png" alt="Logo" className="w-[300px] h-[300px] xl:w-[500px] xl:h-[500px] object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.4)]" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-2xl bg-white/90 dark:bg-card/90 lg:bg-transparent lg:dark:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-8 lg:p-0 rounded-3xl shadow-xl lg:shadow-none border lg:border-none">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20">
              <MapPin className="w-4 h-4 mr-2" /> Pondok Betung - Pondok Aren
            </div>
            
            <h2 className="text-3xl md:text-5xl text-primary font-bold italic tracking-wide mb-2" style={{ fontFamily: 'cursive' }}>Bersatu, Beraksi,</h2>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4 leading-none drop-shadow-sm">
              Berkarya
            </h1>
            <h3 className="text-xl md:text-2xl text-primary font-bold tracking-widest uppercase mb-8">
              Untuk Desa Dan Bangsa
            </h3>
            
            <p className="text-slate-700 dark:text-slate-300 md:text-lg leading-relaxed mb-10 font-medium max-w-xl">
              Portal resmi Karang Taruna Bina Pemuda. Pusat informasi, transparansi kegiatan, dan kolaborasi warga untuk mewujudkan lingkungan yang aktif, kreatif, dan mandiri.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="h-14 px-8 text-base bg-primary hover:bg-primary/90 text-white rounded-full shadow-xl shadow-primary/30 group">
                <Link to="/lomba">
                  <Trophy className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> IKUTI LOMBA
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base bg-white dark:bg-card border-2 border-slate-200 dark:border-slate-800 rounded-full shadow-sm group">
                <Link to="/transparansi">
                  <PieChart className="mr-2 h-5 w-5 text-primary group-hover:scale-110 transition-transform" /> TRANSPARANSI KAS
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION (Floating) */}
      <section className="relative z-30 -mt-16 container mx-auto px-4">
        <div className="bg-[#8B1A10] text-white rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden border-4 border-white dark:border-card">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 relative z-10 divide-x-0 md:divide-x divide-white/10">
            {[
              { icon: Users, val: stats.warga, label: 'Keluarga' },
              { icon: Calendar, val: stats.kegiatan, label: 'Kegiatan' },
              { icon: Trophy, val: stats.peserta, label: 'Program Lomba' },
              { icon: Newspaper, val: stats.berita, label: 'Publikasi' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center justify-center gap-3 text-center md:text-left">
                <stat.icon className="w-10 h-10 md:w-12 md:h-12 text-yellow-400 drop-shadow-md" />
                <div>
                  <div className="text-3xl md:text-4xl font-black tracking-tighter">{stat.val}</div>
                  <div className="text-xs md:text-sm font-bold tracking-widest uppercase text-yellow-400/90">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURES/PROGRAM SECTION */}
      <section className="py-24 bg-white dark:bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Layanan & Program</h2>
            <div className="w-24 h-1.5 bg-primary rounded-full mx-auto mb-6"></div>
            <p className="text-lg text-slate-600 dark:text-slate-400">Jelajahi berbagai inisiatif dan layanan digital kami untuk memudahkan warga berpartisipasi dan mendapatkan informasi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Link key={i} to={feature.to} className="group block h-full">
                <Card className="h-full border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 group-hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl ${feature.color} flex items-center justify-center mb-6 md:mb-8 transform group-hover:scale-110 transition-transform duration-300 shadow-md overflow-hidden`}>
                      {feature.imageSrc ? (
                        <img src={feature.imageSrc} alt={feature.title} className="w-full h-full object-cover scale-[1.5] drop-shadow-lg" />
                      ) : (
                        <feature.icon className="w-10 h-10 md:w-12 md:h-12" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 font-medium mb-6 line-clamp-2">{feature.desc}</p>
                    <div className="flex items-center text-primary font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                      Jelajahi <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BERITA TERKINI */}
      <section className="py-24 bg-slate-100 dark:bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Kabar Terbaru</h2>
              <div className="w-24 h-1.5 bg-primary rounded-full mb-6"></div>
              <p className="text-lg text-slate-600 dark:text-slate-400">Dapatkan informasi terkini mengenai kegiatan, pengumuman, dan berita seputar lingkungan kita.</p>
            </div>
            <Button asChild variant="outline" className="rounded-full font-bold">
              <Link to="/informasi">Lihat Semua Berita <ArrowRight className="ml-2 w-4 h-4"/></Link>
            </Button>
          </div>

          {latestBerita.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestBerita.map((item) => (
                <Link key={item.id} to={`/informasi`} className="group">
                  <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-card hover:shadow-2xl transition-all duration-300 rounded-2xl h-full flex flex-col group-hover:-translate-y-1">
                    <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                      {item.foto_url ? (
                        <img src={item.foto_url} alt={item.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Newspaper className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                        {item.kategori}
                      </div>
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(item.created_at || '').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors">{item.judul}</h3>
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 text-sm">{item.konten}</p>
                      </div>
                      <div className="flex items-center text-primary font-bold text-sm">
                        Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-card p-12 rounded-2xl border text-center">
              <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700">Belum ada berita</h3>
              <p className="text-muted-foreground mt-2">Nantikan update informasi selanjutnya dari pengurus.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="relative py-24 bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-primary/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500 rounded-full blur-[100px] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6">Mari Berkontribusi!</h2>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 font-medium">Dukung setiap program Karang Taruna melalui donasi, partisipasi lomba, atau belanja di BUMKT.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 text-base bg-white text-slate-900 hover:bg-slate-100 rounded-full font-bold shadow-xl">
              <Link to="/patungan">
                Mulai Donasi
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base border-2 border-white/30 bg-transparent text-white hover:bg-white/20 hover:text-white rounded-full font-bold">
              <Link to="/etalase">
                <Store className="w-5 h-5 mr-2" /> Kunjungi Etalase
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
