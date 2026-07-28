import { useState, useEffect } from 'react'
import { Search, Image as ImageIcon, Filter, Loader2, Share2, Sparkles, Play, Upload, Instagram } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function GaleriPublik() {
  const [galleries, setGalleries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Kategori')
  const [activeYear, setActiveYear] = useState('Semua Tahun')
  const [activeMedia, setActiveMedia] = useState('Semua Media')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchGalleries()
  }, [])

  const fetchGalleries = async () => {
    try {
      setLoading(true)
      const [galRes, annRes] = await Promise.all([
        supabase.from('gallery').select('*').order('created_at', { ascending: false }),
        supabase.from('announcements').select('*').not('gambar', 'is', null).order('created_at', { ascending: false })
      ])
      
      const combined = [
        ...(galRes.data || []).map(g => ({ ...g, type: 'galeri' })),
        ...(annRes.data || []).map(a => ({ id: a.id, judul: a.judul, gambar: a.gambar, kategori: 'Pengumuman', created_at: a.created_at, type: 'pengumuman' }))
      ]
      
      setGalleries(combined)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['Kategori', ...Array.from(new Set(galleries.map(g => g.kategori || 'Umum')))]
  const years = ['Semua Tahun', ...Array.from(new Set(galleries.map(g => new Date(g.created_at).getFullYear().toString())))].sort((a,b) => b.localeCompare(a))

  const filteredGalleries = galleries.filter(g => {
    const matchCat = activeCategory === 'Kategori' || g.kategori === activeCategory
    const matchYear = activeYear === 'Semua Tahun' || new Date(g.created_at).getFullYear().toString() === activeYear
    const matchSearch = g.judul.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchYear && matchSearch
  })

  return (
    <div className="bg-md-surface text-md-on-surface min-h-screen font-inter selection:bg-md-primary-fixed selection:text-md-on-primary-fixed">
      <main className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12">
        {/* Hero Section & Header */}
        <header className="mb-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-extrabold text-4xl md:text-5xl text-md-primary mb-4 tracking-tight">Galeri & Dokumentasi</h1>
              <p className="text-lg text-md-on-surface-variant max-w-2xl leading-relaxed">
                Jejak langkah pengabdian kami dalam membangun lingkungan yang lebih baik. Temukan ribuan momen inspiratif dari setiap kegiatan Karang Taruna.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-md-secondary text-md-on-secondary rounded-lg font-semibold text-sm hover:shadow-xl transition-all">
                <Share2 className="w-4 h-4" />
                Bagikan Momen
              </button>
            </div>
          </div>
        </header>



        {/* Filters Section */}
        <section className="bg-md-surface-container-low p-6 rounded-xl mb-6 border border-md-outline-variant sticky top-24 z-40 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="font-semibold text-sm text-md-primary mr-2 flex items-center gap-1">
                <Filter className="w-5 h-5" /> Saring:
              </span>
              <select 
                className="bg-md-surface border border-md-outline-variant outline-none rounded-lg font-semibold text-sm px-4 py-2 focus:ring-2 focus:ring-md-primary focus:border-md-primary cursor-pointer"
                value={activeYear}
                onChange={(e) => setActiveYear(e.target.value)}
              >
                {years.map((year, i) => <option key={i} value={year}>{year}</option>)}
              </select>
              <select 
                className="bg-md-surface border border-md-outline-variant outline-none rounded-lg font-semibold text-sm px-4 py-2 focus:ring-2 focus:ring-md-primary focus:border-md-primary cursor-pointer"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
              >
                {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
              </select>
              
              <button 
                onClick={() => setActiveMedia('Semua Media')}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${activeMedia === 'Semua Media' ? 'bg-md-primary text-md-on-primary shadow-sm' : 'bg-md-surface border border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-variant'}`}
              >
                Semua Media
              </button>
              <button 
                onClick={() => setActiveMedia('Foto')}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${activeMedia === 'Foto' ? 'bg-md-primary text-md-on-primary shadow-sm' : 'bg-md-surface border border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-variant'}`}
              >
                Foto
              </button>
              <button 
                onClick={() => setActiveMedia('Video')}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${activeMedia === 'Video' ? 'bg-md-primary text-md-on-primary shadow-sm' : 'bg-md-surface border border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-variant'}`}
              >
                Video
              </button>
            </div>
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-md-outline w-5 h-5" />
              <input 
                className="w-full pl-10 pr-4 py-2 bg-md-surface border border-md-outline-variant rounded-lg font-semibold text-sm focus:ring-2 focus:ring-md-primary focus:border-md-primary text-md-on-surface outline-none transition-shadow" 
                placeholder="Cari album atau kegiatan..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Masonry Grid Gallery */}
        <section className="pb-12 min-h-[400px]">
          {loading ? (
            <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 text-md-primary animate-spin" /></div>
          ) : filteredGalleries.length === 0 ? (
            <div className="text-center p-20">
              <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-500">Foto tidak ditemukan</h3>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {filteredGalleries.map((item) => (
                <div key={item.id} className="break-inside-avoid group relative overflow-hidden rounded-xl border border-md-outline-variant bg-white cursor-zoom-in shadow-sm hover:shadow-xl transition-shadow">
                  <img 
                    src={item.gambar} 
                    alt={item.judul}
                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100">
                    <span className="text-white/80 font-medium text-xs mb-1">{item.kategori}</span>
                    <h4 className="text-white font-semibold text-sm">{item.judul}</h4>
                    <p className="text-white/60 text-xs mt-1">{new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>



        {/* CTA Section */}
        <section className="text-center py-12">
          <h2 className="font-bold text-3xl text-md-primary mb-4">Punya Dokumentasi Menarik?</h2>
          <p className="text-md-on-surface-variant text-base mb-8 max-w-lg mx-auto">Bantu kami melengkapi jejak sejarah Karang Taruna. Bagikan foto atau video kegiatan Anda bersama kami di media sosial.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a className="flex items-center gap-3 px-8 py-4 bg-md-primary text-md-on-primary rounded-xl font-semibold text-sm hover:shadow-xl transition-all hover:-translate-y-1" href="#">
              <Upload className="w-5 h-5" />
              Unggah Media
            </a>
            <a className="flex items-center gap-3 px-8 py-4 bg-md-surface border border-md-outline-variant text-md-primary rounded-xl font-semibold text-sm hover:bg-md-surface-variant transition-all hover:-translate-y-1" href="#">
              <Instagram className="w-5 h-5" />
              Follow Instagram
            </a>
          </div>
        </section>

      </main>
    </div>
  )
}





