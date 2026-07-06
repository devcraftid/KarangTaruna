import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { patunganService } from '@/services/patungan'
import { PatunganCampaign } from '@/types'

export default function PatunganPublik() {
  const [campaigns, setCampaigns] = useState<PatunganCampaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await patunganService.getActiveCampaigns()
        const campaignsWithTotal = await Promise.all(data.map(async (camp) => {
          const total = await patunganService.getContributionsTotalByCampaignId(camp.id)
          return { ...camp, terkumpul: total }
        }))
        setCampaigns(campaignsWithTotal)
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold text-primary mb-4 tracking-tight">Program Pendanaan</h1>
        <p className="text-slate-600 md:text-lg max-w-2xl mx-auto">
          Mari bersama-sama mewujudkan program dan kegiatan Karang Taruna melalui pendanaan bersama. Sedikit dari kita, berarti besar bagi mereka.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center p-12 text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed">
          <p className="text-lg font-medium">Belum ada program pendanaan yang aktif saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <Link key={camp.id} to={`/patungan/${camp.id}`} className="group block">
              <div className="h-full overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white group-hover:ring-2 group-hover:ring-primary/20 flex flex-col">
                {camp.gambar ? (
                  <div className="w-full h-48 overflow-hidden flex-shrink-0">
                    <img 
                      src={camp.gambar} 
                      alt={camp.judul} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-400 font-medium">No Image</span>
                  </div>
                )}
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                      {camp.status === 'active' ? 'Sedang Berjalan' : 'Selesai'}
                    </span>
                    <h3 className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-primary transition-colors">{camp.judul}</h3>
                  </div>
                  
                  <p className="text-slate-600 text-sm line-clamp-3 my-4 flex-1">
                    {camp.deskripsi}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-primary">Rp {(camp.terkumpul || 0).toLocaleString('id-ID')}</span>
                      <span className="text-slate-500">Rp {camp.target_dana.toLocaleString('id-ID')}</span>
                    </div>
                    
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                       <div 
                         className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out" 
                         style={{ width: `${Math.min(100, ((camp.terkumpul || 0) / camp.target_dana) * 100)}%` }}
                       />
                    </div>
                    <div className="mt-3 flex justify-between items-center text-xs text-slate-500">
                      <span>Terkumpul {Math.round(((camp.terkumpul || 0) / camp.target_dana) * 100)}%</span>
                      <span>Batas: {new Date(camp.batas_waktu).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
