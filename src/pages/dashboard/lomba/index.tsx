import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lombaService, Lomba } from '@/services/lombaService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit2, Trash2, Eye, FileSpreadsheet, FileIcon, MessageCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { lombaSchema, LombaFormValues } from '@/lib/validations'
import toast, { Toaster } from 'react-hot-toast'

export default function LombaPage() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewRegistrantsId, setViewRegistrantsId] = useState<string | null>(null)

  const { data: competitions, isLoading, error } = useQuery({
    queryKey: ['competitions'],
    queryFn: lombaService.getCompetitions
  })

  const form = useForm<LombaFormValues>({
    resolver: zodResolver(lombaSchema),
    defaultValues: {
      nama_lomba: '', kategori: '', lokasi: '', tanggal: '', jam: '', maksimal_peserta: 10, status: 'draft', deskripsi: ''
    }
  })

  const createMutation = useMutation({
    mutationFn: lombaService.createCompetition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      toast.success('Lomba berhasil ditambahkan')
      setIsOpen(false)
      form.reset()
    },
    onError: (err: any) => toast.error(err.message || 'Gagal menambah lomba')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: LombaFormValues }) => lombaService.updateCompetition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      toast.success('Lomba berhasil diupdate')
      setIsOpen(false)
      setEditingId(null)
      form.reset()
    },
    onError: (err: any) => toast.error(err.message || 'Gagal mengupdate lomba')
  })

  const deleteMutation = useMutation({
    mutationFn: lombaService.deleteCompetition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      toast.success('Lomba berhasil dihapus')
    },
    onError: (err: any) => toast.error(err.message || 'Gagal menghapus lomba')
  })

  const onSubmit = (data: LombaFormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (lomba: Lomba) => {
    setEditingId(lomba.id)
    form.reset({
      nama_lomba: lomba.nama_lomba,
      kategori: lomba.kategori,
      lokasi: lomba.lokasi,
      tanggal: lomba.tanggal,
      jam: lomba.jam,
      maksimal_peserta: lomba.maksimal_peserta,
      status: lomba.status,
      deskripsi: lomba.deskripsi || '',
      pemenang: lomba.pemenang || ''
    })
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus lomba ini? Pendaftaran yang terkait juga akan terhapus.')) {
      deleteMutation.mutate(id)
    }
  }

  const selectedLomba = competitions?.find(c => c.id === viewRegistrantsId)

  const handleExportExcel = (lomba: any) => {
    if (!lomba.registrations || lomba.registrations.length === 0) {
      toast.error('Belum ada pendaftar')
      return
    }
    const data = lomba.registrations.map((r: any, idx: number) => ({
      No: idx + 1,
      Nama: r.members?.nama,
      NIK: r.members?.nik,
      'Jenis Kelamin': r.members?.jenis_kelamin,
      RT: r.members?.rt,
      RW: r.members?.rw,
      'No. HP': r.members?.nomor_hp || '-'
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Pendaftar")
    XLSX.writeFile(wb, `Pendaftar_Lomba_${lomba.nama_lomba}.xlsx`)
  }

  const handleExportPDF = (lomba: any) => {
    if (!lomba.registrations || lomba.registrations.length === 0) {
      toast.error('Belum ada pendaftar')
      return
    }
    const doc = new jsPDF()
    doc.text(`Daftar Pendaftar Lomba: ${lomba.nama_lomba}`, 14, 15)
    
    const tableColumn = ["No", "Nama", "L/P", "RT", "RW", "No. HP"]
    const tableRows = lomba.registrations.map((r: any, idx: number) => [
      idx + 1,
      r.members?.nama,
      r.members?.jenis_kelamin,
      r.members?.rt,
      r.members?.rw,
      r.members?.nomor_hp || '-'
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    })
    doc.save(`Pendaftar_Lomba_${lomba.nama_lomba}.pdf`)
  }

  const handleSendWA = (nomorHp: string, nama: string, lombaName: string) => {
    if (!nomorHp || nomorHp === '-') {
      toast.error('Nomor HP tidak tersedia untuk pendaftar ini')
      return
    }
    const cleanNumber = nomorHp.replace(/[^0-9]/g, '')
    const formattedNumber = cleanNumber.startsWith('0') ? '62' + cleanNumber.substring(1) : cleanNumber
    const message = encodeURIComponent(`Halo ${nama},\n\nTerkait pendaftaran Anda untuk lomba ${lombaName}, kami ingin menginformasikan bahwa...\n`)
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank')
  }

  const handleShareListWA = (lomba: any) => {
    if (!lomba.registrations || lomba.registrations.length === 0) {
      toast.error('Belum ada pendaftar')
      return
    }
    
    let text = `List Daftar Lomba ${lomba.nama_lomba}:\n\n`
    lomba.registrations.forEach((r: any, idx: number) => {
      text += `${idx + 1}. ${r.members?.nama} lomba ${lomba.nama_lomba} (${lomba.kategori})\n`
    })
    
    const message = encodeURIComponent(text)
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const openCreateDialog = () => {
    setEditingId(null)
    form.reset({ nama_lomba: '', kategori: '', lokasi: '', tanggal: '', jam: '', maksimal_peserta: 10, status: 'draft', deskripsi: '', pemenang: '' })
    setIsOpen(true)
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Lomba</h2>
          <p className="text-muted-foreground">Kelola agenda perlombaan 17 Agustus</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Lomba
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Lomba' : 'Tambah Lomba Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nama Lomba</Label>
                <Input {...form.register('nama_lomba')} placeholder="Contoh: Balap Karung" />
                {form.formState.errors.nama_lomba && <p className="text-sm text-destructive">{form.formState.errors.nama_lomba.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Input {...form.register('kategori')} placeholder="Anak-anak / Dewasa" />
                  {form.formState.errors.kategori && <p className="text-sm text-destructive">{form.formState.errors.kategori.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Lokasi</Label>
                  <Input {...form.register('lokasi')} placeholder="Lapangan RT 01" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input type="date" {...form.register('tanggal')} />
                </div>
                <div className="space-y-2">
                  <Label>Jam</Label>
                  <Input type="time" {...form.register('jam')} />
                </div>
                <div className="space-y-2">
                  <Label>Maksimal Peserta</Label>
                  <Input type="number" {...form.register('maksimal_peserta')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status Lomba</Label>
                <Select 
                  onValueChange={(val) => form.setValue('status', val as 'draft' | 'published' | 'completed')}
                  defaultValue={form.getValues('status')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Belum Dibuka)</SelectItem>
                    <SelectItem value="published">Published (Buka Pendaftaran)</SelectItem>
                    <SelectItem value="completed">Completed (Selesai)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.watch('status') === 'completed' && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                  <Label>Pemenang Lomba (Opsional)</Label>
                  <Input {...form.register('pemenang')} placeholder="Contoh: Juara 1: Budi, Juara 2: Ani" />
                </div>
              )}

              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Simpan Perubahan' : 'Tambah Lomba'}
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
          <div className="p-8 text-center text-destructive">Gagal memuat data lomba.</div>
        ) : competitions?.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-lg font-semibold">Belum ada perlombaan</h3>
            <p className="text-muted-foreground mt-2">Mulai tambahkan perlombaan baru.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Lomba</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Kuota</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitions?.map((lomba) => (
                <TableRow key={lomba.id}>
                  <TableCell className="font-medium">{lomba.nama_lomba}</TableCell>
                  <TableCell>{lomba.kategori}</TableCell>
                  <TableCell>{new Date(lomba.tanggal).toLocaleDateString('id-ID')} {lomba.jam}</TableCell>
                  <TableCell>{lomba.registrations?.length || 0} / {lomba.maksimal_peserta} Orang</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${lomba.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : lomba.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' : 'bg-gray-100 text-gray-700 dark:bg-gray-800'}`}>
                      {lomba.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700" onClick={() => setViewRegistrantsId(lomba.id)} title="Lihat Pendaftar">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(lomba)} title="Edit Lomba">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(lomba.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!viewRegistrantsId} onOpenChange={(open) => !open && setViewRegistrantsId(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
            <DialogTitle>Pendaftar: {selectedLomba?.nama_lomba}</DialogTitle>
            {selectedLomba?.registrations && selectedLomba.registrations.length > 0 && (
              <div className="flex space-x-2 mr-8">
                <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => handleExportExcel(selectedLomba)}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleExportPDF(selectedLomba)}>
                  <FileIcon className="w-4 h-4 mr-2" /> PDF
                </Button>
                <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => handleShareListWA(selectedLomba)}>
                  <MessageCircle className="w-4 h-4 mr-2" /> Share WA
                </Button>
              </div>
            )}
          </DialogHeader>
          <div className="py-4">
            {(!selectedLomba?.registrations || selectedLomba.registrations.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground">Belum ada pendaftar untuk lomba ini.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>L/P</TableHead>
                    <TableHead>RT/RW</TableHead>
                    <TableHead>No HP</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedLomba.registrations.map((reg: any, idx: number) => (
                    <TableRow key={reg.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">{reg.members?.nama}</TableCell>
                      <TableCell>{reg.members?.jenis_kelamin}</TableCell>
                      <TableCell>{reg.members?.rt}/{reg.members?.rw}</TableCell>
                      <TableCell>{reg.members?.nomor_hp || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleSendWA(reg.members?.nomor_hp, reg.members?.nama, selectedLomba.nama_lomba)}
                          disabled={!reg.members?.nomor_hp}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" /> WA
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
