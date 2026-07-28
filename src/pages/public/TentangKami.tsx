// @ts-nocheck
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { 
  Building, Users, Book, Scale, Rocket, Eye, CheckCircle, 
  Lightbulb, Handshake, HeartHandshake, Download, ShieldCheck, 
  FileText, X, Mail, Share2 
} from 'lucide-react'

type Member = { id: string; nama: string; jabatan: string; foto_profil?: string; deskripsi?: string }

export default function TentangKami() {
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [settings, setSettings] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    const { data: membersData } = await supabase.from('members').select('*').order('created_at', { ascending: true })
    if (membersData) setMembers(membersData)
    
    const { data: settingsData } = await supabase.from('site_settings').select('*').limit(1)
    if (settingsData && settingsData.length > 0) setSettings(settingsData[0])
    
    const { data: docsData } = await supabase.from('documents').select('*').eq('is_public', true).order('created_at', { ascending: false }).limit(4)
    if (docsData) setDocuments(docsData)
  }

  // Find ketua for top level
  const ketua = members.find(m => m.jabatan?.toLowerCase().includes('ketua') && !m.jabatan?.toLowerCase().includes('wakil'))
  const otherMembers = members.filter(m => m.id !== ketua?.id)

  return (
    <div className="bg-md-surface text-md-on-surface font-inter overflow-x-hidden pb-20">
      <main>
        {/* Hero Section */}
        <section className="relative py-16 px-6 lg:px-10 max-w-7xl mx-auto mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <span className="inline-block bg-md-secondary-container text-md-on-secondary-container px-4 py-1 rounded-full text-xs font-bold mb-4">SIAPA KAMI?</span>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">{settings?.tentang_judul || 'Penggerak Perubahan & Pilar Sosial Pemuda Desa.'}</h1>
              <p className="text-lg text-md-on-surface-variant mb-8">{settings?.tentang_deskripsi || 'Karang Taruna adalah organisasi sosial wadah pengembangan generasi muda yang tumbuh atas dasar kesadaran dan tanggung jawab sosial dari, oleh, dan untuk masyarakat.'}</p>
              <div className="flex flex-wrap gap-4">
                <a href="#visi-misi" className="inline-block bg-primary text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all">Lihat Visi Misi</a>
                <Link to="/kepengurusan" className="inline-block border-2 border-primary text-primary px-8 py-3 rounded-xl text-sm font-bold hover:bg-primary/5 transition-all">Struktur Pengurus</Link>
              </div>
            </div>
            <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-md-surface-container-highest flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent z-10"></div>
              {settings?.tentang_gambar ? (
                <img src={settings.tentang_gambar} alt="Tentang Kami" className="absolute inset-0 w-full h-full object-cover z-0" />
              ) : (
                <Building className="w-32 h-32 text-md-outline opacity-20 z-0" />
              )}
            </div>
          </div>
        </section>

        {/* Sejarah: Timeline Section */}
        <section className="bg-md-surface-container-low py-16 mt-12">
          <div className="px-6 lg:px-10 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-2">Sejarah & Rekam Jejak</h2>
              <p className="text-md-on-surface-variant max-w-2xl mx-auto text-base">Perjalanan panjang kami dalam melayani masyarakat dan memberdayakan potensi pemuda sejak masa awal pembentukan.</p>
            </div>
            <div className="relative space-y-12">
              <div className="absolute left-1/2 -translate-x-1/2 h-full w-1 bg-md-outline-variant hidden md:block"></div>
              
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-4 md:p-8 relative text-center md:text-left">
                <div className="md:w-1/2 text-center md:text-right md:pr-12 w-full">
                  <h3 className="text-2xl font-bold text-md-secondary">1960</h3>
                  <p className="text-base mt-2">Karang Taruna lahir sebagai respon atas kebutuhan wadah pembinaan bagi anak yatim piatu dan anak-anak yang kurang beruntung di Kampung Melayu.</p>
                </div>
                <div className="w-4 h-4 bg-primary rounded-full relative z-10 hidden md:block"></div>
                <div className="md:w-1/2 md:pl-12 w-full">
                  <div className="bg-md-surface p-6 rounded-2xl shadow-sm border border-md-outline-variant flex flex-col md:flex-row items-center gap-4 hover:shadow-md transition-shadow text-center md:text-left">
                    <Book className="w-8 h-8 text-primary" />
                    <span className="text-sm font-bold text-md-on-surface-variant">Momentum Kelahiran</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row-reverse items-center gap-4 md:gap-4 md:p-8 relative text-center md:text-left mt-8 md:mt-0">
                <div className="md:w-1/2 text-center md:text-left md:pl-12 w-full">
                  <h3 className="text-2xl font-bold text-md-secondary">1980</h3>
                  <p className="text-base mt-2">Ditetapkannya Karang Taruna sebagai Organisasi Sosial resmi di bawah pembinaan Departemen Sosial melalui Keputusan Menteri.</p>
                </div>
                <div className="w-4 h-4 bg-primary rounded-full relative z-10 hidden md:block"></div>
                <div className="md:w-1/2 md:pr-12 w-full">
                  <div className="bg-md-surface p-6 rounded-2xl shadow-sm border border-md-outline-variant flex flex-col md:flex-row items-center justify-start md:justify-end gap-4 text-center md:text-right hover:shadow-md transition-shadow">
                    <span className="text-sm font-bold text-md-on-surface-variant md:order-1 order-2">Legalisasi Nasional</span>
                    <Scale className="w-8 h-8 text-primary md:order-2 order-1" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-4 md:p-8 relative text-center md:text-left mt-8 md:mt-0">
                <div className="md:w-1/2 text-center md:text-right md:pr-12 w-full">
                  <h3 className="text-2xl font-bold text-md-secondary">Sekarang</h3>
                  <p className="text-base mt-2">Transformasi digital Karang Taruna menjadi organisasi modern yang berfokus pada ekonomi kreatif, UMKM, dan pemberdayaan sosial berbasis teknologi.</p>
                </div>
                <div className="w-4 h-4 bg-primary rounded-full relative z-10 hidden md:block"></div>
                <div className="md:w-1/2 md:pl-12 w-full">
                  <div className="bg-md-surface p-6 rounded-2xl shadow-sm border border-md-outline-variant flex flex-col md:flex-row items-center gap-4 hover:shadow-md transition-shadow text-center md:text-left">
                    <Rocket className="w-8 h-8 text-primary" />
                    <span className="text-sm font-bold text-md-on-surface-variant">Era Transformasi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visi Misi: Bento Grid */}
        <section id="visi-misi" className="py-16 px-6 lg:px-10 max-w-7xl mx-auto mt-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 h-full">
            <div className="md:col-span-4 bg-primary text-white p-4 md:p-8 rounded-3xl flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
                 <Eye className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <Eye className="w-12 h-12 mb-4" />
                <h2 className="text-3xl font-bold mb-4">Visi Utama</h2>
                <p className="text-lg opacity-90 italic leading-relaxed">"{settings?.visi_teks || 'Terwujudnya kesejahteraan sosial bagi generasi muda melalui penguatan potensi ekonomi, sosial, dan budaya yang berlandaskan kemandirian.'}"</p>
              </div>
              <div className="mt-8 border-t border-white/20 pt-4 relative z-10">
                <span className="text-xs font-bold uppercase tracking-widest">Visi 2024-2029</span>
              </div>
            </div>
            
            <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white border border-md-outline-variant p-4 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <CheckCircle className="w-10 h-10 text-md-secondary mb-4" />
                <h3 className="text-2xl font-bold mb-4 text-md-on-surface">Misi Strategis</h3>
                <ul className="space-y-4">
                  {settings?.misi_teks ? (
                    settings.misi_teks.split('\n').filter((m: string) => m.trim() !== '').map((misi: string, idx: number) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-primary font-bold">{String(idx + 1).padStart(2, '0')}.</span>
                        <span className="text-base text-md-on-surface-variant">{misi.trim()}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex gap-3">
                        <span className="text-primary font-bold">01.</span>
                        <span className="text-base text-md-on-surface-variant">Meningkatkan kualitas sumber daya manusia melalui pelatihan kepemimpinan.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-primary font-bold">02.</span>
                        <span className="text-base text-md-on-surface-variant">Mendorong kemandirian ekonomi melalui UMKM binaan lokal.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-primary font-bold">03.</span>
                        <span className="text-base text-md-on-surface-variant">Menjalin kolaborasi lintas sektor demi pembangunan desa yang inklusif.</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              
              <div className="bg-md-secondary-container/30 border border-md-secondary/20 p-4 md:p-8 rounded-3xl">
                <h3 className="text-2xl font-bold mb-6 text-md-on-surface">Nilai Dasar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl text-center shadow-sm hover:-translate-y-1 transition-transform">
                    <Users className="w-6 h-6 text-md-secondary mb-2" />
                    <span className="text-sm font-bold">Solidaritas</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl text-center shadow-sm hover:-translate-y-1 transition-transform">
                    <Lightbulb className="w-6 h-6 text-md-secondary mb-2" />
                    <span className="text-sm font-bold">Inovasi</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl text-center shadow-sm hover:-translate-y-1 transition-transform">
                    <Handshake className="w-6 h-6 text-md-secondary mb-2" />
                    <span className="text-sm font-bold">Integritas</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl text-center shadow-sm hover:-translate-y-1 transition-transform">
                    <HeartHandshake className="w-6 h-6 text-md-secondary mb-2" />
                    <span className="text-sm font-bold">Kepedulian</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Struktur Organisasi */}
        <section className="bg-md-surface-container py-16 px-6 lg:px-10 mt-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold mb-2">Struktur Organisasi</h2>
                <p className="text-md-on-surface-variant text-base">Sinergi kepemimpinan untuk mewujudkan program kerja yang nyata dan berdampak luas bagi komunitas.</p>
              </div>
              <Link to="/dokumen" className="flex items-center gap-2 text-primary font-bold mt-4 md:mt-0 hover:underline">
                  Unduh Struktur (PDF) <Download className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="flex flex-col items-center gap-12">
              {ketua ? (
                <>
                  <div className="w-full max-w-sm">
                    <div 
                      className="bg-white p-4 md:p-8 rounded-3xl shadow-md border border-md-outline-variant text-center transition-all cursor-pointer hover:-translate-y-2 hover:shadow-xl group"
                      onClick={() => setSelectedMember(ketua)}
                    >
                      {ketua.foto_profil ? (
                        <img className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-primary/10 group-hover:border-primary transition-colors" alt={ketua.nama} src={ketua.foto_profil}/>
                      ) : (
                        <div className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-primary/10 bg-md-surface-container flex items-center justify-center group-hover:border-primary transition-colors">
                          <Users className="w-12 h-12 text-md-outline" />
                        </div>
                      )}
                      <h4 className="text-2xl font-bold text-md-on-surface">{ketua.nama}</h4>
                      <p className="text-md-secondary text-sm font-bold uppercase tracking-wide mt-1">{ketua.jabatan}</p>
                    </div>
                  </div>
                  {otherMembers.length > 0 && <div className="h-12 w-1 bg-md-outline-variant"></div>}
                </>
              ) : null}

              {otherMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full">
                  {otherMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="bg-white p-6 rounded-3xl shadow-sm border border-md-outline-variant text-center transition-all cursor-pointer hover:-translate-y-2 hover:shadow-lg group"
                      onClick={() => setSelectedMember(member)}
                    >
                      {member.foto_profil ? (
                        <img className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary/10 group-hover:border-primary transition-colors" alt={member.nama} src={member.foto_profil}/>
                      ) : (
                        <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary/10 bg-md-surface-container flex items-center justify-center group-hover:border-primary transition-colors">
                          <Users className="w-10 h-10 text-md-outline" />
                        </div>
                      )}
                      <h4 className="text-lg font-bold text-md-on-surface">{member.nama}</h4>
                      <p className="text-md-on-surface-variant text-xs font-bold uppercase mt-1">{member.jabatan}</p>
                    </div>
                  ))}
                </div>
              ) : (
                !ketua && <p className="text-md-on-surface-variant text-center py-8">Belum ada data pengurus terdaftar di database.</p>
              )}
            </div>
          </div>
        </section>

        {/* Download Center & Legalitas */}
        <section className="py-16 px-6 lg:px-10 max-w-7xl mx-auto my-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-6">
              {settings?.legalitas_sk || settings?.legalitas_npwp ? (
                <div className="bg-md-surface-container-high p-4 md:p-8 rounded-3xl border border-md-outline-variant">
                  <h3 className="text-2xl font-bold mb-6">Aspek Legalitas</h3>
                  <div className="space-y-6">
                    {settings.legalitas_sk && (
                      <div className="flex items-start gap-4">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                        <div>
                          <p className="text-sm font-bold text-md-on-surface">SK Kemenkumham / Legalitas</p>
                          <p className="text-xs font-bold text-md-on-surface-variant mt-1">{settings.legalitas_sk}</p>
                        </div>
                      </div>
                    )}
                    {settings.legalitas_npwp && (
                      <div className="flex items-start gap-4">
                        <FileText className="w-8 h-8 text-primary" />
                        <div>
                          <p className="text-sm font-bold text-md-on-surface">NPWP Organisasi</p>
                          <p className="text-xs font-bold text-md-on-surface-variant mt-1">{settings.legalitas_npwp}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-8 pt-6 border-t border-md-outline-variant">
                    <p className="text-base italic text-md-on-surface-variant">"Berbadan hukum resmi untuk menjamin akuntabilitas dan kepercayaan masyarakat."</p>
                  </div>
                </div>
              ) : (
                <div className="bg-md-surface-container-high p-4 md:p-8 rounded-3xl border border-md-outline-variant flex items-center justify-center h-full">
                  <p className="text-md-on-surface-variant text-center">Data Aspek Legalitas belum diatur.</p>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-6">Pusat Unduhan Publik</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.length > 0 ? documents.map((doc) => (
                  <a key={doc.id} href={`${doc.file_url}?download=`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-6 bg-white rounded-2xl border border-md-outline-variant hover:border-primary transition-all group cursor-pointer shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="bg-rose-100 p-3 rounded-xl text-rose-600 group-hover:scale-110 transition-transform">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-md-on-surface">{doc.judul}</p>
                        <p className="text-xs font-bold text-md-on-surface-variant mt-1">{(doc.file_size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-md-on-surface-variant group-hover:text-primary transition-colors" />
                  </a>
                )) : (
                  <p className="text-md-on-surface-variant py-8 col-span-2">Belum ada dokumen publik yang diunggah.</p>
                )}
              </div>
              
              {documents.length > 0 && (
                <div className="mt-6 text-center sm:text-left">
                  <Link to="/dokumen" className="text-sm font-bold text-primary hover:underline">Lihat Semua Dokumen &rarr;</Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Modal for Member Details */}
      {selectedMember && (
        <div 
          className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => setSelectedMember(null)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 bg-primary">
              <button 
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-colors" 
                onClick={() => setSelectedMember(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 border-4 border-white rounded-full overflow-hidden w-32 h-32 bg-md-surface flex items-center justify-center">
                {selectedMember.foto_profil ? (
                  <img className="w-full h-full object-cover" alt={selectedMember.nama} src={selectedMember.foto_profil}/>
                ) : (
                  <Users className="w-12 h-12 text-md-outline" />
                )}
              </div>
            </div>
            <div className="pt-24 pb-8 px-8 text-center">
              <h3 className="text-2xl font-bold text-md-on-surface">{selectedMember.nama}</h3>
              <p className="text-md-secondary text-sm font-bold uppercase tracking-widest mb-6 mt-1">{selectedMember.jabatan}</p>
              <p className="text-base text-md-on-surface-variant leading-relaxed">
                {selectedMember.deskripsi || 'Anggota kepengurusan aktif Karang Taruna yang mendedikasikan waktu untuk kemajuan desa.'}
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <button className="p-3 bg-md-surface-container rounded-full hover:bg-primary/10 text-primary transition-colors focus:outline-none">
                  <Mail className="w-5 h-5" />
                </button>
                <button className="p-3 bg-md-surface-container rounded-full hover:bg-primary/10 text-primary transition-colors focus:outline-none">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
