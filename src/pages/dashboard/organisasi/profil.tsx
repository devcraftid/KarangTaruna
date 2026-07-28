import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { supabase } from '@/lib/supabase'
import { Building, Save, Loader2 } from 'lucide-react'

export default function ProfilOrganisasi() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    nama_organisasi: 'Karang Taruna',
    visi: '',
    misi: '',
    sejarah: '',
    ad_art: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_profiles')
        .select('*')
        .limit(1)
        
      if (error) {
        throw error
      }
      
      if (data && data.length > 0) {
        setProfile(data[0])
        setFormData({
          nama_organisasi: data[0].nama_organisasi || 'Karang Taruna',
          visi: data[0].visi || '',
          misi: data[0].misi || '',
          sejarah: data[0].sejarah || '',
          ad_art: data[0].ad_art || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (profile?.id) {
        // Update existing
        const { error } = await supabase
          .from('organization_profiles')
          .update({
            nama_organisasi: formData.nama_organisasi,
            visi: formData.visi,
            misi: formData.misi,
            sejarah: formData.sejarah,
            ad_art: formData.ad_art,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)
          
        if (error) throw error
        alert('Profil organisasi berhasil diperbarui!')
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('organization_profiles')
          .insert([{
            nama_organisasi: formData.nama_organisasi,
            visi: formData.visi,
            misi: formData.misi,
            sejarah: formData.sejarah,
            ad_art: formData.ad_art
          }])
          .select()
          
        if (error) throw error
        if (data && data.length > 0) {
           setProfile(data[0])
        }
        alert('Profil organisasi berhasil disimpan!')
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profil Organisasi</h1>
          <p className="text-muted-foreground">
            Kelola informasi dasar, visi, misi, dan landasan organisasi.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identitas Organisasi</CardTitle>
          <CardDescription>Informasi ini akan ditampilkan di halaman utama publik.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Organisasi</Label>
            <Input 
              id="nama" 
              value={formData.nama_organisasi} 
              onChange={e => setFormData({...formData, nama_organisasi: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visi">Visi</Label>
            <Textarea 
              id="visi" 
              rows={3} 
              placeholder="Menjadi organisasi pemuda yang tangguh..."
              value={formData.visi} 
              onChange={e => setFormData({...formData, visi: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="misi">Misi</Label>
            <Textarea 
              id="misi" 
              rows={5} 
              placeholder="1. Memberdayakan pemuda... 2. Menjalin kerjasama..."
              value={formData.misi} 
              onChange={e => setFormData({...formData, misi: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sejarah">Sejarah Singkat</Label>
            <Textarea 
              id="sejarah" 
              rows={4} 
              value={formData.sejarah} 
              onChange={e => setFormData({...formData, sejarah: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ad_art">Tautan/Ringkasan AD/ART</Label>
            <Textarea 
              id="ad_art" 
              rows={3}
              placeholder="Tautan Google Drive atau teks ringkasan Anggaran Dasar..." 
              value={formData.ad_art} 
              onChange={e => setFormData({...formData, ad_art: e.target.value})} 
            />
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {profile ? 'Simpan Perubahan' : 'Buat Profil'}
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}
