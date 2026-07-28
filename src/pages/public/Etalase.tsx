import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Store, ShoppingBag, Search, Filter, MessageCircle, ArrowRight, Loader2, Star, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Product } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

export default function Etalase() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Semua')

  const { data: products, isLoading } = useQuery({
    queryKey: ['public_products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Product[]
    }
  })

  const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)

  // Derive categories dynamically from products
  const categories = ['Semua', ...Array.from(new Set(products?.map(p => p.kategori || 'Umum') || []))]

  const filteredProducts = (products || []).filter(p => {
    const matchCat = activeFilter === 'Semua' || p.kategori === activeFilter
    const matchSearch = p.nama.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  // WhatsApp Checkout Function
  const handleCheckout = (product: Product) => {
    const phone = '6281234567890' // Ganti dengan nomor WhatsApp BUMKT
    const message = `Halo BUMKT Karang Taruna! Saya tertarik untuk memesan produk ini:%0A%0A*${product.nama}*%0AHarga: ${formatRupiah(product.harga)}%0A%0AMohon info ketersediaan stoknya. Terima kasih!`
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  return (
    <div className="bg-md-surface min-h-screen pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/20 rounded-full mb-6">
             <Store className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 uppercase tracking-tight">Etalase BUMKT</h1>
          <p className="text-lg text-white/80 leading-relaxed mb-8">
            Dukung ekonomi lokal dan kemandirian organisasi dengan membeli produk/jasa dari Badan Usaha Milik Karang Taruna.
          </p>
          
          <div className="relative max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input 
                placeholder="Cari produk BUMKT..." 
                className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-full focus-visible:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        
        {/* Filter Categories */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
           <Filter className="w-5 h-5 text-slate-400 mr-2" />
           {categories.map((cat, i) => (
             <button
               key={i}
               onClick={() => setActiveFilter(cat)}
               className={`px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm
                 ${activeFilter === cat 
                   ? 'bg-indigo-600 text-white scale-105' 
                   : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
             >
               {cat}
             </button>
           ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-20 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-dashed dark:border-slate-800 max-w-2xl mx-auto">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-500 mb-2">Tidak ada produk ditemukan.</h3>
            <p className="text-sm text-slate-400">Coba ubah kata kunci atau kategori pencarian Anda.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex flex-col h-full hover:-translate-y-2">
                <div className="relative h-56 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {product.stok > 0 && product.stok < 5 && (
                    <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Sisa {product.stok}
                    </div>
                  )}
                  {product.gambar_url ? (
                    <img 
                      src={product.gambar_url} 
                      alt={product.nama} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingBag className="w-16 h-16" />
                    </div>
                  )}
                  
                  {/* Hover Overlay Desktop */}
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                     <button 
                       onClick={() => handleCheckout(product)}
                       className="bg-white text-slate-900 font-bold px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                     >
                       <MessageCircle className="w-5 h-5 text-green-500" /> Beli Sekarang
                     </button>
                  </div>
                </div>
                
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                      {product.kategori || 'Produk'}
                    </span>
                    <div className="flex items-center text-amber-400 text-xs font-bold">
                       <Star className="w-3 h-3 fill-amber-400 mr-1" /> 5.0
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-2">{product.nama}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">{product.deskripsi}</p>
                  
                  <div className="mt-auto">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{formatRupiah(product.harga)}</p>
                  </div>
                  
                  {/* Mobile Checkout Button (visible only on small screens) */}
                  <button 
                    onClick={() => handleCheckout(product)}
                    className="md:hidden mt-4 w-full bg-green-500 text-white font-bold px-4 py-3 rounded-xl flex justify-center items-center gap-2 active:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" /> Pesan via WA
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}





