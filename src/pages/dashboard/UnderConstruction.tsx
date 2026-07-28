import { Wrench, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function UnderConstruction() {
  const navigate = useNavigate()

  return (
    <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-dashed border-2">
        <CardContent className="pt-10 pb-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Wrench className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Halaman Belum Tersedia
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-[300px]">
            Fitur ini sedang dalam tahap pengembangan dan akan segera hadir di pembaruan selanjutnya.
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Halaman Sebelumnya
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
