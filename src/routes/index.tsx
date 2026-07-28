import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import Home from '@/pages/public/Home'
import Login from '@/pages/auth/Login'
import Transparansi from '@/pages/public/Transparansi'
import LombaPublik from '@/pages/public/LombaPublik'
import InformasiPublik from '@/pages/public/InformasiPublik'
import BeritaDetail from '@/pages/public/BeritaDetail'
import GaleriPublik from '@/pages/public/GaleriPublik'
import EventDetail from '@/pages/public/EventDetail'
import PanitiaPublik from '@/pages/public/PanitiaPublik'
import PatunganPublik from '@/pages/public/Patungan'
import PatunganDetail from '@/pages/public/PatunganDetail'
import Etalase from '@/pages/public/Etalase'
import VotingPublik from '@/pages/public/VotingPublik'
import HallOfFamePublik from '@/pages/public/HallOfFame'
import TentangKami from '@/pages/public/TentangKami'
import KepengurusanPublik from '@/pages/public/KepengurusanPublik'
import ProgramKerjaPublik from '@/pages/public/ProgramKerjaPublik'
import Faq from '@/pages/public/Faq'
import Kontak from '@/pages/public/Kontak'
import AspirasiPublik from '@/pages/public/AspirasiPublik'
import DokumenPublik from '@/pages/public/DokumenPublik'
import NotFound from '@/pages/public/NotFound'
import PendaftaranPublik from '@/pages/public/PendaftaranPublik'

import DashboardHome from '@/pages/dashboard/DashboardHome'
import UnderConstruction from '@/pages/dashboard/UnderConstruction'
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
import HallOfFameDashboard from '@/pages/dashboard/hall-of-fame'

// New Modules Placeholder Imports
import ProfilOrganisasi from '@/pages/dashboard/organisasi/profil'
import StrukturOrganisasi from '@/pages/dashboard/organisasi/struktur'
import PembinaOrganisasi from '@/pages/dashboard/organisasi/pembina'
import DataAnggota from '@/pages/dashboard/anggota/data'
import KtaDigital from '@/pages/dashboard/anggota/kta'
import AbsensiAnggota from '@/pages/dashboard/anggota/absensi'
import Kepanitiaan from '@/pages/dashboard/acara/panitia'
import PresensiEvent from '@/pages/dashboard/acara/presensi'
import SertifikatDigital from '@/pages/dashboard/acara/sertifikat'
import Rapat from '@/pages/dashboard/administrasi/rapat'
import Dokumen from '@/pages/dashboard/administrasi/dokumen'
import Aspirasi from '@/pages/dashboard/publikasi/aspirasi'
import Forum from '@/pages/dashboard/publikasi/forum'
import ProdukUmkm from '@/pages/dashboard/umkm/produk'
import Analitik from '@/pages/dashboard/analitik'
import ExportLaporan from '@/pages/dashboard/laporan/export'
import ProfilWeb from '@/pages/dashboard/pengaturan/web'
import AksesSistem from '@/pages/dashboard/pengaturan/akses'
import BackupSistem from '@/pages/dashboard/pengaturan/sistem'
import RingkasanOrganisasi from '@/pages/dashboard/ringkasan'
import UsersManagement from '@/pages/dashboard/users'
import UsersActivity from '@/pages/dashboard/users/activity'
import DashboardEvent from '@/pages/dashboard/events/dashboard'
import TimelineProker from '@/pages/dashboard/proker/timeline'
import TransparansiDashboard from '@/pages/dashboard/transparansi'
import RealisasiAnggaran from '@/pages/dashboard/transparansi/realisasi'
import LaporanUmkm from '@/pages/dashboard/umkm/laporan'
import PinjamInventaris from '@/pages/dashboard/inventaris/pinjam'

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
        path: 'lomba/:id',
        element: <EventDetail />,
      },
      {
        path: 'informasi',
        element: <InformasiPublik />,
      },
      {
        path: 'informasi/:id',
        element: <BeritaDetail />,
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
      },
      {
        path: 'hall-of-fame',
        element: <HallOfFamePublik />,
      },
      {
        path: 'tentang',
        element: <TentangKami />,
      },
      {
        path: 'kepengurusan',
        element: <KepengurusanPublik />,
      },
      {
        path: 'program-kerja',
        element: <ProgramKerjaPublik />,
      },
      {
        path: 'faq',
        element: <Faq />,
      },
      {
        path: 'kontak',
        element: <Kontak />,
      },
      {
        path: 'aspirasi',
        element: <AspirasiPublik />,
      },
      {
        path: 'dokumen',
        element: <DokumenPublik />,
      },
      {
        path: 'pendaftaran',
        element: <PendaftaranPublik />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
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
      },
      {
        path: 'hall-of-fame',
        element: <HallOfFameDashboard />,
      },
      // New Routes
      {
        path: 'organisasi/profil',
        element: <ProfilOrganisasi />,
      },
      {
        path: 'organisasi/struktur',
        element: <StrukturOrganisasi />,
      },
      {
        path: 'organisasi/pembina',
        element: <PembinaOrganisasi />,
      },
      {
        path: 'anggota/data',
        element: <DataAnggota />,
      },
      {
        path: 'anggota/kta',
        element: <KtaDigital />,
      },
      {
        path: 'anggota/absensi',
        element: <AbsensiAnggota />,
      },
      {
        path: 'acara/panitia',
        element: <Kepanitiaan />,
      },
      {
        path: 'acara/presensi',
        element: <PresensiEvent />,
      },
      {
        path: 'acara/sertifikat',
        element: <SertifikatDigital />,
      },
      {
        path: 'administrasi/rapat',
        element: <Rapat />,
      },
      {
        path: 'administrasi/dokumen',
        element: <Dokumen />,
      },
      {
        path: 'publikasi/aspirasi',
        element: <Aspirasi />,
      },
      {
        path: 'publikasi/forum',
        element: <Forum />,
      },
      {
        path: 'umkm/produk',
        element: <ProdukUmkm />,
      },
      {
        path: 'analitik',
        element: <Analitik />,
      },
      {
        path: 'laporan/export',
        element: <ExportLaporan />,
      },
      {
        path: 'pengaturan/web',
        element: <ProfilWeb />,
      },
      {
        path: 'pengaturan/akses',
        element: <AksesSistem />,
      },
      {
        path: 'pengaturan/sistem',
        element: <BackupSistem />,
      },
      {
        path: 'ringkasan',
        element: <RingkasanOrganisasi />,
      },
      {
        path: 'users',
        element: <UsersManagement />,
      },
      {
        path: 'users/activity',
        element: <UsersActivity />,
      },
      {
        path: 'events/dashboard',
        element: <DashboardEvent />,
      },
      {
        path: 'proker/timeline',
        element: <TimelineProker />,
      },
      {
        path: 'transparansi',
        element: <TransparansiDashboard />,
      },
      {
        path: 'transparansi/realisasi',
        element: <RealisasiAnggaran />,
      },
      {
        path: 'umkm/laporan',
        element: <LaporanUmkm />,
      },
      {
        path: 'inventaris/pinjam',
        element: <PinjamInventaris />,
      },
      {
        path: '*',
        element: <UnderConstruction />,
      }
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />
}
