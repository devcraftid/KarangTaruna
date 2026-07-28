import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Wallet, Loader2, Info, MessageCircle, HeartHandshake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function PatunganDetail() {
  const { id } = useParams()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaignDetail()
  }, [id])

  const fetchCampaignDetail = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('patungan_campaigns').select('*').eq('id', id).single()
      if (error) throw error
      if (data) setCampaign(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0)
  const progress = campaign ? Math.min(Math.round(((campaign.terkumpul || 0) / (campaign.target || 1)) * 100), 100) : 0

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-sky-500 animate-spin" /></div>
  if (!campaign) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-3xl font-bold mb-2">Kampanye Tidak Ditemukan</h2>
      <Link to="/patungan"><Button>Kembali ke Portal Donasi</Button></Link>
    </div>
  )

  const handleKonfirmasiWA = () => {
    const phone = '6281234567890'
    const message = `Halo Admin Karang Taruna! Saya ingin berdonasi untuk program *${campaign.judul}*. Mohon info rekening/e-wallet untuk transfer. Terima kasih.`
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  return (
    <div className="bg-md-surface min-h-screen pb-20 pt-10">
      <div className="container mx-auto px-4 max-w-5xl">
        
        <Link to="/patungan" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-sky-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Portal Donasi
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          
          {/* Main Content */}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
              {campaign.judul}
            </h1>
            
            <div className="w-full h-[300px] rounded-3xl overflow-hidden mb-8 shadow-md bg-slate-100 dark:bg-slate-800">
              {campaign.gambar ? (
                <img src={campaign.gambar} alt={campaign.judul} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <HeartHandshake className="w-20 h-20" />
                </div>
              )}
            </div>

            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Cerita & Tujuan</h3>
              <p className="whitespace-pre-wrap leading-relaxed">{campaign.deskripsi || 'Tidak ada deskripsi detail untuk penggalangan dana ini.'}</p>
            </div>
          </div>

          {/* Donation Action Sidebar */}
          <div>
            <Card className="border-none shadow-xl sticky top-24 overflow-hidden rounded-3xl border-t-8 border-t-sky-500 bg-white dark:bg-slate-900">
              <CardContent className="p-4 md:p-8">
                
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Dana Terkumpul</p>
                <h2 className="text-4xl font-black text-sky-600 mb-6">{formatRupiah(campaign.terkumpul)}</h2>
                
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden mb-4">
                  <div className="bg-sky-500 h-3 rounded-full relative" style={{ width: `${progress}%` }}>
                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm font-bold mb-8">
                  <span className="text-slate-700 dark:text-slate-300">{progress}% Tercapai</span>
                  <span className="text-slate-400">Target: {formatRupiah(campaign.target)}</span>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleKonfirmasiWA}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-4 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-lg shadow-sky-500/30"
                  >
                    <Wallet className="w-5 h-5" /> Donasi Sekarang
                  </button>
                  
                  <button 
                    onClick={handleKonfirmasiWA}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 font-bold px-6 py-4 rounded-xl flex justify-center items-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" /> Konfirmasi via WhatsApp
                  </button>
                </div>

                <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 p-4 rounded-xl flex items-start gap-3 text-sm">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>Semua donasi akan masuk ke kas Karang Taruna dan disalurkan 100% sesuai peruntukan program. Laporan transparansi akan diperbarui secara berkala.</p>
                </div>
                
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </div>
  )
}





