import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, User, Facebook, Twitter, Link as LinkIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useSEO } from '@/hooks/useSEO'

export default function BeritaDetail() {
  const { id } = useParams()
  const [berita, setBerita] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBeritaDetail()
  }, [id])

  const fetchBeritaDetail = async () => {
    try {
      setLoading(true)
      let query = supabase.from('news').select('*')
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      
      if (id && uuidRegex.test(id)) {
        query = query.eq('id', id)
      } else {
        throw new Error('Invalid ID format')
      }

      const { data, error } = await query.single()
      
      if (error) throw error
      if (data) {
        setBerita(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useSEO({
    title: berita ? berita.judul : 'Memuat Berita...',
    description: berita ? berita.isi?.replace(/<[^>]*>?/gm, '').slice(0, 150) : 'Portal Berita Karang Taruna',
    image: berita?.thumbnail
  })

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
  }

  if (!berita) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold mb-2">Berita Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-6">Artikel yang Anda cari mungkin telah dihapus atau URL tidak valid.</p>
        <Link to="/informasi"><Button>Kembali ke Portal Informasi</Button></Link>
      </div>
    )
  }

  return (
    <div className="bg-md-surface min-h-screen pb-20 pt-10">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Breadcrumb / Back */}
        <Link to="/informasi" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Indeks Berita
        </Link>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Berita
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
            {berita.judul}
          </h1>
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-slate-500 border-b dark:border-slate-800 pb-6">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                 <User className="w-4 h-4" />
               </div>
               <span className="font-medium text-slate-700 dark:text-slate-300">Admin Karang Taruna</span>
             </div>
             <div className="flex items-center gap-2">
               <Calendar className="w-4 h-4" />
               {new Date(berita.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
             </div>
          </div>
        </div>

        {/* Thumbnail */}
        {berita.thumbnail && (
          <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-xl bg-slate-100 dark:bg-slate-900">
            <img src={berita.thumbnail} alt={berita.judul} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content Body */}
        <div className="flex flex-col md:flex-row gap-12">
           
           {/* Share Sidebar */}
           <div className="w-full md:w-16 shrink-0 flex md:flex-col gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest md:[writing-mode:vertical-lr] md:rotate-180 md:mx-auto md:mb-4">Bagikan</span>
              <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-sky-500 hover:border-sky-500 transition-colors">
                <Twitter className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-colors">
                <LinkIcon className="w-4 h-4" />
              </button>
           </div>

           {/* Main Text */}
           <div className="flex-1 prose prose-lg dark:prose-invert prose-headings:font-bold prose-a:text-primary max-w-none">
             {/* Simple formatting for now. If stored as HTML, use dangerouslySetInnerHTML */}
             {berita.isi?.split('\n').map((paragraph: string, idx: number) => (
                <p key={idx}>{paragraph}</p>
             ))}
           </div>
        </div>

      </div>
    </div>
  )
}





