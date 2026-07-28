import { useState, useEffect } from 'react'
import { Search, Calendar, Bell, Newspaper, Loader2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

type NewsItem = {
  id: string
  judul: string
  isi?: string
  thumbnail?: string
  created_at: string
}

type AnnouncementItem = {
  id: string
  judul: string
  isi?: string
  gambar?: string
  prioritas?: string
  created_at: string
}

const CATEGORIES = ['Semua', 'Kegiatan', 'Prestasi', 'UMKM', 'Sosial', 'Pengumuman']

const priorityStyle = (p?: string) => {
  if (p === 'mendesak' || p === 'urgent') return { dot: 'bg-red-500', label: 'MENDESAK', color: 'text-red-500' }
  if (p === 'penting' || p === 'important') return { dot: 'bg-secondary', label: 'PENTING', color: 'text-secondary' }
  return { dot: 'bg-primary', label: 'INFORMASI', color: 'text-primary' }
}

export default function InformasiPublik() {
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [berita, setBerita] = useState<NewsItem[]>([])
  const [pengumuman, setPengumuman] = useState<AnnouncementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 6

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [beritaRes, pengumumanRes] = await Promise.all([
        supabase.from('news').select('*').order('created_at', { ascending: false }),
        supabase.from('announcements').select('*').order('created_at', { ascending: false })
      ])
      if (beritaRes.data) setBerita(beritaRes.data)
      if (pengumumanRes.data) setPengumuman(pengumumanRes.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBerita = berita.filter(b => {
    return b.judul?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const pagedBerita = filteredBerita.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const totalPages = Math.max(1, Math.ceil(filteredBerita.length / ITEMS_PER_PAGE))

  const heroNews = berita[0]

  return (
    <div className="bg-md-surface min-h-screen pb-20 font-inter">

      {/* ===== FEATURED HERO ===== */}
      {heroNews && (
        <section className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-12 mb-12">
          <Link to={`/informasi/${heroNews.id}`} className="relative w-full h-[480px] rounded-[28px] overflow-hidden group shadow-2xl block">
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
              {heroNews.thumbnail ? (
                <img src={heroNews.thumbnail} alt={heroNews.judul} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-md-primary-container to-primary flex items-center justify-center">
                  <Newspaper className="w-24 h-24 text-white/30" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4 md:p-8 md:p-12 max-w-3xl">
              <span className="bg-secondary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                UTAMA • BERITA
              </span>
              <h1 className="text-white text-2xl md:text-4xl font-extrabold mb-4 leading-tight">
                {heroNews.judul}
              </h1>
              <p className="text-white/80 text-base md:text-lg mb-6 line-clamp-2">
                {heroNews.isi?.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...'}
              </p>
              <div className="flex items-center gap-4 md:gap-6">
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(heroNews.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/30 transition-colors">
                  Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:p-8">

          {/* ===== NEWS COLUMN ===== */}
          <div className="lg:col-span-8">

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setCurrentPage(1) }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      activeCategory === cat
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-md-surface-container text-md-on-surface-variant hover:bg-md-surface-container-high'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-md-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Cari berita..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-md-surface-container-low border border-md-outline-variant/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-48"
                />
              </div>
            </div>

            {/* News Grid */}
            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : pagedBerita.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-md-outline-variant/30">
                <Newspaper className="w-12 h-12 text-md-outline mx-auto mb-4" />
                <p className="font-semibold text-md-on-surface-variant">Belum ada berita ditemukan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {pagedBerita.map(item => (
                  <Link to={`/informasi`} key={item.id} className="group">
                    <article className="bg-white rounded-2xl border border-md-outline-variant/30 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                      <div className="h-48 overflow-hidden relative bg-md-surface-container-high">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.judul}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Newspaper className="w-16 h-16 text-md-outline/30" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                            Berita
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-md-on-surface-variant text-xs mb-3">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <h3 className="font-bold text-lg text-primary mb-3 line-clamp-2 leading-snug group-hover:text-secondary transition-colors">
                          {item.judul}
                        </h3>
                        <p className="text-md-on-surface-variant text-sm line-clamp-3 mb-5">
                          {item.isi?.replace(/<[^>]*>?/gm, '').slice(0, 120) + '...'}
                        </p>
                        <span className="flex items-center gap-2 text-secondary text-sm font-semibold group-hover:gap-3 transition-all">
                          Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-container disabled:opacity-40 transition-colors"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'border border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-container'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-container disabled:opacity-40 transition-colors"
                  >
                    ›
                  </button>
                </nav>
              </div>
            )}
          </div>

          {/* ===== SIDEBAR ===== */}
          <aside className="lg:col-span-4 space-y-6">

            {/* Pengumuman Penting */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-4 md:p-8 shadow-sm border border-md-outline-variant/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-50 text-red-600 p-2 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-primary">Pengumuman Penting</h2>
              </div>
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
              ) : pengumuman.length === 0 ? (
                <p className="text-md-on-surface-variant text-sm text-center py-6">Belum ada pengumuman.</p>
              ) : (
                <div className="space-y-5">
                  {pengumuman.slice(0, 3).map(item => {
                    const pStyle = priorityStyle(item.prioritas)
                    return (
                      <div key={item.id} className="pb-5 border-b border-md-outline-variant/30 last:border-0 last:pb-0">
                        <span className={`${pStyle.color} text-xs font-bold uppercase tracking-wider block mb-1`}>
                          {pStyle.label}
                        </span>
                        <h4 className="text-sm font-semibold text-md-on-surface mb-2 hover:text-primary transition-colors cursor-pointer leading-snug">
                          {item.judul}
                        </h4>
                        {item.isi && (
                          <p className="text-md-on-surface-variant text-xs leading-relaxed line-clamp-2">{item.isi}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              <button className="w-full mt-6 py-3 border-2 border-primary text-primary font-semibold text-sm rounded-xl hover:bg-primary hover:text-white transition-all duration-300">
                Lihat Semua Pengumuman
              </button>
            </div>

            {/* Newsletter */}
            <div className="bg-primary rounded-3xl p-4 md:p-8 text-white overflow-hidden relative shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-20 blur-3xl -mr-16 -mt-16 rounded-full" />
              <div className="relative z-10 space-y-4">
                <h2 className="text-xl font-bold">Jangan Lewatkan Kabar Terbaru</h2>
                <p className="text-white/70 text-sm leading-relaxed">Dapatkan berita dan pengumuman langsung di email Anda setiap minggu.</p>
                <div className="space-y-3">
                  <label className="text-white/70 text-xs font-medium">Alamat Email</label>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                  />
                  <button className="w-full bg-secondary text-white py-3 rounded-xl text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-md">
                    Berlangganan Sekarang
                  </button>
                </div>
                <p className="text-[11px] text-white/40 text-center italic">Kami menjaga privasi Anda. Berhenti berlangganan kapan saja.</p>
              </div>
            </div>

            {/* Media Sosial */}
            <div className="bg-md-surface-container rounded-3xl p-4 md:p-8 border border-md-outline-variant/30">
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-5">Ikuti Media Sosial</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'Instagram', href: '#', icon: '📸' },
                  { label: 'Facebook', href: '#', icon: '🌐' },
                  { label: 'YouTube', href: '#', icon: '▶️' },
                  { label: 'WhatsApp', href: '#', icon: '💬' },
                ].map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-md-surface-bright transition-colors group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
                    <span className="text-md-on-surface-variant text-sm font-medium">{label}</span>
                  </a>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  )
}
