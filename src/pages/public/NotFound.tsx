import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <Card className="w-full max-w-[420px] rounded-2xl border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
        <CardContent className="p-8 md:p-10 flex flex-col items-center text-center">
          
          <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <FileQuestion className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-7xl font-extrabold text-red-500 mb-4 tracking-tighter">
            404
          </h1>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Halaman Tidak Ditemukan
          </h2>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Maaf, halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau memang belum tersedia saat ini.
          </p>
          
          <Link to="/" className="w-full">
            <Button className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              <Home className="w-4 h-4 mr-2" /> Kembali ke Beranda
            </Button>
          </Link>
          
        </CardContent>
      </Card>
    </div>
  )
}





