// @ts-nocheck
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from '@/lib/supabase'
import { FileSpreadsheet, Loader2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

export default function RiwayatTransaksiPublik() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ totalPemasukan: 0, totalPengeluaran: 0, saldo: 0 })

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      // Fetch Income
      const { data: incomeData, error: incomeError } = await supabase
        .from('income')
        .select('id, tanggal, nominal, keterangan, status')
        .eq('status', 'verified')
      if (incomeError) throw incomeError

      // Fetch Expenses
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('id, tanggal, nominal, keterangan, status')
        .eq('status', 'verified')
      if (expenseError) throw expenseError

      // Combine and format
      const combined = [
        ...(incomeData || []).map(i => ({ ...i, tipe: 'masuk', debit: i.nominal, kredit: 0 })),
        ...(expenseData || []).map(e => ({ ...e, tipe: 'keluar', debit: 0, kredit: e.nominal }))
      ]

      // Sort chronological (oldest to newest for running balance)
      combined.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())

      let runningBalance = 0
      let totalMasuk = 0
      let totalKeluar = 0

      const withBalance = combined.map(t => {
        runningBalance += t.debit - t.kredit
        totalMasuk += t.debit
        totalKeluar += t.kredit
        return { ...t, saldo: runningBalance }
      })

      // Sort descending for display (newest first)
      withBalance.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())

      setTransactions(withBalance)
      setSummary({ totalPemasukan: totalMasuk, totalPengeluaran: totalKeluar, saldo: runningBalance })
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4 md:p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileSpreadsheet className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transparansi Kas Publik</h1>
          <p className="text-muted-foreground">
            Buku Kas Umum (BKU) Karang Taruna. Rekapitulasi terbuka mutasi keuangan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Total Pemasukan</p>
                <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">{formatRupiah(summary.totalPemasukan)}</h3>
              </div>
              <div className="p-3 bg-green-200 dark:bg-green-800 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-700 dark:text-green-200" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Total Pengeluaran</p>
                <h3 className="text-2xl font-bold text-red-900 dark:text-red-100">{formatRupiah(summary.totalPengeluaran)}</h3>
              </div>
              <div className="p-3 bg-red-200 dark:bg-red-800 rounded-full">
                <TrendingDown className="w-5 h-5 text-red-700 dark:text-red-200" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Saldo Kas Saat Ini</p>
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatRupiah(summary.saldo)}</h3>
              </div>
              <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-full">
                <Wallet className="w-5 h-5 text-blue-700 dark:text-blue-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buku Kas Umum (Mutasi Kas)</CardTitle>
          <CardDescription>Catatan aliran dana keluar dan masuk secara kronologis.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900">
                <TableRow>
                  <TableHead className="w-[100px]">Tanggal</TableHead>
                  <TableHead>Keterangan / Uraian</TableHead>
                  <TableHead className="text-right">Debit (Masuk)</TableHead>
                  <TableHead className="text-right">Kredit (Keluar)</TableHead>
                  <TableHead className="text-right bg-blue-50 dark:bg-blue-950">Saldo Akhir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-12">Belum ada transaksi tercatat.</TableCell></TableRow>
                ) : transactions.map((t, idx) => (
                  <TableRow key={`${t.tipe}-${t.id}`}>
                    <TableCell className="font-medium">{new Date(t.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell>{t.keterangan}</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">{t.debit > 0 ? formatRupiah(t.debit) : '-'}</TableCell>
                    <TableCell className="text-right text-red-600 font-medium">{t.kredit > 0 ? formatRupiah(t.kredit) : '-'}</TableCell>
                    <TableCell className="text-right font-bold bg-blue-50/30 dark:bg-blue-950/30">{formatRupiah(t.saldo)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
