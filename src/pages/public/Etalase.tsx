import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Store, ShoppingBag } from 'lucide-react'
import { Product } from '@/types'

export default function Etalase() {
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

  return (
    <div className="py-20 animate-in fade-in duration-700">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
            Etalase BUMKT
          </h1>
          <p className="text-lg text-slate-600">
            Dukung kemandirian organisasi dengan membeli produk dan layanan dari Badan Usaha Milik Karang Taruna.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Belum Ada Produk</h3>
            <p className="text-slate-500 mt-2">Saat ini belum ada produk yang ditampilkan di etalase.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products?.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  {product.gambar ? (
                    <img 
                      src={product.gambar} 
                      alt={product.nama_produk} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Store className="w-12 h-12 opacity-50" />
                    </div>
                  )}
                  {product.stok === 0 && (
                     <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">Habis</div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{product.nama_produk}</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-4 line-clamp-2 flex-1">{product.deskripsi}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-extrabold text-primary">{formatRupiah(product.harga)}</span>
                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">Stok: {product.stok}</span>
                  </div>
                  
                  <a 
                    href={`https://wa.me/6281234567890?text=Halo,%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(product.nama_produk)}%20yang%20ada%20di%20Etalase%20Karang%20Taruna.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-4 w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center transition-colors ${
                      product.stok > 0 
                        ? 'bg-primary text-white hover:bg-primary/90' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    onClick={(e) => { if(product.stok === 0) e.preventDefault() }}
                  >
                    Beli Sekarang
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
