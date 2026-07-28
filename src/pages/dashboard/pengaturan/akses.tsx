import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { supabase } from '@/lib/supabase'
import { Loader2, Users, Shield, UserCog } from 'lucide-react'

export default function PengaturanAkses() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    role: 'warga'
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, fullname, email, role, created_at')
      .order('created_at', { ascending: false })
      
    if (!error && data) {
      setUsers(data)
    }
    setLoading(false)
  }

  const handleOpenDialog = (user: any) => {
    setSelectedUser(user)
    setFormData({ role: user.role || 'warga' })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!selectedUser) return
    
    setSaving(true)
    try {
      await supabase
        .from('profiles')
        .update({ role: formData.role })
        .eq('id', selectedUser.id)
        
      setIsDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error(error)
      alert('Terjadi kesalahan saat mengubah peran pengguna.')
    } finally {
      setSaving(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Super Admin</span>
      case 'ketua': return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Ketua</span>
      case 'wakil_ketua': return <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">Wakil Ketua</span>
      case 'sekretaris': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Sekretaris</span>
      case 'bendahara': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Bendahara</span>
      case 'koordinator': return <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">Koor. Bidang</span>
      case 'admin_media': return <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">Admin Media</span>
      case 'admin_umkm': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Admin UMKM</span>
      case 'pembina': return <span className="px-2 py-1 bg-slate-800 text-slate-100 rounded-full text-xs font-medium">Pembina</span>
      case 'panitia': return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Panitia Acara</span>
      case 'anggota': return <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium">Anggota</span>
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium">Warga / Publik</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hak Akses & Pengguna</h1>
          <p className="text-muted-foreground">
            Kelola akun pengguna terdaftar dan berikan peran (role) untuk akses dasbor.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Daftar Pengguna Terdaftar
          </CardTitle>
          <CardDescription>Menampilkan semua profil yang memiliki akun di sistem Karang Taruna.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
              Belum ada data pengguna.
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Email Akun</TableHead>
                    <TableHead>Peran Saat Ini</TableHead>
                    <TableHead>Terdaftar Sejak</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.fullname || 'Tanpa Nama'}
                      </TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>
                        {getRoleBadge(item.role)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(item)} className="gap-2">
                          <UserCog className="w-4 h-4" /> Ubah Peran
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary"/> Ubah Hak Akses</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="bg-slate-50 p-4 rounded-lg space-y-1">
                <p className="text-sm text-slate-500">Pengguna Terpilih:</p>
                <p className="font-semibold">{selectedUser.fullname}</p>
                <p className="text-sm text-slate-600">{selectedUser.email}</p>
              </div>

              <div className="grid gap-2 mt-2">
                <Label>Pilih Peran Baru</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData({ role: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Super Admin (Akses Penuh)</SelectItem>
                    <SelectItem value="ketua">Ketua (Laporan & Pengawasan)</SelectItem>
                    <SelectItem value="wakil_ketua">Wakil Ketua (Wakil Pengawasan)</SelectItem>
                    <SelectItem value="sekretaris">Sekretaris (Manajemen Anggota, Surat, Acara)</SelectItem>
                    <SelectItem value="bendahara">Bendahara (Manajemen Keuangan Kas)</SelectItem>
                    <SelectItem value="koordinator">Koordinator Bidang (Program Kerja)</SelectItem>
                    <SelectItem value="admin_media">Admin Media (Publikasi & Berita)</SelectItem>
                    <SelectItem value="admin_umkm">Admin UMKM (Katalog & BUMKT)</SelectItem>
                    <SelectItem value="pembina">Pembina (Akses Pantau Laporan)</SelectItem>
                    <SelectItem value="panitia">Panitia (Manajemen Acara & Event)</SelectItem>
                    <SelectItem value="anggota">Anggota Organisasi</SelectItem>
                    <SelectItem value="warga">Warga / Publik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Terapkan Peran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
