import { Users, Award, ShieldCheck, Heart } from 'lucide-react'

export default function PanitiaPublik() {
  const panitia = [
    { nama: 'Budi Santoso', jabatan: 'Ketua Panitia', divisi: 'Inti', img: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=C8102E&color=fff&size=150' },
    { nama: 'Siti Aminah', jabatan: 'Wakil Ketua', divisi: 'Inti', img: 'https://ui-avatars.com/api/?name=Siti+Aminah&background=C8102E&color=fff&size=150' },
    { nama: 'Andi Pratama', jabatan: 'Sekretaris 1', divisi: 'Inti', img: 'https://ui-avatars.com/api/?name=Andi+Pratama&background=1E3A8A&color=fff&size=150' },
    { nama: 'Rina Melati', jabatan: 'Sekretaris 2', divisi: 'Inti', img: 'https://ui-avatars.com/api/?name=Rina+Melati&background=1E3A8A&color=fff&size=150' },
    { nama: 'Hendra Gunawan', jabatan: 'Bendahara 1', divisi: 'Inti', img: 'https://ui-avatars.com/api/?name=Hendra+Gunawan&background=047857&color=fff&size=150' },
    { nama: 'Lia Kusuma', jabatan: 'Bendahara 2', divisi: 'Inti', img: 'https://ui-avatars.com/api/?name=Lia+Kusuma&background=047857&color=fff&size=150' },
    
    { nama: 'Doni Saputra', jabatan: 'Koord. Acara', divisi: 'Acara', img: 'https://ui-avatars.com/api/?name=Doni+Saputra&background=D97706&color=fff&size=150' },
    { nama: 'Dita Wulandari', jabatan: 'Anggota Acara 1', divisi: 'Acara', img: 'https://ui-avatars.com/api/?name=Dita+Wulandari&background=D97706&color=fff&size=150' },
    { nama: 'Eko Wahyudi', jabatan: 'Anggota Acara 2', divisi: 'Acara', img: 'https://ui-avatars.com/api/?name=Eko+Wahyudi&background=D97706&color=fff&size=150' },
    
    { nama: 'Fajar Nugroho', jabatan: 'Koord. Lomba', divisi: 'Lomba', img: 'https://ui-avatars.com/api/?name=Fajar+Nugroho&background=6D28D9&color=fff&size=150' },
    { nama: 'Gita Pertiwi', jabatan: 'Anggota Lomba 1', divisi: 'Lomba', img: 'https://ui-avatars.com/api/?name=Gita+Pertiwi&background=6D28D9&color=fff&size=150' },
    { nama: 'Hadi Suwito', jabatan: 'Anggota Lomba 2', divisi: 'Lomba', img: 'https://ui-avatars.com/api/?name=Hadi+Suwito&background=6D28D9&color=fff&size=150' },
    
    { nama: 'Ika Nurhayati', jabatan: 'Koord. Konsumsi', divisi: 'Konsumsi', img: 'https://ui-avatars.com/api/?name=Ika+Nurhayati&background=BE185D&color=fff&size=150' },
    { nama: 'Joko Anwar', jabatan: 'Anggota Konsumsi', divisi: 'Konsumsi', img: 'https://ui-avatars.com/api/?name=Joko+Anwar&background=BE185D&color=fff&size=150' },
    
    { nama: 'Kiki Ramadhan', jabatan: 'Koord. Perlengkapan', divisi: 'Perlengkapan', img: 'https://ui-avatars.com/api/?name=Kiki+Ramadhan&background=4338CA&color=fff&size=150' },
    { nama: 'Lukman Hakim', jabatan: 'Anggota Perlengkapan', divisi: 'Perlengkapan', img: 'https://ui-avatars.com/api/?name=Lukman+Hakim&background=4338CA&color=fff&size=150' },
    
    { nama: 'Mira Setiawan', jabatan: 'Koord. Dokumentasi', divisi: 'Dokumentasi', img: 'https://ui-avatars.com/api/?name=Mira+Setiawan&background=0F766E&color=fff&size=150' },
  ]

  const getIcon = (divisi: string) => {
    switch (divisi) {
      case 'Inti': return <ShieldCheck className="w-4 h-4 text-primary" />
      case 'Acara': return <Heart className="w-4 h-4 text-amber-500" />
      case 'Lomba': return <Award className="w-4 h-4 text-purple-500" />
      default: return <Users className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-black tracking-tighter text-primary mb-4 uppercase">Susunan Panitia 17-an</h1>
        <p className="text-lg text-muted-foreground">
          Mengenal lebih dekat 17 punggawa Karang Taruna yang bekerja keras menyukseskan perayaan Hari Kemerdekaan RI ke-81 di lingkungan kita.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {panitia.map((p, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <img src={p.img} alt={p.nama} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-md border">
                {getIcon(p.divisi)}
              </div>
            </div>
            
            <h3 className="font-bold text-lg mb-1">{p.nama}</h3>
            <p className="text-sm font-semibold text-primary mb-1">{p.jabatan}</p>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 border mt-2">
              Divisi {p.divisi}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-16 bg-primary/5 border border-primary/20 rounded-3xl p-8 text-center max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-primary mb-2" style={{ fontFamily: 'cursive' }}>"Terima Kasih Panitia!"</h3>
        <p className="text-muted-foreground">
          Semangat gotong royong dan kerja keras kalian adalah kunci suksesnya acara kita. Merdeka!
        </p>
      </div>
    </div>
  )
}
