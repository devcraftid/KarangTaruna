import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { supabase } from '@/lib/supabase'
import { Loader2, Settings, ShieldAlert, Server, HardDrive } from 'lucide-react'

export default function PengaturanSistem() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settingsId, setSettingsId] = useState<string | null>(null)
  
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('site_settings')
      .select('id, is_active')
      .limit(1)
      
    if (!error && data && data.length > 0) {
      setSettingsId(data[0].id)
      setMaintenanceMode(!data[0].is_active) // if is_active is false, maintenance is true
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!settingsId) return
    setSaving(true)
    try {
      await supabase
        .from('site_settings')
        .update({ is_active: !maintenanceMode })
        .eq('id', settingsId)
      
      alert('Pengaturan sistem berhasil disimpan!')
    } catch (error) {
      console.error(error)
      alert('Terjadi kesalahan saat menyimpan.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h1>
          <p className="text-muted-foreground">
            Kelola konfigurasi inti aplikasi dan basis data.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving || !settingsId} className="flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
          Simpan Konfigurasi
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="border-red-200">
          <CardHeader className="bg-red-50/50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <ShieldAlert className="w-5 h-5" /> Mode Pemeliharaan
            </CardTitle>
            <CardDescription>
              Mengaktifkan mode ini akan menutup akses publik ke situs web sementara waktu.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between border p-4 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Aktifkan Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Situs publik akan menampilkan halaman perbaikan.</p>
              </div>
              <Switch 
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" /> Status Layanan (Simulasi)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Server className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Koneksi Database Supabase</p>
                  <p className="text-sm text-green-600">Terhubung dan Normal</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Penyimpanan (Storage)</p>
                  <p className="text-sm text-blue-600">Berjalan Normal</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
