import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'
import { Users, LayoutDashboard, Wallet, Calendar, FileText, Target, Loader2 } from 'lucide-react'

export default function RingkasanOrganisasi() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAnggota: 0,
    totalProker: 0,
    totalEvent: 0,
    saldoKas: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      const [membersRes, prokerRes, eventRes, incomeRes, expenseRes] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }),
        supabase.from('work_programs').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('income').select('nominal').eq('status', 'verified'),
        supabase.from('expenses').select('nominal').eq('status', 'verified')
      ])

      const totalIncome = incomeRes.data?.reduce((acc, curr) => acc + curr.nominal, 0) || 0
      const totalExpense = expenseRes.data?.reduce((acc, curr) => acc + curr.nominal, 0) || 0

      setStats({
        totalAnggota: membersRes.count || 0,
        totalProker: prokerRes.count || 0,
        totalEvent: eventRes.count || 0,
        saldoKas: totalIncome - totalExpense
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ringkasan Organisasi</h1>
          <p className="text-muted-foreground">
            Status *High-Level* Karang Taruna (Khusus Pengurus Inti).
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-none">
          <CardContent className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Anggota</p>
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold text-blue-900 dark:text-white">{stats.totalAnggota}</h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-none">
          <CardContent className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">Saldo Kas Umum</p>
              <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-green-900 dark:text-white truncate" title={formatRupiah(stats.saldoKas)}>
              {formatRupiah(stats.saldoKas)}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-none">
          <CardContent className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Program Kerja</p>
              <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-3xl font-bold text-orange-900 dark:text-white">{stats.totalProker}</h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-none">
          <CardContent className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Total Event</p>
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-3xl font-bold text-purple-900 dark:text-white">{stats.totalEvent}</h3>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Akses Cepat Pengurus Inti</CardTitle>
          <CardDescription>Menu yang sering diakses oleh Ketua, Wakil, dan Sekretaris.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg flex items-start gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full shrink-0">
              <FileText className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Persuratan</h4>
              <p className="text-sm text-muted-foreground mb-2">Cek surat masuk terbaru atau buat draf surat keluar.</p>
              <a href="/dashboard/surat" className="text-sm text-primary font-medium hover:underline">Ke Persuratan &rarr;</a>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg flex items-start gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full shrink-0">
              <Users className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Manajemen Pengguna</h4>
              <p className="text-sm text-muted-foreground mb-2">Atur hak akses login (Role) ke dasbor pengurus.</p>
              <a href="/dashboard/users" className="text-sm text-primary font-medium hover:underline">Ke Manajemen User &rarr;</a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
