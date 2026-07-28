import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function PatunganPublik() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [contributions, setContributions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Semua')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [campRes, prodRes, contRes] = await Promise.all([
        supabase.from('patungan_campaigns').select('*').order('created_at', { ascending: false }).limit(2),
        supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3),
        supabase.from('patungan_contributions').select('*').eq('status', 'verified').order('tanggal', { ascending: false }).limit(3)
      ])

      if (campRes.data) setCampaigns(campRes.data)
      if (prodRes.data) setProducts(prodRes.data)
      if (contRes.data) setContributions(contRes.data)
      
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0)

  const getProgress = (terkumpul: number, target: number) => {
    if (!target) return 0
    return Math.min(Math.round(((terkumpul || 0) / target) * 100), 100)
  }

  return (
    <div className="bg-md-background text-md-on-surface font-body-md overflow-x-hidden">
      <main className="max-w-container-max mx-auto px-margin-desktop py-unit-xl">
        
        {/* Hero Section */}
        <section className="mb-unit-xl relative rounded-3xl overflow-hidden min-h-[400px] flex items-center">
          <div className="absolute inset-0 bg-md-primary/90"></div>
          <div className="relative z-10 w-full md:w-2/3 px-margin-desktop py-unit-xl text-md-on-primary">
            <h1 className="font-headline-xl text-headline-xl mb-4 text-white">Pusat Pemberdayaan & Donasi Komunitas</h1>
            <p className="font-body-lg text-body-lg opacity-90 mb-unit-lg text-white">Membangun ekonomi lokal melalui UMKM dan menyatukan kepedulian untuk kemajuan bersama Desa kita.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#donasi" className="bg-md-secondary text-md-on-primary px-8 py-3 rounded-xl font-label-md text-body-md hover:bg-md-on-secondary-container transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">volunteer_activism</span>
                Donasi Sekarang
              </a>
              <a href="#umkm" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-xl font-label-md text-body-md hover:bg-white/20 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">storefront</span>
                Jelajahi UMKM
              </a>
            </div>
          </div>
        </section>

        {/* UMKM Marketplace Section */}
        <section id="umkm" className="mb-unit-xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-unit-lg gap-4">
            <div>
              <span className="text-md-secondary font-bold tracking-widest text-label-sm uppercase">Ekonomi Lokal</span>
              <h2 className="font-headline-lg text-headline-lg mt-2">UMKM Marketplace</h2>
            </div>
            <div className="flex gap-2 bg-md-surface-container-low p-1 rounded-xl">
              {['Semua', 'Kuliner', 'Jasa', 'Kerajinan'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-label-md transition-all ${activeFilter === cat ? 'bg-md-primary text-md-on-primary' : 'hover:bg-md-primary/5 text-md-on-surface-variant'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {products.length === 0 && !loading ? (
               <div className="col-span-3 text-center py-12 text-md-on-surface-variant">Belum ada produk UMKM</div>
            ) : (
              products.map(p => (
                <div key={p.id} className="bg-md-surface rounded-xl border border-md-outline-variant overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48 overflow-hidden bg-md-surface-container-high">
                    {p.gambar ? (
                      <img src={p.gambar} alt={p.nama} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-md-outline"><span className="material-symbols-outlined text-4xl opacity-50">storefront</span></div>
                    )}
                    <span className="absolute top-4 left-4 bg-md-secondary text-md-on-primary px-3 py-1 rounded-full text-label-sm">UMKM</span>
                  </div>
                  <div className="p-unit-md">
                    <h3 className="font-headline-md text-headline-md mb-1">{p.nama_produk}</h3>
                    <p className="text-md-on-surface-variant text-body-md mb-4 line-clamp-2">{p.deskripsi || 'Produk UMKM lokal unggulan.'}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-md-outline-variant">
                      <div>
                        <span className="text-label-sm text-md-on-surface-variant block">Mulai dari</span>
                        <span className="text-md-primary font-bold">{formatRupiah(p.harga)}</span>
                      </div>
                      <a href={`https://wa.me/6281234567890?text=Halo%20saya%20tertarik%20dengan%20produk%20${p.nama_produk}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg font-label-md hover:brightness-110 transition-all">
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Donation Section */}
        <section id="donasi" className="mb-unit-xl bg-md-primary-container rounded-3xl p-margin-desktop text-md-on-primary-container overflow-hidden relative">
          <div className="relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-unit-xl">
              <span className="text-md-secondary-fixed font-bold tracking-widest text-label-sm uppercase">Transparansi Dana</span>
              <h2 className="font-headline-lg text-headline-lg text-md-on-primary mt-2 mb-4">Program Donasi Aktif</h2>
              <p className="text-md-on-primary-container/80 text-body-md">Setiap rupiah yang Anda donasikan akan berdampak langsung pada kesejahteraan warga desa kita.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
              {campaigns.length === 0 && !loading ? (
                 <div className="col-span-2 text-center py-12 text-white/60">Belum ada kampanye donasi aktif</div>
              ) : (
                campaigns.map(camp => (
                  <div key={camp.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-unit-lg rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-md-secondary text-md-on-primary px-3 py-1 rounded-full text-label-sm">{camp.status === 'active' ? 'Aktif' : 'Selesai'}</span>
                      <span className="text-label-sm opacity-70 text-white">Target: {formatRupiah(camp.target_dana)}</span>
                    </div>
                    <h3 className="font-headline-md text-md-on-primary mb-2 line-clamp-1">{camp.judul}</h3>
                    <p className="text-body-md text-white/70 mb-6 line-clamp-2">{camp.deskripsi}</p>
                    <div className="mb-6">
                      <div className="flex justify-between text-label-md mb-2 text-white">
                        <span>Terkumpul: <span className="text-md-secondary-fixed font-bold">{formatRupiah(camp.terkumpul)}</span></span>
                        <span>{getProgress(camp.terkumpul, camp.target_dana)}%</span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div className="bg-md-secondary-fixed h-full rounded-full shadow-[0_0_15px_rgba(255,221,186,0.3)]" style={{ width: `${getProgress(camp.terkumpul, camp.target_dana)}%` }}></div>
                      </div>
                    </div>
                    <Link to={`/patungan/${camp.id}`} className="block">
                      <button className="w-full bg-md-secondary-fixed text-md-on-secondary-fixed font-bold py-3 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">favorite</span>
                        Donasi Sekarang
                      </button>
                    </Link>
                  </div>
                ))
              )}
            </div>

            {/* Transparency List */}
            <div className="mt-unit-xl grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="bg-md-surface-container-low/10 p-unit-md rounded-2xl">
                <h4 className="font-label-md text-md-on-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-md-secondary-fixed">history</span>
                  Riwayat Donasi Terbaru
                </h4>
                <div className="space-y-3">
                  {contributions.length === 0 ? (
                    <p className="text-white/50 text-sm">Belum ada donasi.</p>
                  ) : (
                    contributions.map(c => (
                      <div key={c.id} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                        <div>
                          <p className="font-label-md text-md-on-primary">{c.nama_donatur || 'Hamba Allah'}</p>
                          <p className="text-label-sm opacity-60 text-white">{new Date(c.tanggal).toLocaleDateString('id-ID')}</p>
                        </div>
                        <span className="text-md-secondary-fixed font-bold">{formatRupiah(c.nominal)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="bg-md-surface-container-low/10 p-unit-md rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="font-label-md text-md-on-primary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-md-secondary-fixed">group</span>
                    Top Donatur Bulan Ini
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 bg-white/5 p-2 pr-4 rounded-full border border-white/10">
                      <div className="w-8 h-8 rounded-full bg-md-secondary text-md-on-primary flex items-center justify-center font-bold text-label-sm">AS</div>
                      <span className="text-label-sm text-md-on-primary">Aditya Saputra</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-2 pr-4 rounded-full border border-white/10">
                      <div className="w-8 h-8 rounded-full bg-md-primary text-md-on-primary flex items-center justify-center font-bold text-label-sm">RK</div>
                      <span className="text-label-sm text-md-on-primary">Rina Kartika</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-dashed border-white/20 text-center">
                  <p className="text-label-sm text-white/70 italic">"Terima kasih atas kebaikan hati para donatur. Seluruh data keuangan diaudit secara berkala oleh tim Karang Taruna."</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-md-secondary/10 rounded-full blur-[80px]"></div>
        </section>

        {/* Community Engagement Section */}
        <section className="mb-unit-xl grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Aspirasi Form */}
          <div className="lg:col-span-8 bg-md-surface rounded-3xl p-unit-lg border border-md-outline-variant shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-md-primary/10 rounded-2xl text-md-primary">
                <span className="material-symbols-outlined">campaign</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md">Suara Warga (Aspirasi)</h2>
                <p className="text-md-on-surface-variant text-body-md">Punya ide atau keluhan untuk desa? Sampaikan di sini.</p>
              </div>
            </div>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-unit-md" onSubmit={(e) => { e.preventDefault(); alert('Terima kasih! Aspirasi Anda telah terkirim.'); e.currentTarget.reset(); }}>
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-bold">Nama Lengkap</label>
                <input required className="bg-[#F7FAFC] border-none rounded-lg p-3 focus:ring-2 focus:ring-md-primary/20 outline-none transition-all text-black" placeholder="Masukkan nama Anda" type="text"/>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-label-md font-bold">Nomor WhatsApp</label>
                <input required className="bg-[#F7FAFC] border-none rounded-lg p-3 focus:ring-2 focus:ring-md-primary/20 outline-none transition-all text-black" placeholder="08xxxxxxxxx" type="tel"/>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-label-md font-bold">Pesan Aspirasi</label>
                <textarea required className="bg-[#F7FAFC] border-none rounded-lg p-3 focus:ring-2 focus:ring-md-primary/20 outline-none transition-all text-black" placeholder="Tuliskan aspirasi atau saran Anda secara detail..." rows={4}></textarea>
              </div>
              <div className="md:col-span-2 text-right">
                <button className="bg-md-primary text-md-on-primary px-8 py-3 rounded-xl font-bold hover:shadow-md transition-all" type="submit">Kirim Aspirasi</button>
              </div>
            </form>
          </div>

          {/* Membership Call to Action */}
          <div className="lg:col-span-4 bg-md-secondary rounded-3xl p-unit-lg text-md-on-primary shadow-sm flex flex-col justify-between overflow-hidden relative group">
            <div className="relative z-10">
              <h2 className="font-headline-md text-headline-md mb-2">Gabung Karang Taruna</h2>
              <p className="text-body-md opacity-90 mb-6">Jadilah bagian dari penggerak perubahan desa. Dapatkan pengalaman, relasi, dan kesempatan berkarya.</p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-label-md">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span> Pelatihan Soft Skill
                </li>
                <li className="flex items-center gap-2 text-label-md">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span> Akses Modal UMKM
                </li>
                <li className="flex items-center gap-2 text-label-md">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span> Sertifikat Anggota
                </li>
              </ul>
            </div>
            <Link to="/pendaftaran" className="relative z-10 w-full block">
              <button className="w-full bg-white text-md-secondary font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all text-center">Daftar Anggota Baru</button>
            </Link>
            <div className="absolute -right-8 -bottom-8 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            </div>
          </div>
        </section>

        {/* Contact & Maps Section */}
        <section className="mb-unit-xl">
          <div className="bg-md-surface rounded-3xl border border-md-outline-variant overflow-hidden shadow-sm flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-margin-desktop bg-md-surface-container-low">
              <span className="text-md-primary font-bold tracking-widest text-label-sm uppercase">Lokasi Kami</span>
              <h2 className="font-headline-lg text-headline-lg mt-2 mb-unit-md">Hubungi Kami</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-md-primary/5 flex items-center justify-center text-md-primary shrink-0">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-md-on-surface">Alamat Sekretariat</h4>
                    <p className="text-md-on-surface-variant text-body-md">Jl. Merdeka No. 45, Desa Maju Jaya, Kec. Pembangunan, Jawa Barat 40123</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-md-primary/5 flex items-center justify-center text-md-primary shrink-0">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-md-on-surface">Email & Kontak</h4>
                    <p className="text-md-on-surface-variant text-body-md">halo@karangtaruna.id<br/>+62 812-3456-7890</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-md-primary/5 flex items-center justify-center text-md-primary shrink-0">
                    <span className="material-symbols-outlined">share</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-md-on-surface mb-2">Media Sosial</h4>
                    <div className="flex gap-3">
                      <a href="#" className="p-2 bg-white rounded-lg border border-md-outline-variant hover:text-md-primary transition-colors">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
                      </a>
                      <a href="#" className="p-2 bg-white rounded-lg border border-md-outline-variant hover:text-md-primary transition-colors">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 min-h-[300px] relative">
              <div className="absolute inset-0 bg-slate-200 grayscale hover:grayscale-0 transition-all duration-700">
                <div className="absolute inset-0 bg-md-primary/5 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="bg-md-primary text-md-on-primary p-3 rounded-full shadow-lg animate-bounce">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <span className="mt-2 bg-white px-3 py-1 rounded-full shadow-sm font-label-sm">Sekretariat Karang Taruna</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
