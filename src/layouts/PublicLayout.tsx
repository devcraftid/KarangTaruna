import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Home, Trophy, Info, PieChart, User, LogIn, Image } from 'lucide-react'

export default function PublicLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()

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
            <Link to="/galeri" className={`hover:text-primary transition-colors ${isActive('/galeri') ? 'text-primary border-b-2 border-primary py-7' : 'py-7 text-slate-700 dark:text-slate-200'}`}>Galeri</Link>
            
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t flex items-center h-16 z-50 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] overflow-x-auto gap-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <Link to="/" className={`flex flex-col items-center justify-center min-w-[72px] h-full space-y-1 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Home className={`w-5 h-5 ${isActive('/') ? 'fill-primary/20' : ''}`} />
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>
        <Link to="/lomba" className={`flex flex-col items-center justify-center min-w-[72px] h-full space-y-1 ${isActive('/lomba') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Trophy className={`w-5 h-5 ${isActive('/lomba') ? 'fill-primary/20' : ''}`} />
          <span className="text-[10px] font-medium">Lomba</span>
        </Link>
        <Link to="/informasi" className={`flex flex-col items-center justify-center min-w-[72px] h-full space-y-1 ${isActive('/informasi') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Info className={`w-5 h-5 ${isActive('/informasi') ? 'fill-primary/20' : ''}`} />
          <span className="text-[10px] font-medium">Informasi</span>
        </Link>
        <Link to="/transparansi" className={`flex flex-col items-center justify-center min-w-[72px] h-full space-y-1 ${isActive('/transparansi') ? 'text-primary' : 'text-muted-foreground'}`}>
          <PieChart className={`w-5 h-5 ${isActive('/transparansi') ? 'fill-primary/20' : ''}`} />
          <span className="text-[10px] font-medium">Keuangan</span>
        </Link>
        <Link to="/galeri" className={`flex flex-col items-center justify-center min-w-[72px] h-full space-y-1 ${isActive('/galeri') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Image className={`w-5 h-5 ${isActive('/galeri') ? 'fill-primary/20' : ''}`} />
          <span className="text-[10px] font-medium">Galeri</span>
        </Link>
        {user ? (
          <Link to="/dashboard" className="flex flex-col items-center justify-center min-w-[72px] h-full space-y-1 text-muted-foreground hover:text-primary">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Akun</span>
          </Link>
        ) : (
          <Link to="/login" className="flex flex-col items-center justify-center min-w-[72px] h-full space-y-1 text-muted-foreground hover:text-primary">
            <LogIn className="w-5 h-5" />
            <span className="text-[10px] font-medium">Login</span>
          </Link>
        )}
      </nav>
    </div>
  )
}
