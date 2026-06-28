import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pendaftaranService } from '@/services/pendaftaranService'
import { memberService } from '@/services/memberService'
import { lombaService } from '@/services/lombaService'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pendaftaranSchema, PendaftaranFormValues } from '@/lib/validations'
import toast, { Toaster } from 'react-hot-toast'

export default function Pendaftaran() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: registrations, isLoading } = useQuery({ queryKey: ['registrations'], queryFn: pendaftaranService.getPendaftaran })
  const { data: members } = useQuery({ queryKey: ['members'], queryFn: memberService.getMembers })
  const { data: competitions } = useQuery({ queryKey: ['competitions'], queryFn: lombaService.getCompetitions })

  const form = useForm<PendaftaranFormValues>({
    resolver: zodResolver(pendaftaranSchema),
    defaultValues: { member_id: '', competition_id: '', status: 'pending' }
  })

  const createMutation = useMutation({
    mutationFn: pendaftaranService.createPendaftaran,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      toast.success('Pendaftaran ditambahkan')
      setIsOpen(false)
    },
    onError: (err: any) => toast.error(err.message || 'Gagal mendaftar')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: PendaftaranFormValues }) => pendaftaranService.updatePendaftaran(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      toast.success('Status diupdate')
      setIsOpen(false)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: pendaftaranService.deletePendaftaran,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      toast.success('Pendaftaran dibatalkan')
    }
  })

  const onSubmit = (data: PendaftaranFormValues) => {
    if (editingId) updateMutation.mutate({ id: editingId, data })
    else createMutation.mutate(data)
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pendaftaran Lomba</h2>
          <p className="text-muted-foreground">Kelola pendaftaran anggota ke lomba</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); form.reset({ member_id: '', competition_id: '', status: 'pending' }); setIsOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Daftarkan Anggota
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Edit Pendaftaran' : 'Pendaftaran Lomba'}</DialogTitle></DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Anggota (Peserta)</Label>
                <Select onValueChange={(val) => form.setValue('member_id', val)} defaultValue={form.getValues('member_id')} disabled={!!editingId}>
                  <SelectTrigger><SelectValue placeholder="Pilih anggota" /></SelectTrigger>
                  <SelectContent>
                    {members?.map(m => <SelectItem key={m.id} value={m.id}>{m.nama} - {m.nik}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lomba</Label>
                <Select onValueChange={(val) => form.setValue('competition_id', val)} defaultValue={form.getValues('competition_id')} disabled={!!editingId}>
                  <SelectTrigger><SelectValue placeholder="Pilih lomba" /></SelectTrigger>
                  <SelectContent>
                    {competitions?.filter(c => c.status === 'published').map(c => <SelectItem key={c.id} value={c.id}>{c.nama_lomba}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {editingId && (
                <div className="space-y-2">
                  <Label>Status Pendaftaran</Label>
                  <Select onValueChange={(val) => form.setValue('status', val as any)} defaultValue={form.getValues('status')}>
                    <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Simpan</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border rounded-xl shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Peserta</TableHead>
              <TableHead>Lomba</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-4">Memuat...</TableCell></TableRow>
            ) : registrations?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.members?.nama} <span className="text-xs text-muted-foreground ml-1">(RT {item.members?.rt} / RW {item.members?.rw})</span>
                </TableCell>
                <TableCell>{item.competitions?.nama_lomba}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : item.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'}`}>
                    {item.status}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => {
                    setEditingId(item.id)
                    form.reset({ member_id: item.member_id, competition_id: item.competition_id, status: item.status })
                    setIsOpen(true)
                  }}><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                    if (window.confirm('Batalkan pendaftaran ini?')) deleteMutation.mutate(item.id)
                  }}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
