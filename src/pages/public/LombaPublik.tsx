import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lombaService } from '@/services/lombaService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import toast, { Toaster } from 'react-hot-toast'
import { Trophy, Calendar, MapPin, Users, CheckCircle2, BadgeCheck } from 'lucide-react'

export default function LombaPublik() {
  const queryClient = useQueryClient()
  const [selectedLomba, setSelectedLomba] = useState<any | null>(null)
  
  const [formData, setFormData] = useState({
    nama: '',
    jenis_kelamin: 'L',
    umur: '',
    rt: '',
    rw: '',
    nama_ortu: ''
  })

  const { data: competitions, isLoading } = useQuery({
    queryKey: ['public_competitions'],
    queryFn: lombaService.getPublicCompetitions
  })

  const registerMutation = useMutation({
    mutationFn: ({ competition_id, payload }: { competition_id: string, payload: any }) => 
      lombaService.registerPublic(competition_id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['public_competitions'] })
      toast.success(`Berhasil mendaftar! Atas nama: ${data.member.nama}`)
      setSelectedLomba(null)
      setFormData({ nama: '', jenis_kelamin: 'L', umur: '', rt: '', rw: '', nama_ortu: '' })
    },
    onError: (err: any) => toast.error(err.message || 'Gagal mendaftar')
  })

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLomba || !formData.nama || !formData.nama_ortu) return
    registerMutation.mutate({ competition_id: selectedLomba.id, payload: formData })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in duration-500">
      <Toaster />
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">Perlombaan 17 Agustus</h1>
        <p className="text-lg text-muted-foreground">
          Ikuti berbagai perlombaan seru untuk memeriahkan hari kemerdekaan. Daftarkan diri Anda sekarang!
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Memuat data lomba...</div>
      ) : competitions?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl shadow-sm border">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-xl font-semibold">Belum Ada Perlombaan</h2>
          <p className="text-muted-foreground mt-2">Saat ini belum ada perlombaan yang dibuka.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions?.map((lomba: any) => {
            const isFull = lomba.registrations?.[0]?.count >= lomba.maksimal_peserta
            const isCompleted = lomba.status === 'completed'
            
            return (
              <div key={lomba.id} className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                      {lomba.kategori}
                    </span>
                    {isCompleted ? (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Selesai
                      </span>
                    ) : isFull ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Penuh</span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Buka</span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{lomba.nama_lomba}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {lomba.deskripsi || 'Tidak ada deskripsi.'}
                  </p>
                  
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      {new Date(lomba.tanggal).toLocaleDateString('id-ID')} | {lomba.jam}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      {lomba.lokasi}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      Kuota: {lomba.registrations?.[0]?.count || 0} / {lomba.maksimal_peserta}
                    </div>
                    {lomba.pengawas_lomba && lomba.pengawas_lomba.length > 0 && (
                      <div className="flex items-start pt-2 border-t mt-2">
                        <BadgeCheck className="w-4 h-4 mr-2 text-primary mt-0.5" />
                        <div>
                          <span className="font-semibold block mb-1">Pengawas:</span>
                          <div className="flex flex-wrap gap-1">
                            {lomba.pengawas_lomba.map((p: any, idx: number) => (
                              <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-xs border">
                                {p.nama_lengkap}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isCompleted && lomba.pemenang && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 border-t border-amber-100 dark:border-amber-900/30">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-500 mb-1 flex items-center">
                      <Trophy className="w-4 h-4 mr-2" /> Daftar Pemenang
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400/80">{lomba.pemenang}</p>
                  </div>
                )}

                <div className="p-4 border-t bg-slate-50/50 dark:bg-slate-900/20">
                  <Button 
                    className="w-full" 
                    variant={isCompleted || isFull ? "secondary" : "default"}
                    disabled={isCompleted || isFull}
                    onClick={() => setSelectedLomba(lomba)}
                  >
                    {isCompleted ? 'Lomba Selesai' : isFull ? 'Kuota Penuh' : 'Daftar Sekarang'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={!!selectedLomba} onOpenChange={(open) => !open && setSelectedLomba(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Daftar Lomba: {selectedLomba?.nama_lomba}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4 pt-4">
            
            <div className="space-y-2">
              <Label>Nama Lengkap Peserta (Anak)</Label>
              <Input name="nama" value={formData.nama} onChange={handleChange} placeholder="Contoh: Budi Santoso" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Umur (Tahun)</Label>
                <Input type="number" name="umur" value={formData.umur} onChange={handleChange} placeholder="Contoh: 10" required />
              </div>
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Select value={formData.jenis_kelamin} onValueChange={(val) => setFormData(p => ({...p, jenis_kelamin: val}))}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>RT</Label>
                <Input name="rt" value={formData.rt} onChange={handleChange} placeholder="Contoh: 01" required />
              </div>
              <div className="space-y-2">
                <Label>RW</Label>
                <Input name="rw" value={formData.rw} onChange={handleChange} placeholder="Contoh: 05" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nama Orang Tua</Label>
              <Input name="nama_ortu" value={formData.nama_ortu} onChange={handleChange} placeholder="Contoh: Bapak Andi / Ibu Ani" required />
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setSelectedLomba(null)}>Batal</Button>
              <Button type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Mendaftar...' : 'Kirim Pendaftaran'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
