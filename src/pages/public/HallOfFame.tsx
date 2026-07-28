import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Award, Trophy, Medal, Star, Crown, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

export default function HallOfFamePublik() {
  const [winners, setWinners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchWinners()
  }, [])

  const fetchWinners = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .not('pemenang', 'is', null)
        .neq('pemenang', '')
        .order('tanggal', { ascending: false })
      
      if (error) throw error
      if (data) setWinners(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredWinners = winners.filter(w => 
    w.nama_lomba.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.pemenang.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-md-surface min-h-screen pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent"></div>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 relative z-10 text-center max-w-3xl">
          <Crown className="w-16 h-16 text-amber-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
            Dinding Prestasi
          </h1>
          <p className="text-lg text-white/80 leading-relaxed mb-8">
            Apresiasi dan penganugerahan bagi warga berprestasi yang telah memenangkan berbagai perlombaan Karang Taruna.
          </p>
          
          <div className="relative max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input 
                placeholder="Cari nama lomba atau nama pemenang..." 
                className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-full focus-visible:ring-amber-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-16 max-w-5xl">
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-amber-500 animate-spin" /></div>
        ) : filteredWinners.length === 0 ? (
          <div className="text-center p-20 bg-white dark:bg-slate-900 rounded-3xl shadow-sm">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-500">Belum ada data pemenang tercatat.</h3>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:p-8">
            {filteredWinners.map((item, index) => {
               // Assign dynamic medal colors based on index just for visual flair if we don't have actual ranking data
               const isTop = index % 3 === 0
               return (
                 <Card key={item.id} className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden relative group hover:-translate-y-2 transition-transform duration-300">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-colors"></div>
                    
                    <CardContent className="p-4 md:p-8 relative z-10 text-center">
                       <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 rounded-full flex items-center justify-center mb-6 shadow-inner border border-amber-300/30">
                         {isTop ? <Trophy className="w-10 h-10 text-amber-600 dark:text-amber-400" /> : <Medal className="w-10 h-10 text-amber-600 dark:text-amber-400" />}
                       </div>
                       
                       <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                         <Star className="w-3 h-3" /> Pemenang Juara 1
                       </div>

                       <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{item.pemenang}</h3>
                       
                       <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 mx-auto my-4 rounded-full"></div>
                       
                       <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">{item.nama_lomba}</p>
                       <p className="text-xs text-slate-400">{new Date(item.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</p>
                    </CardContent>
                 </Card>
               )
            })}
          </div>
        )}
      </div>
    </div>
  )
}





