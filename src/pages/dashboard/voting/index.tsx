import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Vote, Plus, Loader2, PieChart, Edit, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import toast, { Toaster } from 'react-hot-toast'
import { Poll, PollOption } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { Progress } from '@/components/ui/progress'

export default function Voting() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const isAdmin = profile?.role === 'admin'
  
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    opsi: ['']
  })

  const [resultsOpen, setResultsOpen] = useState(false)
  const [selectedPoll, setSelectedPoll] = useState<(Poll & { poll_options: PollOption[] }) | null>(null)

  const { data: polls, isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: async () => {
      const { data, error } = await supabase.from('polls').select('*, poll_options(*)').order('created_at', { ascending: false })
      if (error) throw error
      return data as (Poll & { poll_options: PollOption[] })[]
    }
  })



  // get votes for results
  const { data: allVotes } = useQuery({
    queryKey: ['all_poll_votes', selectedPoll?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('poll_votes').select('option_id, voter_id, voter_name, created_at, poll_options(teks_opsi)').eq('poll_id', selectedPoll?.id).order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!selectedPoll?.id
  })

  const saveMutation = useMutation({
    mutationFn: async (newData: any) => {
      if (editingId) {
        const { error } = await supabase.from('polls').update({
          judul: newData.judul,
          deskripsi: newData.deskripsi,
          tanggal_mulai: new Date(newData.tanggal_mulai).toISOString(),
          tanggal_selesai: new Date(newData.tanggal_selesai).toISOString(),
        }).eq('id', editingId)
        
        if (error) throw error
        return
      }

      const { data: pollData, error: pollError } = await supabase.from('polls').insert([{
        judul: newData.judul,
        deskripsi: newData.deskripsi,
        tanggal_mulai: new Date(newData.tanggal_mulai).toISOString(),
        tanggal_selesai: new Date(newData.tanggal_selesai).toISOString(),
        created_by: profile?.id
      }]).select().single()
      
      if (pollError) throw pollError

      const optionsToInsert = newData.opsi.filter((o: string) => o.trim() !== '').map((o: string) => ({
        poll_id: pollData.id,
        teks_opsi: o
      }))

      if (optionsToInsert.length > 0) {
        const { error: optionsError } = await supabase.from('poll_options').insert(optionsToInsert)
        if (optionsError) throw optionsError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
      toast.success(editingId ? 'Voting berhasil diperbarui' : 'Voting berhasil dibuat')
      setIsOpen(false)
      setEditingId(null)
      setFormData({ judul: '', deskripsi: '', tanggal_mulai: '', tanggal_selesai: '', opsi: [''] })
    },
    onError: (error) => toast.error('Gagal menyimpan voting: ' + error.message)
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('polls').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
      toast.success('Voting berhasil dihapus')
    },
    onError: (error) => toast.error('Gagal menghapus voting: ' + error.message)
  })



  const handleAddOption = () => {
    setFormData({ ...formData, opsi: [...formData.opsi, ''] })
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOpsi = [...formData.opsi]
    newOpsi[index] = value
    setFormData({ ...formData, opsi: newOpsi })
  }

  const openCreateDialog = () => {
    setEditingId(null)
    setFormData({ judul: '', deskripsi: '', tanggal_mulai: '', tanggal_selesai: '', opsi: [''] })
    setIsOpen(true)
  }

  const openEditDialog = (poll: Poll & { poll_options: PollOption[] }) => {
    setEditingId(poll.id)
    setFormData({
      judul: poll.judul,
      deskripsi: poll.deskripsi || '',
      tanggal_mulai: new Date(poll.tanggal_mulai).toISOString().slice(0, 16),
      tanggal_selesai: new Date(poll.tanggal_selesai).toISOString().slice(0, 16),
      opsi: poll.poll_options.map(o => o.teks_opsi) // not editable but needed for state structure
    })
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus voting ini?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleShowResults = (poll: Poll & { poll_options: PollOption[] }) => {
    setSelectedPoll(poll)
    setResultsOpen(true)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Toaster />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Vote className="h-6 w-6 text-primary" />
            E-Voting & Polling
          </h1>
          <p className="text-muted-foreground">Sistem pemungutan suara elektronik Karang Taruna</p>
        </div>
        
        {isAdmin && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Buat Voting Baru</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Voting' : 'Buat Voting Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData) }} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Judul Pemilihan</Label>
                  <Input required value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} placeholder="Pemilihan Ketua KT 2024" />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Input value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Waktu Mulai</Label>
                    <Input type="datetime-local" required value={formData.tanggal_mulai} onChange={e => setFormData({...formData, tanggal_mulai: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Waktu Selesai</Label>
                    <Input type="datetime-local" required value={formData.tanggal_selesai} onChange={e => setFormData({...formData, tanggal_selesai: e.target.value})} />
                  </div>
                </div>
                
                {!editingId && (
                  <div className="space-y-2">
                    <Label>Kandidat / Opsi Pilihan</Label>
                    {formData.opsi.map((op, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <Input value={op} onChange={(e) => handleOptionChange(idx, e.target.value)} placeholder={`Opsi ${idx + 1}`} required />
                        {idx === formData.opsi.length - 1 && (
                          <Button type="button" variant="outline" onClick={handleAddOption}><Plus className="w-4 h-4" /></Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {editingId && (
                  <p className="text-xs text-muted-foreground italic">Opsi pilihan tidak dapat diubah setelah voting dibuat.</p>
                )}
                
                <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {editingId ? 'Simpan Perubahan' : 'Buat Voting'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Results Dialog */}
      <Dialog open={resultsOpen} onOpenChange={setResultsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hasil Pemilihan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <h3 className="font-bold text-lg">{selectedPoll?.judul}</h3>
            {allVotes ? (
              <div className="space-y-4">
                {selectedPoll?.poll_options.map(option => {
                  const votesCount = allVotes.filter((v: any) => v.option_id === option.id).length
                  const totalVotes = allVotes.length
                  const percentage = totalVotes > 0 ? (votesCount / totalVotes) * 100 : 0
                  return (
                    <div key={option.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{option.teks_opsi}</span>
                        <span className="font-semibold">{votesCount} Suara ({percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
                <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">Total Suara Masuk: {allVotes.length}</p>

                {isAdmin && allVotes.length > 0 && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Users className="w-4 h-4"/> Riwayat Pemilih</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                      {allVotes.map((vote: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-2 rounded text-xs border flex flex-col">
                          <span className="font-bold text-slate-700 dark:text-slate-200">{vote.voter_name || 'Tanpa Nama'} ({vote.voter_id})</span>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-primary font-medium">Memilih: {vote.poll_options?.teks_opsi}</span>
                            <span className="text-muted-foreground text-[10px]">{new Date(vote.created_at).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {isLoading ? (
          <div className="col-span-1 lg:col-span-2 text-center py-8">Loading...</div>
        ) : polls?.length === 0 ? (
          <div className="col-span-1 lg:col-span-2 text-center py-8 bg-white dark:bg-card border rounded-lg">Belum ada sesi pemilihan yang aktif</div>
        ) : (
          polls?.map((poll) => {
            const isClosed = new Date() > new Date(poll.tanggal_selesai) || poll.status === 'closed'
            
            return (
               <div key={poll.id} className="bg-white dark:bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
                 <div className="p-6 flex-1">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <h3 className="font-bold text-lg">{poll.judul}</h3>
                       <p className="text-sm text-muted-foreground mt-1">{poll.deskripsi}</p>
                     </div>
                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isClosed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                       {isClosed ? 'DITUTUP' : 'AKTIF'}
                     </span>
                   </div>
                   
                   <div className="text-xs text-muted-foreground mb-4 space-y-1">
                     <p>Mulai: {new Date(poll.tanggal_mulai).toLocaleString('id-ID')}</p>
                     <p>Selesai: {new Date(poll.tanggal_selesai).toLocaleString('id-ID')}</p>
                   </div>
 
                   {isClosed ? (
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="font-medium text-muted-foreground">Sesi pemilihan telah berakhir</p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 text-center">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Pemilihan Sedang Berjalan</p>
                      <a href="/voting" target="_blank" rel="noopener noreferrer">
                        <Button variant="default" size="sm">Buka Halaman Voting Publik</Button>
                      </a>
                    </div>
                  )}
                 </div>
                 
                 {isAdmin && (
                    <div className="bg-muted/30 p-4 border-t flex justify-between gap-2 items-center">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(poll)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(poll.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Hapus
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleShowResults(poll)}>
                        <PieChart className="w-4 h-4 mr-2" /> Hasil
                      </Button>
                    </div>
                 )}
               </div>
             )
          })
        )}
      </div>
    </div>
  )
}
