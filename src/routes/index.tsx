import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import Home from '@/pages/public/Home'
import Login from '@/pages/auth/Login'
import Transparansi from '@/pages/public/Transparansi'
import LombaPublik from '@/pages/public/LombaPublik'
import InformasiPublik from '@/pages/public/InformasiPublik'
import GaleriPublik from '@/pages/public/GaleriPublik'
import PanitiaPublik from '@/pages/public/PanitiaPublik'

import DashboardHome from '@/pages/dashboard/DashboardHome'
import Anggota from '@/pages/dashboard/anggota'
import Lomba from '@/pages/dashboard/lomba'
import Pendaftaran from '@/pages/dashboard/pendaftaran'
import Pengumuman from '@/pages/dashboard/pengumuman'
import Berita from '@/pages/dashboard/berita'
import Galeri from '@/pages/dashboard/galeri'
import KategoriPemasukan from '@/pages/dashboard/kategori-pemasukan'
import KategoriPengeluaran from '@/pages/dashboard/kategori-pengeluaran'
import KasMasuk from '@/pages/dashboard/kas-masuk'
import KasKeluar from '@/pages/dashboard/kas-keluar'
import Laporan from '@/pages/dashboard/laporan'

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'transparansi',
        element: <Transparansi />,
      },
      {
        path: 'lomba',
        element: <LombaPublik />,
      },
      {
        path: 'informasi',
        element: <InformasiPublik />,
      },
      {
        path: 'galeri',
        element: <GaleriPublik />,
      },
      {
        path: 'panitia',
        element: <PanitiaPublik />,
      },
      {
        path: 'login',
        element: <Login />,
      }
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: 'anggota',
        element: <Anggota />,
      },
      {
        path: 'lomba',
        element: <Lomba />,
      },
      {
        path: 'pendaftaran',
        element: <Pendaftaran />,
      },
      {
        path: 'pengumuman',
        element: <Pengumuman />,
      },
      {
        path: 'berita',
        element: <Berita />,
      },
      {
        path: 'galeri',
        element: <Galeri />,
      },
      {
        path: 'kategori-pemasukan',
        element: <KategoriPemasukan />,
      },
      {
        path: 'kategori-pengeluaran',
        element: <KategoriPengeluaran />,
      },
      {
        path: 'kas-masuk',
        element: <KasMasuk />,
      },
      {
        path: 'kas-keluar',
        element: <KasKeluar />,
      },
      {
        path: 'laporan',
        element: <Laporan />,
      }
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
