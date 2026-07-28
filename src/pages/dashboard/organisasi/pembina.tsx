import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from '@/lib/supabase'
import { Award, Plus, Loader2, Trash2 } from 'lucide-react'

export default function PembinaOrganisasi() {
  const [advisors, setAdvisors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [formData, setFormData] = useState({ nama_pembina: '', jabatan: '', kontak: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setFetching(true)
    try {
      const { data, error } = await supabase.from('organization_advisors').select('*').order('created_at', { ascending: true })
      if (error) throw error
      if (data) setAdvisors(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleAdd = async () => {
    if (!formData.nama_pembina || !formData.jabatan) return
    setLoading(true)
    try {
      const { data, error } = await supabase.from('organization_advisors').insert([formData]).select()
      if (error) throw error
      if (data) setAdvisors([...advisors, ...data])
      setFormData({ nama_pembina: '', jabatan: '', kontak: '' })
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data pembina ini?')) return
    try {
      const { error } = await supabase.from('organization_advisors').delete().eq('id', id)
      if (error) throw error
      setAdvisors(advisors.filter(a => a.id !== id))
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (fetching) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Award className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dewan Pembina</h1>
          <p className="text-muted-foreground">
            Data pelindung dan pembina Karang Taruna.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Pembina Baru</CardTitle>
          <CardDescription>Masukkan data dewan pembina atau penasihat.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-1 flex-1 w-full">
              <Label>Nama Lengkap & Gelar</Label>
              <Input placeholder="Bpk. Kepala Desa..." value={formData.nama_pembina} onChange={e => setFormData({...formData, nama_pembina: e.target.value})} />
            </div>
            <div className="space-y-1 flex-1 w-full">
              <Label>Jabatan Instansi</Label>
              <Input placeholder="Kepala Desa / Ketua RW" value={formData.jabatan} onChange={e => setFormData({...formData, jabatan: e.target.value})} />
            </div>
            <div className="space-y-1 flex-1 w-full">
              <Label>Kontak (Opsional)</Label>
              <Input placeholder="0812..." value={formData.kontak} onChange={e => setFormData({...formData, kontak: e.target.value})} />
            </div>
            <Button onClick={handleAdd} disabled={loading} className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Tambah
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pembina</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead className="w-[100px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advisors.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Belum ada data pembina.</TableCell></TableRow>
              ) : advisors.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-semibold">{a.nama_pembina}</TableCell>
                  <TableCell>{a.jabatan}</TableCell>
                  <TableCell>{a.kontak || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={() => handleDelete(a.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
