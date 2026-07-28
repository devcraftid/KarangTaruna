// @ts-nocheck
import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'

export default function AspirasiPublik() {
  const [formData, setFormData] = useState({
    nama_pengirim: '',
    nomor_whatsapp: '',
    pesan: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // In a real app, you would upload the photo to storage first and get URL.
      // Here we just accept a URL if they have one or leave it blank.
      const { error: dbErr } = await supabase.from('aspirations').insert([
        {
          nama_pengirim: formData.nama_pengirim,
          nomor_whatsapp: formData.nomor_whatsapp,
          pesan: formData.pesan
        }
      ])
      
      if (dbErr) throw dbErr
      
      setSuccess(true)
      setFormData({ nama_pengirim: '', nomor_whatsapp: '', pesan: '' })
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Terjadi kesalahan saat mengirim aspirasi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-md-surface min-h-screen pb-20 pt-10">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 max-w-4xl">
        
        <div className="text-center mb-12">
           <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
             <MessageSquare className="w-10 h-10 text-primary" />
           </div>
           <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-primary tracking-tight">Ruang Aspirasi</h1>
           <p className="text-lg text-md-on-surface-variant max-w-2xl mx-auto">
             Punya kritik, saran, atau laporan terkait lingkungan warga? Sampaikan melalui form di bawah ini agar dapat ditindaklanjuti oleh pengurus.
           </p>
        </div>

        <Card className="border-none shadow-xl bg-white dark:bg-md-inverse-surface overflow-hidden rounded-3xl">
          <div className="h-2 w-full bg-secondary"></div>
          <CardContent className="p-4 md:p-8 md:p-12">
            
            {success ? (
              <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                 <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                   <CheckCircle2 className="w-10 h-10" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Aspirasi Berhasil Terkirim!</h2>
                 <p className="text-slate-500 mb-8 max-w-md mx-auto">
                   Terima kasih atas kepedulian Anda. Pesan Anda telah masuk ke sistem kami dan akan segera ditinjau oleh pengurus Karang Taruna.
                 </p>
                 <Button onClick={() => setSuccess(false)} variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                   Kirim Aspirasi Lainnya
                 </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-1 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap / Inisial</label>
                    <input required name="nama_pengirim" value={formData.nama_pengirim} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all text-black" placeholder="Cth: Hamba Allah" type="text"/>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nomor WhatsApp</label>
                    <input name="nomor_whatsapp" value={formData.nomor_whatsapp} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary transition-all text-black" placeholder="Opsional (untuk tindak lanjut)" type="tel"/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pesan" className="font-bold text-slate-700 dark:text-slate-300">Isi Pesan / Laporan</Label>
                    <Textarea 
                      id="pesan" 
                      name="pesan" 
                      placeholder="Ceritakan secara detail aspirasi Anda di sini..." 
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-teal-500 min-h-[150px] resize-none"
                      value={formData.pesan}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold h-14 rounded-xl shadow-lg shadow-teal-500/30 gap-2 text-lg"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {loading ? 'Mengirim...' : 'Kirim Aspirasi'}
                </Button>
                
                <p className="text-center text-xs text-slate-400 font-medium">
                  Identitas pelapor akan dijaga kerahasiaannya jika diperlukan.
                </p>
              </form>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  )
}





