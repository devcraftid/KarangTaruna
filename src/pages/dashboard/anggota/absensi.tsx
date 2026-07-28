import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'
import { CheckSquare, Loader2, Save, Plus } from 'lucide-react'

export default function AbsensiAnggota() {
  const [attendances, setAttendances] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    member_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    kegiatan: '',
    status: 'hadir',
    keterangan: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [attRes, memRes] = await Promise.all([
        supabase
          .from('member_attendances')
          .select(`
            id, tanggal, kegiatan, status, keterangan,
            members(nama, nomor_anggota)
          `)
          .order('tanggal', { ascending: false })
          .limit(100),
        supabase
          .from('members')
          .select('id, nama, nomor_anggota')
          .order('nama')
      ])
      
      if (attRes.data) setAttendances(attRes.data)
      if (memRes.data) setMembers(memRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.member_id || !formData.kegiatan) return
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('member_attendances')
        .insert([{
          member_id: formData.member_id,
          tanggal: formData.tanggal,
          kegiatan: formData.kegiatan,
          status: formData.status,
          keterangan: formData.kegaran
        }])
        .select(`
          id, tanggal, kegiatan, status, keterangan,
          members(nama, nomor_anggota)
        `)
      
      if (error) throw error
      if (data) {
        setAttendances([data[0], ...attendances])
      }
      setFormData({ ...formData, member_id: '', keterangan: '' })
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CheckSquare className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Presensi Anggota</h1>
          <p className="text-muted-foreground">
            Catat dan pantau riwayat kehadiran anggota secara manual.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Absensi Baru</CardTitle>
          <CardDescription>Masukkan data kehadiran anggota untuk rapat/kegiatan tertentu.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="space-y-1">
              <Label>Kegiatan / Rapat</Label>
              <Input 
                placeholder="Misal: Rapat Pleno Agustus" 
                value={formData.kegiatan}
                onChange={e => setFormData({...formData, kegiatan: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <Label>Tanggal</Label>
              <Input 
                type="date" 
                value={formData.tanggal}
                onChange={e => setFormData({...formData, tanggal: e.target.value})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 p-4 rounded-xl border">
            <div className="space-y-1 md:col-span-5">
              <Label>Anggota</Label>
              <Select value={formData.member_id} onValueChange={(val) => setFormData({...formData, member_id: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Anggota" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nomor_anggota ? `[${m.nomor_anggota}] ` : ''}{m.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hadir">Hadir</SelectItem>
                  <SelectItem value="izin">Izin</SelectItem>
                  <SelectItem value="sakit">Sakit</SelectItem>
                  <SelectItem value="alpa">Alpa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-3">
              <Label>Keterangan (Opsional)</Label>
              <Input 
                placeholder="Alasan izin/sakit..." 
                value={formData.keterangan || ''}
                onChange={e => setFormData({...formData, keterangan: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleSave} disabled={saving || !formData.member_id || !formData.kegiatan} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Catat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Kehadiran Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama Anggota</TableHead>
                <TableHead>Kegiatan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendances.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Belum ada riwayat absensi.</TableCell></TableRow>
              ) : attendances.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{new Date(a.tanggal).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="font-medium">{a.members?.nama}</TableCell>
                  <TableCell>{a.kegiatan}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full 
                      ${a.status === 'hadir' ? 'bg-green-100 text-green-700' : 
                        a.status === 'izin' ? 'bg-blue-100 text-blue-700' :
                        a.status === 'sakit' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {a.status?.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.keterangan || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
