import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'
import { Loader2, Download, FileSpreadsheet, Users, Wallet, MessageSquare } from 'lucide-react'

export default function LaporanExport() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('Tidak ada data untuk diekspor.')
      return
    }

    // Get headers from first object
    const headers = Object.keys(data[0])
    
    // Convert data to CSV format
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          let cellValue = row[header] === null || row[header] === undefined ? '' : String(row[header])
          // Escape quotes and wrap in quotes if contains comma
          if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
            cellValue = `"${cellValue.replace(/"/g, '""')}"`
          }
          return cellValue
        }).join(',')
      )
    ].join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportAnggota = async () => {
    setDownloading('anggota')
    try {
      const { data } = await supabase.from('members').select('*')
      if (data) downloadCSV(data, 'Data_Anggota_Karang_Taruna')
    } catch (error) {
      console.error(error)
    } finally {
      setDownloading(null)
    }
  }

  const handleExportKeuangan = async () => {
    setDownloading('keuangan')
    try {
      // Fetch both income and expenses
      const { data: income } = await supabase.from('income').select('*, tipe: "pemasukan"')
      const { data: expenses } = await supabase.from('expenses').select('*, tipe: "pengeluaran"')
      
      const allTransactions = [
        ...(income || []).map(i => ({ 
          id: i.id, tanggal: i.tanggal, tipe: 'Pemasukan', nama: i.nama_sumber, nominal: i.nominal, status: i.status 
        })),
        ...(expenses || []).map(e => ({ 
          id: e.id, tanggal: e.tanggal, tipe: 'Pengeluaran', nama: e.nama_pengeluaran, nominal: e.nominal, status: 'verified' 
        }))
      ].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
      
      downloadCSV(allTransactions, 'Data_Keuangan_Kas')
    } catch (error) {
      console.error(error)
    } finally {
      setDownloading(null)
    }
  }

  const handleExportAspirasi = async () => {
    setDownloading('aspirasi')
    try {
      const { data } = await supabase.from('aspirations').select('nama_pengirim, nomor_whatsapp, pesan, status, created_at')
      if (data) downloadCSV(data, 'Data_Aspirasi_Masyarakat')
    } catch (error) {
      console.error(error)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ekspor Laporan</h1>
        <p className="text-muted-foreground">
          Unduh basis data ke dalam format *Spreadsheet* (CSV) untuk keperluan pelaporan atau pengarsipan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Anggota */}
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Data Anggota</CardTitle>
            <CardDescription>
              Mengekspor seluruh data pengurus dan anggota karang taruna terdaftar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full flex items-center gap-2" 
              onClick={handleExportAnggota}
              disabled={downloading !== null}
            >
              {downloading === 'anggota' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Unduh CSV
            </Button>
          </CardContent>
        </Card>

        {/* Keuangan */}
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Buku Kas Keuangan</CardTitle>
            <CardDescription>
              Mengekspor seluruh riwayat transaksi pemasukan dan pengeluaran kas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full flex items-center gap-2" 
              onClick={handleExportKeuangan}
              disabled={downloading !== null}
            >
              {downloading === 'keuangan' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Unduh CSV
            </Button>
          </CardContent>
        </Card>

        {/* Aspirasi */}
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle>Aspirasi Masyarakat</CardTitle>
            <CardDescription>
              Mengekspor semua pesan dan pengaduan dari kotak suara masyarakat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full flex items-center gap-2" 
              onClick={handleExportAspirasi}
              disabled={downloading !== null}
            >
              {downloading === 'aspirasi' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Unduh CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
