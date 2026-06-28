import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { Wallet, CreditCard, ArrowRightLeft, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function Transparansi() {
  const [realtimeTrigger, setRealtimeTrigger] = useState(0)

  useEffect(() => {
    const incomeSub = supabase.channel('public:income').on('postgres_changes', { event: '*', schema: 'public', table: 'income' }, () => setRealtimeTrigger(prev => prev + 1)).subscribe()
    const expenseSub = supabase.channel('public:expenses').on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => setRealtimeTrigger(prev => prev + 1)).subscribe()
    return () => { supabase.removeChannel(incomeSub); supabase.removeChannel(expenseSub) }
  }, [])

  const { data: income, isLoading: loadingIncome } = useQuery({ queryKey: ['public-income', realtimeTrigger], queryFn: async () => { const { data, error } = await supabase.from('income').select('*').eq('status', 'verified').order('tanggal', { ascending: false }); if (error) throw error; return data } })
  const { data: expenses, isLoading: loadingExpenses } = useQuery({ queryKey: ['public-expenses', realtimeTrigger], queryFn: async () => { const { data, error } = await supabase.from('expenses').select('*').order('tanggal', { ascending: false }); if (error) throw error; return data } })

  const totalIncome = income?.reduce((sum, item) => sum + Number(item.nominal), 0) || 0
  const totalExpense = expenses?.reduce((sum, item) => sum + Number(item.nominal), 0) || 0
  const saldo = totalIncome - totalExpense

  const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background pb-20 animate-in fade-in duration-500">
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white pt-16 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
        <div className="container mx-auto max-w-6xl relative z-10 text-center space-y-4">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-medium mb-4">
            <span className="flex h-2.5 w-2.5 rounded-full bg-green-400 mr-2 animate-pulse"></span>
            Live Real-time Data
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Transparansi Keuangan Terbuka</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">Laporan arus kas masuk dan keluar organisasi Karang Taruna secara real-time dan akuntabel. Setiap rupiah dikelola dengan penuh amanah.</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 -mt-20 relative z-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-card border rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center space-x-5 transition-transform hover:-translate-y-1">
            <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-2xl"><Wallet className="h-8 w-8" /></div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Pemasukan</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{formatRupiah(totalIncome)}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-card border rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center space-x-5 transition-transform hover:-translate-y-1">
            <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-2xl"><CreditCard className="h-8 w-8" /></div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Pengeluaran</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{formatRupiah(totalExpense)}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-blue-700 text-white rounded-2xl p-6 shadow-xl shadow-primary/30 flex items-center space-x-5 transition-transform hover:-translate-y-1">
            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl"><ArrowRightLeft className="h-8 w-8 text-white" /></div>
            <div>
              <p className="text-sm font-semibold text-white/80 uppercase tracking-wider">Saldo Saat Ini</p>
              <p className="text-3xl font-bold mt-1">{formatRupiah(saldo)}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-12">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold flex items-center"><ShieldCheck className="mr-2 text-green-600" /> Riwayat Pemasukan</h2>
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">Terverifikasi</span>
            </div>
            <div className="bg-white dark:bg-card border rounded-2xl shadow-sm overflow-hidden">
              {loadingIncome ? <div className="p-12 text-center text-muted-foreground animate-pulse">Memuat data realtime...</div> : (
                <div className="divide-y">
                  {income?.length === 0 ? <div className="p-12 text-center text-muted-foreground">Belum ada pemasukan</div> : 
                    income?.slice(0, 10).map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">{item.nama_donatur.charAt(0).toUpperCase()}</div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{item.nama_donatur}</p>
                            <p className="text-xs text-muted-foreground flex items-center mt-1"><CheckCircle2 className="w-3 h-3 mr-1 text-green-500" /> {new Date(item.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600 text-lg">+{formatRupiah(item.nominal)}</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-2xl font-bold flex items-center text-slate-800 dark:text-white"><ArrowRightLeft className="mr-2 text-red-500" /> Riwayat Pengeluaran</h2>
            </div>
            <div className="bg-white dark:bg-card border rounded-2xl shadow-sm overflow-hidden">
              {loadingExpenses ? <div className="p-12 text-center text-muted-foreground animate-pulse">Memuat data realtime...</div> : (
                <div className="divide-y">
                  {expenses?.length === 0 ? <div className="p-12 text-center text-muted-foreground">Belum ada pengeluaran</div> : 
                    expenses?.slice(0, 10).map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">{item.nama_pengeluaran.charAt(0).toUpperCase()}</div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{item.nama_pengeluaran}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(item.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</p>
                          </div>
                        </div>
                        <span className="font-bold text-red-600 text-lg">-{formatRupiah(item.nominal)}</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
