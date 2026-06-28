import { useAuth } from '@/context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Users, Trophy, Wallet, CreditCard, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardHome() {
  const { profile } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard_stats_real'],
    queryFn: async () => {
      const [members, competitions, incomeRes, expensesRes] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('competitions').select('*', { count: 'exact', head: true }),
        supabase.from('income').select('nominal, tanggal').eq('status', 'verified'),
        supabase.from('expenses').select('nominal, tanggal')
      ])

      const incomes = incomeRes.data || []
      const expenses = expensesRes.data || []

      const totalIncome = incomes.reduce((sum, item) => sum + Number(item.nominal), 0)
      const totalExpense = expenses.reduce((sum, item) => sum + Number(item.nominal), 0)
      
      // Calculate monthly data for the chart (last 6 months)
      const monthlyData = []
      const today = new Date()
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const monthName = d.toLocaleDateString('id-ID', { month: 'short' })
        const year = d.getFullYear()
        const monthNum = d.getMonth()
        
        const monthIncome = incomes
          .filter(inc => {
            const date = new Date(inc.tanggal)
            return date.getMonth() === monthNum && date.getFullYear() === year
          })
          .reduce((sum, inc) => sum + Number(inc.nominal), 0)
          
        const monthExpense = expenses
          .filter(exp => {
            const date = new Date(exp.tanggal)
            return date.getMonth() === monthNum && date.getFullYear() === year
          })
          .reduce((sum, exp) => sum + Number(exp.nominal), 0)

        monthlyData.push({
          name: `${monthName} ${year.toString().slice(-2)}`,
          pemasukan: monthIncome,
          pengeluaran: monthExpense
        })
      }

      return {
        memberCount: members.count || 0,
        competitionCount: competitions.count || 0,
        totalIncome,
        totalExpense,
        saldo: totalIncome - totalExpense,
        monthlyData
      }
    }
  })

  const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Dashboard Utama
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Selamat datang kembali, <span className="font-semibold text-foreground">{profile?.fullname}</span>. Akses Anda: <span className="capitalize px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-semibold">{profile?.role}</span>
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl"></div>)}
        </div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Card 1: Saldo */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-primary to-blue-700 p-6 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Wallet className="w-32 h-32 text-white" />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/80">Saldo Saat Ini</p>
                  <p className="text-3xl font-bold text-white tracking-tight">{formatRupiah(stats?.saldo || 0)}</p>
                </div>
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Card 2: Income */}
            <div className="group relative overflow-hidden bg-white dark:bg-card p-6 rounded-2xl border border-green-100 dark:border-green-900/30 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Pemasukan</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-500">{formatRupiah(stats?.totalIncome || 0)}</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-500" />
                </div>
              </div>
            </div>

            {/* Card 3: Expense */}
            <div className="group relative overflow-hidden bg-white dark:bg-card p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Pengeluaran</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-500">{formatRupiah(stats?.totalExpense || 0)}</p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>
              </div>
            </div>

            {/* Card 4: Entities */}
            <div className="group relative overflow-hidden bg-white dark:bg-card p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Keanggotaan</p>
                  <p className="text-2xl font-bold">{stats?.memberCount || 0} <span className="text-sm font-normal text-muted-foreground">Anggota</span></p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-500" />
                </div>
              </div>
              <div className="pt-4 border-t flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-medium">Lomba Aktif</span>
                <span className="text-xs font-bold px-2 py-1 bg-accent rounded-md flex items-center"><Trophy className="w-3 h-3 mr-1 text-yellow-500"/> {stats?.competitionCount || 0} Lomba</span>
              </div>
            </div>

          </div>

          <div className="bg-white dark:bg-card border rounded-2xl shadow-sm p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" /> Arus Kas 6 Bulan Terakhir
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Grafik akumulasi pemasukan dan pengeluaran per bulan secara real-time.</p>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6b7280', fontSize: 12}} 
                    tickFormatter={(val) => `Rp${val >= 1000000 ? (val/1000000).toFixed(0) + 'M' : val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [formatRupiah(value), ""]}
                  />
                  <Area type="monotone" name="Pemasukan" dataKey="pemasukan" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorPemasukan)" />
                  <Area type="monotone" name="Pengeluaran" dataKey="pengeluaran" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorPengeluaran)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
