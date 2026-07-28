// @ts-nocheck
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { 
  ArrowRight, ArrowLeft, Upload, UserRound, Info, ChevronDown, 
  Phone, Mail, Clock, Instagram, Youtube, Twitter, Facebook, 
  HeadphonesIcon, Check, MapPin
} from 'lucide-react'

export default function PendaftaranPublik() {
  const [step, setStep] = useState(1)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    nomor_whatsapp: '',
    tempat_tanggal_lahir: '',
    alamat_lengkap: '',
    bidang_minat: [] as string[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [faqs, setFaqs] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    fetchFaqsAndSettings()
  }, [])

  const fetchFaqsAndSettings = async () => {
    const [faqRes, setRes] = await Promise.all([
      supabase.from('faqs').select('*').eq('is_active', true).order('urutan', { ascending: true }),
      supabase.from('site_settings').select('*').single()
    ])
    if (faqRes.data) setFaqs(faqRes.data)
    if (setRes.data) setSettings(setRes.data)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleMinatToggle = (minat: string) => {
    setFormData(prev => {
      const exists = prev.bidang_minat.includes(minat)
      if (exists) return { ...prev, bidang_minat: prev.bidang_minat.filter(m => m !== minat) }
      return { ...prev, bidang_minat: [...prev.bidang_minat, minat] }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('member_registrations').insert([formData])
      if (error) throw error
      alert('Terima kasih! Pendaftaran Anda telah kami terima dan sedang dalam proses peninjauan.')
      setStep(1)
      setFormData({
        nama_lengkap: '', email: '', nomor_whatsapp: '', tempat_tanggal_lahir: '', alamat_lengkap: '', bidang_minat: []
      })
    } catch (err) {
      console.error(err)
      alert('Gagal mengirim pendaftaran, silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }



  const toggleFaq = (index: number) => {
    if (openFaq === index) setOpenFaq(null)
    else setOpenFaq(index)
  }

  return (
    <div className="bg-md-surface text-md-on-surface font-inter min-h-screen selection:bg-md-secondary-container selection:text-md-on-secondary-container">
      <main className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="font-extrabold text-4xl md:text-5xl text-md-primary mb-2 tracking-tight">Bergabung dengan Kami</h1>
          <p className="text-lg text-md-on-surface-variant max-w-2xl leading-relaxed">
            Jadilah bagian dari perubahan positif di lingkungan kita. Daftarkan diri Anda sebagai anggota Karang Taruna dan berkontribusi untuk masa depan pemuda yang lebih baik.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Registration Form Section */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-md-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm border border-md-outline-variant">
              {/* Progress Stepper */}
              <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4 md:pb-0">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1 last:flex-none group cursor-pointer" onClick={() => setStep(s)}>
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 transition-colors ${step === s ? 'bg-md-primary text-md-on-primary' : step > s ? 'bg-md-secondary text-md-on-secondary' : 'bg-md-surface-variant text-md-on-surface-variant'}`}>
                        {step > s ? <Check className="w-5 h-5" /> : s}
                      </div>
                      <span className={`font-semibold text-sm whitespace-nowrap hidden sm:block ${step === s ? 'text-md-primary' : 'text-md-on-surface-variant'}`}>
                        {s === 1 ? 'Informasi Pribadi' : s === 2 ? 'Alamat & Minat' : 'Upload Dokumen'}
                      </span>
                    </div>
                    {s !== 3 && <div className="h-px bg-md-outline-variant flex-1 mx-4 min-w-[24px]"></div>}
                  </div>
                ))}
              </div>

              {/* Multi-step Form Content */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Step 1: Personal Info */}
                {step === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-sm text-md-on-surface-variant">Nama Lengkap</label>
                        <input required name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} className="w-full bg-[#F7FAFC] border-none rounded-lg p-3 focus:ring-2 focus:ring-md-primary focus:ring-opacity-30 transition-all outline-none text-black" placeholder="Masukkan nama sesuai KTP" type="text"/>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-sm text-md-on-surface-variant">Email</label>
                        <input name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#F7FAFC] border-none rounded-lg p-3 focus:ring-2 focus:ring-md-primary focus:ring-opacity-30 transition-all outline-none text-black" placeholder="contoh@email.com" type="email"/>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-sm text-md-on-surface-variant">Nomor WhatsApp</label>
                        <input required name="nomor_whatsapp" value={formData.nomor_whatsapp} onChange={handleChange} className="w-full bg-[#F7FAFC] border-none rounded-lg p-3 focus:ring-2 focus:ring-md-primary focus:ring-opacity-30 transition-all outline-none text-black" placeholder="0812xxxx" type="tel"/>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-sm text-md-on-surface-variant">Tempat, Tanggal Lahir</label>
                        <input required name="tempat_tanggal_lahir" value={formData.tempat_tanggal_lahir} onChange={handleChange} className="w-full bg-[#F7FAFC] border-none rounded-lg p-3 focus:ring-2 focus:ring-md-primary focus:ring-opacity-30 transition-all outline-none text-black" placeholder="Jakarta, 01-01-2000" type="text"/>
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button className="bg-md-primary text-md-on-primary px-8 py-3 rounded-lg font-bold hover:opacity-90 flex items-center gap-2" onClick={() => setStep(2)} type="button">
                        Lanjut <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Address & Interests */}
                {step === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="space-y-1">
                      <label className="font-semibold text-sm text-md-on-surface-variant">Alamat Lengkap (Sesuai Domisili)</label>
                      <textarea required name="alamat_lengkap" value={formData.alamat_lengkap} onChange={handleChange} className="w-full bg-[#F7FAFC] border-none rounded-lg p-3 focus:ring-2 focus:ring-md-primary focus:ring-opacity-30 transition-all outline-none text-black" placeholder="Nama Jalan, No. Rumah, RT/RW..." rows={3}></textarea>
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-sm text-md-on-surface-variant">Bidang Minat</label>
                      <div className="flex flex-wrap gap-2">
                        {['Lingkungan Hidup', 'Pendidikan', 'Ekonomi Kreatif', 'Olahraga & Seni'].map((minat) => (
                          <label key={minat} className="flex items-center gap-2 bg-[#F7FAFC] px-4 py-2 rounded-full cursor-pointer hover:bg-md-surface-variant transition-colors border border-transparent has-[:checked]:border-md-primary has-[:checked]:bg-md-primary/5">
                            <input className="hidden" type="checkbox" checked={formData.bidang_minat.includes(minat)} onChange={() => handleMinatToggle(minat)} />
                            <span className="font-medium text-xs text-black">{minat}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between pt-4">
                      <button className="text-md-primary font-bold flex items-center gap-2" onClick={() => setStep(1)} type="button">
                        <ArrowLeft className="w-5 h-5" /> Kembali
                      </button>
                      <button className="bg-md-primary text-md-on-primary px-8 py-3 rounded-lg font-bold hover:opacity-90 flex items-center gap-2" onClick={() => setStep(3)} type="button">
                        Lanjut <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Document Upload */}
                {step === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border-2 border-dashed border-md-outline-variant rounded-xl p-6 text-center hover:border-md-primary transition-colors cursor-pointer group flex flex-col items-center">
                        <Upload className="w-10 h-10 text-md-on-surface-variant group-hover:text-md-primary mb-2 transition-colors" />
                        <p className="font-semibold text-sm text-md-on-surface">Foto KTP / Kartu Pelajar</p>
                        <p className="text-xs text-md-on-surface-variant mt-1">PNG, JPG, PDF (Maks. 2MB)</p>
                      </div>
                      <div className="border-2 border-dashed border-md-outline-variant rounded-xl p-6 text-center hover:border-md-primary transition-colors cursor-pointer group flex flex-col items-center">
                        <UserRound className="w-10 h-10 text-md-on-surface-variant group-hover:text-md-primary mb-2 transition-colors" />
                        <p className="font-semibold text-sm text-md-on-surface">Pas Foto 3x4</p>
                        <p className="text-xs text-md-on-surface-variant mt-1">Latar belakang biru/merah</p>
                      </div>
                    </div>
                    <div className="bg-md-secondary-container/10 p-4 rounded-lg flex gap-4 items-start">
                      <Info className="w-6 h-6 text-md-secondary shrink-0" />
                      <p className="text-sm text-md-on-secondary-container">Pastikan semua data yang Anda masukkan benar. Proses verifikasi biasanya memakan waktu 2-3 hari kerja.</p>
                    </div>
                    <div className="flex justify-between pt-4">
                      <button className="text-md-primary font-bold flex items-center gap-2" onClick={() => setStep(2)} type="button">
                        <ArrowLeft className="w-5 h-5" /> Kembali
                      </button>
                      <button disabled={isSubmitting} className="bg-md-secondary text-md-on-secondary px-8 py-3 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50" type="submit">
                        {isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* FAQ Accordion */}
            <div className="bg-md-surface-container p-6 md:p-8 rounded-xl border border-md-outline-variant">
              <h3 className="font-bold text-2xl text-md-primary mb-6">Pertanyaan Umum (FAQ)</h3>
              <div className="space-y-2">
                {faqs.length === 0 ? (
                  <p className="text-sm text-md-on-surface-variant">Belum ada FAQ.</p>
                ) : faqs.map((faq, i) => (
                  <div key={i} className="bg-md-surface-container-lowest rounded-lg border border-md-outline-variant overflow-hidden">
                    <button className="w-full text-left p-4 flex justify-between items-center transition-colors hover:bg-md-primary/5" onClick={() => toggleFaq(i)}>
                      <span className="font-semibold text-sm">{faq.pertanyaan}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40' : 'max-h-0'}`}>
                      <div className="p-4 text-md-on-surface-variant border-t border-md-outline-variant text-sm leading-relaxed">
                        {faq.jawaban}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Contact Info & Map */}
          <div className="lg:col-span-4 space-y-6">
            {/* Map Card */}
            <div className="bg-md-surface-container-lowest rounded-xl border border-md-outline-variant overflow-hidden shadow-sm">
              <div className="h-64 relative bg-md-surface-dim">
                <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-slate-400" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-md-primary/20 to-transparent"></div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-2xl text-md-primary mb-2">Sekretariat Utama</h4>
                <p className="text-md-on-surface-variant text-sm mb-4 leading-relaxed">{settings?.alamat_sekretariat || 'Jl. Pemuda Harapan No. 123, Kelurahan Maju Jaya, Jakarta Selatan, 12345'}</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="text-md-primary w-5 h-5" />
                    <span className="text-sm font-medium">{settings?.nomor_telepon || '(021) 555-0123'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-md-primary w-5 h-5" />
                    <span className="text-sm font-medium">{settings?.email || 'kontak@karangtaruna.org'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="text-md-primary w-5 h-5" />
                    <span className="text-sm font-medium">{settings?.jam_operasional || 'Sen - Sab: 09:00 - 17:00'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links Card */}
            <div className="bg-md-primary text-md-on-primary p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-2xl mb-4">Media Sosial</h4>
                <div className="grid grid-cols-2 gap-2">
                  <a className="flex items-center gap-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all group" href="#">
                    <div className="w-8 h-8 rounded-full bg-md-secondary flex items-center justify-center shrink-0">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">Instagram</span>
                  </a>
                  <a className="flex items-center gap-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all" href="#">
                    <div className="w-8 h-8 rounded-full bg-md-secondary flex items-center justify-center shrink-0">
                      <Youtube className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">YouTube</span>
                  </a>
                  <a className="flex items-center gap-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all" href="#">
                    <div className="w-8 h-8 rounded-full bg-md-secondary flex items-center justify-center shrink-0">
                      <Twitter className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">Twitter</span>
                  </a>
                  <a className="flex items-center gap-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all" href="#">
                    <div className="w-8 h-8 rounded-full bg-md-secondary flex items-center justify-center shrink-0">
                      <Facebook className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">Facebook</span>
                  </a>
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-md-secondary/20 rounded-full blur-2xl"></div>
            </div>

            {/* Assistance Card */}
            <div className="bg-md-secondary-container p-6 rounded-xl border border-md-secondary/20">
              <h4 className="font-bold text-2xl text-md-on-secondary-container mb-2">Butuh Bantuan?</h4>
              <p className="text-sm text-md-on-secondary-container/80 mb-4 leading-relaxed">Tim support kami siap membantu proses pendaftaran Anda jika mengalami kendala teknis.</p>
              <button className="w-full bg-md-on-secondary-container text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <HeadphonesIcon className="w-5 h-5" /> Chat Support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
