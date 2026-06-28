import { useState } from 'react'
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { 
  LayoutDashboard, Users, Trophy, DollarSign, LogOut,
  Megaphone, Newspaper, Image as ImageIcon, Settings,
  CreditCard, Wallet, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout() {
  const { user, profile, loading, signOut } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />
  }

  const role = profile.role

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'sekretaris', 'bendahara'] },
    { name: 'Data Anggota', href: '/dashboard/anggota', icon: Users, roles: ['admin', 'sekretaris'] },
    { name: 'Data Lomba', href: '/dashboard/lomba', icon: Trophy, roles: ['admin', 'sekretaris'] },
    { name: 'Pendaftaran', href: '/dashboard/pendaftaran', icon: Users, roles: ['admin', 'sekretaris'] },
    { name: 'Pengumuman', href: '/dashboard/pengumuman', icon: Megaphone, roles: ['admin', 'sekretaris'] },
    { name: 'Berita', href: '/dashboard/berita', icon: Newspaper, roles: ['admin', 'sekretaris'] },
    { name: 'Galeri', href: '/dashboard/galeri', icon: ImageIcon, roles: ['admin', 'sekretaris'] },
    { name: 'Kat. Pemasukan', href: '/dashboard/kategori-pemasukan', icon: DollarSign, roles: ['admin', 'bendahara'] },
    { name: 'Kat. Pengeluaran', href: '/dashboard/kategori-pengeluaran', icon: DollarSign, roles: ['admin', 'bendahara'] },
    { name: 'Kas Masuk', href: '/dashboard/kas-masuk', icon: Wallet, roles: ['admin', 'bendahara'] },
    { name: 'Kas Keluar', href: '/dashboard/kas-keluar', icon: CreditCard, roles: ['admin', 'bendahara'] },
    { name: 'Laporan Keuangan', href: '/dashboard/laporan', icon: DollarSign, roles: ['admin', 'bendahara'] },
    { name: 'Pengaturan Web', href: '/dashboard/pengaturan', icon: Settings, roles: ['admin'] },
  ]

  const filteredNav = navItems.filter(item => item.roles.includes(role || ''))

  return (
    <div className="flex h-screen bg-muted/40 overflow-hidden w-full relative">
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-card border-r flex flex-col transition-all duration-300 ease-in-out
          md:relative md:flex
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        <div className={`h-16 flex items-center border-b px-4 ${isCollapsed ? 'md:justify-center justify-between' : 'justify-between'}`}>
          {(!isCollapsed || isMobileOpen) && <h2 className="font-bold text-lg text-primary whitespace-nowrap overflow-hidden">Admin Panel</h2>}
          
          {/* Mobile Close Button */}
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)} className="md:hidden h-8 w-8 text-muted-foreground">
            <X className="h-5 w-5" />
          </Button>

          {/* Desktop Collapse Button */}
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex h-8 w-8 text-muted-foreground">
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <nav className="space-y-2">
            {filteredNav.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  title={isCollapsed && !isMobileOpen ? item.name : ''}
                  onClick={() => setIsMobileOpen(false)} // Close sidebar on click (mobile)
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors 
                    ${isActive ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'hover:bg-accent hover:text-accent-foreground text-slate-600 dark:text-slate-300'}
                    ${isCollapsed && !isMobileOpen ? 'md:justify-center' : ''}
                  `}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                  {(!isCollapsed || isMobileOpen) && <span className="whitespace-nowrap">{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t">
          <div className={`flex items-center gap-3 mb-4 ${isCollapsed && !isMobileOpen ? 'md:justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-primary font-bold">
              {profile.fullname.charAt(0)}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{profile.fullname}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
              </div>
            )}
          </div>
          
          {(isCollapsed && !isMobileOpen) ? (
             <Button variant="outline" size="icon" className="w-full h-10" onClick={signOut} title="Logout">
               <LogOut className="h-4 w-4 text-destructive" />
             </Button>
          ) : (
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </aside>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="h-16 flex items-center justify-between px-4 bg-white dark:bg-card border-b md:hidden shadow-sm z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="text-slate-600">
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="font-bold text-lg text-primary">Karang Taruna</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {profile.fullname.charAt(0)}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50/50 dark:bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


