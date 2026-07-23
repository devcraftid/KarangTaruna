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
import PatunganPublik from '@/pages/public/Patungan'
import PatunganDetail from '@/pages/public/PatunganDetail'
import Etalase from '@/pages/public/Etalase'
import VotingPublik from '@/pages/public/VotingPublik'

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
import PatunganDashboard from '@/pages/dashboard/patungan'
import VerifikasiKontribusi from '@/pages/dashboard/patungan/kontribusi'
import Surat from '@/pages/dashboard/surat'
import Inventaris from '@/pages/dashboard/inventaris'
import Proker from '@/pages/dashboard/proker'
import Voting from '@/pages/dashboard/voting'
import Bumkt from '@/pages/dashboard/bumkt'
import Events from '@/pages/dashboard/events'
import Warga from '@/pages/dashboard/warga'
import Proposals from '@/pages/dashboard/proposals'

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
      },
      {
        path: 'patungan',
        element: <PatunganPublik />,
      },
      {
        path: 'patungan/:id',
        element: <PatunganDetail />,
      },
      {
        path: 'etalase',
        element: <Etalase />,
      },
      {
        path: 'voting',
        element: <VotingPublik />,
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
        path: 'surat',
        element: <Surat />,
      },
      {
        path: 'inventaris',
        element: <Inventaris />,
      },
      {
        path: 'proker',
        element: <Proker />,
      },
      {
        path: 'voting',
        element: <Voting />,
      },
      {
        path: 'bumkt',
        element: <Bumkt />,
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
      },
      {
        path: 'patungan',
        element: <PatunganDashboard />,
      },
      {
        path: 'patungan/kontribusi',
        element: <VerifikasiKontribusi />,
      },
      {
        path: 'events',
        element: <Events />,
      },
      {
        path: 'warga',
        element: <Warga />,
      },
      {
        path: 'proposals',
        element: <Proposals />,
      }
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
