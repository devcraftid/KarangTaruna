-- SCHEMA UPDATE FASE 10
-- Fondasi Manajemen Organisasi & Anggota

-- 1. Tabel Profil Organisasi (Single row biasanya)
CREATE TABLE IF NOT EXISTS public.organization_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_organisasi TEXT NOT NULL DEFAULT 'Karang Taruna',
    visi TEXT,
    misi TEXT,
    sejarah TEXT,
    ad_art TEXT,
    logo_url TEXT,
    cover_url TEXT,
    alamat TEXT,
    email TEXT,
    telepon TEXT,
    instagram TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Periode Kepengurusan
CREATE TABLE IF NOT EXISTS public.organization_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tahun_mulai VARCHAR(4) NOT NULL,
    tahun_selesai VARCHAR(4) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Master Divisi / Bidang
CREATE TABLE IF NOT EXISTS public.organization_divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_divisi TEXT NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Master Pembina
CREATE TABLE IF NOT EXISTS public.organization_advisors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_pembina TEXT NOT NULL,
    jabatan TEXT NOT NULL, -- cth: 'Kepala Desa', 'Tokoh Masyarakat'
    kontak TEXT,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabel Kehadiran / Absensi Anggota
CREATE TABLE IF NOT EXISTS public.member_attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    kegiatan TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('hadir', 'izin', 'sakit', 'alpa')),
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup RLS (Row Level Security) - Basic open access for authenticated users in the dashboard context
ALTER TABLE public.organization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_attendances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users (profiles)" ON public.organization_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable read for public (profiles)" ON public.organization_profiles FOR SELECT TO public USING (true);

CREATE POLICY "Enable all access for authenticated users (periods)" ON public.organization_periods FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable read for public (periods)" ON public.organization_periods FOR SELECT TO public USING (true);

CREATE POLICY "Enable all access for authenticated users (divisions)" ON public.organization_divisions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable read for public (divisions)" ON public.organization_divisions FOR SELECT TO public USING (true);

CREATE POLICY "Enable all access for authenticated users (advisors)" ON public.organization_advisors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable read for public (advisors)" ON public.organization_advisors FOR SELECT TO public USING (true);

CREATE POLICY "Enable all access for authenticated users (attendances)" ON public.member_attendances FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
