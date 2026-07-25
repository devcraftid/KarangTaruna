import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProposals, createProposal, updateProposal, deleteProposal } from '@/services/proposalService'
import { getSponsors, createSponsor, updateSponsor, deleteSponsor } from '@/services/sponsorService'
import { getActiveEvents } from '@/services/eventService'
import type { Proposal, Sponsor } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit2, Trash2, FileText, Download, Building, Phone, Database, ListTodo, Sparkles, FileSignature } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import toast, { Toaster } from 'react-hot-toast'
import { storageService } from '@/services/storageService'

export default function Proposals() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('database')
  
  // -------------------------------------------------------------
  // SPONSOR DATABASE STATE
  // -------------------------------------------------------------
  const [isSponsorOpen, setIsSponsorOpen] = useState(false)
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null)
  const [sponsorForm, setSponsorForm] = useState<Partial<Sponsor>>({
    nama_perusahaan: '', bidang_industri: '', kontak_person: '', nomor_hp: '', email: '', alamat: '', tingkat_potensi: 'Sedang', penanggung_jawab: '', dokumen_mou: '', keterangan: ''
  })
  const [mouFile, setMouFile] = useState<File | null>(null)
  const [isSponsorUploading, setIsSponsorUploading] = useState(false)

  const { data: sponsors, isLoading: sponsorLoading } = useQuery({ queryKey: ['sponsors'], queryFn: getSponsors })

  const resetSponsorForm = () => {
    setSponsorForm({ nama_perusahaan: '', bidang_industri: '', kontak_person: '', nomor_hp: '', email: '', alamat: '', tingkat_potensi: 'Sedang', penanggung_jawab: '', dokumen_mou: '', keterangan: '' })
    setEditingSponsor(null)
    setMouFile(null)
  }

  const createSponsorMut = useMutation({
    mutationFn: createSponsor,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sponsors'] }); toast.success('Sponsor ditambahkan'); setIsSponsorOpen(false); resetSponsorForm(); },
    onError: (err: any) => toast.error(err.message || 'Gagal menambahkan sponsor')
  })

  const updateSponsorMut = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Sponsor> }) => updateSponsor(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sponsors'] }); toast.success('Sponsor diupdate'); setIsSponsorOpen(false); resetSponsorForm(); },
    onError: (err: any) => toast.error(err.message || 'Gagal update sponsor')
  })

  const deleteSponsorMut = useMutation({
    mutationFn: deleteSponsor,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sponsors'] }); toast.success('Sponsor dihapus'); },
    onError: (err: any) => toast.error(err.message || 'Gagal menghapus sponsor')
  })

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSponsorUploading(true)
    let fileUrl = sponsorForm.dokumen_mou

    try {
      if (mouFile) {
        fileUrl = await storageService.uploadFile('news', mouFile) // fallback to news bucket if specific not available
      }
      const finalData = { ...sponsorForm, dokumen_mou: fileUrl }
      if (editingSponsor) {
        updateSponsorMut.mutate({ id: editingSponsor.id, data: finalData })
      } else {
        createSponsorMut.mutate(finalData)
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    } finally {
      setIsSponsorUploading(false)
    }
  }

  // -------------------------------------------------------------
  // PROPOSAL TRACKER STATE
  // -------------------------------------------------------------
  const [isOpen, setIsOpen] = useState(false)
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [filterEventId, setFilterEventId] = useState<string>('all')

  const [formData, setFormData] = useState({
    event_id: '', instansi_tujuan: '', kontak_person: '', nomor_hp: '', tanggal_kirim: new Date().toISOString().split('T')[0], status: 'dikirim' as 'dikirim' | 'follow_up' | 'diterima' | 'ditolak', nominal_cair: 0, keterangan: '', file_proposal: ''
  })

  const { data: events } = useQuery({ queryKey: ['active-events'], queryFn: getActiveEvents })
  
  const { data: proposals, isLoading, error } = useQuery({ 
    queryKey: ['proposals', filterEventId], 
    queryFn: () => getProposals(filterEventId === 'all' ? undefined : filterEventId)
  })

  const resetForm = () => {
    setFormData({ event_id: events?.[0]?.id || '', instansi_tujuan: '', kontak_person: '', nomor_hp: '', tanggal_kirim: new Date().toISOString().split('T')[0], status: 'dikirim', nominal_cair: 0, keterangan: '', file_proposal: '' })
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
        fileUrl = await storageService.uploadFile('news', selectedFile) 
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

  const getPotensiBadge = (potensi: string) => {
    switch(potensi) {
      case 'Tinggi': return <span className="px-2 py-0.5 bg-green-100 text-green-800 border-green-200 border rounded text-xs font-medium">Potensi Tinggi</span>
      case 'Sedang': return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border-amber-200 border rounded text-xs font-medium">Potensi Sedang</span>
      case 'Rendah': return <span className="px-2 py-0.5 bg-slate-100 text-slate-800 border-slate-200 border rounded text-xs font-medium">Potensi Rendah</span>
      default: return null
    }
  }

  // -------------------------------------------------------------
  // AI RECOMMENDATION LOGIC (SIMULATED)
  // -------------------------------------------------------------
  const [selectedEventForAI, setSelectedEventForAI] = useState<string>('')
  const [aiRecommendations, setAiRecommendations] = useState<{sponsor: Sponsor, score: number, reason: string}[]>([])
  const [isAiLoading, setIsAiLoading] = useState(false)

  const handleGenerateAI = () => {
    if (!selectedEventForAI || !sponsors) return;
    setIsAiLoading(true)
    setAiRecommendations([])
    
    const event = events?.find(e => e.id === selectedEventForAI)
    const eventName = (event?.nama_acara || '').toLowerCase()
    const eventDesc = (event?.deskripsi || '').toLowerCase()
    const combinedText = eventName + " " + eventDesc

    setTimeout(() => {
      // Simulated AI Logic (Heuristics)
      const matches = sponsors.map(sp => {
        let score = 30 // base score
        let reason = "Merupakan mitra potensial dasar."
        const industri = sp.bidang_industri.toLowerCase()
        
        if (sp.tingkat_potensi === 'Tinggi') score += 20;
        else if (sp.tingkat_potensi === 'Sedang') score += 10;
        
        if (combinedText.includes('lomba') || combinedText.includes('17')) {
          if (industri.includes('makanan') || industri.includes('minuman') || industri.includes('f&b')) {
            score += 35; reason = "Acara 17-an / Lomba sangat relevan dengan industri makanan & minuman untuk konsumsi peserta."
          } else if (industri.includes('retail') || industri.includes('toko')) {
            score += 25; reason = "Toko/Retail lokal memiliki kecenderungan tinggi menyumbang untuk acara warga sekitar."
          }
        }
        
        if (combinedText.includes('ramadhan') || combinedText.includes('puasa') || combinedText.includes('buka')) {
          if (industri.includes('makanan') || industri.includes('minuman') || industri.includes('f&b')) {
            score += 40; reason = "Industri makanan sangat cocok dengan tema Ramadhan (Buka Bersama)."
          } else if (industri.includes('pakaian') || industri.includes('busana')) {
            score += 20; reason = "Toko busana cocok untuk momen persiapan hari raya."
          }
        }

        // Cap at 99%
        score = Math.min(score + Math.floor(Math.random() * 10), 99)
        return { sponsor: sp, score, reason }
      }).sort((a,b) => b.score - a.score).filter(m => m.score > 40).slice(0, 5)

      setAiRecommendations(matches)
      setIsAiLoading(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sponsor & Partnership CRM</h2>
          <p className="text-muted-foreground">Kelola hubungan, database mitra, dan pelacakan proposal.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px] bg-slate-100/50 p-1 mb-6 border">
          <TabsTrigger value="database" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><Database className="w-4 h-4 mr-2"/> Database Sponsor</TabsTrigger>
          <TabsTrigger value="tracker" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><ListTodo className="w-4 h-4 mr-2"/> Tracker Proposal</TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-indigo-700 data-[state=active]:text-indigo-700"><Sparkles className="w-4 h-4 mr-2"/> Rekomendasi AI</TabsTrigger>
        </TabsList>

        {/* =========================================
            TAB 1: DATABASE SPONSOR
        ========================================= */}
        <TabsContent value="database" className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">Master Data Mitra</h3>
              <p className="text-sm text-muted-foreground">Kumpulan data permanen instansi, perusahaan, dan calon donatur.</p>
            </div>
            <Dialog open={isSponsorOpen} onOpenChange={(open) => { setIsSponsorOpen(open); if (!open) resetSponsorForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Tambah Mitra</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingSponsor ? 'Edit Data Mitra' : 'Tambah Mitra / Sponsor Baru'}</DialogTitle></DialogHeader>
                <form onSubmit={handleSponsorSubmit} className="space-y-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nama Perusahaan / Instansi</Label>
                      <Input required value={sponsorForm.nama_perusahaan} onChange={(e) => setSponsorForm({...sponsorForm, nama_perusahaan: e.target.value})} placeholder="PT Jaya Abadi" />
                    </div>
                    <div className="space-y-2">
                      <Label>Bidang Industri</Label>
                      <Input required value={sponsorForm.bidang_industri} onChange={(e) => setSponsorForm({...sponsorForm, bidang_industri: e.target.value})} placeholder="Makanan, Telekomunikasi..." />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Kontak Person</Label>
                      <Input value={sponsorForm.kontak_person} onChange={(e) => setSponsorForm({...sponsorForm, kontak_person: e.target.value})} placeholder="Bpk. Budi" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nomor HP / WhatsApp</Label>
                      <Input value={sponsorForm.nomor_hp} onChange={(e) => setSponsorForm({...sponsorForm, nomor_hp: e.target.value})} placeholder="08..." />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={sponsorForm.email} onChange={(e) => setSponsorForm({...sponsorForm, email: e.target.value})} placeholder="budi@perusahaan.com" />
                  </div>

                  <div className="space-y-2">
                    <Label>Alamat Lengkap</Label>
                    <Input value={sponsorForm.alamat} onChange={(e) => setSponsorForm({...sponsorForm, alamat: e.target.value})} placeholder="Jl. Sudirman No 1..." />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tingkat Potensi</Label>
                      <Select value={sponsorForm.tingkat_potensi} onValueChange={(v: any) => setSponsorForm({...sponsorForm, tingkat_potensi: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tinggi">Tinggi</SelectItem>
                          <SelectItem value="Sedang">Sedang</SelectItem>
                          <SelectItem value="Rendah">Rendah</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Penanggung Jawab Internal (PIC)</Label>
                      <Input value={sponsorForm.penanggung_jawab} onChange={(e) => setSponsorForm({...sponsorForm, penanggung_jawab: e.target.value})} placeholder="Nama panitia yg mengurus" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Keterangan Tambahan</Label>
                    <Input value={sponsorForm.keterangan} onChange={(e) => setSponsorForm({...sponsorForm, keterangan: e.target.value})} placeholder="Catatan penting..." />
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Dokumen MoU / Perjanjian (Opsional)</Label>
                    <Input type="file" accept=".pdf,image/*" onChange={(e) => setMouFile(e.target.files?.[0] || null)} />
                  </div>

                  <div className="pt-4 flex justify-end space-x-2">
                    <Button type="submit" disabled={isSponsorUploading || createSponsorMut.isPending || updateSponsorMut.isPending}>
                      {isSponsorUploading ? 'Menyimpan...' : 'Simpan Database'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-card border rounded-xl shadow-sm">
            {sponsorLoading ? (
              <div className="p-8 text-center text-muted-foreground">Memuat data sponsor...</div>
            ) : sponsors?.length === 0 ? (
              <div className="p-16 text-center">
                <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Belum ada database mitra</h3>
                <p className="text-muted-foreground mt-2">Mulai masukkan data calon sponsor dan mitra kerja sama.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Perusahaan / Instansi</TableHead>
                    <TableHead>Industri</TableHead>
                    <TableHead>Kontak Person</TableHead>
                    <TableHead>Potensi</TableHead>
                    <TableHead>PIC Internal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sponsors?.map((sp) => (
                    <TableRow key={sp.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">{sp.nama_perusahaan}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{sp.alamat || '-'}</div>
                      </TableCell>
                      <TableCell>{sp.bidang_industri}</TableCell>
                      <TableCell>
                        <div className="text-sm">{sp.kontak_person || '-'}</div>
                        <div className="text-xs text-muted-foreground">{sp.nomor_hp || '-'}</div>
                      </TableCell>
                      <TableCell>{getPotensiBadge(sp.tingkat_potensi)}</TableCell>
                      <TableCell><div className="text-sm font-medium">{sp.penanggung_jawab || '-'}</div></TableCell>
                      <TableCell className="text-right space-x-1">
                        {sp.dokumen_mou && (
                          <Button variant="ghost" size="icon" asChild title="Lihat MoU">
                            <a href={sp.dokumen_mou} target="_blank" rel="noreferrer">
                              <FileSignature className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => { 
                          setEditingSponsor(sp); 
                          setSponsorForm(sp); 
                          setIsSponsorOpen(true); 
                        }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { if(window.confirm('Hapus mitra dari database?')) deleteSponsorMut.mutate(sp.id) }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* =========================================
            TAB 2: TRACKER PROPOSAL (Existing)
        ========================================= */}
        <TabsContent value="tracker" className="space-y-4 animate-in fade-in">
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
        </TabsContent>

        {/* =========================================
            TAB 3: AI REKOMENDASI SPONSOR
        ========================================= */}
        <TabsContent value="ai" className="space-y-6 animate-in fade-in zoom-in-95">
          <Card className="border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-50/50 to-white">
            <CardHeader>
              <CardTitle className="text-indigo-800 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" /> AI Matchmaker
              </CardTitle>
              <CardDescription>
                AI akan mencocokkan acara yang akan digelar dengan profil industri di Database Sponsor untuk memberikan rekomendasi target proposal yang paling akurat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:w-[400px] space-y-2">
                  <Label>Pilih Acara untuk Dianalisis</Label>
                  <Select value={selectedEventForAI} onValueChange={setSelectedEventForAI}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Pilih acara..." />
                    </SelectTrigger>
                    <SelectContent>
                      {events?.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.nama_acara}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleGenerateAI} 
                  disabled={!selectedEventForAI || isAiLoading || (sponsors && sponsors.length === 0)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                >
                  {isAiLoading ? 'Menganalisis...' : 'Analisis Kecocokan'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {isAiLoading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin text-indigo-500">
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="text-sm text-indigo-600 font-medium animate-pulse">Menghitung heuristik industri dan potensi...</p>
            </div>
          )}

          {!isAiLoading && aiRecommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 text-lg">Rekomendasi Teratas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiRecommendations.map((rec, idx) => (
                  <Card key={idx} className="border border-slate-200 overflow-hidden relative group hover:border-indigo-300 transition-colors">
                    <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-bl-xl text-sm z-10 flex items-center shadow-sm">
                      <Sparkles className="w-3 h-3 mr-1"/> {rec.score}% Match
                    </div>
                    <CardHeader className="pb-3 pt-5">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {rec.sponsor.nama_perusahaan}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                         <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs border">{rec.sponsor.bidang_industri}</span>
                         {getPotensiBadge(rec.sponsor.tingkat_potensi)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm p-3 bg-indigo-50/50 rounded-lg text-indigo-900 border border-indigo-50">
                        <span className="font-semibold block mb-1">💡 Alasan Rekomendasi:</span>
                        {rec.reason}
                      </div>
                      <div className="text-xs text-muted-foreground flex justify-between items-center pt-2 border-t mt-2">
                        <span>PIC: <span className="font-medium text-slate-700">{rec.sponsor.penanggung_jawab || '-'}</span></span>
                        <span>{rec.sponsor.nomor_hp || rec.sponsor.email || 'Tidak ada kontak'}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!isAiLoading && aiRecommendations.length === 0 && selectedEventForAI && (
            <div className="p-8 text-center border rounded-xl bg-slate-50">
              <p className="text-slate-500">Tidak ada rekomendasi dengan persentase cocok (&gt;40%). Coba tambahkan lebih banyak variasi industri di Database Sponsor.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
