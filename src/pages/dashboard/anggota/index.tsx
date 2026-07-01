import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { memberService, Member } from '@/services/memberService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit2, Trash2, MessageCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { memberSchema, MemberFormValues } from '@/lib/validations'
import toast, { Toaster } from 'react-hot-toast'
import { storageService } from '@/services/storageService'

export default function Anggota() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { data: members, isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: memberService.getMembers
  })

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      nama: '',
      nik: '',
      jenis_kelamin: 'Laki-laki',
      tanggal_lahir: '',
      alamat: '',
      rt: '',
      rw: '',
      nomor_hp: '',
      is_panitia: false,
      jabatan: 'Anggota',
      divisi: '',
      foto_url: ''
    }
  })

  const createMutation = useMutation({
    mutationFn: memberService.createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Anggota berhasil ditambahkan')
      setIsOpen(false)
      form.reset()
    },
    onError: (err: any) => toast.error(err.message || 'Gagal menambah anggota')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: MemberFormValues }) => memberService.updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Anggota berhasil diupdate')
      setIsOpen(false)
      setEditingId(null)
      form.reset()
    },
    onError: (err: any) => toast.error(err.message || 'Gagal mengupdate anggota')
  })

  const deleteMutation = useMutation({
    mutationFn: memberService.deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Anggota berhasil dihapus')
    },
    onError: (err: any) => toast.error(err.message || 'Gagal menghapus anggota')
  })

  const onSubmit = async (data: MemberFormValues) => {
    setIsUploading(true)
    let uploadedUrl = data.foto_url || ''
    
    try {
      if (selectedFile) {
        uploadedUrl = await storageService.uploadFile('avatars', selectedFile)
      }
      
      const finalData = {
        ...data,
        foto_url: uploadedUrl
      }

      if (editingId) {
        updateMutation.mutate({ id: editingId, data: finalData })
      } else {
        const pseudoNik = `KT-${Date.now().toString().slice(-13)}`
        const finalNewData = {
          ...finalData,
          nik: finalData.nik || pseudoNik,
          jenis_kelamin: finalData.jenis_kelamin || 'Laki-laki',
          tanggal_lahir: finalData.tanggal_lahir || '2000-01-01',
          alamat: finalData.alamat || '-',
          rt: finalData.rt || '00',
          rw: finalData.rw || '00',
          nomor_hp: finalData.nomor_hp || ''
        }
        createMutation.mutate(finalNewData)
      }
    } catch (err: any) {
      toast.error('Gagal mengupload foto: ' + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleEdit = (member: Member) => {
    setEditingId(member.id)
    setSelectedFile(null)
    form.reset({
      nama: member.nama,
      nik: member.nik,
      jenis_kelamin: member.jenis_kelamin as 'Laki-laki' | 'Perempuan',
      tanggal_lahir: member.tanggal_lahir,
      alamat: member.alamat,
      rt: member.rt,
      rw: member.rw,
      nomor_hp: member.nomor_hp,
      is_panitia: member.is_panitia || false,
      jabatan: member.jabatan || 'Anggota',
      divisi: member.divisi || '',
      foto_url: member.foto_url || ''
    })
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSendWA = (nomorHp: string | undefined | null, nama: string) => {
    if (!nomorHp || nomorHp === '-') {
      toast.error('Nomor HP tidak tersedia')
      return
    }
    const cleanNumber = nomorHp.replace(/[^0-9]/g, '')
    const formattedNumber = cleanNumber.startsWith('0') ? '62' + cleanNumber.substring(1) : cleanNumber
    const message = encodeURIComponent(`Halo ${nama},\n\n`)
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank')
  }

  const openCreateDialog = () => {
    setEditingId(null)
    setSelectedFile(null)
    form.reset({
      nama: '', nik: '', jenis_kelamin: 'Laki-laki', tanggal_lahir: '', alamat: '', rt: '', rw: '', nomor_hp: '', is_panitia: false, jabatan: 'Anggota', divisi: '', foto_url: ''
    })
    setIsOpen(true)
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Anggota</h2>
          <p className="text-muted-foreground">Kelola data anggota karang taruna</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Anggota
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Anggota' : 'Tambah Anggota Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input {...form.register('nama')} placeholder="Masukkan nama" />
                  {form.formState.errors.nama && <p className="text-sm text-destructive">{form.formState.errors.nama.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Foto Profil (Opsional)</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="is_panitia" 
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={form.watch('is_panitia')} 
                      onChange={(e) => form.setValue('is_panitia', e.target.checked)} 
                    />
                    <Label htmlFor="is_panitia" className="cursor-pointer">Jadikan sebagai Panitia 17-an?</Label>
                  </div>
                </div>

                {form.watch('is_panitia') && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300">
                    <div className="space-y-2">
                      <Label>Jabatan Kepanitiaan</Label>
                      <Select 
                        onValueChange={(val) => form.setValue('jabatan', val)}
                        defaultValue={form.getValues('jabatan') || 'Anggota'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ketua">Ketua</SelectItem>
                          <SelectItem value="Wakil Ketua">Wakil Ketua</SelectItem>
                          <SelectItem value="Sekretaris">Sekretaris</SelectItem>
                          <SelectItem value="Bendahara">Bendahara</SelectItem>
                          <SelectItem value="Koordinator">Koordinator</SelectItem>
                          <SelectItem value="Anggota">Anggota</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Divisi / Seksi</Label>
                      <Select 
                        onValueChange={(val) => form.setValue('divisi', val)}
                        defaultValue={form.getValues('divisi') || 'Umum'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih divisi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inti">Inti</SelectItem>
                          <SelectItem value="Acara">Acara</SelectItem>
                          <SelectItem value="Lomba">Lomba</SelectItem>
                          <SelectItem value="Konsumsi">Konsumsi</SelectItem>
                          <SelectItem value="Perlengkapan">Perlengkapan</SelectItem>
                          <SelectItem value="Dokumentasi">Dokumentasi</SelectItem>
                          <SelectItem value="Humas">Humas</SelectItem>
                          <SelectItem value="Keamanan">Keamanan</SelectItem>
                          <SelectItem value="Umum">Umum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                {editingId && (
                  <>
                    <div className="space-y-2">
                      <Label>NIK</Label>
                      <Input {...form.register('nik')} placeholder="16 digit NIK" />
                      {form.formState.errors.nik && <p className="text-sm text-destructive">{form.formState.errors.nik.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Jenis Kelamin</Label>
                        <Select 
                          onValueChange={(val) => form.setValue('jenis_kelamin', val as 'Laki-laki' | 'Perempuan')}
                          defaultValue={form.getValues('jenis_kelamin')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis kelamin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tanggal Lahir</Label>
                        <Input type="date" {...form.register('tanggal_lahir')} />
                        {form.formState.errors.tanggal_lahir && <p className="text-sm text-destructive">{form.formState.errors.tanggal_lahir.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Alamat Lengkap</Label>
                      <Input {...form.register('alamat')} placeholder="Jalan, No Rumah" />
                      {form.formState.errors.alamat && <p className="text-sm text-destructive">{form.formState.errors.alamat.message}</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>RT</Label>
                        <Input {...form.register('rt')} placeholder="001" />
                      </div>
                      <div className="space-y-2">
                        <Label>RW</Label>
                        <Input {...form.register('rw')} placeholder="002" />
                      </div>
                      <div className="space-y-2">
                        <Label>Nomor HP</Label>
                        <Input {...form.register('nomor_hp')} placeholder="08..." />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || isUploading}>
                  {isUploading ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Data'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border rounded-xl shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">Gagal memuat data anggota.</div>
        ) : members?.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-lg font-semibold">Belum ada anggota</h3>
            <p className="text-muted-foreground mt-2">Mulai tambahkan anggota karang taruna sekarang.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>NIK</TableHead>
                <TableHead>L/P</TableHead>
                <TableHead>No. HP</TableHead>
                <TableHead>RT/RW</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.nama}</TableCell>
                  <TableCell>{member.nik}</TableCell>
                  <TableCell>{member.jenis_kelamin}</TableCell>
                  <TableCell>{member.nomor_hp}</TableCell>
                  <TableCell>{member.rt}/{member.rw}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleSendWA(member.nomor_hp, member.nama)} title="Hubungi WA">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(member.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
