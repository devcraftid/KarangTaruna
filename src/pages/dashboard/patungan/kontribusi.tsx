import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { patunganService } from '@/services/patungan'
import { PatunganContribution } from '@/types'
import toast from 'react-hot-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function VerifikasiKontribusi() {
  const [contributions, setContributions] = useState<PatunganContribution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContributions()
  }, [])

  const fetchContributions = async () => {
    setLoading(true)
    try {
      const data = await patunganService.getContributions()
      setContributions(data)
    } catch (error: any) {
      toast.error(error.message || 'Gagal memuat data kontribusi.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'verified' | 'rejected') => {
    try {
      await patunganService.updateContributionStatus(id, status)
      toast.success(`Kontribusi berhasil di-${status}.`)
      fetchContributions()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Verifikasi Kontribusi</h1>
        <p className="text-muted-foreground mt-1">Verifikasi dana program pendanaan yang masuk.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Daftar Kontribusi</h2>
          <p className="text-sm text-muted-foreground">Menampilkan semua kontribusi dari semua program pendanaan.</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-4 md:p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama Donatur</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Bukti</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Belum ada kontribusi.
                    </TableCell>
                  </TableRow>
                ) : (
                  contributions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="font-medium">{item.nama_donatur}</TableCell>
                      <TableCell>{item.patungan_campaigns?.judul}</TableCell>
                      <TableCell>Rp {Number(item.nominal).toLocaleString('id-ID')}</TableCell>
                      <TableCell>{item.metode_pembayaran}</TableCell>
                      <TableCell>
                        {item.bukti_transfer ? (
                          <a href={item.bukti_transfer} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                            Lihat Bukti
                          </a>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${item.status === 'verified' ? 'bg-green-100 text-green-700' : item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {item.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm" className="h-8 bg-green-50 text-green-600 hover:bg-green-100 border-green-200" onClick={() => handleUpdateStatus(item.id, 'verified')}>
                              <CheckCircle className="w-4 h-4 mr-1" /> Terima
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-destructive border-red-200 hover:bg-red-50" onClick={() => handleUpdateStatus(item.id, 'rejected')}>
                              <XCircle className="w-4 h-4 mr-1" /> Tolak
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
