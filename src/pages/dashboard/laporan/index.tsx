import { useQuery } from '@tanstack/react-query'
import { keuanganService } from '@/services/keuanganService'
import { Button } from '@/components/ui/button'
import { Download, FileText, MessageCircle } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import toast from 'react-hot-toast'

export default function Laporan() {
  const { data: income, isLoading: loadingIncome } = useQuery({ queryKey: ['income'], queryFn: keuanganService.getIncome })
  const { data: expenses, isLoading: loadingExpenses } = useQuery({ queryKey: ['expenses'], queryFn: keuanganService.getExpenses })

  const totalIncome = income?.reduce((sum, item) => sum + Number(item.nominal), 0) || 0
  const totalExpense = expenses?.reduce((sum, item) => sum + Number(item.nominal), 0) || 0
  const saldo = totalIncome - totalExpense

  const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka)

  const handleExport = (type: string) => {
    toast.success(`Fitur export ${type} akan mengunduh file...`)
  }

  const handleShareWA = () => {
    const text = `*Laporan Keuangan Karang Taruna*\n\n` +
      `Total Pemasukan: ${formatRupiah(totalIncome)}\n` +
      `Total Pengeluaran: ${formatRupiah(totalExpense)}\n` +
      `*Saldo Akhir: ${formatRupiah(saldo)}*\n\n` +
      `Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`
    
    const message = encodeURIComponent(text)
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Laporan Keuangan</h2>
          <p className="text-muted-foreground">Ringkasan dan cetak laporan kas Karang Taruna</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => handleExport('Excel')}><FileText className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Export Excel</span></Button>
          <Button className="flex-1 sm:flex-none" onClick={() => handleExport('PDF')}><Download className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Export PDF</span></Button>
          <Button variant="outline" className="flex-1 sm:flex-none text-green-600 hover:text-green-700" onClick={handleShareWA}><MessageCircle className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Share WA</span></Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Pemasukan</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{formatRupiah(totalExpense)}</p>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm bg-primary/5 border-primary/20">
          <p className="text-sm font-medium text-primary">Saldo Akhir</p>
          <p className="text-3xl font-extrabold text-primary mt-2">{formatRupiah(saldo)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pemasukan Terakhir</h3>
          <div className="bg-card border rounded-xl shadow-sm">
            <Table>
              <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Sumber</TableHead><TableHead className="text-right">Nominal</TableHead></TableRow></TableHeader>
              <TableBody>
                {loadingIncome ? <TableRow><TableCell colSpan={3} className="text-center py-4">Memuat...</TableCell></TableRow> : 
                  income?.slice(0, 5).map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{item.nama_donatur}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">{formatRupiah(item.nominal)}</TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pengeluaran Terakhir</h3>
          <div className="bg-card border rounded-xl shadow-sm">
            <Table>
              <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Keterangan</TableHead><TableHead className="text-right">Nominal</TableHead></TableRow></TableHeader>
              <TableBody>
                {loadingExpenses ? <TableRow><TableCell colSpan={3} className="text-center py-4">Memuat...</TableCell></TableRow> : 
                  expenses?.slice(0, 5).map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{item.nama_pengeluaran}</TableCell>
                      <TableCell className="text-right text-red-600 font-medium">{formatRupiah(item.nominal)}</TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
