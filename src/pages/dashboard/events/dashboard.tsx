import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'
import { Calendar, Users, Trophy, Flag, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardEvent() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalPanitia: 0,
    totalLomba: 0
  })

  // Data dummy untuk chart karena kita tidak menyimpan data pendaftar harian saat ini
  const monthlyData = [
    { name: 'Jan', peserta: 40 },
    { name: 'Feb', peserta: 30 },
    { name: 'Mar', peserta: 20 },
    { name: 'Apr', peserta: 50 },
    { name: 'Mei', peserta: 80 },
    { name: 'Jun', peserta: 45 },
    { name: 'Jul', peserta: 100 },
    { name: 'Ags', peserta: 250 }, // Puncak event 17an
    { name: 'Sep', peserta: 60 },
  ]

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [eventsRes, activeRes, panitiaRes, lombaRes] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }).in('status', ['draft', 'published']),
        supabase.from('event_committees').select('id', { count: 'exact', head: true }),
        supabase.from('competitions').select('id', { count: 'exact', head: true })
      ])

      setStats({
        totalEvents: eventsRes.count || 0,
        activeEvents: activeRes.count || 0,
        totalPanitia: panitiaRes.count || 0,
        totalLomba: lombaRes.count || 0
      })
    } catch (error) {
      console.error('Error fetching event stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4 md:p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
          <Calendar className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Event</h1>
          <p className="text-muted-foreground">
            Ringkasan kegiatan, acara, dan kepanitiaan.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-50 dark:bg-slate-900/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-slate-500">Total Acara / Event</p>
              <Flag className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="text-3xl font-bold">{stats.totalEvents}</h3>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 dark:bg-slate-900/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-slate-500">Event Berjalan</p>
              <div className="relative">
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold">{stats.activeEvents}</h3>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 dark:bg-slate-900/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-slate-500">Katalog Lomba</p>
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-3xl font-bold">{stats.totalLomba}</h3>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 dark:bg-slate-900/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-slate-500">Total Relawan / Panitia</p>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-3xl font-bold">{stats.totalPanitia}</h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partisipasi Event Sepanjang Tahun</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="peserta" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Jumlah Peserta/Warga" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
