import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getHouseholds, createHousehold, updateHousehold, deleteHousehold, getHouseholdDues, createHouseholdDue, updateHouseholdDue } from '@/services/householdService'
import { getActiveEvents } from '@/services/eventService'
import type { Household, HouseholdDue } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit2, Trash2, Home, CheckCircle2, XCircle, Clock } from 'lucide-react'
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

export default function Households() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'data' | 'iuran'>('data')
  
  // Data State
  const [isOpenData, setIsOpenData] = useState(false)
  const [editingHousehold, setEditingHousehold] = useState<Household | null>(null)
  const [formData, setFormData] = useState({
    kepala_keluarga: '',
    nomor_rumah: '',
    rt: '',
    rw: '',
    blok: '',
    keterangan: ''
  })

  // Iuran State
  const [isOpenIuran, setIsOpenIuran] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [editingDue, setEditingDue] = useState<HouseholdDue | null>(null)
  const [dueFormData, setDueFormData] = useState({
    household_id: '',
    nominal: 0,
    status: 'pending' as 'pending' | 'verified' | 'rejected',
    tanggal_bayar: new Date().toISOString().split('T')[0],
    keterangan: ''
  })

  // Queries
  const { data: households } = useQuery({ queryKey: ['households'], queryFn: getHouseholds })
  const { data: events } = useQuery({ queryKey: ['active-events'], queryFn: getActiveEvents })
  
  // Set default event selection
  if (events && events.length > 0 && !selectedEventId) {
    setSelectedEventId(events[0].id)
  }

  const { data: dues, isLoading: isLoadingD } = useQuery({ 
    queryKey: ['household-dues', selectedEventId], 
    queryFn: () => getHouseholdDues(selectedEventId),
    enabled: !!selectedEventId
  })

  // Mutations - Households
  const createHMutation = useMutation({
    mutationFn: createHousehold,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['households'] }); toast.success('Data rumah ditambahkan'); setIsOpenData(false); resetForm(); },
    onError: (err: any) => toast.error(err.message || 'Gagal')
  })
  const updateHMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Household> }) => updateHousehold(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['households'] }); toast.success('Data rumah diupdate'); setIsOpenData(false); resetForm(); },
    onError: (err: any) => toast.error(err.message || 'Gagal')
  })
  const deleteHMutation = useMutation({
    mutationFn: deleteHousehold,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['households'] }); toast.success('Data rumah dihapus'); },
    onError: (err: any) => toast.error(err.message || 'Gagal')
  })

  // Mutations - Dues
  const createDMutation = useMutation({
    mutationFn: (data: any) => createHouseholdDue({...data, event_id: selectedEventId}),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['household-dues'] }); toast.success('Iuran ditambahkan'); setIsOpenIuran(false); resetDueForm(); },
    onError: (err: any) => toast.error(err.message || 'Gagal menambah iuran. Mungkin rumah ini sudah memiliki entri iuran untuk acara ini.')
  })
  const updateDMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<HouseholdDue> }) => updateHouseholdDue(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['household-dues'] }); toast.success('Iuran diupdate'); setIsOpenIuran(false); resetDueForm(); },
    onError: (err: any) => toast.error(err.message || 'Gagal')
  })

  const resetForm = () => {
    setFormData({ kepala_keluarga: '', nomor_rumah: '', rt: '', rw: '', blok: '', keterangan: '' })
    setEditingHousehold(null)
  }

  const resetDueForm = () => {
    setDueFormData({ household_id: '', nominal: 0, status: 'pending', tanggal_bayar: new Date().toISOString().split('T')[0], keterangan: '' })
    setEditingDue(null)
  }

  // Render Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Lunas</span>
      case 'pending': return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Belum Lunas / Janji</span>
      case 'rejected': return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Menolak</span>
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Rumah & Iuran Warga</h2>
          <p className="text-muted-foreground">Kelola daftar rumah (KK) dan checklist tarikan iuran acara</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b">
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'data' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-slate-900'}`}
          onClick={() => setActiveTab('data')}
        >
          Data Rumah / KK
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'iuran' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-slate-900'}`}
          onClick={() => setActiveTab('iuran')}
        >
          Checklist Iuran Acara
        </button>
      </div>

      {/* TAB DATA RUMAH */}
      {activeTab === 'data' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-end">
            <Dialog open={isOpenData} onOpenChange={(open) => { setIsOpenData(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Tambah Rumah</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingHousehold ? 'Edit Rumah' : 'Tambah Rumah'}</DialogTitle></DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  if (editingHousehold) updateHMutation.mutate({ id: editingHousehold.id, data: formData })
                  else createHMutation.mutate(formData)
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Kepala Keluarga / Penanggung Jawab</Label>
                    <Input required value={formData.kepala_keluarga} onChange={(e) => setFormData({...formData, kepala_keluarga: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nomor Rumah</Label>
                      <Input required value={formData.nomor_rumah} onChange={(e) => setFormData({...formData, nomor_rumah: e.target.value})} placeholder="Misal: A12" />
                    </div>
                    <div className="space-y-2">
                      <Label>Blok (Opsional)</Label>
                      <Input value={formData.blok} onChange={(e) => setFormData({...formData, blok: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>RT</Label>
                      <Input required value={formData.rt} onChange={(e) => setFormData({...formData, rt: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>RW</Label>
                      <Input required value={formData.rw} onChange={(e) => setFormData({...formData, rw: e.target.value})} />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end space-x-2">
                    <Button type="submit" disabled={createHMutation.isPending || updateHMutation.isPending}>Simpan</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-card border rounded-xl shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kepala Keluarga</TableHead>
                  <TableHead>No. Rumah</TableHead>
                  <TableHead>RT/RW</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {households?.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.kepala_keluarga}</TableCell>
                    <TableCell><Home className="w-4 h-4 inline mr-2 text-muted-foreground"/> {h.nomor_rumah} {h.blok ? `(Blok ${h.blok})` : ''}</TableCell>
                    <TableCell>{h.rt}/{h.rw}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingHousehold(h); setFormData({ kepala_keluarga: h.kepala_keluarga, nomor_rumah: h.nomor_rumah, rt: h.rt, rw: h.rw, blok: h.blok || '', keterangan: h.keterangan || '' }); setIsOpenData(true); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if(window.confirm('Hapus?')) deleteHMutation.mutate(h.id) }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* TAB IURAN */}
      {activeTab === 'iuran' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between gap-4 bg-slate-50 p-4 rounded-xl border">
            <div className="w-full sm:w-1/3 space-y-2">
              <Label>Pilih Acara (Proyek)</Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih acara aktif" />
                </SelectTrigger>
                <SelectContent>
                  {events?.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.nama_acara}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Dialog open={isOpenIuran} onOpenChange={(open) => { setIsOpenIuran(open); if (!open) resetDueForm(); }}>
                <DialogTrigger asChild>
                  <Button disabled={!selectedEventId}><Plus className="mr-2 h-4 w-4" /> Catat Iuran Warga</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingDue ? 'Update Status Iuran' : 'Catat Iuran Baru'}</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    if (editingDue) updateDMutation.mutate({ id: editingDue.id, data: dueFormData })
                    else createDMutation.mutate(dueFormData)
                  }} className="space-y-4">
                    {!editingDue && (
                      <div className="space-y-2">
                        <Label>Pilih Rumah / KK</Label>
                        <Select required onValueChange={(v) => setDueFormData({...dueFormData, household_id: v})}>
                          <SelectTrigger><SelectValue placeholder="Pilih rumah" /></SelectTrigger>
                          <SelectContent>
                            {households?.map(h => (
                              <SelectItem key={h.id} value={h.id}>{h.kepala_keluarga} - {h.nomor_rumah} (RT {h.rt})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Nominal Terkumpul (Rp)</Label>
                      <Input type="number" required min={0} value={dueFormData.nominal} onChange={(e) => setDueFormData({...dueFormData, nominal: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Status Iuran</Label>
                      <Select value={dueFormData.status} onValueChange={(v: any) => setDueFormData({...dueFormData, status: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="verified">Lunas / Sudah Bayar (Verified)</SelectItem>
                          <SelectItem value="pending">Belum Lunas / Janji Bayar Nanti</SelectItem>
                          <SelectItem value="rejected">Menolak / Tidak Berpartisipasi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Keterangan Tambahan</Label>
                      <Input value={dueFormData.keterangan} onChange={(e) => setDueFormData({...dueFormData, keterangan: e.target.value})} placeholder="Misal: Janji bayar minggu depan" />
                    </div>
                    <div className="pt-4 flex justify-end space-x-2">
                      <Button type="submit" disabled={createDMutation.isPending || updateDMutation.isPending}>Simpan</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="bg-card border rounded-xl shadow-sm">
            {!selectedEventId ? (
              <div className="p-8 text-center text-muted-foreground">Silakan pilih acara terlebih dahulu.</div>
            ) : isLoadingD ? (
              <div className="p-8 text-center text-muted-foreground">Memuat data iuran...</div>
            ) : dues?.length === 0 ? (
              <div className="p-16 text-center">
                <h3 className="text-lg font-semibold">Belum ada catatan iuran</h3>
                <p className="text-muted-foreground mt-2">Mulai keliling dan catat iuran warga.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kepala Keluarga / Rumah</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tgl Update</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dues?.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">
                        {d.households?.kepala_keluarga}
                        <p className="text-xs text-muted-foreground">No. {d.households?.nomor_rumah} (RT {d.households?.rt})</p>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">Rp {d.nominal.toLocaleString('id-ID')}</TableCell>
                      <TableCell>{getStatusBadge(d.status)} {d.keterangan && <p className="text-xs text-muted-foreground mt-1">{d.keterangan}</p>}</TableCell>
                      <TableCell>{d.tanggal_bayar ? new Date(d.tanggal_bayar).toLocaleDateString('id-ID') : '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { 
                          setEditingDue(d); 
                          setDueFormData({ household_id: d.household_id, nominal: d.nominal, status: d.status, tanggal_bayar: d.tanggal_bayar || '', keterangan: d.keterangan || '' }); 
                          setIsOpenIuran(true); 
                        }}>
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
