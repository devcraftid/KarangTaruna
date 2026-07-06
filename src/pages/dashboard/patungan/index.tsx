import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { patunganService } from '@/services/patungan'
import { PatunganCampaign } from '@/types'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function PatunganDashboard() {
  const [campaigns, setCampaigns] = useState<PatunganCampaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const data = await patunganService.getCampaigns()
      const campaignsWithTotal = await Promise.all(data.map(async (camp) => {
        const total = await patunganService.getContributionsTotalByCampaignId(camp.id)
        return { ...camp, terkumpul: total }
      }))
      setCampaigns(campaignsWithTotal)
    } catch (error: any) {
      toast.error(error.message || 'Gagal memuat data program pendanaan.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus program ini?')) {
      try {
        await patunganService.deleteCampaign(id)
        toast.success('Program pendanaan telah dihapus.')
        fetchCampaigns()
      } catch (error: any) {
        toast.error(error.message)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Program Pendanaan</h1>
          <p className="text-muted-foreground mt-1">Kelola program pendanaan bersama.</p>
        </div>
        <div className="flex gap-2">
           <Link to="/dashboard/patungan/kontribusi">
             <Button variant="outline"><Coins className="w-4 h-4 mr-2" /> Verifikasi Kontribusi</Button>
           </Link>
           <Button>
             <Plus className="w-4 h-4 mr-2" /> Tambah Program
           </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Daftar Program Pendanaan</h2>
          <p className="text-sm text-muted-foreground">Semua program pendanaan yang telah dibuat.</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
            Belum ada data program pendanaan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((camp) => (
              <div key={camp.id} className="overflow-hidden border rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white">
                {camp.gambar && (
                  <img src={camp.gambar} alt={camp.judul} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-lg truncate">{camp.judul}</h3>
                     <span className={`text-xs px-2 py-1 rounded-full ${camp.status === 'active' ? 'bg-green-100 text-green-700' : camp.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                       {camp.status}
                     </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{camp.deskripsi}</p>
                  
                  <div className="space-y-2 text-sm mb-4">
                     <div className="flex justify-between">
                        <span className="text-slate-500">Target</span>
                        <span className="font-medium">Rp {camp.target_dana.toLocaleString('id-ID')}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-slate-500">Terkumpul</span>
                        <span className="font-bold text-primary">Rp {(camp.terkumpul || 0).toLocaleString('id-ID')}</span>
                     </div>
                  </div>
                  
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                     <div 
                       className="bg-primary h-2 rounded-full" 
                       style={{ width: `${Math.min(100, ((camp.terkumpul || 0) / camp.target_dana) * 100)}%` }}
                     />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                    <Button variant="ghost" size="sm" className="h-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(camp.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
