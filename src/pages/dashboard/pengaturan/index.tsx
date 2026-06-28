import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Pengaturan() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pengaturan Website</h2>
        <p className="text-muted-foreground">Kelola informasi dasar organisasi</p>
      </div>

      <div className="bg-card border rounded-xl shadow-sm p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Organisasi</Label>
            <Input defaultValue="Karang Taruna 17 Agustus" />
          </div>
          <div className="space-y-2">
            <Label>Alamat Sekretariat</Label>
            <Input defaultValue="Jl. Merdeka No. 17, RW 01" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email Kontak</Label>
              <Input defaultValue="kontak@kt17agustus.com" />
            </div>
            <div className="space-y-2">
              <Label>Nomor WhatsApp</Label>
              <Input defaultValue="08123456789" />
            </div>
          </div>
        </div>
        <div className="pt-4 border-t flex justify-end">
          <Button>Simpan Pengaturan</Button>
        </div>
      </div>
    </div>
  )
}
