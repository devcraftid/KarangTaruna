import { useState, useEffect } from 'react'
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { 
  LayoutDashboard, Users, Trophy, DollarSign, LogOut,
  Megaphone, Newspaper, Image as ImageIcon,
  CreditCard, Wallet, ChevronLeft, ChevronRight, ChevronDown, Menu, X,
  Mail, Archive, Calendar, Vote, Store
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout() {
  const { user, profile, loading, signOut } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<string[]>(['Utama', 'Administrasi', 'Keuangan & Usaha', 'Publikasi', 'Kegiatan & Interaksi'])
  
  const location = useLocation()

  // Ensure active route group is open on load
  useEffect(() => {
    // optional logic to open active group
  }, [location.pathname])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />
  }

  const role = profile.role

  const menuGroups = [
    {
      title: 'Utama',
      icon: LayoutDashboard,
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'sekretaris', 'bendahara'] },
      ]
    },
    {
      title: 'Administrasi',
      icon: Archive,
      items: [
        { name: 'Data Anggota', href: '/dashboard/anggota', icon: Users, roles: ['admin', 'sekretaris'] },
        { name: 'E-Surat', href: '/dashboard/surat', icon: Mail, roles: ['admin', 'sekretaris'] },
        { name: 'Inventaris', href: '/dashboard/inventaris', icon: Archive, roles: ['admin', 'sekretaris'] },
        { name: 'Proker & Absensi', href: '/dashboard/proker', icon: Calendar, roles: ['admin', 'sekretaris'] },
      ]
    },
    {
      title: 'Keuangan & Usaha',
      icon: DollarSign,
      items: [
        { name: 'Kas Masuk', href: '/dashboard/kas-masuk', icon: Wallet, roles: ['admin', 'bendahara'] },
        { name: 'Kas Keluar', href: '/dashboard/kas-keluar', icon: CreditCard, roles: ['admin', 'bendahara'] },
        { name: 'Kat. Pemasukan', href: '/dashboard/kategori-pemasukan', icon: DollarSign, roles: ['admin', 'bendahara'] },
        { name: 'Kat. Pengeluaran', href: '/dashboard/kategori-pengeluaran', icon: DollarSign, roles: ['admin', 'bendahara'] },
        { name: 'Prog. Pendanaan', href: '/dashboard/patungan', icon: Wallet, roles: ['admin', 'bendahara'] },
        { name: 'Etalase BUMKT', href: '/dashboard/bumkt', icon: Store, roles: ['admin', 'bendahara'] },
        { name: 'Laporan Keuangan', href: '/dashboard/laporan', icon: DollarSign, roles: ['admin', 'bendahara'] },
      ]
    },
    {
      title: 'Publikasi',
      icon: Megaphone,
      items: [
        { name: 'Pengumuman', href: '/dashboard/pengumuman', icon: Megaphone, roles: ['admin', 'sekretaris'] },
        { name: 'Berita', href: '/dashboard/berita', icon: Newspaper, roles: ['admin', 'sekretaris'] },
        { name: 'Galeri', href: '/dashboard/galeri', icon: ImageIcon, roles: ['admin', 'sekretaris'] },
      ]
    },
    {
      title: 'Kegiatan & Interaksi',
      icon: Users,
      items: [
        { name: 'Pendaftaran', href: '/dashboard/pendaftaran', icon: Users, roles: ['admin', 'sekretaris'] },
        { name: 'Data Lomba', href: '/dashboard/lomba', icon: Trophy, roles: ['admin', 'sekretaris'] },
        { name: 'E-Voting', href: '/dashboard/voting', icon: Vote, roles: ['admin'] },
      ]
    }
  ]

  const toggleGroup = (title: string) => {
    if (isCollapsed) {
      setIsCollapsed(false)
      if (!openGroups.includes(title)) {
        setOpenGroups([...openGroups, title])
      }
      return
    }
    
    if (openGroups.includes(title)) {
      setOpenGroups(openGroups.filter(g => g !== title))
    } else {
      setOpenGroups([...openGroups, title])
    }
  }

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
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4 px-3 space-y-4">
          {menuGroups.map((group) => {
            const filteredItems = group.items.filter(item => item.roles.includes(role || ''))
            if (filteredItems.length === 0) return null

            const isOpen = openGroups.includes(group.title) || (isCollapsed && !isMobileOpen)

            return (
              <div key={group.title} className="space-y-1">
                {/* Group Header */}
                <button 
                  onClick={() => toggleGroup(group.title)}
                  className={`w-full flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 hover:text-slate-600 dark:hover:text-slate-300 transition-colors ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}
                >
                  {isCollapsed && !isMobileOpen ? (
                    <group.icon className="w-5 h-5" title={group.title} />
                  ) : (
                    <>
                      <span>{group.title}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                {/* Group Items */}
                <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isOpen || (isCollapsed && !isMobileOpen) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  {filteredItems.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        title={isCollapsed && !isMobileOpen ? item.name : ''}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-colors 
                          ${isActive ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'hover:bg-accent hover:text-accent-foreground text-slate-600 dark:text-slate-300'}
                          ${isCollapsed && !isMobileOpen ? 'md:justify-center' : ''}
                        `}
                      >
                        <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                        {(!isCollapsed || isMobileOpen) && <span className="whitespace-nowrap">{item.name}</span>}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="p-4 border-t mt-auto">
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
