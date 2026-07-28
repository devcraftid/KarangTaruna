import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MessageSquare, HelpCircle } from "lucide-react"
import { supabase } from '@/lib/supabase'

export default function Faq() {
  const [faqs, setFaqs] = useState<any[]>([])

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await supabase.from('faqs').select('*').eq('is_active', true).order('urutan', { ascending: true })
      if (data) setFaqs(data)
    }
    fetchFaqs()
  }, [])

  return (
    <div className="bg-md-surface min-h-screen pb-20">
      {/* HEADER SECTION */}
      <div className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_60%_center,_#ffddba,_transparent)]"></div>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 relative z-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Pusat Bantuan (FAQ)</h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Temukan jawaban untuk pertanyaan yang paling sering diajukan mengenai keanggotaan, donasi, dan program kami.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 mt-12 max-w-3xl">
        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-xl">
           <div className="flex items-center gap-3 mb-8 pb-6 border-b dark:border-slate-800">
             <div className="w-12 h-12 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600">
               <HelpCircle className="w-6 h-6" />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pertanyaan Umum</h2>
               <p className="text-sm text-slate-500">Klik pada pertanyaan untuk melihat jawaban.</p>
             </div>
           </div>

           <Accordion type="single" collapsible className="w-full">
              {faqs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  Belum ada pertanyaan umum.
                </div>
              ) : faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-b border-slate-200 dark:border-slate-800">
                  <AccordionTrigger className="hover:no-underline py-6 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left font-bold text-slate-800 dark:text-slate-200">
                    {faq.pertanyaan}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.jawaban}
                  </AccordionContent>
                </AccordionItem>
              ))}
           </Accordion>
           
           <div className="mt-12 bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl text-center">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-400 mb-4" />
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Masih punya pertanyaan?</h3>
              <p className="text-sm text-slate-500 mb-4">Tim kami siap membantu Anda dengan informasi lebih lanjut.</p>
              <a href="/kontak" className="inline-block bg-primary text-white font-bold px-6 py-3 rounded-full hover:shadow-lg transition-all text-sm">
                Hubungi Kami Sekarang
              </a>
           </div>
        </div>
      </div>
    </div>
  )
}





