-- SCHEMA UPDATE FASE 11
-- Keuangan Publik & Ekosistem UMKM Warga

-- 1. Tabel Profil UMKM Warga
CREATE TABLE IF NOT EXISTS public.umkm_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_usaha TEXT NOT NULL,
    pemilik_id UUID REFERENCES public.members(id) ON DELETE SET NULL, -- Relasi ke anggota (opsional)
    nama_pemilik TEXT, -- Fallback jika bukan anggota
    kategori TEXT NOT NULL, -- cth: 'Kuliner', 'Jasa', 'Kerajinan'
    alamat TEXT,
    kontak TEXT,
    deskripsi TEXT,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Memodifikasi tabel products agar berelasi dengan umkm_profiles
-- Tambahkan umkm_id ke products jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='umkm_id') THEN
        ALTER TABLE public.products ADD COLUMN umkm_id UUID REFERENCES public.umkm_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Tabel Laporan Penjualan UMKM
CREATE TABLE IF NOT EXISTS public.umkm_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    umkm_id UUID NOT NULL REFERENCES public.umkm_profiles(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    total_penjualan DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_transaksi INTEGER NOT NULL DEFAULT 0,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup RLS untuk tabel-tabel baru
ALTER TABLE public.umkm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umkm_sales ENABLE ROW LEVEL SECURITY;

-- Policy UMKM Profiles
CREATE POLICY "Enable all access for authenticated users (umkm)" ON public.umkm_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable read for public (umkm)" ON public.umkm_profiles FOR SELECT TO public USING (true);

-- Policy UMKM Sales
CREATE POLICY "Enable all access for authenticated users (umkm_sales)" ON public.umkm_sales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable read for public (umkm_sales)" ON public.umkm_sales FOR SELECT TO public USING (true);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
