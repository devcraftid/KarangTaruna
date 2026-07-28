import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from '@/lib/supabase'
import { Users, Plus, Loader2, Trash2 } from 'lucide-react'

export default function StrukturOrganisasi() {
  const [periods, setPeriods] = useState<any[]>([])
  const [divisions, setDivisions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [newPeriod, setNewPeriod] = useState({ tahun_mulai: '', tahun_selesai: '' })
  const [newDivision, setNewDivision] = useState({ nama_divisi: '', deskripsi: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setFetching(true)
    try {
      const [periodsRes, divisionsRes] = await Promise.all([
        supabase.from('organization_periods').select('*').order('tahun_mulai', { ascending: false }),
        supabase.from('organization_divisions').select('*').order('nama_divisi')
      ])
      
      if (periodsRes.data) setPeriods(periodsRes.data)
      if (divisionsRes.data) setDivisions(divisionsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleAddPeriod = async () => {
    if (!newPeriod.tahun_mulai || !newPeriod.tahun_selesai) return
    setLoading(true)
    try {
      const { data, error } = await supabase.from('organization_periods').insert([newPeriod]).select()
      if (error) throw error
      if (data) setPeriods([...data, ...periods])
      setNewPeriod({ tahun_mulai: '', tahun_selesai: '' })
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDivision = async () => {
    if (!newDivision.nama_divisi) return
    setLoading(true)
    try {
      const { data, error } = await supabase.from('organization_divisions').insert([newDivision]).select()
      if (error) throw error
      if (data) setDivisions([...divisions, ...data])
      setNewDivision({ nama_divisi: '', deskripsi: '' })
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDivision = async (id: string) => {
    if (!confirm('Hapus divisi ini?')) return
    try {
      const { error } = await supabase.from('organization_divisions').delete().eq('id', id)
      if (error) throw error
      setDivisions(divisions.filter(d => d.id !== id))
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (fetching) {
    return <div className="flex justify-center p-4 md:p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Struktur Kepengurusan</h1>
          <p className="text-muted-foreground">
            Kelola periode kepengurusan dan master divisi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Kolom Periode */}
        <Card>
          <CardHeader>
            <CardTitle>Periode Kepengurusan</CardTitle>
            <CardDescription>Daftar masa jabatan pengurus.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="space-y-1 flex-1">
                <Label>Tahun Mulai</Label>
                <Input placeholder="2024" value={newPeriod.tahun_mulai} onChange={e => setNewPeriod({...newPeriod, tahun_mulai: e.target.value})} />
              </div>
              <div className="space-y-1 flex-1">
                <Label>Tahun Selesai</Label>
                <Input placeholder="2027" value={newPeriod.tahun_selesai} onChange={e => setNewPeriod({...newPeriod, tahun_selesai: e.target.value})} />
              </div>
              <Button onClick={handleAddPeriod} disabled={loading}><Plus className="w-4 h-4" /></Button>
            </div>

            <div className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Belum ada data periode.</TableCell></TableRow>
                  ) : periods.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.tahun_mulai} - {p.tahun_selesai}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>{p.is_active ? 'Aktif' : 'Tidak Aktif'}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Kolom Divisi */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Divisi / Bidang</CardTitle>
            <CardDescription>Master data bidang/seksi kepengurusan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="space-y-1 flex-1">
                <Label>Nama Divisi</Label>
                <Input placeholder="Misal: Humas" value={newDivision.nama_divisi} onChange={e => setNewDivision({...newDivision, nama_divisi: e.target.value})} />
              </div>
              <Button onClick={handleAddDivision} disabled={loading}><Plus className="w-4 h-4 mr-2" /> Tambah</Button>
            </div>

            <div className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Divisi</TableHead>
                    <TableHead className="w-[80px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {divisions.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Belum ada divisi.</TableCell></TableRow>
                  ) : divisions.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.nama_divisi}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={() => handleDeleteDivision(d.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
