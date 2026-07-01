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

export default function Anggota() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

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
      nomor_hp: ''
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

  const onSubmit = (data: MemberFormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data })
    } else {
      // Auto-generate missing fields for new members
      const pseudoNik = `KT-${Date.now().toString().slice(-13)}`
      const finalData = {
        ...data,
        nik: data.nik || pseudoNik,
        jenis_kelamin: data.jenis_kelamin || 'Laki-laki',
        tanggal_lahir: data.tanggal_lahir || '2000-01-01',
        alamat: data.alamat || '-',
        rt: data.rt || '00',
        rw: data.rw || '00',
        nomor_hp: data.nomor_hp || ''
      }
      createMutation.mutate(finalData)
    }
  }

  const handleEdit = (member: Member) => {
    setEditingId(member.id)
    form.reset({
      nama: member.nama,
      nik: member.nik,
      jenis_kelamin: member.jenis_kelamin as 'Laki-laki' | 'Perempuan',
      tanggal_lahir: member.tanggal_lahir,
      alamat: member.alamat,
      rt: member.rt,
      rw: member.rw,
      nomor_hp: member.nomor_hp
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
    form.reset({
      nama: '', nik: '', jenis_kelamin: 'Laki-laki', tanggal_lahir: '', alamat: '', rt: '', rw: '', nomor_hp: ''
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
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Simpan Perubahan' : 'Tambah Data'}
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
