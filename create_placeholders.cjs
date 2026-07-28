const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'src', 'pages', 'dashboard');

const newRoutes = [
  'organisasi/profil',
  'organisasi/struktur',
  'organisasi/pembina',
  'anggota/data',
  'anggota/kta',
  'anggota/absensi',
  'acara/panitia',
  'acara/presensi',
  'acara/sertifikat',
  'administrasi/rapat',
  'administrasi/dokumen',
  'publikasi/aspirasi',
  'publikasi/forum',
  'umkm/produk',
  'analitik',
  'laporan/export',
  'pengaturan/web',
  'pengaturan/akses',
  'pengaturan/sistem'
];

newRoutes.forEach(route => {
  const parts = route.split('/');
  const isIndex = parts.length === 1;
  const dirName = isIndex ? route : parts.slice(0, -1).join('/');
  const fileName = isIndex ? 'index.tsx' : `${parts[parts.length - 1]}.tsx`;
  
  const componentName = route.split('/').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  
  const targetDir = path.join(basePath, dirName);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, fileName);
  
  const content = `import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function ${componentName}() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">${componentName.replace(/([A-Z])/g, ' $1').trim()}</h1>
        <p className="text-muted-foreground">
          Modul ini masih dalam tahap pengembangan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Fitur ini akan segera hadir pada iterasi pengembangan berikutnya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg">
            <h3 className="mt-4 text-lg font-semibold">Under Construction</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Kami sedang menyiapkan fitur terbaik untuk organisasi Anda.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
`;

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created: ${filePath}`);
  }
});
