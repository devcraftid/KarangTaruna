import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, Instagram, Facebook, Clock, Send, Loader2, Youtube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function Kontak() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [formData, setFormData] = useState({
    nama: '',
    hp: '',
    subjek: '',
    pesan: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').limit(1)
    if (data && data.length > 0) setSettings(data[0])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const fullPesan = `Subjek: ${formData.subjek}\n\n${formData.pesan}`
      const { error } = await supabase.from('aspirations').insert([
        {
          nama_pengirim: formData.nama,
          nomor_whatsapp: formData.hp,
          pesan: fullPesan
        }
      ])
      
      if (error) throw error
      
      toast.success('Pesan Anda berhasil dikirim! Kami akan segera merespons.')
      setFormData({ nama: '', hp: '', subjek: '', pesan: '' })
    } catch (error) {
      console.error(error)
      toast.error('Gagal mengirim pesan, silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-md-surface min-h-screen pb-20">
      <Toaster />
      
      {/* HEADER SECTION */}
      <div className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 via-transparent to-transparent"></div>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 uppercase tracking-tight">Hubungi Kami</h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Kami selalu terbuka untuk berdiskusi, berkolaborasi, maupun menerima masukan dari seluruh elemen masyarakat.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 max-w-6xl">
        <div className="grid lg:grid-cols-5 gap-4 md:p-8">
          
          {/* Contact Info (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-rose-600 text-white h-full">
               <CardContent className="p-4 md:p-8">
                 <h2 className="text-2xl font-bold mb-8">Informasi Kontak</h2>
                 
                 <div className="space-y-6">
                   <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                       <MapPin className="w-5 h-5" />
                     </div>
                     <div>
                       <h3 className="font-bold mb-1">Sekretariat</h3>
                         {settings?.alamat_sekretariat || 'Belum diatur'}
                     </div>
                   </div>

                   <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                       <Phone className="w-5 h-5" />
                     </div>
                     <div>
                       <h3 className="font-bold mb-1">Telepon / WhatsApp</h3>
                        <p className="text-white/80 text-sm leading-relaxed">{settings?.nomor_telepon || 'Belum diatur'}</p>
                     </div>
                   </div>

                   <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                       <Mail className="w-5 h-5" />
                     </div>
                     <div>
                       <h3 className="font-bold mb-1">Email</h3>
                        <p className="text-white/80 text-sm leading-relaxed">{settings?.email || 'Belum diatur'}</p>
                     </div>
                   </div>

                   <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                       <Clock className="w-5 h-5" />
                     </div>
                     <div>
                       <h3 className="font-bold mb-1">Jam Operasional Balai Warga</h3>
                         {settings?.jam_operasional || 'Belum diatur'}
                     </div>
                   </div>
                 </div>

                 <hr className="my-8 border-white/20" />

                 <h3 className="font-bold mb-4">Media Sosial</h3>
                 <div className="flex gap-4">
                    <a href={settings?.link_instagram || '#'} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:text-primary transition-colors flex items-center justify-center">
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a href={settings?.link_facebook || '#'} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:text-primary transition-colors flex items-center justify-center">
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a href={settings?.link_youtube || '#'} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:text-primary transition-colors flex items-center justify-center">
                      <Youtube className="w-5 h-5" />
                    </a>
                 </div>
               </CardContent>
            </Card>
          </div>

          {/* Form & Map (3 cols) */}
          <div className="lg:col-span-3 space-y-8">
            <Card className="border-none shadow-xl">
              <CardContent className="p-4 md:p-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Kirim Pesan</h2>
                <p className="text-slate-500 mb-8">Punya ide, masukan, atau ingin berkolaborasi? Silakan isi formulir di bawah ini.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Lengkap</Label>
                      <Input id="nama" value={formData.nama} onChange={handleChange} required placeholder="Contoh: Budi Santoso" className="bg-slate-50 dark:bg-slate-900" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hp">Nomor HP / WA</Label>
                      <Input id="hp" value={formData.hp} onChange={handleChange} required placeholder="0812xxxxxx" className="bg-slate-50 dark:bg-slate-900" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subjek">Subjek Pesan</Label>
                    <Input id="subjek" value={formData.subjek} onChange={handleChange} required placeholder="Apa yang ingin Anda sampaikan?" className="bg-slate-50 dark:bg-slate-900" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pesan">Detail Pesan</Label>
                    <Textarea id="pesan" value={formData.pesan} onChange={handleChange} required rows={5} placeholder="Tuliskan pesan Anda di sini..." className="bg-slate-50 dark:bg-slate-900 resize-none" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto px-8 gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? 'Mengirim...' : 'Kirim Pesan'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg overflow-hidden h-64 relative">
              <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                 {/* Google Maps Embed Placeholder - Actual iframe can be inserted here */}
                 <iframe 
                   src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15863.670273767675!2d106.74100615!3d-6.27438465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f0612c62c2f7%3A0x6b44a6b225916053!2sPondok%20Betung%2C%20Pondok%20Aren%2C%20South%20Tangerang%20City%2C%20Banten!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid" 
                   width="100%" 
                   height="100%" 
                   style={{ border: 0 }} 
                   allowFullScreen={false} 
                   loading="lazy" 
                   referrerPolicy="no-referrer-when-downgrade"
                   className="grayscale hover:grayscale-0 transition-all duration-700"
                 ></iframe>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}





