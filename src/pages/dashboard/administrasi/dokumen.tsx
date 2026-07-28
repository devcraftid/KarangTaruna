import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { FileText, Plus, Loader2, Trash2, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/context/AuthContext'

export default function Dokumen() {
  const { profile } = useAuth()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    tipe_dokumen: 'proposal',
    judul: '',
    deskripsi: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setFetching(true)
    try {
      const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false })
      if (error) throw error
      if (data) setDocuments(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleAdd = async () => {
    if (!formData.judul || !file) return
    setLoading(true)
    try {
      // 1. Upload File
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      // We will upload to 'proposal' bucket as a generic bucket for phase 2 or create a 'documents' bucket.
      // For now let's use 'proposal' bucket if 'documents' doesn't exist, wait, the schema had 'lpj' and 'proposal'.
      const bucket = formData.tipe_dokumen === 'lpj' ? 'lpj' : 'proposal'
      
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file)
      if (uploadError) throw uploadError
      
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)

      // 2. Insert to database
      const { data, error } = await supabase.from('documents').insert([{
        ...formData,
        file_url: urlData.publicUrl,
        uploaded_by: profile?.id
      }]).select()
      
      if (error) throw error
      if (data) setDocuments([data[0], ...documents])
      
      setFormData({ tipe_dokumen: 'proposal', judul: '', deskripsi: '' })
      setFile(null)
      setIsOpen(false)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus dokumen ini?')) return
    try {
      const { error } = await supabase.from('documents').delete().eq('id', id)
      if (error) throw error
      setDocuments(documents.filter(d => d.id !== id))
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (fetching) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Arsip Dokumen</h1>
            <p className="text-muted-foreground">Penyimpanan Proposal, LPJ, SOP, dan Template.</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Unggah Dokumen</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Unggah Dokumen Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipe Dokumen</Label>
                <Select value={formData.tipe_dokumen} onValueChange={v => setFormData({...formData, tipe_dokumen: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="lpj">Laporan (LPJ)</SelectItem>
                    <SelectItem value="sop">SOP Organisasi</SelectItem>
                    <SelectItem value="template">Template Surat/Desain</SelectItem>
                    <SelectItem value="lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Judul Dokumen</Label>
                <Input value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} placeholder="Proposal Kegiatan..." />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi / Keterangan Singkat</Label>
                <Input value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Pilih File</Label>
                <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
              <Button onClick={handleAdd} disabled={loading || !file} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Unggah
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipe</TableHead>
                <TableHead>Judul Dokumen</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Waktu Unggah</TableHead>
                <TableHead className="w-[120px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Belum ada dokumen yang diunggah.</TableCell></TableRow>
              ) : documents.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-semibold uppercase">{d.tipe_dokumen}</span>
                  </TableCell>
                  <TableCell className="font-semibold">{d.judul}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{d.deskripsi || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">{new Date(d.created_at).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <a href={d.file_url} target="_blank" rel="noreferrer" download>
                        <Button variant="ghost" size="icon" title="Unduh File"><Download className="w-4 h-4 text-primary" /></Button>
                      </a>
                      <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 p-0" onClick={() => handleDelete(d.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
