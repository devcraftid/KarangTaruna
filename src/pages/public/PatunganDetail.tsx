import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Upload, AlertCircle, ArrowLeft } from 'lucide-react'
import { patunganService } from '@/services/patungan'
import { storageService } from '@/services/storageService'
import { PatunganCampaign } from '@/types'
import toast, { Toaster } from 'react-hot-toast'

export default function PatunganDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [campaign, setCampaign] = useState<PatunganCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    nama_donatur: '',
    nominal: '',
    metode_pembayaran: '',
    keterangan: '',
  })

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return
      try {
        const data = await patunganService.getCampaignById(id)
        const total = await patunganService.getContributionsTotalByCampaignId(id)
        setCampaign({ ...data, terkumpul: total })
      } catch (error) {
        console.error('Error fetching campaign:', error)
        toast.error('Kampanye tidak ditemukan.')
        navigate('/patungan')
      } finally {
        setLoading(false)
      }
    }
    fetchCampaign()
  }, [id, navigate])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 2 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 2MB')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!id) return
    
    if (formData.metode_pembayaran !== 'Tunai ke Bendahara' && !file) {
      toast.error('Silakan upload bukti transfer.')
      return
    }
    
    if (Number(formData.nominal) < 1000) {
      toast.error('Nominal minimal Rp 1.000')
      return
    }

    setSubmitting(true)
    try {
      let publicUrl = ''
      // 1. Upload Bukti Transfer (if any)
      if (file) {
        publicUrl = await storageService.uploadFile('patungan', file)
      }
      
      // 2. Submit Contribution
      await patunganService.createContribution({
        campaign_id: id,
        nama_donatur: formData.nama_donatur,
        nominal: Number(formData.nominal),
        metode_pembayaran: formData.metode_pembayaran,
        bukti_transfer: publicUrl || undefined,
        keterangan: formData.keterangan,
        tanggal: new Date().toISOString().split('T')[0], // today's date
        status: 'pending'
      })

      toast.success('Kontribusi Anda telah dikirim dan menunggu verifikasi!')
      
      // Reset form
      setFormData({ nama_donatur: '', nominal: '', metode_pembayaran: '', keterangan: '' })
      setFile(null)
      
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!campaign) return null

  const progressPercentage = Math.min(100, ((campaign.terkumpul || 0) / campaign.target_dana) * 100)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Toaster />
      <Button variant="ghost" onClick={() => navigate('/patungan')} className="mb-6 hover:bg-slate-100">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Pendanaan
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Campaign Info */}
        <div className="space-y-6">
          <div className="rounded-xl overflow-hidden bg-white shadow-sm border">
            {campaign.gambar ? (
              <img src={campaign.gambar} alt={campaign.judul} className="w-full h-64 object-cover" />
            ) : (
              <div className="w-full h-64 bg-slate-100 flex items-center justify-center">
                <span className="text-slate-400">No Image</span>
              </div>
            )}
            <div className="p-6">
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-4 uppercase ${campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                {campaign.status === 'active' ? 'Sedang Berjalan' : 'Selesai'}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-800 mb-4">{campaign.judul}</h1>
              <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">{campaign.deskripsi}</p>
              
              <div className="bg-slate-50 p-4 rounded-lg border">
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-primary text-lg">Rp {(campaign.terkumpul || 0).toLocaleString('id-ID')}</span>
                  <span className="text-slate-500 self-end">Target: Rp {campaign.target_dana.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mb-3">
                   <div 
                     className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out" 
                     style={{ width: `${progressPercentage}%` }}
                   />
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Terkumpul {Math.round(progressPercentage)}%</span>
                  <span>Batas Waktu: {new Date(campaign.batas_waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contribution Form */}
        <div>
          <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-primary/20 overflow-hidden">
            <div className="bg-slate-50 border-b p-6">
              <h2 className="text-xl font-bold">Beri Kontribusi</h2>
            </div>
            <div className="p-6">
              {campaign.status !== 'active' ? (
                <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg flex gap-3 items-start">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Program ini sudah tidak aktif, sehingga tidak dapat menerima kontribusi baru.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama (Donatur)</Label>
                    <Input 
                      id="nama" 
                      placeholder="Masukkan nama Anda (atau Hamba Allah)" 
                      value={formData.nama_donatur}
                      onChange={(e) => setFormData({...formData, nama_donatur: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nominal">Nominal (Rp)</Label>
                    <Input 
                      id="nominal" 
                      type="number"
                      placeholder="Contoh: 50000" 
                      value={formData.nominal}
                      onChange={(e) => setFormData({...formData, nominal: e.target.value})}
                      required
                      min="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metode">Metode Pembayaran / Transfer Ke</Label>
                    <Select required value={formData.metode_pembayaran} onValueChange={(val) => setFormData({...formData, metode_pembayaran: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Bank / E-Wallet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BCA - 1234567890 a.n Karang Taruna">BCA - 1234567890 (Karang Taruna)</SelectItem>
                        <SelectItem value="Mandiri - 0987654321 a.n Karang Taruna">Mandiri - 0987654321 (Karang Taruna)</SelectItem>
                        <SelectItem value="DANA - 081234567890">DANA - 081234567890</SelectItem>
                        <SelectItem value="Tunai ke Bendahara">Tunai (Langsung ke Bendahara)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keterangan">Keterangan / Pesan (Opsional)</Label>
                    <textarea 
                      id="keterangan"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tulis pesan penyemangat..."
                      value={formData.keterangan}
                      onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bukti">Bukti Transfer (Gambar)</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:bg-slate-50 transition-colors text-center cursor-pointer relative">
                      <input 
                        type="file" 
                        id="bukti" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        required={formData.metode_pembayaran !== 'Tunai ke Bendahara'}
                      />
                      {file ? (
                        <div className="text-sm font-medium text-primary break-all">
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-slate-500">
                          <Upload className="w-8 h-8 mb-2 text-slate-400" />
                          <span className="text-sm font-medium">Klik atau drop file di sini</span>
                          <span className="text-xs text-slate-400 mt-1">Maks. 2MB (JPG, PNG)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full py-6 text-lg font-bold" disabled={submitting}>
                    {submitting ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Mengirim...</>
                    ) : (
                      'Kirim Kontribusi'
                    )}
                  </Button>
                  <p className="text-xs text-center text-slate-500 mt-2">
                    Kontribusi Anda akan diverifikasi oleh pengurus sebelum masuk ke total dana.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
