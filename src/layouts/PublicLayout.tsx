import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Search, Moon, Sun, Menu, X, ChevronDown,
  BookOpen, Store, Heart, Phone, MessageSquare, Award, Users,
  Briefcase, Home, Image, MapPin, Mail, Instagram, Facebook, Youtube,
  FileText, User, LogIn, Trophy, Info
} from 'lucide-react'

import { supabase } from '@/lib/supabase'
// ---- NAV DROPDOWN ----
function NavDropdown({ title, children, isActive }: { title: string, children: React.ReactNode, isActive: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  let timeout: NodeJS.Timeout

  return (
    <div
      className="relative"
      onMouseEnter={() => { clearTimeout(timeout); setIsOpen(true) }}
      onMouseLeave={() => { timeout = setTimeout(() => setIsOpen(false), 180) }}
    >
      <button className={`flex items-center gap-1 text-[13px] font-semibold tracking-wide transition-colors ${isActive ? 'text-primary' : 'text-md-on-surface-variant hover:text-primary'}`}>
        {title}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`absolute top-full left-0 mt-2 w-64 bg-white dark:bg-md-inverse-surface border border-md-outline-variant/40 shadow-2xl rounded-2xl overflow-hidden transition-all duration-200 origin-top-left z-50 ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
        <div className="flex flex-col p-2 gap-0.5">
          {children}
        </div>
      </div>
    </div>
  )
}

function DropdownItem({ to, icon: Icon, children, description }: { to: string, icon: any, children: React.ReactNode, description?: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-md-surface-container-low transition-colors group">
      <div className="w-8 h-8 rounded-lg bg-md-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <div className="font-semibold text-sm text-md-on-surface">{children}</div>
        {description && <div className="text-xs text-md-on-surface-variant">{description}</div>}
      </div>
    </Link>
  )
}

export default function PublicLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').limit(1)
    if (data && data.length > 0) setSettings(data[0])
  }

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [isDark])

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
  }, [isMobileMenuOpen])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-md-surface">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const isActive = (path: string) => location.pathname === path
  const isProfilActive = ['/tentang', '/kepengurusan', '/program-kerja'].includes(location.pathname)
  const isProgramActive = ['/informasi', '/lomba', '/galeri', '/hall-of-fame'].includes(location.pathname)
  const isLayananActive = ['/etalase', '/patungan', '/kontak', '/faq', '/aspirasi', '/dokumen', '/transparansi'].includes(location.pathname)

  return (
    <div className="flex flex-col min-h-screen bg-md-surface font-inter">

      {/* ======= HEADER ======= */}
      <header className={`sticky top-0 z-50 border-b border-md-outline-variant/30 transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-md-inverse-surface/95 backdrop-blur-md shadow-sm' : 'bg-white/90 dark:bg-md-inverse-surface/90 backdrop-blur-md'}`}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <div>
              <span className="font-extrabold text-base text-primary dark:text-md-primary-fixed leading-tight block">Karang Taruna</span>
              <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">Bina Pemuda</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/" className={`text-[13px] font-semibold tracking-wide transition-colors ${isActive('/') ? 'text-primary border-b-2 border-secondary pb-0.5' : 'text-md-on-surface-variant hover:text-primary'}`}>Beranda</Link>

            <NavDropdown title="Profil" isActive={isProfilActive}>
              <DropdownItem to="/tentang" icon={Info} description="Sejarah, Visi & Misi">Tentang Kami</DropdownItem>
              <DropdownItem to="/kepengurusan" icon={Users} description="Struktur Pengurus">Kepengurusan</DropdownItem>
              <DropdownItem to="/program-kerja" icon={Briefcase} description="Roadmap Kegiatan">Program Kerja</DropdownItem>
            </NavDropdown>

            <NavDropdown title="Publikasi" isActive={isProgramActive}>
              <DropdownItem to="/informasi" icon={BookOpen} description="Berita & Pengumuman">Berita & Info</DropdownItem>
              <DropdownItem to="/lomba" icon={Trophy} description="Event & Perlombaan">Agenda & Event</DropdownItem>
              <DropdownItem to="/galeri" icon={Image} description="Foto & Video">Galeri</DropdownItem>
              <DropdownItem to="/hall-of-fame" icon={Award} description="Penghargaan & Prestasi">Prestasi</DropdownItem>
            </NavDropdown>

            <NavDropdown title="Layanan" isActive={isLayananActive}>
              <DropdownItem to="/transparansi" icon={FileText} description="Laporan Keuangan Publik">Transparansi Kas</DropdownItem>
              <DropdownItem to="/dokumen" icon={FileText} description="Pusat Unduhan Formulir & SOP">Pusat Unduhan</DropdownItem>
              <DropdownItem to="/etalase" icon={Store} description="Produk UMKM Lokal">Etalase UMKM</DropdownItem>
              <DropdownItem to="/patungan" icon={Heart} description="Program Donasi">Donasi</DropdownItem>
              <DropdownItem to="/aspirasi" icon={MessageSquare} description="Sampaikan Aspirasi">Aspirasi</DropdownItem>
              <DropdownItem to="/kontak" icon={Phone} description="Hubungi Kami">Kontak</DropdownItem>
            </NavDropdown>
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-md-surface-container transition-colors" title="Ctrl+K">
              <Search className="w-4 h-4 text-md-on-surface-variant" />
            </button>
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-md-surface-container transition-colors">
              {isDark ? <Sun className="w-4 h-4 text-md-on-surface-variant" /> : <Moon className="w-4 h-4 text-md-on-surface-variant" />}
            </button>
            <div className="w-px h-6 bg-md-outline-variant mx-1" />
            {user ? (
              <Link to="/dashboard" className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Dasbor
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-5 py-2 border-2 border-primary text-primary text-sm font-bold rounded-xl hover:bg-primary/5 transition-all">Login</Link>
                <Link to="/pendaftaran" className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-sm">Daftar</Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-2">
            <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-md-surface-container transition-colors">
              <Search className="w-5 h-5 text-md-on-surface-variant" />
            </button>
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-md-surface-container transition-colors">
              {isDark ? <Sun className="w-5 h-5 text-md-on-surface-variant" /> : <Moon className="w-5 h-5 text-md-on-surface-variant" />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-md-on-surface">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </header>

      {/* ======= MOBILE MENU ======= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-20 left-0 right-0 bottom-0 bg-white dark:bg-md-inverse-surface overflow-y-auto p-6 space-y-6" onClick={e => e.stopPropagation()}>

            <div>
              <p className="text-xs font-bold text-md-on-surface-variant uppercase tracking-widest mb-3">Navigasi</p>
              <div className="space-y-1">
                {[
                  { to: '/', label: 'Beranda', icon: Home },
                  { to: '/tentang', label: 'Tentang Kami', icon: Info },
                  { to: '/kepengurusan', label: 'Kepengurusan', icon: Users },
                  { to: '/program-kerja', label: 'Program Kerja', icon: Briefcase },
                  { to: '/informasi', label: 'Berita & Info', icon: BookOpen },
                  { to: '/lomba', label: 'Agenda & Event', icon: Trophy },
                  { to: '/galeri', label: 'Galeri', icon: Image },
                  { to: '/hall-of-fame', label: 'Prestasi', icon: Award },
                ].map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive(to) ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-md-surface-container text-md-on-surface'}`}>
                    <Icon className="w-5 h-5" /> {label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-md-on-surface-variant uppercase tracking-widest mb-3">Layanan</p>
              <div className="space-y-1">
                {[
                  { to: '/transparansi', label: 'Transparansi Kas', icon: FileText },
                  { to: '/dokumen', label: 'Pusat Unduhan', icon: FileText },
                  { to: '/etalase', label: 'Etalase UMKM', icon: Store },
                  { to: '/patungan', label: 'Donasi', icon: Heart },
                  { to: '/aspirasi', label: 'Aspirasi', icon: MessageSquare },
                  { to: '/kontak', label: 'Kontak', icon: Phone },
                  { to: '/faq', label: 'FAQ', icon: MessageSquare },
                ].map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive(to) ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-md-surface-container text-md-on-surface'}`}>
                    <Icon className="w-5 h-5" /> {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-md-outline-variant space-y-3">
              {user ? (
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 bg-primary text-white p-4 rounded-2xl font-bold">
                  <User className="w-5 h-5" /> Dasbor Admin
                </Link>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 bg-primary text-white p-4 rounded-2xl font-bold">
                  <LogIn className="w-5 h-5" /> Login / Daftar
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======= MAIN CONTENT ======= */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ======= FOOTER ======= */}
      <footer className="bg-primary text-white">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Brand */}
            <div className="md:col-span-4 space-y-5">
              <div>
                <span className="text-xl font-extrabold text-secondary">Karang Taruna</span>
                <span className="text-white/60 text-sm font-bold ml-2">Bina Pemuda</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Organisasi sosial wadah pembinaan dan pengembangan generasi muda yang tumbuh atas dasar kesadaran dan tanggung jawab sosial untuk kemajuan masyarakat.
              </p>
              <div className="flex gap-3">
                {settings?.link_instagram && (
                  <a href={settings.link_instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary/80 transition-colors">
                    <Instagram className="w-4 h-4 text-white" />
                  </a>
                )}
                {settings?.link_facebook && (
                  <a href={settings.link_facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary/80 transition-colors">
                    <Facebook className="w-4 h-4 text-white" />
                  </a>
                )}
                {settings?.link_youtube && (
                  <a href={settings.link_youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary/80 transition-colors">
                    <Youtube className="w-4 h-4 text-white" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-2 space-y-4">
              <h5 className="text-secondary font-bold text-sm uppercase tracking-wider">Tautan Cepat</h5>
              <ul className="space-y-3">
                {[['/', 'Beranda'], ['/tentang', 'Tentang Kami'], ['/program-kerja', 'Program Kerja'], ['/informasi', 'Berita']].map(([to, label]) => (
                  <li key={to}><Link to={to} className="text-white/70 hover:text-white text-sm transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div className="md:col-span-2 space-y-4">
              <h5 className="text-secondary font-bold text-sm uppercase tracking-wider">Komunitas</h5>
              <ul className="space-y-3">
                {[['/transparansi', 'Transparansi Kas'], ['/dokumen', 'Pusat Unduhan'], ['/etalase', 'UMKM & Etalase'], ['/patungan', 'Donasi & Sosial'], ['/aspirasi', 'Aspirasi'], ['/kontak', 'Kontak Kami'], ['/faq', 'FAQ']].map(([to, label]) => (
                  <li key={to}><Link to={to} className="text-white/70 hover:text-white text-sm transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-4 space-y-5">
              <h5 className="text-secondary font-bold text-sm uppercase tracking-wider">Hubungi Kami</h5>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{settings?.alamat_sekretariat || 'Alamat belum diatur'}</p>
                </div>
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-secondary shrink-0" />
                  <p className="text-white/70 text-sm">{settings?.nomor_telepon || '-'}</p>
                </div>
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-secondary shrink-0" />
                  <p className="text-white/70 text-sm">{settings?.email || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-xs">© {new Date().getFullYear()} Karang Taruna Bina Pemuda. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-white/40 hover:text-white text-xs transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-white/40 hover:text-white text-xs transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ======= GLOBAL SEARCH DIALOG ======= */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden bg-white dark:bg-md-inverse-surface border-none rounded-2xl shadow-2xl">
          <div className="flex items-center border-b border-md-outline-variant/30 px-4 py-3">
            <Search className="w-5 h-5 text-md-on-surface-variant mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Cari berita, UMKM, atau informasi..."
              className="flex-1 bg-transparent border-none focus:outline-none text-md-on-surface placeholder:text-md-on-surface-variant text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery) {
                  setIsSearchOpen(false)
                  navigate('/informasi')
                }
              }}
              autoFocus
            />
            <kbd className="text-[10px] font-bold bg-md-surface-container text-md-on-surface-variant px-2 py-1 rounded">ESC</kbd>
          </div>
          <div className="p-4">
            {!searchQuery ? (
              <div className="text-center py-8 text-md-on-surface-variant">
                <p className="text-sm">Mulai mengetik untuk mencari...</p>
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                  {['Berita', 'UMKM', 'Event', 'Donasi'].map(tag => (
                    <span key={tag} onClick={() => setSearchQuery(tag)} className="text-xs bg-md-surface-container px-3 py-1 rounded-full cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">{tag}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {[
                  { to: '/informasi', icon: BookOpen, label: `Cari "${searchQuery}" di Berita`, color: 'text-primary' },
                  { to: '/etalase', icon: Store, label: `Cari "${searchQuery}" di Etalase UMKM`, color: 'text-emerald-600' },
                  { to: '/dokumen', icon: FileText, label: `Cari "${searchQuery}" di Pusat Unduhan`, color: 'text-secondary' },
                ].map(({ to, icon: Icon, label, color }) => (
                  <Link key={to} to={to} onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-md-surface-container transition-colors">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="text-sm font-semibold text-md-on-surface">{label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ======= FAB ======= */}
      <Link
        to="/lomba"
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        title="Lihat Agenda"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2.5}>
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </Link>

    </div>
  )
}
