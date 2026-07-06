import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Vote, CheckCircle, AlertCircle, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import toast, { Toaster } from 'react-hot-toast'
import { Poll, PollOption } from '@/types'

export default function VotingPublik() {
  const queryClient = useQueryClient()
  
  const [selectedOption, setSelectedOption] = useState<{ pollId: string, optionId: string, optionText: string, pollTitle: string } | null>(null)
  const [voterData, setVoterData] = useState({ nik: '', nama: '' })
  
  // Track voted polls locally in this session to update UI instantly without fetching all votes
  const [votedPollsLocal, setVotedPollsLocal] = useState<string[]>([])

  const { data: polls, isLoading } = useQuery({
    queryKey: ['public_polls'],
    queryFn: async () => {
      // Only fetch active polls for public
      const { data, error } = await supabase
        .from('polls')
        .select('*, poll_options(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        
      if (error) throw error
      
      // Filter out polls that have passed their end date
      const activePolls = data.filter(poll => new Date(poll.tanggal_selesai) > new Date())
      return activePolls as (Poll & { poll_options: PollOption[] })[]
    }
  })

  const voteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOption) throw new Error("Opsi belum dipilih")
      if (voterData.nik.length < 16) throw new Error("NIK harus 16 digit")
      if (!voterData.nama.trim()) throw new Error("Nama harus diisi")

      const { error } = await supabase.from('poll_votes').insert([{
        poll_id: selectedOption.pollId, 
        option_id: selectedOption.optionId, 
        voter_id: voterData.nik,
        voter_name: voterData.nama
      }])
      
      if (error) {
        // Checking for unique constraint violation code (23505)
        if (error.code === '23505' || error.message.includes('unique constraint')) {
          throw new Error('NIK ini sudah digunakan untuk memberikan suara pada pemilihan ini.')
        }
        throw error
      }
    },
    onSuccess: () => {
      if (selectedOption) {
        setVotedPollsLocal([...votedPollsLocal, selectedOption.pollId])
      }
      toast.success('Suara Anda berhasil disimpan! Terima kasih atas partisipasinya.')
      setSelectedOption(null)
      setVoterData({ nik: '', nama: '' })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menyimpan suara')
    }
  })

  const handleVoteClick = (poll: Poll, option: PollOption) => {
    setSelectedOption({
      pollId: poll.id,
      optionId: option.id,
      optionText: option.teks_opsi,
      pollTitle: poll.judul
    })
  }

  const submitVote = (e: React.FormEvent) => {
    e.preventDefault()
    voteMutation.mutate()
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Toaster />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-4 flex items-center justify-center gap-3">
          <Vote className="w-10 h-10 text-primary" />
          E-Voting Karang Taruna
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Gunakan hak suara Anda untuk kemajuan Karang Taruna. Pastikan Anda memiliki NIK yang valid untuk berpartisipasi. 1 NIK = 1 Suara.
        </p>
      </div>

      <Dialog open={!!selectedOption} onOpenChange={(open) => !open && setSelectedOption(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Konfirmasi Pilihan</DialogTitle>
            <DialogDescription>
              Anda akan memilih <strong className="text-primary">{selectedOption?.optionText}</strong> untuk {selectedOption?.pollTitle}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitVote} className="space-y-4 mt-4">
            <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm border border-blue-200 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>Mohon isi data diri sesuai KTP. Data ini hanya digunakan untuk validasi suara agar tidak terjadi duplikasi pemilih.</p>
            </div>
            
            <div className="space-y-2">
              <Label>Nomor Induk Kependudukan (NIK)</Label>
              <Input 
                type="number" 
                required 
                placeholder="16 Digit NIK" 
                value={voterData.nik}
                onChange={e => setVoterData({...voterData, nik: e.target.value.slice(0, 16)})}
              />
              <p className="text-xs text-muted-foreground text-right">{voterData.nik.length}/16 digit</p>
            </div>
            <div className="space-y-2">
              <Label>Nama Lengkap (Sesuai KTP)</Label>
              <Input 
                required 
                placeholder="Contoh: Budi Santoso" 
                value={voterData.nama}
                onChange={e => setVoterData({...voterData, nama: e.target.value})}
              />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSelectedOption(null)} disabled={voteMutation.isPending}>Batal</Button>
              <Button type="submit" disabled={voteMutation.isPending || voterData.nik.length < 16 || !voterData.nama}>
                {voteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Kirim Suara
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-8">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : polls?.length === 0 ? (
          <div className="bg-white dark:bg-card border rounded-2xl p-12 text-center shadow-sm">
            <Vote className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Belum Ada Pemilihan</h2>
            <p className="text-slate-500">Saat ini tidak ada sesi E-Voting yang sedang berlangsung.</p>
          </div>
        ) : (
          polls?.map(poll => {
            const isVoted = votedPollsLocal.includes(poll.id)

            return (
              <div key={poll.id} className="bg-white dark:bg-card border rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900 border-b p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">{poll.judul}</h2>
                      <p className="text-slate-600 dark:text-slate-300">{poll.deskripsi}</p>
                    </div>
                    <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
                      Hingga: {new Date(poll.tanggal_selesai).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 md:p-8">
                  {isVoted ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-8 rounded-xl text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-300" />
                      </div>
                      <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Suara Telah Diberikan!</h3>
                      <p className="text-green-700 dark:text-green-400">Terima kasih telah berpartisipasi dalam pemilihan ini.</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Silakan pilih salah satu kandidat/opsi di bawah ini:
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {poll.poll_options.map(option => (
                          <div 
                            key={option.id} 
                            onClick={() => handleVoteClick(poll, option)}
                            className="border-2 rounded-xl p-6 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group flex flex-col items-center justify-center text-center gap-4 bg-white"
                          >
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <span className="text-2xl font-bold text-slate-400 group-hover:text-primary">
                                {option.teks_opsi.charAt(0)}
                              </span>
                            </div>
                            <span className="font-bold text-lg group-hover:text-primary">{option.teks_opsi}</span>
                            <Button variant="outline" className="w-full mt-2 group-hover:bg-primary group-hover:text-white border-primary/20">
                              Pilih Kandidat
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
