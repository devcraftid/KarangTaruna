import { useState, useEffect } from 'react'
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { 
  LayoutDashboard, Users, Trophy, DollarSign, LogOut,
  Megaphone, Newspaper, Image as ImageIcon,
  CreditCard, Wallet, ChevronLeft, ChevronRight, ChevronDown, Menu, X,
  FileText, Flag, Home as HomeIcon, Award,
  Calendar, Briefcase, Mail, FolderOpen,
  ShoppingBag, ClipboardList, Settings, BarChart, FileSpreadsheet,
  CheckSquare, MessageSquare, PieChart, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout() {
  const { user, profile, loading, signOut } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<string[]>([
    'Dasbor & Pengguna',
    'Organisasi & SDM',
    'Program & Kegiatan',
    'Administrasi & Aset',
    'Keuangan & Transparansi',
    'Ekonomi Warga',
    'Humas & Publikasi',
    'Pengaturan Sistem'
  ])
  
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
      title: 'Dasbor & Laporan',
      icon: LayoutDashboard,
      items: [
        { name: 'Dasbor Utama', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'sekretaris', 'bendahara', 'panitia', 'ketua', 'wakil_ketua', 'koordinator', 'admin_media', 'admin_umkm', 'pembina'] },
        { name: 'Ringkasan Organisasi', href: '/dashboard/ringkasan', icon: PieChart, roles: ['admin', 'ketua', 'wakil_ketua', 'pembina'] },
        { name: 'Dashboard Analitik', href: '/dashboard/analitik', icon: PieChart, roles: ['admin', 'ketua'] },
        { name: 'Dashboard Event', href: '/dashboard/events/dashboard', icon: BarChart, roles: ['admin', 'sekretaris', 'ketua', 'panitia'] },
        { name: 'Laporan Keuangan', href: '/dashboard/laporan', icon: FileSpreadsheet, roles: ['admin', 'bendahara', 'ketua', 'wakil_ketua', 'pembina'] },
        { name: 'Realisasi Anggaran', href: '/dashboard/transparansi/realisasi', icon: PieChart, roles: ['admin', 'bendahara'] },
      ]
    },
    {
      title: 'Manajemen Organisasi',
      icon: Users,
      items: [
        { name: 'Profil & AD/ART', href: '/dashboard/organisasi/profil', icon: Info, roles: ['admin', 'sekretaris'] },
        { name: 'Struktur & Periode', href: '/dashboard/organisasi/struktur', icon: Users, roles: ['admin', 'sekretaris'] },
        { name: 'Data Pembina', href: '/dashboard/organisasi/pembina', icon: Award, roles: ['admin', 'sekretaris'] },
        { name: 'Data Anggota', href: '/dashboard/anggota/data', icon: Users, roles: ['admin', 'sekretaris', 'ketua'] },
        { name: 'Data Kepengurusan', href: '/dashboard/anggota', icon: Users, roles: ['admin', 'sekretaris', 'ketua'] },
        { name: 'Data Warga', href: '/dashboard/warga', icon: HomeIcon, roles: ['admin', 'sekretaris', 'bendahara'] },
        { name: 'KTA Digital', href: '/dashboard/anggota/kta', icon: CreditCard, roles: ['admin', 'sekretaris'] },
        { name: 'Absensi Anggota', href: '/dashboard/anggota/absensi', icon: CheckSquare, roles: ['admin', 'sekretaris'] },
      ]
    },
    {
      title: 'Program & Layanan',
      icon: Calendar,
      items: [
        { name: 'Daftar Proker', href: '/dashboard/proker', icon: FileText, roles: ['admin', 'koordinator', 'ketua'] },
        { name: 'Timeline Proker', href: '/dashboard/proker/timeline', icon: Calendar, roles: ['admin', 'koordinator'] },
        { name: 'Acara / Event', href: '/dashboard/events', icon: Flag, roles: ['admin', 'sekretaris', 'panitia'] },
        { name: 'Katalog Lomba', href: '/dashboard/lomba', icon: Trophy, roles: ['admin', 'sekretaris', 'panitia'] },
        { name: 'Kepanitiaan', href: '/dashboard/acara/panitia', icon: Users, roles: ['admin', 'sekretaris', 'panitia'] },
        { name: 'Sertifikat Digital', href: '/dashboard/acara/sertifikat', icon: Award, roles: ['admin', 'sekretaris', 'panitia'] },
        { name: 'Data BUMKT', href: '/dashboard/bumkt', icon: ShoppingBag, roles: ['admin', 'sekretaris', 'bendahara', 'admin_umkm'] },
        { name: 'Katalog Produk', href: '/dashboard/umkm/produk', icon: FolderOpen, roles: ['admin', 'sekretaris', 'admin_umkm'] },
      ]
    },
    {
      title: 'Keuangan & Aset',
      icon: DollarSign,
      items: [
        { name: 'Kas Masuk', href: '/dashboard/kas-masuk', icon: Wallet, roles: ['admin', 'bendahara'] },
        { name: 'Kas Keluar', href: '/dashboard/kas-keluar', icon: CreditCard, roles: ['admin', 'bendahara'] },
        { name: 'Iuran & Patungan', href: '/dashboard/patungan', icon: DollarSign, roles: ['admin', 'bendahara'] },
        { name: 'Data Sponsor', href: '/dashboard/proposals', icon: FileText, roles: ['admin', 'sekretaris', 'bendahara'] },
        { name: 'Buku Kas Publik', href: '/dashboard/transparansi', icon: FileSpreadsheet, roles: ['admin', 'bendahara', 'ketua'] },
        { name: 'Data Inventaris', href: '/dashboard/inventaris', icon: Briefcase, roles: ['admin', 'sekretaris'] },
        { name: 'Pinjam Barang', href: '/dashboard/inventaris/pinjam', icon: ClipboardList, roles: ['admin', 'sekretaris'] },
      ]
    },
    {
      title: 'Humas & Sistem',
      icon: Settings,
      items: [
        { name: 'Berita & Artikel', href: '/dashboard/berita', icon: Newspaper, roles: ['admin', 'sekretaris', 'admin_media'] },
        { name: 'Pengumuman', href: '/dashboard/pengumuman', icon: Megaphone, roles: ['admin', 'sekretaris', 'admin_media'] },
        { name: 'Galeri Foto', href: '/dashboard/galeri', icon: ImageIcon, roles: ['admin', 'sekretaris', 'admin_media'] },
        { name: 'Dinding Prestasi', href: '/dashboard/hall-of-fame', icon: Award, roles: ['admin', 'sekretaris', 'admin_media'] },
        { name: 'Aspirasi & Forum', href: '/dashboard/publikasi/aspirasi', icon: MessageSquare, roles: ['admin', 'sekretaris', 'ketua'] },
        { name: 'Persuratan', href: '/dashboard/surat', icon: Mail, roles: ['admin', 'sekretaris'] },
        { name: 'Notulen & Rapat', href: '/dashboard/administrasi/rapat', icon: ClipboardList, roles: ['admin', 'sekretaris'] },
        { name: 'Hak Akses', href: '/dashboard/users', icon: Users, roles: ['admin'] },
        { name: 'Pengaturan Web', href: '/dashboard/pengaturan/web', icon: Settings, roles: ['admin'] },
        { name: 'Backup & Log', href: '/dashboard/pengaturan/sistem', icon: FolderOpen, roles: ['admin'] },
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
                  title={group.title}
                  className={`w-full flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 hover:text-slate-600 dark:hover:text-slate-300 transition-colors ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}
                >
                  {isCollapsed && !isMobileOpen ? (
                    <group.icon className="w-5 h-5" />
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
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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

        <main className="flex-1 min-w-0 overflow-auto p-4 md:p-8 bg-slate-50/50 dark:bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
