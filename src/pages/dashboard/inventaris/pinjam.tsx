// @ts-nocheck
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'
import { Loader2, Save, ArrowLeftRight } from 'lucide-react'

export default function PeminjamanInventaris() {
  const [loans, setLoans] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    item_id: '',
    peminjam: '',
    jumlah: 1,
    tanggal_pinjam: new Date().toISOString().split('T')[0],
    keterangan: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [loansRes, itemsRes] = await Promise.all([
        supabase
          .from('inventory_loans')
          .select(`
            id, peminjam, jumlah, tanggal_pinjam, tanggal_kembali, status, keterangan,
            inventory_items(nama_barang)
          `)
          .order('tanggal_pinjam', { ascending: false }),
        supabase
          .from('inventory_items')
          .select('id, nama_barang, jumlah, kondisi')
          .order('nama_barang')
      ])
      
      if (loansRes.data) setLoans(loansRes.data)
      if (itemsRes.data) setItems(itemsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.item_id || !formData.peminjam || formData.jumlah < 1) return
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('inventory_loans')
        .insert([{
          item_id: formData.item_id,
          peminjam: formData.peminjam,
          jumlah: formData.jumlah,
          tanggal_pinjam: formData.tanggal_pinjam,
          keterangan: formData.keterangan,
          status: 'dipinjam'
        }])
        .select(`
          id, peminjam, jumlah, tanggal_pinjam, tanggal_kembali, status, keterangan,
          inventory_items(nama_barang)
        `)
      
      if (error) throw error
      if (data) {
        setLoans([data[0], ...loans])
      }
      setFormData({ ...formData, item_id: '', peminjam: '', jumlah: 1, keterangan: '' })
      alert('Peminjaman berhasil dicatat!')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReturn = async (id: string) => {
    if (!confirm('Tandai barang telah dikembalikan?')) return
    try {
      const { error } = await supabase
        .from('inventory_loans')
        .update({ 
          status: 'dikembalikan', 
          tanggal_kembali: new Date().toISOString().split('T')[0] 
        })
        .eq('id', id)
        
      if (error) throw error
      setLoans(loans.map(l => l.id === id ? { ...l, status: 'dikembalikan', tanggal_kembali: new Date().toISOString().split('T')[0] } : l))
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ArrowLeftRight className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistem Peminjaman</h1>
          <p className="text-muted-foreground">
            Catat peminjaman dan pengembalian aset/inventaris organisasi.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catat Peminjaman Baru</CardTitle>
          <CardDescription>Masukkan detail siapa yang meminjam barang dan jumlahnya.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="space-y-1 md:col-span-4">
              <Label>Pilih Barang</Label>
              <Select value={formData.item_id} onValueChange={(val) => setFormData({...formData, item_id: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih barang..." />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.nama_barang} (Stok: {item.jumlah})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1 md:col-span-3">
              <Label>Nama Peminjam</Label>
              <Input 
                placeholder="Misal: Budi / Div. Acara" 
                value={formData.peminjam}
                onChange={e => setFormData({...formData, peminjam: e.target.value})}
              />
            </div>
            
            <div className="space-y-1 md:col-span-2">
              <Label>Jumlah</Label>
              <Input 
                type="number" 
                min="1"
                value={formData.jumlah}
                onChange={e => setFormData({...formData, jumlah: parseInt(e.target.value) || 1})}
              />
            </div>
            
            <div className="space-y-1 md:col-span-3">
              <Label>Tanggal Pinjam</Label>
              <Input 
                type="date" 
                value={formData.tanggal_pinjam}
                onChange={e => setFormData({...formData, tanggal_pinjam: e.target.value})}
              />
            </div>
            
            <div className="space-y-1 md:col-span-9">
              <Label>Keterangan / Keperluan</Label>
              <Input 
                placeholder="Untuk acara 17 Agustusan..." 
                value={formData.keterangan}
                onChange={e => setFormData({...formData, keterangan: e.target.value})}
              />
            </div>
            
            <div className="md:col-span-3">
              <Button onClick={handleSave} disabled={saving || !formData.item_id || !formData.peminjam} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Catat Pinjam
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Peminjaman</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead>Peminjam</TableHead>
                  <TableHead>Tgl Pinjam</TableHead>
                  <TableHead>Tgl Kembali</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Belum ada riwayat peminjaman.</TableCell></TableRow>
                ) : loans.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">
                      {l.inventory_items?.nama_barang}
                      <span className="ml-2 text-xs text-muted-foreground">({l.jumlah} unit)</span>
                    </TableCell>
                    <TableCell>
                      {l.peminjam}
                      {l.keterangan && <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{l.keterangan}</div>}
                    </TableCell>
                    <TableCell>{new Date(l.tanggal_pinjam).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{l.tanggal_kembali ? new Date(l.tanggal_kembali).toLocaleDateString('id-ID') : '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full 
                        ${l.status === 'dikembalikan' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {l.status?.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {l.status !== 'dikembalikan' && (
                        <Button variant="outline" size="sm" className="h-8 text-xs bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 border-green-200" onClick={() => handleReturn(l.id)}>
                          Kembalikan
                        </Button>
                      )}
                    </TableCell>
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
