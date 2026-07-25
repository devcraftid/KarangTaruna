import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getHallOfFameEntries, createHallOfFameEntry, updateHallOfFameEntry, deleteHallOfFameEntry } from '@/services/hallOfFameService'
import type { HallOfFameEntry } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit2, Trash2, Award, Image as ImageIcon } from 'lucide-react'
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
import toast, { Toaster } from 'react-hot-toast'
import { storageService } from '@/services/storageService'

const KATEGORI_OPTIONS = [
  { value: 'ketua', label: 'Ketua Karang Taruna' },
  { value: 'pengurus_terbaik', label: 'Pengurus Terbaik' },
  { value: 'anggota_inspiratif', label: 'Anggota Inspiratif' },
  { value: 'prestasi', label: 'Prestasi Organisasi' },
  { value: 'juara_lomba', label: 'Juara Lomba' },
  { value: 'sejarah', label: 'Dokumentasi Sejarah' }
]

export default function HallOfFameDashboard() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<HallOfFameEntry | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [filterKategori, setFilterKategori] = useState<string>('all')

  const [formData, setFormData] = useState<Partial<HallOfFameEntry>>({
    kategori: 'ketua',
    judul: '',
    deskripsi: '',
    tahun: new Date().getFullYear().toString(),
    foto_url: ''
  })

  const { data: entries, isLoading, error } = useQuery({ 
    queryKey: ['hall_of_fame'], 
    queryFn: getHallOfFameEntries 
  })

  const resetForm = () => {
    setFormData({
      kategori: 'ketua',
      judul: '',
      deskripsi: '',
      tahun: new Date().getFullYear().toString(),
      foto_url: ''
    })
    setEditingEntry(null)
    setSelectedFile(null)
  }

  const createMutation = useMutation({
    mutationFn: createHallOfFameEntry,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hall_of_fame'] }); toast.success('Entri ditambahkan'); setIsOpen(false); resetForm(); },
    onError: (err: any) => toast.error(err.message || 'Gagal menambahkan data')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<HallOfFameEntry> }) => updateHallOfFameEntry(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hall_of_fame'] }); toast.success('Entri diupdate'); setIsOpen(false); resetForm(); },
    onError: (err: any) => toast.error(err.message || 'Gagal update data')
  })

  const deleteMutation = useMutation({
    mutationFn: deleteHallOfFameEntry,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hall_of_fame'] }); toast.success('Entri dihapus'); },
    onError: (err: any) => toast.error(err.message || 'Gagal menghapus data')
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    let fileUrl = formData.foto_url

    try {
      if (selectedFile) {
        fileUrl = await storageService.uploadFile('news', selectedFile) // using news bucket for public images
      }
      const finalData = { ...formData, foto_url: fileUrl }
      if (editingEntry) {
        updateMutation.mutate({ id: editingEntry.id, data: finalData })
      } else {
        createMutation.mutate(finalData)
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const getKategoriLabel = (value: string) => {
    return KATEGORI_OPTIONS.find(opt => opt.value === value)?.label || value
  }

  const filteredEntries = entries?.filter(e => filterKategori === 'all' || e.kategori === filterKategori)

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kelola Hall of Fame</h2>
          <p className="text-muted-foreground">Dokumentasikan sejarah, mantan ketua, anggota terbaik, dan piala organisasi.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-slate-50 p-4 rounded-xl border">
        <div className="w-full sm:w-1/3 space-y-2">
          <Label>Filter Kategori</Label>
          <Select value={filterKategori} onValueChange={setFilterKategori}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {KATEGORI_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Tambah Data
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingEntry ? 'Edit Data Hall of Fame' : 'Tambah Data Hall of Fame'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kategori / Jenis</Label>
                    <Select required value={formData.kategori} onValueChange={(v: any) => setFormData({...formData, kategori: v})}>
                      <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                      <SelectContent>
                        {KATEGORI_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tahun (Misal: 2023 atau 2018-2021)</Label>
                    <Input required value={formData.tahun} onChange={(e) => setFormData({...formData, tahun: e.target.value})} placeholder="2023" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Judul / Nama Lengkap</Label>
                  <Input required value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} placeholder="Misal: Budi Santoso (Ketua) / Juara 1 Voli" />
                </div>

                <div className="space-y-2">
                  <Label>Deskripsi / Keterangan (Opsional)</Label>
                  <Textarea value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} placeholder="Ceritakan detail prestasi atau riwayat..." rows={4} />
                </div>

                <div className="space-y-2">
                  <Label>Upload Foto / Gambar (Sangat Disarankan)</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                  {formData.foto_url && !selectedFile && (
                    <div className="mt-2 flex items-center gap-4">
                      <img src={formData.foto_url} alt="Preview" className="w-16 h-16 object-cover rounded-md border" />
                      <p className="text-xs text-muted-foreground">Foto sudah ada, upload foto baru untuk mengganti.</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end space-x-2">
                  <Button type="submit" disabled={isUploading || createMutation.isPending || updateMutation.isPending}>
                    {isUploading ? 'Menyimpan...' : 'Simpan Data'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">Gagal memuat.</div>
        ) : filteredEntries?.length === 0 ? (
          <div className="p-16 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Belum ada data di kategori ini</h3>
            <p className="text-muted-foreground mt-2">Mulai masukkan sejarah dan prestasi organisasi.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Foto</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Judul / Nama</TableHead>
                <TableHead>Tahun</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries?.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {entry.foto_url ? (
                      <img src={entry.foto_url} alt={entry.judul} className="w-12 h-12 rounded-lg object-cover border" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {getKategoriLabel(entry.kategori)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{entry.judul}</div>
                    {entry.deskripsi && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{entry.deskripsi}</div>}
                  </TableCell>
                  <TableCell className="font-medium">{entry.tahun}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => { 
                      setEditingEntry(entry); 
                      setFormData(entry); 
                      setIsOpen(true); 
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { if(window.confirm('Hapus entri sejarah ini?')) deleteMutation.mutate(entry.id) }}>
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
