import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'
import { PieChart as PieChartIcon, Loader2, Info } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function RealisasiAnggaran() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({ pieData: [], barData: [], summary: {} })

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#f43f5e']

  useEffect(() => {
    fetchRealisasi()
  }, [])

  const fetchRealisasi = async () => {
    try {
      setLoading(true)
      // Fetch Expenses
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('keterangan, nominal, status')
        .eq('status', 'verified')
        
      if (error) throw error

      let total = 0
      const grouped: Record<string, number> = {}

      expenses?.forEach(exp => {
        total += exp.nominal
        // Coba ekstrak nama proker/kategori dari keterangan (asumsi format "Proker: X" atau ambil kata pertama)
        // Jika tidak ada format khusus, kita kelompokkan berdasarkan "keterangan"
        let category = 'Lain-lain'
        const ket = exp.keterangan?.toLowerCase() || ''
        
        if (ket.includes('rapat')) category = 'Operasional Rapat'
        else if (ket.includes('listrik') || ket.includes('wifi') || ket.includes('air')) category = 'Tagihan Rutin'
        else if (ket.includes('atk') || ket.includes('cetak') || ket.includes('print')) category = 'ATK & Kesekretariatan'
        else if (ket.includes('konsumsi')) category = 'Konsumsi'
        else if (ket.includes('17 agustus') || ket.includes('lomba') || ket.includes('kemerdekaan')) category = 'Event 17 Agustus'
        else if (ket.includes('ramadhan') || ket.includes('bukber') || ket.includes('tarawih')) category = 'Event Keagamaan'
        else if (ket.includes('beli') || ket.includes('inventaris')) category = 'Pembelian Aset'
        else category = exp.keterangan || 'Lain-lain'

        // Batasi panjang nama kategori
        if (category.length > 20) category = category.substring(0, 20) + '...'
        
        grouped[category] = (grouped[category] || 0) + exp.nominal
      })

      const pieData = Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        
      const barData = Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5) // Top 5

      setData({ pieData, barData, summary: { total } })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <PieChartIcon className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Realisasi Anggaran</h1>
          <p className="text-muted-foreground">
            Grafik distribusi dan serapan anggaran untuk program kerja & operasional.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Distribusi Pengeluaran</CardTitle>
            <CardDescription>Berdasarkan kategori kegiatan</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            {data.pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">Belum ada data pengeluaran</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.pieData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatRupiah(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Top 5 Pengeluaran Terbesar</CardTitle>
            <CardDescription>Kategori yang paling banyak menyerap anggaran</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            {data.barData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">Belum ada data pengeluaran</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tickFormatter={(value) => `Rp${value/1000}k`} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatRupiah(value)} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    {data.barData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-50 dark:bg-slate-900 border-none">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full shrink-0">
            <Info className="w-6 h-6 text-blue-700 dark:text-blue-300" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Total Anggaran Terserap: {formatRupiah(data.summary.total || 0)}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Data di atas dihitung berdasarkan pengeluaran Kas Karang Taruna yang telah berstatus <strong>"Verified"</strong> (Disetujui oleh Ketua & Bendahara).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
