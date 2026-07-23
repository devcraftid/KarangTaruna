import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProposals, createProposal, updateProposal, deleteProposal } from '@/services/proposalService'
import { getActiveEvents } from '@/services/eventService'
import type { Proposal } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit2, Trash2, FileText, Download, Building, Phone } from 'lucide-react'
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

export default function Proposals() {
  const queryClient = useQueryClient()
  
  const [isOpen, setIsOpen] = useState(false)
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [filterEventId, setFilterEventId] = useState<string>('all')

  const [formData, setFormData] = useState({
    event_id: '',
    instansi_tujuan: '',
    kontak_person: '',
    nomor_hp: '',
    tanggal_kirim: new Date().toISOString().split('T')[0],
    status: 'dikirim' as 'dikirim' | 'follow_up' | 'diterima' | 'ditolak',
    nominal_cair: 0,
    keterangan: '',
    file_proposal: ''
  })

  // Queries
  const { data: events } = useQuery({ queryKey: ['active-events'], queryFn: getActiveEvents })
  
  const { data: proposals, isLoading, error } = useQuery({ 
    queryKey: ['proposals', filterEventId], 
    queryFn: () => getProposals(filterEventId === 'all' ? undefined : filterEventId)
  })

  const resetForm = () => {
    setFormData({
      event_id: events?.[0]?.id || '',
      instansi_tujuan: '',
      kontak_person: '',
      nomor_hp: '',
      tanggal_kirim: new Date().toISOString().split('T')[0],
      status: 'dikirim',
      nominal_cair: 0,
      keterangan: '',
      file_proposal: ''
    })
    setEditingProposal(null)
    setSelectedFile(null)
  }

  const createMutation = useMutation({
    mutationFn: createProposal,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['proposals'] }); toast.success('Proposal ditambahkan'); setIsOpen(false); resetForm(); },
    onError: (err: any) => toast.error(err.message || 'Gagal')
  })
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Proposal> }) => updateProposal(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['proposals'] }); toast.success('Proposal diupdate'); setIsOpen(false); resetForm(); },
    onError: (err: any) => toast.error(err.message || 'Gagal')
  })
  
  const deleteMutation = useMutation({
    mutationFn: deleteProposal,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['proposals'] }); toast.success('Proposal dihapus'); },
    onError: (err: any) => toast.error(err.message || 'Gagal')
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    let fileUrl = formData.file_proposal

    try {
      if (selectedFile) {
        fileUrl = await storageService.uploadFile('news', selectedFile) // using news or create a generic bucket if needed
      }

      const finalData = { ...formData, file_proposal: fileUrl }

      if (editingProposal) {
        updateMutation.mutate({ id: editingProposal.id, data: finalData })
      } else {
        createMutation.mutate(finalData)
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'diterima': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Diterima/Cair</span>
      case 'ditolak': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Ditolak</span>
      case 'follow_up': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Follow Up</span>
      default: return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Baru Dikirim</span>
    }
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tracker Proposal & Sponsor</h2>
          <p className="text-muted-foreground">Lacak penyebaran proposal, follow up sponsor, dan donatur eksternal</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-slate-50 p-4 rounded-xl border">
        <div className="w-full sm:w-1/3 space-y-2">
          <Label>Filter Acara</Label>
          <Select value={filterEventId} onValueChange={setFilterEventId}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Acara" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Acara</SelectItem>
              {events?.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.nama_acara}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormData({...formData, event_id: events?.[0]?.id || ''})}>
                <Plus className="mr-2 h-4 w-4" /> Catat Proposal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingProposal ? 'Edit Catatan Proposal' : 'Catat Pengiriman Proposal'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Untuk Acara</Label>
                  <Select required value={formData.event_id} onValueChange={(v) => setFormData({...formData, event_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Pilih acara" /></SelectTrigger>
                    <SelectContent>
                      {events?.map(e => <SelectItem key={e.id} value={e.id}>{e.nama_acara}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Instansi / Perusahaan Tujuan</Label>
                  <Input required value={formData.instansi_tujuan} onChange={(e) => setFormData({...formData, instansi_tujuan: e.target.value})} placeholder="Misal: PT Bumi Jaya" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kontak Person (Opsional)</Label>
                    <Input value={formData.kontak_person} onChange={(e) => setFormData({...formData, kontak_person: e.target.value})} placeholder="Nama penanggung jawab" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nomor HP / Telepon</Label>
                    <Input value={formData.nomor_hp} onChange={(e) => setFormData({...formData, nomor_hp: e.target.value})} placeholder="08..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal Dikirim</Label>
                    <Input type="date" required value={formData.tanggal_kirim} onChange={(e) => setFormData({...formData, tanggal_kirim: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status Saat Ini</Label>
                    <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dikirim">Baru Dikirim</SelectItem>
                        <SelectItem value="follow_up">Sedang Follow Up (Menunggu Jawaban)</SelectItem>
                        <SelectItem value="diterima">Diterima / Cair</SelectItem>
                        <SelectItem value="ditolak">Ditolak / Tidak ACC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.status === 'diterima' && (
                  <div className="space-y-2 animate-in zoom-in duration-200">
                    <Label>Nominal Cair (Rp)</Label>
                    <Input type="number" min={0} required value={formData.nominal_cair} onChange={(e) => setFormData({...formData, nominal_cair: parseInt(e.target.value) || 0})} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Keterangan Tambahan / Hasil Pertemuan</Label>
                  <Input value={formData.keterangan} onChange={(e) => setFormData({...formData, keterangan: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <Label>Upload File Proposal PDF / Foto Bukti (Opsional)</Label>
                  <Input type="file" accept=".pdf,image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                  {formData.file_proposal && !selectedFile && (
                    <p className="text-xs text-muted-foreground">File sudah ada, upload baru untuk mengganti.</p>
                  )}
                </div>

                <div className="pt-4 flex justify-end space-x-2">
                  <Button type="submit" disabled={isUploading || createMutation.isPending || updateMutation.isPending}>
                    {isUploading ? 'Menyimpan...' : 'Simpan'}
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
        ) : proposals?.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Belum ada proposal disebar</h3>
            <p className="text-muted-foreground mt-2">Catat penyebaran proposal ke perusahaan atau donatur.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tujuan / Instansi</TableHead>
                <TableHead>Acara</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status & Hasil</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium flex items-center"><Building className="w-3 h-3 mr-1 text-slate-400"/> {p.instansi_tujuan}</div>
                    {(p.kontak_person || p.nomor_hp) && (
                      <div className="text-xs text-muted-foreground mt-1 flex items-center">
                        <Phone className="w-3 h-3 mr-1"/> {p.kontak_person || '-'} ({p.nomor_hp || '-'})
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{p.events?.nama_acara}</TableCell>
                  <TableCell className="text-sm">{new Date(p.tanggal_kirim).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>
                    <div className="mb-1">{getStatusBadge(p.status)}</div>
                    {p.status === 'diterima' && (
                      <div className="text-sm font-bold text-green-600 mt-1">Rp {p.nominal_cair?.toLocaleString('id-ID')}</div>
                    )}
                    {p.keterangan && <div className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{p.keterangan}</div>}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {p.file_proposal && (
                      <Button variant="ghost" size="icon" asChild title="Lihat Berkas">
                        <a href={p.file_proposal} target="_blank" rel="noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => { 
                      setEditingProposal(p); 
                      setFormData({ 
                        event_id: p.event_id, instansi_tujuan: p.instansi_tujuan, kontak_person: p.kontak_person || '', nomor_hp: p.nomor_hp || '', 
                        tanggal_kirim: p.tanggal_kirim, status: p.status, nominal_cair: p.nominal_cair || 0, keterangan: p.keterangan || '', file_proposal: p.file_proposal || '' 
                      }); 
                      setIsOpen(true); 
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { if(window.confirm('Hapus catatan proposal?')) deleteMutation.mutate(p.id) }}>
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
