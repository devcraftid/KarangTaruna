import { useQuery } from '@tanstack/react-query'
import { galeriService } from '@/services/galeriService'
import { Image as ImageIcon } from 'lucide-react'

export default function GaleriPublik() {
  const { data: gallery, isLoading } = useQuery({
    queryKey: ['public_gallery'],
    queryFn: galeriService.getGaleri
  })

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">Galeri Kegiatan</h1>
        <p className="text-lg text-muted-foreground">
          Dokumentasi dan momen seru dari berbagai kegiatan Karang Taruna kami.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Memuat galeri...</div>
      ) : gallery?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl shadow-sm border">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-xl font-semibold">Belum Ada Foto</h2>
          <p className="text-muted-foreground mt-2">Galeri kegiatan masih kosong saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery?.map((item: any) => (
            <div key={item.id} className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer aspect-square bg-slate-100">
              <img 
                src={item.foto.startsWith('http') ? item.foto : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/gallery/${item.foto}`}
                alt={item.judul}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/400x400?text=No+Image'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-4 w-full text-white">
                  <h3 className="font-semibold text-sm md:text-base line-clamp-2">{item.judul}</h3>
                  <p className="text-xs text-white/70 mt-1">
                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
