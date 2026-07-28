// @ts-nocheck
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'
import { BarChart as ChartIcon, Plus, Loader2, TrendingUp, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LaporanUMKM() {
  const [sales, setSales] = useState<any[]>([])
  const [umkms, setUmkms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  const [formData, setFormData] = useState({
    umkm_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    total_penjualan: 0,
    total_transaksi: 0,
    catatan: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [salesRes, umkmRes] = await Promise.all([
        supabase
          .from('umkm_sales')
          .select(`*, umkm_profiles(nama_usaha)`)
          .order('tanggal', { ascending: false })
          .limit(100),
        supabase
          .from('umkm_profiles')
          .select('id, nama_usaha')
          .eq('is_verified', true)
      ])
      
      if (salesRes.error) throw salesRes.error
      if (umkmRes.error) throw umkmRes.error
      
      setSales(salesRes.data || [])
      setUmkms(umkmRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.umkm_id || formData.total_penjualan <= 0) return
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('umkm_sales')
        .insert([formData])
        .select(`*, umkm_profiles(nama_usaha)`)
      
      if (error) throw error
      if (data) setSales([data[0], ...sales])
      
      setShowForm(false)
      setFormData({ 
        umkm_id: '', 
        tanggal: new Date().toISOString().split('T')[0], 
        total_penjualan: 0, 
        total_transaksi: 0, 
        catatan: '' 
      })
      toast.success('Laporan penjualan berhasil dicatat!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-4 md:p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
  }

  // Hitung total omzet bulan ini
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const totalOmzet = sales.reduce((acc, curr) => {
    const d = new Date(curr.tanggal)
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      return acc + Number(curr.total_penjualan)
    }
    return acc
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChartIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Laporan Penjualan UMKM</h1>
            <p className="text-muted-foreground">
              Rekapitulasi omzet dan aktivitas penjualan warga.
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
          {showForm ? 'Batal' : <><Plus className="w-4 h-4 mr-2" /> Catat Penjualan</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-none shadow-sm md:col-span-1">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Total Omzet (Bulan Ini)</p>
                <h3 className="text-3xl font-bold text-blue-900 dark:text-blue-100">{formatRupiah(totalOmzet)}</h3>
              </div>
              <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-700 dark:text-blue-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="border-blue-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <CardHeader>
            <CardTitle className="text-lg">Form Input Penjualan Harian/Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-2 lg:col-span-1">
                <Label>Pilih Usaha</Label>
                <Select value={formData.umkm_id} onValueChange={(val) => setFormData({...formData, umkm_id: val})}>
                  <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                  <SelectContent>
                    {umkms.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.nama_usaha}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 lg:col-span-1">
                <Label>Tanggal Laporan</Label>
                <Input type="date" value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} />
              </div>
              <div className="space-y-2 lg:col-span-1">
                <Label>Total Penjualan (Rp)</Label>
                <Input type="number" value={formData.total_penjualan || ''} onChange={e => setFormData({...formData, total_penjualan: Number(e.target.value)})} />
              </div>
              <div className="space-y-2 lg:col-span-1">
                <Label>Jml Transaksi (Opsional)</Label>
                <Input type="number" value={formData.total_transaksi || ''} onChange={e => setFormData({...formData, total_transaksi: Number(e.target.value)})} />
              </div>
              <div className="lg:col-span-1">
                <Button className="w-full" onClick={handleSave} disabled={saving || !formData.umkm_id}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Simpan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama UMKM / Usaha</TableHead>
                <TableHead className="text-right">Total Penjualan (Omzet)</TableHead>
                <TableHead className="text-center">Jml Transaksi</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-12">Belum ada laporan penjualan.</TableCell></TableRow>
              ) : sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{new Date(s.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell className="font-medium text-slate-900">{s.umkm_profiles?.nama_usaha || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-emerald-600">{formatRupiah(s.total_penjualan)}</TableCell>
                  <TableCell className="text-center">{s.total_transaksi || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{s.catatan || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
