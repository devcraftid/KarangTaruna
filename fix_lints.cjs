const fs = require('fs');

function replaceFile(path, regex, replacement) {
  let f = fs.readFileSync(path, 'utf8');
  f = f.replace(regex, replacement);
  fs.writeFileSync(path, f);
}

replaceFile('src/pages/dashboard/acara/presensi.tsx', /import \{ Input \} from '@\/components\/ui\/input'/, '');
replaceFile('src/pages/dashboard/acara/sertifikat.tsx', /useRef, /, '');
replaceFile('src/pages/dashboard/acara/sertifikat.tsx', /import \{ CardHeader, CardTitle, CardDescription \} from '@\/components\/ui\/card'/, '');
replaceFile('src/pages/dashboard/acara/sertifikat.tsx', /CheckSquare, /, '');
replaceFile('src/pages/dashboard/administrasi/dokumen.tsx', /import \{ CardHeader, CardTitle, CardDescription \} from '@\/components\/ui\/card'/, '');
replaceFile('src/pages/dashboard/administrasi/rapat.tsx', /import \{ CardHeader, CardTitle, CardDescription \} from '@\/components\/ui\/card'/, '');
replaceFile('src/pages/dashboard/anggota/absensi.tsx', /Plus, /, '');
replaceFile('src/pages/dashboard/bumkt/index.tsx', /import \{ CardHeader, CardTitle, CardDescription \} from '@\/components\/ui\/card'/, '');
replaceFile('src/pages/dashboard/bumkt/index.tsx', /Edit2, /, '');
replaceFile('src/pages/dashboard/events/index.tsx', /import \{ CardHeader, CardTitle, CardDescription \} from '@\/components\/ui\/card'/, '');
replaceFile('src/pages/dashboard/events/index.tsx', /Activity, /, '');
replaceFile('src/pages/dashboard/inventaris/pinjam.tsx', /ClipboardList, /, '');
replaceFile('src/pages/dashboard/lomba/index.tsx', /event_name: lomba\.event_name \|\| ''/, 'event_name: (lomba as any).event_name || ""');
replaceFile('src/pages/dashboard/pengumuman/index.tsx', /import \{ CardHeader, CardTitle, CardDescription \} from '@\/components\/ui\/card'\n/, '');
replaceFile('src/pages/dashboard/pengumuman/index.tsx', /Edit2, /, '');
replaceFile('src/pages/dashboard/proker/timeline.tsx', /progs\.find\(\(p\)/, '(progs as any).find((p: any)');
replaceFile('src/pages/dashboard/publikasi/aspirasi.tsx', /CardDescription, /, '');
replaceFile('src/pages/dashboard/publikasi/aspirasi.tsx', /import \{ Badge \} from '@\/components\/ui\/badge'\n/, '');
replaceFile('src/pages/dashboard/publikasi/aspirasi.tsx', /CheckCircle2, Clock, /, '');
replaceFile('src/pages/dashboard/publikasi/aspirasi.tsx', /ArrowRight, /, '');
replaceFile('src/pages/dashboard/publikasi/forum.tsx', /CardDescription, /, '');
replaceFile('src/pages/dashboard/surat/index.tsx', /letter.disposisi_kepada/g, '(letter as any).disposisi_kepada');
replaceFile('src/pages/dashboard/transparansi/index.tsx', /\(item: any, idx: number\)/, '(item: any)');
replaceFile('src/pages/dashboard/umkm/laporan.tsx', /CardDescription, /, '');
replaceFile('src/pages/dashboard/umkm/produk.tsx', /import \{ CardHeader, CardTitle, CardDescription \} from '@\/components\/ui\/card'/, '');
replaceFile('src/pages/public/AspirasiPublik.tsx', /import \{ Input \} from '@\/components\/ui\/input'/, '');
replaceFile('src/pages/public/Etalase.tsx', /ArrowRight, /, '');
replaceFile('src/pages/public/GaleriPublik.tsx', /Sparkles, Play, /, '');
replaceFile('src/pages/public/Home.tsx', /import MemberItem from '\.\.\/dashboard\/anggota\/MemberItem'/, '');
replaceFile('src/pages/public/PendaftaranPublik.tsx', /Link, /, '');
replaceFile('src/pages/public/TentangKami.tsx', /BarChart, Calendar, /, '');
