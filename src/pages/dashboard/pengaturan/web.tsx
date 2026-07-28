import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { supabase } from '@/lib/supabase'
import { Loader2, Globe, Save } from 'lucide-react'

export default function PengaturanWeb() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settingsId, setSettingsId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    alamat_sekretariat: '',
    nomor_telepon: '',
    email: '',
    jam_operasional: '',
    link_instagram: '',
    link_youtube: '',
    link_twitter: '',
    link_facebook: '',
    link_maps: '',
    legalitas_sk: '',
    legalitas_npwp: '',
    ketua_nama: '',
    ketua_jabatan: '',
    ketua_sambutan: '',
    ketua_foto: '',
    tentang_judul: '',
    tentang_deskripsi: '',
    tentang_gambar: '',
    visi_teks: '',
    misi_teks: ''
  })

  // State untuk unggah dokumen Pusat Unduhan
  const [docFile, setDocFile] = useState<File | null>(null)
  const [docTitle, setDocTitle] = useState('')
  const [docUploading, setDocUploading] = useState(false)

  const [ketuaFotoFile, setKetuaFotoFile] = useState<File | null>(null)
  const [ketuaFotoUploading, setKetuaFotoUploading] = useState(false)

  const [tentangFotoFile, setTentangFotoFile] = useState<File | null>(null)
  const [tentangFotoUploading, setTentangFotoUploading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      
    if (!error && data && data.length > 0) {
      const setting = data[0]
      setSettingsId(setting.id)
      setFormData({
        alamat_sekretariat: setting.alamat_sekretariat || '',
        nomor_telepon: setting.nomor_telepon || '',
        email: setting.email || '',
        jam_operasional: setting.jam_operasional || '',
        link_instagram: setting.link_instagram || '',
        link_youtube: setting.link_youtube || '',
        link_twitter: setting.link_twitter || '',
        link_facebook: setting.link_facebook || '',
        link_maps: setting.link_maps || '',
        legalitas_sk: setting.legalitas_sk || '',
        legalitas_npwp: setting.legalitas_npwp || '',
        ketua_nama: setting.ketua_nama || '',
        ketua_jabatan: setting.ketua_jabatan || '',
        ketua_sambutan: setting.ketua_sambutan || '',
        ketua_foto: setting.ketua_foto || '',
        tentang_judul: setting.tentang_judul || '',
        tentang_deskripsi: setting.tentang_deskripsi || '',
        tentang_gambar: setting.tentang_gambar || '',
        visi_teks: setting.visi_teks || '',
        misi_teks: setting.misi_teks || ''
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (settingsId) {
        await supabase
          .from('site_settings')
          .update(formData)
          .eq('id', settingsId)
      } else {
        const { data } = await supabase
          .from('site_settings')
          .insert([formData])
          .select()
        if (data && data.length > 0) {
          setSettingsId(data[0].id)
        }
      }
      alert('Pengaturan web berhasil disimpan!')
    } catch (error) {
      console.error(error)
      alert('Terjadi kesalahan saat menyimpan.')
    } finally {
      setSaving(false)
    }
  }

  const handleUploadDokumen = async () => {
    if (!docTitle || !docFile) {
      alert('Judul dan File harus diisi!')
      return
    }
    setDocUploading(true)
    try {
      const fileExt = docFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage.from('proposal').upload(fileName, docFile)
      if (uploadError) throw uploadError
      
      const { data: urlData } = supabase.storage.from('proposal').getPublicUrl(fileName)

      const { error } = await supabase.from('documents').insert([{
        judul: docTitle,
        tipe_dokumen: 'lainnya',
        file_url: urlData.publicUrl,
        file_size: docFile.size,
        format: fileExt
      }])
      
      if (error) throw error
      
      alert('Dokumen berhasil diunggah dan ditambahkan ke Pusat Unduhan Publik!')
      setDocTitle('')
      setDocFile(null)
    } catch (error: any) {
      alert(error.message || 'Gagal mengunggah dokumen.')
    } finally {
      setDocUploading(false)
    }
  }

  const handleUploadKetuaFoto = async () => {
    if (!ketuaFotoFile) return
    setKetuaFotoUploading(true)
    try {
      const fileExt = ketuaFotoFile.name.split('.').pop()
      const fileName = `ketua_${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, ketuaFotoFile)
      if (uploadError) throw uploadError
      
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      
      setFormData(prev => ({ ...prev, ketua_foto: urlData.publicUrl }))
      alert('Foto Ketua berhasil diunggah! Jangan lupa klik Simpan Pengaturan di bawah.')
      setKetuaFotoFile(null)
    } catch (error: any) {
      alert(error.message || 'Gagal mengunggah foto.')
    } finally {
      setKetuaFotoUploading(false)
    }
  }

  const handleUploadTentangFoto = async () => {
    if (!tentangFotoFile) return
    setTentangFotoUploading(true)
    try {
      const fileExt = tentangFotoFile.name.split('.').pop()
      const fileName = `tentang_${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, tentangFotoFile)
      if (uploadError) throw uploadError
      
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      
      setFormData(prev => ({ ...prev, tentang_gambar: urlData.publicUrl }))
      alert('Gambar Tentang Kami berhasil diunggah! Jangan lupa klik Simpan Pengaturan di bawah.')
      setTentangFotoFile(null)
    } catch (error: any) {
      alert(error.message || 'Gagal mengunggah gambar.')
    } finally {
      setTentangFotoUploading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan Web</h1>
          <p className="text-muted-foreground">
            Kelola informasi kontak dan tautan sosial media untuk situs publik.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Perubahan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> Informasi Kontak
            </CardTitle>
            <CardDescription>Informasi yang ditampilkan di bagian footer dan halaman kontak.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Alamat Sekretariat</Label>
              <Textarea 
                value={formData.alamat_sekretariat}
                onChange={e => setFormData({...formData, alamat_sekretariat: e.target.value})}
                placeholder="Jl. Pemuda Harapan..."
              />
            </div>
            <div className="space-y-2">
              <Label>Nomor Telepon / WhatsApp</Label>
              <Input 
                value={formData.nomor_telepon}
                onChange={e => setFormData({...formData, nomor_telepon: e.target.value})}
                placeholder="08123456789"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="kontak@karangtaruna.org"
              />
            </div>
            <div className="space-y-2">
              <Label>Jam Operasional</Label>
              <Input 
                value={formData.jam_operasional}
                onChange={e => setFormData({...formData, jam_operasional: e.target.value})}
                placeholder="Senin - Sabtu: 09:00 - 17:00"
              />
            </div>
            <div className="space-y-2">
              <Label>URL Google Maps Embed</Label>
              <Textarea 
                value={formData.link_maps}
                onChange={e => setFormData({...formData, link_maps: e.target.value})}
                placeholder="https://www.google.com/maps/embed?..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media Sosial</CardTitle>
            <CardDescription>Tautan ke akun media sosial resmi Karang Taruna.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input 
                value={formData.link_instagram}
                onChange={e => setFormData({...formData, link_instagram: e.target.value})}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label>Facebook URL</Label>
              <Input 
                value={formData.link_facebook}
                onChange={e => setFormData({...formData, link_facebook: e.target.value})}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label>Twitter / X URL</Label>
              <Input 
                value={formData.link_twitter}
                onChange={e => setFormData({...formData, link_twitter: e.target.value})}
                placeholder="https://twitter.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label>YouTube Channel URL</Label>
              <Input 
                value={formData.link_youtube}
                onChange={e => setFormData({...formData, link_youtube: e.target.value})}
                placeholder="https://youtube.com/..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aspek Legalitas</CardTitle>
            <CardDescription>Nomor registrasi hukum dan pajak yang akan ditampilkan di halaman publik.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>SK Kemenkumham / Legalitas</Label>
              <Input 
                value={formData.legalitas_sk}
                onChange={e => setFormData({...formData, legalitas_sk: e.target.value})}
                placeholder="Contoh: AHU-0001234.AH.01.07.2023"
              />
            </div>
            <div className="space-y-2">
              <Label>NPWP Organisasi</Label>
              <Input 
                value={formData.legalitas_npwp}
                onChange={e => setFormData({...formData, legalitas_npwp: e.target.value})}
                placeholder="Contoh: 92.123.456.7-890.000"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profil Ketua (Beranda)</CardTitle>
            <CardDescription>Informasi profil ketua dan sambutannya yang ditampilkan di halaman beranda publik.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Ketua</Label>
                <Input 
                  value={formData.ketua_nama}
                  onChange={e => setFormData({...formData, ketua_nama: e.target.value})}
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
              <div className="space-y-2">
                <Label>Jabatan (Teks Tampil)</Label>
                <Input 
                  value={formData.ketua_jabatan}
                  onChange={e => setFormData({...formData, ketua_jabatan: e.target.value})}
                  placeholder="Contoh: Ketua Karang Taruna"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pesan Sambutan</Label>
              <Textarea 
                value={formData.ketua_sambutan}
                onChange={e => setFormData({...formData, ketua_sambutan: e.target.value})}
                placeholder="Tuliskan pesan sambutan..."
                rows={4}
              />
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label>Foto Ketua (Rasio disarankan 3:4 atau 1:1)</Label>
              {formData.ketua_foto && (
                <div className="mb-3">
                  <img src={formData.ketua_foto} alt="Foto Ketua" className="w-24 h-24 object-cover rounded-xl border" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input 
                  type="file"
                  accept="image/*"
                  onChange={e => setKetuaFotoFile(e.target.files?.[0] || null)}
                />
                <Button onClick={handleUploadKetuaFoto} disabled={ketuaFotoUploading || !ketuaFotoFile} variant="outline">
                  {ketuaFotoUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Unggah Foto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profil Tentang Kami</CardTitle>
            <CardDescription>Informasi yang ditampilkan di halaman publik "Tentang Kami" (Hero Banner, Visi, Misi).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Judul Utama (Hero)</Label>
              <Input 
                value={formData.tentang_judul}
                onChange={e => setFormData({...formData, tentang_judul: e.target.value})}
                placeholder="Contoh: Penggerak Perubahan & Pilar Sosial Pemuda Desa."
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Singkat (Hero)</Label>
              <Textarea 
                value={formData.tentang_deskripsi}
                onChange={e => setFormData({...formData, tentang_deskripsi: e.target.value})}
                placeholder="Contoh: Karang Taruna adalah organisasi sosial..."
                rows={3}
              />
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label>Gambar Utama / Hero (Rasio disarankan 16:9 atau 4:3)</Label>
              {formData.tentang_gambar && (
                <div className="mb-3">
                  <img src={formData.tentang_gambar} alt="Gambar Tentang Kami" className="w-48 h-32 object-cover rounded-xl border" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input 
                  type="file"
                  accept="image/*"
                  onChange={e => setTentangFotoFile(e.target.files?.[0] || null)}
                />
                <Button onClick={handleUploadTentangFoto} disabled={tentangFotoUploading || !tentangFotoFile} variant="outline">
                  {tentangFotoUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Unggah Gambar
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 pt-2 border-t border-slate-100 mt-4">
              <Label>Visi</Label>
              <Textarea 
                value={formData.visi_teks}
                onChange={e => setFormData({...formData, visi_teks: e.target.value})}
                placeholder="Tuliskan Visi organisasi..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Misi (Pisahkan tiap poin dengan enter/baris baru)</Label>
              <Textarea 
                value={formData.misi_teks}
                onChange={e => setFormData({...formData, misi_teks: e.target.value})}
                placeholder="Misi 1&#10;Misi 2&#10;Misi 3"
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-rose-50/20">
          <CardHeader>
            <CardTitle className="text-rose-700">Unggah Pusat Unduhan Publik</CardTitle>
            <CardDescription>File yang diunggah di sini (misal: AD/ART, Formulir, dll) akan otomatis muncul di halaman "Pusat Unduhan" web publik.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Judul Dokumen Publik</Label>
              <Input 
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                placeholder="Contoh: AD/ART Karang Taruna Terbaru"
              />
            </div>
            <div className="space-y-2">
              <Label>File Dokumen (PDF, Word, dll)</Label>
              <Input 
                type="file"
                onChange={e => setDocFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button onClick={handleUploadDokumen} disabled={docUploading || !docFile || !docTitle} className="bg-rose-600 hover:bg-rose-700 w-full mt-2">
              {docUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Upload Dokumen ke Publik
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
