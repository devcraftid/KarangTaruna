import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { galeriService } from '@/services/galeriService'
import { storageService } from '@/services/storageService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import toast, { Toaster } from 'react-hot-toast'

export default function Galeri() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [judul, setJudul] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { data: gallery, isLoading } = useQuery({ queryKey: ['gallery'], queryFn: galeriService.getGaleri })

  const createMutation = useMutation({
    mutationFn: galeriService.createGaleri,
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['gallery'] }); 
      toast.success('Foto ditambahkan'); 
      setIsOpen(false); 
      setJudul('');
      setSelectedFile(null);
    }
  })

  const deleteMutation = useMutation({
    mutationFn: galeriService.deleteGaleri,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['gallery'] }); toast.success('Foto dihapus') }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!judul.trim()) return
    if (!selectedFile) {
      toast.error('Silakan pilih foto terlebih dahulu')
      return
    }

    try {
      setIsUploading(true)
      const url = await storageService.uploadFile('gallery', selectedFile)
      createMutation.mutate({ judul, foto: url })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold tracking-tight">Galeri</h2></div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setJudul(''); setSelectedFile(null); setIsOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Upload Foto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Foto</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Judul Foto</Label>
                <Input required value={judul} onChange={e=>setJudul(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>File Foto</Label>
                <Input type="file" accept="image/*" required onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </div>
              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" disabled={createMutation.isPending || isUploading}>
                  {isUploading ? 'Mengunggah...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <div className="text-center p-8">Memuat...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery?.map(item => (
            <div key={item.id} className="relative group bg-card border rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-square bg-muted flex items-center justify-center relative">
                {item.foto && item.foto !== 'placeholder.jpg' ? (
                  <img src={item.foto} alt={item.judul} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground text-sm">[Tidak ada gambar]</span>
                )}
              </div>
              <div className="p-3 border-t bg-card">
                <p className="font-medium text-sm truncate">{item.judul}</p>
                <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString('id-ID')}</p>
              </div>
              <Button 
                variant="destructive" size="icon" 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" 
                onClick={() => { if(window.confirm('Hapus foto ini?')) deleteMutation.mutate(item.id) }}
              ><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
