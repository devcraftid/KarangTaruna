import { useState, useEffect } from 'react'

import { FileText, Download, Search, Loader2, FolderOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function DokumenPublik() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      // Only show documents that are marked as public, or for now just pull templates and SOPs
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .in('tipe_dokumen', ['template', 'sop', 'proposal', 'lpj']) // assuming these are types
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setDocuments(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDocs = documents.filter(doc => 
    doc.judul.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getFormatIcon = (format: string) => {
    if (format === 'pdf') return <FileText className="w-8 h-8 text-rose-500" />
    if (format === 'docx') return <FileText className="w-8 h-8 text-blue-500" />
    return <FileText className="w-8 h-8 text-slate-500" />
  }

  return (
    <div className="bg-md-surface min-h-screen pb-20 pt-10">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="text-center mb-12">
           <div className="inline-flex items-center justify-center p-4 bg-rose-500/20 rounded-full mb-6">
             <FolderOpen className="w-10 h-10 text-rose-500" />
           </div>
           <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900 dark:text-white uppercase tracking-tight">Pusat Unduhan</h1>
           <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
             Akses dan unduh formulir pendaftaran, surat pengantar, AD/ART, dan dokumen penting Karang Taruna lainnya secara transparan.
           </p>
        </div>

        <div className="relative max-w-xl mx-auto mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input 
            placeholder="Cari nama dokumen..." 
            className="pl-12 h-14 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 focus-visible:ring-rose-500 rounded-full shadow-sm text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-rose-500 animate-spin" /></div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center p-20 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-dashed dark:border-slate-800">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-500 mb-2">Dokumen tidak ditemukan</h3>
            <p className="text-sm text-slate-400">Pastikan kata kunci pencarian Anda benar.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
             <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDocs.map((doc) => (
                  <div key={doc.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                     
                     <div className="shrink-0 flex items-center justify-center w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-2xl">
                       {getFormatIcon(doc.format || 'pdf')}
                     </div>
                     
                     <div className="flex-1">
                       <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-rose-600 transition-colors">
                         {doc.judul}
                       </h3>
                       <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-sm">{doc.tipe_dokumen}</span>
                          <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>{new Date(doc.created_at).toLocaleDateString('id-ID')}</span>
                       </div>
                     </div>
                     
                     <div className="shrink-0">
                        {doc.file_url ? (
                          <a href={`${doc.file_url}?download=`} target="_blank" rel="noreferrer">
                            <Button className="w-full sm:w-auto gap-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/30">
                              <Download className="w-4 h-4" /> Unduh
                            </Button>
                          </a>
                        ) : (
                          <Button disabled variant="outline" className="w-full sm:w-auto">
                            File Tidak Tersedia
                          </Button>
                        )}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

      </div>
    </div>
  )
}





