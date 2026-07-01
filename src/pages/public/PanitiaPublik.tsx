import { Users, Award, ShieldCheck, Heart } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { memberService } from '@/services/memberService'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"

export default function PanitiaPublik() {
  const { data: panitia, isLoading } = useQuery({
    queryKey: ['panitia'],
    queryFn: memberService.getPanitia
  })

  const getIcon = (divisi: string) => {
    switch (divisi) {
      case 'Inti': return <ShieldCheck className="w-4 h-4 text-primary" />
      case 'Acara': return <Heart className="w-4 h-4 text-amber-500" />
      case 'Lomba': return <Award className="w-4 h-4 text-purple-500" />
      default: return <Users className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-black tracking-tighter text-primary mb-4 uppercase">Susunan Panitia 17-an</h1>
        <p className="text-lg text-muted-foreground">
          Mengenal lebih dekat 17 punggawa Karang Taruna yang bekerja keras menyukseskan perayaan Hari Kemerdekaan RI ke-81 di lingkungan kita.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">Memuat data panitia...</div>
        ) : panitia?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">Belum ada data panitia yang ditambahkan.</div>
        ) : panitia?.map((p, idx) => {
          const imgUrl = p.foto_url 
            ? (p.foto_url.startsWith('http') ? p.foto_url : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${p.foto_url}`)
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.nama)}&background=C8102E&color=fff&size=150`
            
          return (
          <div key={idx} className="bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-inner group-hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20">
                    <img src={imgUrl} alt={p.nama} className="w-full h-full object-cover" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none flex justify-center items-center [&>button]:text-white">
                  <DialogTitle className="sr-only">Foto Profil {p.nama}</DialogTitle>
                  <img src={imgUrl} alt={p.nama} className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" />
                </DialogContent>
              </Dialog>
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-md border pointer-events-none z-10">
                {getIcon(p.divisi || 'Umum')}
              </div>
            </div>
            
            <h3 className="font-bold text-lg mb-1">{p.nama}</h3>
            <p className="text-sm font-semibold text-primary mb-1">{p.jabatan || 'Anggota'}</p>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 border mt-2">
              Divisi {p.divisi || 'Umum'}
            </span>
          </div>
        )})}
      </div>
      
      <div className="mt-16 bg-primary/5 border border-primary/20 rounded-3xl p-8 text-center max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-primary mb-2" style={{ fontFamily: 'cursive' }}>"Terima Kasih Panitia!"</h3>
        <p className="text-muted-foreground">
          Semangat gotong royong dan kerja keras kalian adalah kunci suksesnya acara kita. Merdeka!
        </p>
      </div>
    </div>
  )
}
