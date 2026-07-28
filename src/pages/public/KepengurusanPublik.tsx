import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Users, Mail, Phone } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Member } from '@/services/memberService'

export default function KepengurusanPublik() {
  const [pengurus, setPengurus] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPengurus()
  }, [])

  const fetchPengurus = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
      
      if (error) throw error
      if (data) {
        setPengurus(data as any)
      }
    } catch (error) {
      console.error('Error fetching pengurus:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-md-surface min-h-screen pb-20">
      {/* HEADER SECTION */}
      <div className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 uppercase tracking-tight">Susunan Kepengurusan</h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Mengenal tokoh-tokoh pemuda di balik pergerakan Karang Taruna Bina Pemuda periode 2024 - 2027.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20">
        {loading ? (
          <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : pengurus.length === 0 ? (
          <Card className="text-center p-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-500">Belum ada data kepengurusan.</h3>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {pengurus.map((p, index) => (
              <Card key={p.id || index} className="border-none shadow-lg overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  {p.foto_url ? (
                    <img src={p.foto_url} alt={p.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                      <Users className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                     <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm">
                       {p.divisi || 'Pengurus Inti'}
                     </span>
                  </div>
                </div>
                <CardContent className="p-5 text-center relative bg-white dark:bg-slate-900">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1">{p.nama}</h3>
                  <p className="text-sm font-medium text-primary mb-4">{p.jabatan}</p>
                  
                  <div className="flex justify-center gap-3">
                    {p.nomor_hp && (
                      <a href={`https://wa.me/${p.nomor_hp}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors">
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}





