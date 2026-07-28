// @ts-nocheck
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'
import { Calendar, Loader2, Clock, CheckCircle2, CircleDashed } from 'lucide-react'

export default function TimelineProker() {
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('work_programs')
        .select('*')
        .order('tanggal_mulai', { ascending: true })

      if (error) throw error
      if (data) setPrograms(data)
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  // Group by Month/Year
  const groupedPrograms = programs.reduce((acc, prog) => {
    const date = new Date(prog.tanggal_mulai)
    const monthYear = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    if (!acc[monthYear]) acc[monthYear] = []
    acc[monthYear].push(prog)
    return acc
  }, {} as Record<string, any[]>)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-500" />
      default: return <CircleDashed className="w-5 h-5 text-slate-400" />
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20'
      case 'in_progress': return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
      default: return 'border-l-slate-400 bg-slate-50/50 dark:bg-slate-900/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai'
      case 'in_progress': return 'Berjalan'
      default: return 'Perencanaan'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timeline Kegiatan</h1>
          <p className="text-muted-foreground">
            Pantau alur dan perkembangan program kerja organisasi.
          </p>
        </div>
      </div>

      {Object.keys(groupedPrograms).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground border-dashed">
            Belum ada program kerja yang direncanakan.
          </CardContent>
        </Card>
      ) : (
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 md:ml-6 space-y-8 pb-8">
          {Object.entries(groupedPrograms).map(([monthYear, progs]) => (
            <div key={monthYear} className="relative">
              {/* Month Marker */}
              <div className="absolute -left-[27px] top-0 h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-950 flex items-center justify-center shadow-sm">
                <Calendar className="w-5 h-5 text-slate-500" />
              </div>
              
              <div className="pl-10">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pt-2">{monthYear}</h2>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {progs.map((p) => (
                    <Card key={p.id} className={`border-l-4 shadow-sm hover:shadow-md transition-all ${getStatusColor(p.status)}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-base leading-tight">{p.nama_program}</CardTitle>
                          {getStatusIcon(p.status)}
                        </div>
                        <CardDescription className="text-xs font-medium">
                          {new Date(p.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(p.tanggal_selesai).toLocaleDateString('id-ID')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                          {p.deskripsi || 'Tidak ada deskripsi.'}
                        </p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            PJ: {p.penanggung_jawab || '-'}
                          </span>
                          <span className="font-semibold uppercase tracking-wider">
                            {getStatusText(p.status)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
