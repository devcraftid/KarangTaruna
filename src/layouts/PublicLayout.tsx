import { useState, useRef, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { 
  Home, Trophy, Info, PieChart, User, LogIn, Image, Users, 
  Menu, X, Coins, Store, Vote, ChevronDown 
} from 'lucide-react'

// Custom Dropdown Component
function NavDropdown({ title, children, isActive }: { title: string, children: React.ReactNode, isActive: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200)
  }

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        className={`flex items-center gap-1 py-7 transition-colors uppercase tracking-wide font-bold text-sm ${isActive ? 'text-primary border-b-2 border-primary' : 'text-slate-700 dark:text-slate-200 hover:text-primary'}`}
      >
        {title} <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown Menu */}
      <div 
        className={`absolute top-full left-0 w-56 bg-white dark:bg-card border shadow-lg rounded-xl overflow-hidden transition-all duration-200 origin-top-left
          ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
      >
        <div className="flex flex-col p-2">
          {children}
        </div>
      </div>
    </div>
  )
}

function DropdownItem({ to, icon: Icon, children }: { to: string, icon: any, children: React.ReactNode }) {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors
        ${active ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 text-slate-700'}`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-slate-400'}`} />
      {children}
    </Link>
  )
}

export default function PublicLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Fix scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const isActive = (path: string) => location.pathname === path
  const isProgramActive = ['/informasi', '/lomba', '/galeri'].includes(location.pathname)
  const isKeuanganActive = ['/transparansi', '/patungan', '/etalase'].includes(location.pathname)
  const isOrganisasiActive = ['/panitia', '/voting'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
      <header className="border-b bg-white dark:bg-card sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 z-50">
            <img src="/logo.png" alt="Logo Karang Taruna" className="w-12 h-12 rounded-full border-2 border-primary/20 object-contain bg-white" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=KT&background=C8102E&color=fff&rounded=true' }} />
            <div className="flex flex-col">
              <h1 className="text-sm md:text-base font-extrabold leading-tight tracking-tight uppercase">Karang Taruna<br/>Bina Pemuda</h1>
              <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Pondok Betung - Pondok Aren</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-6 items-center">
            <Link to="/" className={`uppercase tracking-wide text-sm font-bold hover:text-primary transition-colors ${isActive('/') ? 'text-primary border-b-2 border-primary py-7' : 'py-7 text-slate-700 dark:text-slate-200'}`}>
              Beranda
            </Link>
            
            <NavDropdown title="Informasi & Program" isActive={isProgramActive}>
              <DropdownItem to="/informasi" icon={Info}>Berita & Pengumuman</DropdownItem>
              <DropdownItem to="/lomba" icon={Trophy}>Lomba & Agenda</DropdownItem>
              <DropdownItem to="/galeri" icon={Image}>Galeri Kegiatan</DropdownItem>
            </NavDropdown>

            <NavDropdown title="Keuangan & Usaha" isActive={isKeuanganActive}>
              <DropdownItem to="/transparansi" icon={PieChart}>Transparansi Kas</DropdownItem>
              <DropdownItem to="/patungan" icon={Coins}>Program Pendanaan</DropdownItem>
              <DropdownItem to="/etalase" icon={Store}>Etalase BUMKT</DropdownItem>
            </NavDropdown>

            <NavDropdown title="Organisasi" isActive={isOrganisasiActive}>
              <DropdownItem to="/panitia" icon={Users}>Struktur Panitia</DropdownItem>
              <DropdownItem to="/voting" icon={Vote}>E-Voting Publik</DropdownItem>
            </NavDropdown>
            
            <div className="ml-4 pl-4 border-l">
              {user ? (
                <Link to="/dashboard" className="bg-primary text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-primary/90 transition-all flex items-center shadow-md">
                  <User className="w-4 h-4 mr-2" /> Dashboard
                </Link>
              ) : (
                <Link to="/login" className="bg-primary text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-primary/90 transition-all flex items-center shadow-md">
                  <LogIn className="w-4 h-4 mr-2" /> Login Admin
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-8 bg-card text-center text-sm text-muted-foreground hidden md:block">
        © {new Date().getFullYear()} Karang Taruna 17 Agustus. All rights reserved.
      </footer>

      {/* Mobile Bottom Navigation (Quick Actions) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t flex justify-around items-center h-16 z-50 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`flex flex-col items-center justify-center w-[20%] h-full space-y-1 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Home className={`w-5 h-5 ${isActive('/') ? 'fill-primary/20' : ''}`} />
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>
        <Link to="/voting" onClick={() => setIsMobileMenuOpen(false)} className={`flex flex-col items-center justify-center w-[20%] h-full space-y-1 ${isActive('/voting') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Vote className={`w-5 h-5 ${isActive('/voting') ? 'fill-primary/20' : ''}`} />
          <span className="text-[10px] font-medium">Voting</span>
        </Link>
        <Link to="/patungan" onClick={() => setIsMobileMenuOpen(false)} className={`flex flex-col items-center justify-center w-[20%] h-full space-y-1 ${isActive('/patungan') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Coins className={`w-5 h-5 ${isActive('/patungan') ? 'fill-primary/20' : ''}`} />
          <span className="text-[10px] font-medium">Donasi</span>
        </Link>
        {user ? (
          <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center w-[20%] h-full space-y-1 text-muted-foreground hover:text-primary">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Akun</span>
          </Link>
        ) : (
          <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center w-[20%] h-full space-y-1 text-muted-foreground hover:text-primary">
            <LogIn className="w-5 h-5" />
            <span className="text-[10px] font-medium">Login</span>
          </Link>
        )}
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`flex flex-col items-center justify-center w-[20%] h-full space-y-1 ${isMobileMenuOpen ? 'text-primary' : 'text-muted-foreground'}`}>
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="text-[10px] font-medium">Menu Lengkap</span>
        </button>
      </nav>

      {/* Mobile Menu Overlay (Full Screen) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-white dark:bg-card pt-20 px-4 pb-20 overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="space-y-6 max-w-sm mx-auto">
            
            {/* Section 1 */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Informasi & Program</h3>
              <div className="grid gap-2">
                <Link to="/informasi" onClick={() => setIsMobileMenuOpen(false)} className="bg-slate-50 dark:bg-slate-900 border p-4 rounded-xl flex items-center gap-4 text-slate-700 dark:text-slate-200 font-bold active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Info className="text-primary w-5 h-5"/></div> 
                  Berita & Pengumuman
                </Link>
                <Link to="/lomba" onClick={() => setIsMobileMenuOpen(false)} className="bg-slate-50 dark:bg-slate-900 border p-4 rounded-xl flex items-center gap-4 text-slate-700 dark:text-slate-200 font-bold active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Trophy className="text-primary w-5 h-5"/></div> 
                  Lomba & Agenda
                </Link>
                <Link to="/galeri" onClick={() => setIsMobileMenuOpen(false)} className="bg-slate-50 dark:bg-slate-900 border p-4 rounded-xl flex items-center gap-4 text-slate-700 dark:text-slate-200 font-bold active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Image className="text-primary w-5 h-5"/></div> 
                  Galeri Kegiatan
                </Link>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Keuangan & Usaha</h3>
              <div className="grid gap-2">
                <Link to="/transparansi" onClick={() => setIsMobileMenuOpen(false)} className="bg-slate-50 dark:bg-slate-900 border p-4 rounded-xl flex items-center gap-4 text-slate-700 dark:text-slate-200 font-bold active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><PieChart className="text-primary w-5 h-5"/></div> 
                  Transparansi Kas
                </Link>
                <Link to="/patungan" onClick={() => setIsMobileMenuOpen(false)} className="bg-slate-50 dark:bg-slate-900 border p-4 rounded-xl flex items-center gap-4 text-slate-700 dark:text-slate-200 font-bold active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Coins className="text-primary w-5 h-5"/></div> 
                  Program Pendanaan
                </Link>
                <Link to="/etalase" onClick={() => setIsMobileMenuOpen(false)} className="bg-slate-50 dark:bg-slate-900 border p-4 rounded-xl flex items-center gap-4 text-slate-700 dark:text-slate-200 font-bold active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Store className="text-primary w-5 h-5"/></div> 
                  Etalase BUMKT
                </Link>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Organisasi</h3>
              <div className="grid gap-2">
                <Link to="/panitia" onClick={() => setIsMobileMenuOpen(false)} className="bg-slate-50 dark:bg-slate-900 border p-4 rounded-xl flex items-center gap-4 text-slate-700 dark:text-slate-200 font-bold active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Users className="text-primary w-5 h-5"/></div> 
                  Struktur Panitia
                </Link>
                <Link to="/voting" onClick={() => setIsMobileMenuOpen(false)} className="bg-slate-50 dark:bg-slate-900 border p-4 rounded-xl flex items-center gap-4 text-slate-700 dark:text-slate-200 font-bold active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Vote className="text-primary w-5 h-5"/></div> 
                  E-Voting Publik
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
