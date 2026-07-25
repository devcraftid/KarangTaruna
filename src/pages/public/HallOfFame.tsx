import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getHallOfFameEntries } from '@/services/hallOfFameService'
import { Award, Star, History, Users, Trophy } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"

export default function HallOfFame() {
  const { data: entries, isLoading } = useQuery({ 
    queryKey: ['hall_of_fame_public'], 
    queryFn: getHallOfFameEntries 
  })

  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: 'Semua', icon: Award },
    { id: 'ketua', label: 'Ketua', icon: Users },
    { id: 'pengurus_terbaik', label: 'Pengurus Terbaik', icon: Star },
    { id: 'anggota_inspiratif', label: 'Inspiratif', icon: Star },
    { id: 'prestasi', label: 'Prestasi', icon: Trophy },
    { id: 'juara_lomba', label: 'Juara Lomba', icon: Trophy },
    { id: 'sejarah', label: 'Sejarah', icon: History }
  ]

  const filteredEntries = entries?.filter(e => activeCategory === 'all' || e.kategori === activeCategory) || []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background pb-20">
      <div className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <Award className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 uppercase">Hall of Fame</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Mengenang sejarah, mengapresiasi dedikasi, dan merayakan setiap pencapaian luar biasa Karang Taruna Bina Pemuda.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 mt-8 md:-mt-8 relative z-10">
        <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-2 md:p-4 border mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                  ${isActive 
                    ? 'bg-primary text-white shadow-md scale-105' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                {cat.label}
              </button>
            )
          })}
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="animate-spin text-primary inline-block mb-4">
              <History className="w-10 h-10" />
            </div>
            <p className="text-muted-foreground font-medium">Memuat catatan sejarah...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-card rounded-2xl border">
            <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Belum ada catatan</h3>
            <p className="text-muted-foreground mt-2">Data untuk kategori ini belum ditambahkan oleh pengurus.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-slate-200 dark:border-slate-800">
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  {entry.foto_url ? (
                    <img 
                      src={entry.foto_url} 
                      alt={entry.judul} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <Award className="w-12 h-12 mb-2 opacity-50" />
                      <span className="text-xs uppercase tracking-widest font-bold">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm text-primary font-bold px-3 py-1 rounded-full text-sm shadow-sm">
                    {entry.tahun}
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                      {categories.find(c => c.id === entry.kategori)?.label || entry.kategori}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                    {entry.judul}
                  </h3>
                  {entry.deskripsi && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                      {entry.deskripsi}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
