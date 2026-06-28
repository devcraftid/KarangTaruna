import { useQuery } from '@tanstack/react-query'
import { pengumumanService } from '@/services/pengumumanService'
import { beritaService } from '@/services/beritaService'
import { Megaphone, Newspaper, Calendar } from 'lucide-react'

export default function InformasiPublik() {
  const { data: pengumuman, isLoading: loadingPengumuman } = useQuery({
    queryKey: ['pengumuman'],
    queryFn: pengumumanService.getPengumuman
  })

  const { data: berita, isLoading: loadingBerita } = useQuery({
    queryKey: ['berita'],
    queryFn: beritaService.getBerita
  })

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">Pusat Informasi</h1>
        <p className="text-lg text-muted-foreground">
          Berita terbaru dan pengumuman penting seputar kegiatan Karang Taruna.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Kolom Pengumuman */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <Megaphone className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Pengumuman</h2>
          </div>

          <div className="space-y-4">
            {loadingPengumuman ? (
              <div className="text-muted-foreground">Memuat pengumuman...</div>
            ) : pengumuman?.length === 0 ? (
              <div className="text-muted-foreground">Belum ada pengumuman.</div>
            ) : pengumuman?.map((item: any) => (
              <div key={item.id} className="bg-card border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-2">{item.judul}</h3>
                <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{item.konten}</p>
                <div className="flex items-center text-xs text-slate-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Berita */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Newspaper className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Berita Terbaru</h2>
          </div>

          <div className="space-y-4">
            {loadingBerita ? (
              <div className="text-muted-foreground">Memuat berita...</div>
            ) : berita?.length === 0 ? (
              <div className="text-muted-foreground">Belum ada berita.</div>
            ) : berita?.map((item: any) => (
              <div key={item.id} className="bg-card border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-2">{item.judul}</h3>
                <p className="text-muted-foreground mb-4 whitespace-pre-wrap line-clamp-3">{item.konten}</p>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Ditulis oleh: {item.penulis}</span>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
