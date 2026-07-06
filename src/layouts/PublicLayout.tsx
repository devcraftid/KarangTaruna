import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Home, Trophy, Info, PieChart, User, LogIn, Image, Users, Menu, X, Coins } from 'lucide-react'

export default function PublicLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
      <header className="border-b bg-white dark:bg-card sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Karang Taruna" className="w-12 h-12 rounded-full border-2 border-primary/20 object-contain bg-white" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=KT&background=C8102E&color=fff&rounded=true' }} />
            <div className="flex flex-col">
              <h1 className="text-sm md:text-base font-extrabold leading-tight tracking-tight uppercase">Karang Taruna<br/>Bina Pemuda</h1>
              <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Pondok Betung - Pondok Aren</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-6 items-center text-sm font-bold tracking-wide uppercase">
            <Link to="/" className={`hover:text-primary transition-colors ${isActive('/') ? 'text-primary border-b-2 border-primary py-7' : 'py-7 text-slate-700 dark:text-slate-200'}`}>Beranda</Link>
            <Link to="/lomba" className={`hover:text-primary transition-colors ${isActive('/lomba') ? 'text-primary border-b-2 border-primary py-7' : 'py-7 text-slate-700 dark:text-slate-200'}`}>Lomba & Agenda</Link>
            <Link to="/informasi" className={`hover:text-primary transition-colors ${isActive('/informasi') ? 'text-primary border-b-2 border-primary py-7' : 'py-7 text-slate-700 dark:text-slate-200'}`}>Informasi & Berita</Link>
            <Link to="/transparansi" className={`hover:text-primary transition-colors ${isActive('/transparansi') ? 'text-primary border-b-2 border-primary py-7' : 'py-7 text-slate-700 dark:text-slate-200'}`}>Transparansi Keuangan</Link>
            <Link to="/patungan" className={`hover:text-primary transition-colors ${isActive('/patungan') ? 'text-primary border-b-2 border-primary py-7' : 'py-7 text-slate-700 dark:text-slate-200'}`}>Program Pendanaan</Link>
            <Link to="/galeri" className={`hover:text-primary transition-colors ${isActive('/galeri') ? 'text-primary border-b-2 border-primary py-7' : 'py-7 text-slate-700 dark:text-slate-200'}`}>Galeri</Link>
            <Link to="/panitia" className={`hover:text-primary transition-colors ${isActive('/panitia') ? 'text-primary border-b-2 border-primary py-7' : 'py-7 text-slate-700 dark:text-slate-200'}`}>Panitia</Link>
            
            {user ? (
              <Link to="/dashboard" className="bg-primary text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-primary/90 transition-all flex items-center shadow-md ml-4">
                <User className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="bg-primary text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-primary/90 transition-all flex items-center shadow-md ml-4">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-8 bg-card text-center text-sm text-muted-foreground hidden md:block">
        © {new Date().getFullYear()} Karang Taruna 17 Agustus. All rights reserved.
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t flex justify-around items-center h-16 z-50 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`flex flex-col items-center justify-center w-[20%] h-full space-y-1 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Home className={`w-5 h-5 ${isActive('/') ? 'fill-primary/20' : ''}`} />
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>
        <Link to="/lomba" onClick={() => setIsMobileMenuOpen(false)} className={`flex flex-col items-center justify-center w-[20%] h-full space-y-1 ${isActive('/lomba') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Trophy className={`w-5 h-5 ${isActive('/lomba') ? 'fill-primary/20' : ''}`} />
          <span className="text-[10px] font-medium">Lomba</span>
        </Link>
        <Link to="/patungan" onClick={() => setIsMobileMenuOpen(false)} className={`flex flex-col items-center justify-center w-[20%] h-full space-y-1 ${isActive('/patungan') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Coins className={`w-5 h-5 ${isActive('/patungan') ? 'fill-primary/20' : ''}`} />
          <span className="text-[10px] font-medium">Pendanaan</span>
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
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-sm pt-24 px-6 pb-20 overflow-y-auto flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
           <Link to="/informasi" onClick={() => setIsMobileMenuOpen(false)} className="p-4 rounded-xl bg-slate-50 border hover:border-primary/50 flex items-center gap-4 text-lg font-bold text-slate-700">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Info className="text-primary w-5 h-5"/></div> 
             Informasi & Berita
           </Link>
           <Link to="/transparansi" onClick={() => setIsMobileMenuOpen(false)} className="p-4 rounded-xl bg-slate-50 border hover:border-primary/50 flex items-center gap-4 text-lg font-bold text-slate-700">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><PieChart className="text-primary w-5 h-5"/></div> 
             Transparansi Keuangan
           </Link>
           <Link to="/galeri" onClick={() => setIsMobileMenuOpen(false)} className="p-4 rounded-xl bg-slate-50 border hover:border-primary/50 flex items-center gap-4 text-lg font-bold text-slate-700">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Image className="text-primary w-5 h-5"/></div> 
             Galeri
           </Link>
           <Link to="/panitia" onClick={() => setIsMobileMenuOpen(false)} className="p-4 rounded-xl bg-slate-50 border hover:border-primary/50 flex items-center gap-4 text-lg font-bold text-slate-700">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Users className="text-primary w-5 h-5"/></div> 
             Panitia
           </Link>
        </div>
      )}
    </div>
  )
}
