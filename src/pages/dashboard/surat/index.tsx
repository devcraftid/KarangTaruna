// @ts-nocheck
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Plus, Mail, Loader2, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import toast from 'react-hot-toast'
import { Letter } from '@/types'

export default function Surat() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    nomor_surat: '',
    jenis_surat: 'masuk',
    tanggal: new Date().toISOString().split('T')[0],
    pihak_terkait: '',
    perihal: '',
    keterangan: '',
    disposisi_kepada: '',
    status_surat: 'diproses'
  })

  const { data: letters, isLoading } = useQuery({
    queryKey: ['letters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .order('tanggal', { ascending: false })
      if (error) throw error
      return data as Letter[]
    }
  })

  const createMutation = useMutation({
    mutationFn: async (newData: any) => {
      let file_url = ''
      
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('letters')
          .upload(filePath, file)
          
        if (uploadError) throw uploadError
        
        const { data: urlData } = supabase.storage
          .from('letters')
          .getPublicUrl(filePath)
          
        file_url = urlData.publicUrl
      }

      const { error } = await supabase.from('letters').insert([{
        ...newData,
        file_url,
        created_by: profile?.id
      }])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letters'] })
      toast.success('Surat berhasil ditambahkan')
      setIsOpen(false)
      setFormData({
        nomor_surat: '',
        jenis_surat: 'masuk',
        tanggal: new Date().toISOString().split('T')[0],
        pihak_terkait: '',
        perihal: '',
        keterangan: '',
        disposisi_kepada: '',
        status_surat: 'diproses'
      })
      setFile(null)
    },
    onError: (error) => {
      toast.error('Gagal menambahkan surat: ' + error.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('letters').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letters'] })
      toast.success('Surat berhasil dihapus')
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    await createMutation.mutateAsync(formData)
    setUploading(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            E-Surat
          </h1>
          <p className="text-muted-foreground">Arsip Surat Masuk dan Keluar</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Tambah Surat</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle>Tambah Arsip Surat</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Jenis Surat</Label>
                <Select value={formData.jenis_surat} onValueChange={(val) => setFormData({...formData, jenis_surat: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masuk">Surat Masuk</SelectItem>
                    <SelectItem value="keluar">Surat Keluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nomor Surat</Label>
                <Input required value={formData.nomor_surat} onChange={e => setFormData({...formData, nomor_surat: e.target.value})} placeholder="001/KT/2023" />
              </div>
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input type="date" required value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{formData.jenis_surat === 'masuk' ? 'Pengirim' : 'Tujuan'}</Label>
                <Input required value={formData.pihak_terkait} onChange={e => setFormData({...formData, pihak_terkait: e.target.value})} placeholder={formData.jenis_surat === 'masuk' ? 'Desa ...' : 'Bapak ...'} />
              </div>
              <div className="space-y-2">
                <Label>Perihal</Label>
                <Input required value={formData.perihal} onChange={e => setFormData({...formData, perihal: e.target.value})} placeholder="Undangan Rapat" />
              </div>
              <div className="space-y-2">
                <Label>File Surat (Opsional, PDF/Gambar)</Label>
                <Input type="file" accept=".pdf,image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="space-y-2">
                <Label>Disposisi Ke (Opsional)</Label>
                <Input value={formData.disposisi_kepada} onChange={e => setFormData({...formData, disposisi_kepada: e.target.value})} placeholder="Ketua RT, Bidang Olahraga..." />
              </div>
              <div className="space-y-2">
                <Label>Keterangan Tambahan</Label>
                <Input value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} />
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Simpan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-card border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Surat</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Pihak Terkait</TableHead>
              <TableHead>Perihal</TableHead>
              <TableHead>Disposisi</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : letters?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Belum ada arsip surat</TableCell>
              </TableRow>
            ) : (
              letters?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nomor_surat}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.jenis_surat === 'masuk' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {item.jenis_surat.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{item.pihak_terkait}</TableCell>
                  <TableCell>{item.perihal}</TableCell>
                  <TableCell>
                    {item.disposisi_kepada ? (
                       <span className="px-2 py-1 bg-slate-100 rounded-md text-xs border">{item.disposisi_kepada}</span>
                    ) : (
                       <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.file_url && (
                        <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" title="Lihat Surat"><ExternalLink className="w-4 h-4 text-blue-600" /></Button>
                        </a>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => { if(confirm('Yakin ingin menghapus?')) deleteMutation.mutate(item.id) }}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
