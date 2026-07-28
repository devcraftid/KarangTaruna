// @ts-nocheck
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Users, Briefcase, Trophy, Calendar,
  Store, Heart, MapPin, Clock, Leaf, Activity, Laptop
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

type EventItem = { id: string; title: string; date: string; time?: string; location?: string; status?: string; type: string }
type NewsItem = { id: string; judul: string; isi?: string; thumbnail?: string; created_at: string }
type ProductItem = { id: string; nama_produk: string; harga: number; gambar?: string; kategori?: string; is_active?: boolean }

type WorkProgramItem = { id: string; nama_program: string; deskripsi?: string; bidang?: string; gambar?: string; }
type SponsorItem = { id: string; nama_perusahaan: string; }
type MemberItem = { id: string; nama: string; foto_profil?: string; jabatan?: string; }

export default function Home() {
  const [stats, setStats] = useState({ anggota: 0, proker: 0, event: 0, umkm: 0 })
  const [events, setEvents] = useState<EventItem[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [products, setProducts] = useState<ProductItem[]>([])
  const [topProkers, setTopProkers] = useState<WorkProgramItem[]>([])
  const [sponsorsList, setSponsorsList] = useState<SponsorItem[]>([])
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [membersRes, prokerRes, eventRes, umkmRes, eventsData, newsData, productsData, topProkersData, sponsorsData, ketuaData] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('work_programs').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('events').select('id, nama_acara, tanggal_mulai, tanggal_selesai, is_active').order('tanggal_mulai', { ascending: true }).limit(3),
        supabase.from('news').select('id, judul, isi, thumbnail, created_at').order('created_at', { ascending: false }).limit(4),
        supabase.from('products').select('id, nama_produk, harga, gambar, is_active').eq('is_active', true).order('created_at', { ascending: false }).limit(4),
        supabase.from('work_programs').select('id, nama_program, deskripsi').order('created_at', { ascending: false }).limit(4),
        supabase.from('sponsors').select('id, nama_perusahaan').limit(10),
        supabase.from('site_settings').select('*').limit(1)
      ])
      setStats({
        anggota: membersRes.count || 0,
        proker: prokerRes.count || 0,
        event: eventRes.count || 0,
        umkm: umkmRes.count || 0,
      })
      if (eventsData.data) {
        setEvents(eventsData.data.map(e => ({
          id: e.id,
          title: e.nama_acara || '',
          date: e.tanggal_mulai,
          time: '',
          location: '',
          status: e.is_active ? 'active' : 'inactive',
          type: 'event'
        })))
      }
      if (newsData.data) setNews(newsData.data)
      if (productsData.data) setProducts(productsData.data)
      if (topProkersData.data) setTopProkers(topProkersData.data)
      if (sponsorsData.data) setSponsorsList(sponsorsData.data)
      if (ketuaData.data && ketuaData.data.length > 0) setSettings(ketuaData.data[0])
    } catch (err) {
      console.error(err)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return { day: '--', month: '---' }
    const d = new Date(dateStr)
    return { day: d.toLocaleDateString('id-ID', { day: '2-digit' }), month: d.toLocaleDateString('id-ID', { month: 'short' }) }
  }

  const formatRupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  const eventStatusColor = (s?: string) => {
    if (s === 'active' || s === 'ongoing') return 'bg-green-500'
    if (s === 'completed') return 'bg-slate-400'
    return 'bg-amber-500'
  }
  const eventStatusLabel = (s?: string) => {
    if (s === 'active' || s === 'ongoing') return 'Pendaftaran Dibuka'
    if (s === 'completed') return 'Selesai'
    return 'Segera Hadir'
  }

  return (
    <div className="flex flex-col">

      {/* ===== 1. HERO ===== */}
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-md-surface-container-highest">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/30 z-10" />
          {/* Admin will input hero images via setting later. Currently disabled dummy image. */}
        </div>
        <div className="relative z-20 h-full max-w-[1280px] mx-auto px-6 lg:px-10 flex flex-col justify-center">
          <div className="max-w-2xl space-y-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-white text-xs font-bold uppercase tracking-widest">
              Generasi Perubahan
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Membangun Desa, <br />
              <span className="text-md-secondary-fixed">Memberdayakan Pemuda</span>
            </h1>
            <p className="text-lg text-white/85 leading-relaxed max-w-xl">
              Wadah pengembangan generasi muda yang kreatif, inovatif, dan berjiwa sosial untuk kemajuan masyarakat yang inklusif.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/tentang" className="px-8 py-4 bg-secondary text-white font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                Daftar Anggota <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/lomba" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-white/20 transition-all">
                <Calendar className="w-5 h-5" /> Lihat Kegiatan
              </Link>
            </div>
          </div>
        </div>
        {/* Slider dots indicator */}
        <div className="absolute bottom-10 left-6 lg:left-10 z-20 flex gap-2">
          <div className="w-12 h-1.5 rounded-full bg-secondary" />
          <div className="w-6 h-1.5 rounded-full bg-white/30" />
          <div className="w-6 h-1.5 rounded-full bg-white/30" />
        </div>
      </section>

      {/* ===== 2. STATS FLOATING ===== */}
      <section className="relative z-30 -mt-16 max-w-[1280px] mx-auto px-6 lg:px-10 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-white dark:bg-md-inverse-surface p-4 md:p-8 rounded-3xl shadow-2xl border border-md-outline-variant/20">
          {[
            { label: 'Anggota Aktif', value: stats.anggota || '—', icon: Users },
            { label: 'Program Berjalan', value: stats.proker || '—', icon: Briefcase },
            { label: 'UMKM Terbina', value: stats.umkm || '—', icon: Store },
            { label: 'Total Event', value: stats.event || '—', icon: Trophy },
          ].map(({ label, value, icon: Icon }, i) => (
            <div key={i} className={`text-center space-y-2 ${i < 3 ? 'md:border-r border-md-outline-variant/30' : ''}`}>
              <Icon className="w-7 h-7 text-primary mx-auto mb-1 opacity-70" />
              <div className="text-3xl font-extrabold text-primary">{value}</div>
              <div className="text-xs font-semibold text-md-on-surface-variant uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 3. SAMBUTAN KETUA ===== */}
      <section className="py-24 max-w-[1280px] mx-auto px-6 lg:px-10 w-full">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
          <div className="md:col-span-5 relative group">
            <div className="absolute inset-0 bg-secondary/80 rounded-2xl rotate-3 transition-transform group-hover:rotate-0 duration-500" />
            {settings?.ketua_foto ? (
              <img 
                src={settings.ketua_foto} 
                alt={settings?.ketua_nama || 'Ketua'}
                className="relative z-10 w-full rounded-2xl aspect-[4/5] object-cover shadow-xl bg-md-surface-container-highest"
              />
            ) : (
              <div className="relative z-10 w-full rounded-2xl aspect-[4/5] shadow-xl bg-md-surface-container-highest flex items-center justify-center">
                <Users className="w-24 h-24 text-md-outline opacity-30" />
              </div>
            )}
            <div className="absolute -bottom-5 -right-5 z-20 bg-primary text-white p-5 rounded-2xl shadow-xl hidden lg:block">
              <span className="font-bold text-base block">{settings?.ketua_nama || 'Belum diatur'}</span>
              <span className="text-md-primary-fixed text-xs opacity-80">{settings?.ketua_jabatan || 'Ketua'}</span>
            </div>
          </div>
          <div className="md:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">Sambutan Ketua</h2>
              <p className="text-lg text-md-on-surface-variant font-medium italic mb-6">
                "{settings?.ketua_sambutan || 'Pesan sambutan belum diatur.'}"
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-md-surface-container-low p-6 rounded-2xl border-l-4 border-secondary">
                <h4 className="text-lg font-bold text-primary mb-2">Visi</h4>
                <p className="text-sm text-md-on-surface-variant leading-relaxed">Menjadi organisasi kepemudaan yang mandiri, profesional, dan garda terdepan dalam kesejahteraan sosial.</p>
              </div>
              <div className="bg-md-surface-container-low p-6 rounded-2xl border-l-4 border-primary">
                <h4 className="text-lg font-bold text-primary mb-2">Misi</h4>
                <p className="text-sm text-md-on-surface-variant leading-relaxed">Meningkatkan kapasitas SDM pemuda melalui pelatihan dan pemberdayaan ekonomi kreatif lokal.</p>
              </div>
            </div>
            <Link to="/tentang" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
              Pelajari Lebih Lanjut <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 4. PROGRAM KERJA BENTO ===== */}
      <section className="py-20 bg-md-surface-container">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">Program Kerja Unggulan</h2>
              <p className="text-md-on-surface-variant">Inisiatif strategis kami untuk pemberdayaan masyarakat.</p>
            </div>
            <Link to="/program-kerja" className="flex items-center gap-1 text-primary font-bold text-sm hover:gap-3 transition-all">
              Semua Program <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
              <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
            {topProkers.length > 0 ? (
              <>
                {/* Big card */}
                {topProkers[0] && (
                  <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-3xl bg-primary cursor-pointer flex items-center justify-center min-h-[300px] md:min-h-0">
                    {topProkers[0].gambar ? (
                      <img
                        src={topProkers[0].gambar}
                        alt={topProkers[0].nama_program}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <Briefcase className="absolute inset-0 w-full h-full p-20 object-cover opacity-10 group-hover:scale-110 transition-transform duration-700 text-white" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 p-8 space-y-3">
                      <div className="bg-secondary px-3 py-1 rounded-full text-[10px] text-white w-fit font-bold uppercase tracking-widest">{topProkers[0].bidang || 'Program'}</div>
                      <h3 className="text-white text-xl font-bold">{topProkers[0].nama_program}</h3>
                      <p className="text-white/80 text-sm leading-relaxed">{topProkers[0].deskripsi || 'Tidak ada deskripsi'}</p>
                    </div>
                  </div>
                )}
                {/* Small cards */}
                {topProkers[1] && (
                  <div className="group relative overflow-hidden rounded-3xl bg-md-secondary-fixed flex flex-col justify-between p-6">
                    <Leaf className="w-10 h-10 text-secondary" />
                    <div>
                      <h3 className="text-md-on-secondary-fixed font-bold text-lg">{topProkers[1].nama_program}</h3>
                      <p className="text-md-on-secondary-fixed-variant text-sm mt-1 line-clamp-2">{topProkers[1].deskripsi}</p>
                    </div>
                  </div>
                )}
                {topProkers[2] && (
                  <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-md-surface-container-high border border-md-outline-variant/30 flex flex-col justify-between p-6">
                    <Activity className="w-10 h-10 text-primary" />
                    <div>
                      <h3 className="text-primary font-bold text-lg">{topProkers[2].nama_program}</h3>
                      <p className="text-md-on-surface-variant text-sm mt-1 line-clamp-2">{topProkers[2].deskripsi}</p>
                    </div>
                  </div>
                )}
                {topProkers[3] && (
                  <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-white dark:bg-md-surface-container-high border border-md-outline-variant/30 flex items-center gap-8 p-8">
                    <div className="flex-1 space-y-3">
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase w-fit">{topProkers[3].bidang || 'Program'}</div>
                      <h3 className="text-primary font-bold text-xl">{topProkers[3].nama_program}</h3>
                      <p className="text-md-on-surface-variant text-sm leading-relaxed line-clamp-2">{topProkers[3].deskripsi}</p>
                    </div>
                    <div className="hidden sm:flex w-28 h-28 bg-primary/10 rounded-2xl items-center justify-center shrink-0">
                      <Store className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-md-on-surface-variant col-span-4 text-center py-12">Belum ada program kerja yang dipublikasikan.</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== 5. UPCOMING EVENTS ===== */}
      <section className="py-20 max-w-[1280px] mx-auto px-6 lg:px-10 w-full">
        <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-12 tracking-tight">Agenda & Kegiatan Mendatang</h2>
        {events.length === 0 ? (
          <div className="text-center py-16 text-md-on-surface-variant bg-md-surface-container-low rounded-3xl">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold">Belum ada agenda yang dijadwalkan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((ev) => {
              const d = formatDate(ev.date)
              return (
                <Link to={`/lomba/${ev.id}?type=${ev.type}`} key={ev.id}
                  className="bg-white dark:bg-md-inverse-surface rounded-2xl border border-md-outline-variant/30 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-48 overflow-hidden bg-md-surface-container-high flex items-center justify-center">
                    <div className="text-center opacity-20">
                      <Calendar className="w-24 h-24 text-primary mx-auto" />
                    </div>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl text-center shadow">
                      <div className="text-primary font-extrabold text-xl leading-none">{d.day}</div>
                      <div className="text-md-on-surface-variant text-[10px] font-bold uppercase mt-0.5">{d.month}</div>
                    </div>
                    <div className={`absolute top-4 right-4 ${eventStatusColor(ev.status)} text-white text-[10px] font-bold px-2 py-1 rounded-full`}>
                      {eventStatusLabel(ev.status)}
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="font-bold text-lg text-primary leading-tight">{ev.title}</h3>
                    <div className="space-y-1.5">
                      {ev.location && (
                        <div className="flex items-center gap-2 text-md-on-surface-variant text-sm">
                          <MapPin className="w-4 h-4 shrink-0" /> {ev.location}
                        </div>
                      )}
                      {ev.time && (
                        <div className="flex items-center gap-2 text-md-on-surface-variant text-sm">
                          <Clock className="w-4 h-4 shrink-0" /> {ev.time} WIB
                        </div>
                      )}
                    </div>
                    <div className="w-full py-3 bg-md-surface-container-high text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-colors text-sm text-center">
                      Lihat Detail
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ===== 6. BERITA & PENGUMUMAN ===== */}
      <section className="py-20 bg-md-surface">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">Berita & Pengumuman</h2>
            <Link to="/informasi" className="px-5 py-2 border-2 border-primary text-primary rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all">
              Lihat Semua
            </Link>
          </div>
          {news.length === 0 ? (
            <p className="text-md-on-surface-variant text-center py-16">Belum ada berita yang dipublikasikan.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Featured */}
              {news[0] && (
                <Link to={`/informasi/${news[0].id}`} className="group cursor-pointer">
                  <div className="overflow-hidden rounded-2xl mb-5 h-72 bg-md-surface-container-high">
                    {news[0].thumbnail ? (
                      <img src={news[0].thumbnail} alt={news[0].judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Laptop className="w-16 h-16 text-md-outline" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-3 text-secondary font-bold text-xs uppercase">
                      <span>Berita Utama</span>
                      <span className="text-md-outline-variant">•</span>
                      <span className="text-md-on-surface-variant">{new Date(news[0].created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</span>
                    </div>
                    <h3 className="text-xl font-bold text-primary leading-tight group-hover:text-secondary transition-colors">{news[0].judul}</h3>
                    {news[0].isi && <p className="text-md-on-surface-variant text-sm line-clamp-2">{news[0].isi.replace(/<[^>]*>?/gm, '')}</p>}
                  </div>
                </Link>
              )}
              {/* List */}
              <div className="space-y-6">
                {news.slice(1, 4).map((item) => (
                  <Link to={`/informasi/${item.id}`} key={item.id}
                    className="flex gap-4 group cursor-pointer border-b border-md-outline-variant/30 pb-6 last:border-0 last:pb-0">
                    <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-md-surface-container-high">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.judul} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Laptop className="w-8 h-8 text-md-outline/50" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-secondary text-xs font-bold uppercase">Berita</span>
                      <h4 className="text-base font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2">{item.judul}</h4>
                      <p className="text-md-on-surface-variant text-xs">{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== 7. ETALASE UMKM ===== */}
      <section className="py-20 bg-primary">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-md-secondary-fixed tracking-tight">Etalase UMKM Kreatif</h2>
            <p className="text-md-primary-fixed/80 text-lg max-w-2xl mx-auto">Dukung ekonomi lokal dengan membeli produk karya pemuda dan pengrajin desa kami.</p>
          </div>
          {products.length === 0 ? (
            <p className="text-white/60 text-center py-12">Belum ada produk tersedia.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 group">
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-white/10">
                    {p.gambar
                      ? <img src={p.gambar} alt={p.nama_produk} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center"><Store className="w-12 h-12 text-white/30" /></div>}
                  </div>
                  <h4 className="text-white font-semibold text-sm line-clamp-2">{p.nama_produk}</h4>
                  <p className="text-md-secondary-fixed font-bold mt-1">{formatRupiah(p.harga)}</p>
                  <Link to="/etalase" className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors">
                    Lihat Produk
                  </Link>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/etalase" className="inline-flex items-center gap-2 border-2 border-md-secondary-fixed text-md-secondary-fixed px-8 py-3 rounded-xl font-bold hover:bg-md-secondary-fixed hover:text-primary transition-all">
              Kunjungi Etalase Lengkap <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 8. SPONSORS MARQUEE ===== */}
      <section className="py-10 bg-md-surface-container-low border-y border-md-outline-variant/20 overflow-hidden">
        <p className="text-center text-xs font-bold text-md-on-surface-variant uppercase tracking-widest mb-6">Didukung Oleh</p>
        <div className="animate-marquee">
          {sponsorsList.length > 0 ? (
            // Duplicate the list a few times for the marquee effect
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex shrink-0">
                {sponsorsList.map(s => (
                  <span key={`${i}-${s.id}`} className="text-md-on-surface-variant/40 font-extrabold text-xl uppercase px-10 whitespace-nowrap">{s.nama_perusahaan}</span>
                ))}
              </div>
            ))
          ) : (
            <span className="text-md-on-surface-variant/40 font-extrabold text-xl uppercase px-10 whitespace-nowrap">Belum ada data sponsor</span>
          )}
        </div>
      </section>

      {/* ===== 9. DONASI CTA ===== */}
      <section className="py-16 max-w-[1280px] mx-auto px-6 lg:px-10 w-full">
        <div className="bg-gradient-to-r from-primary to-md-primary-container rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Mari Berdonasi Bersama</h2>
            <p className="text-white/80 text-lg max-w-lg mx-auto md:mx-0">Setiap kontribusi Anda membantu program sosial dan pemberdayaan masyarakat yang nyata.</p>
          </div>
          <Link to="/patungan" className="shrink-0 px-10 py-4 bg-secondary text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg flex items-center gap-2">
            <Heart className="w-5 h-5" /> Donasi Sekarang
          </Link>
        </div>
      </section>

    </div>
  )
}





