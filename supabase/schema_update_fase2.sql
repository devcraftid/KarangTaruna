-- ==========================================
-- SCRIPT UPDATE SCHEMA FASE 2: ANGGOTA, ORGANISASI, ADMINISTRASI
-- ==========================================

-- 1. MODUL MANAJEMEN ANGGOTA
-- Enum status keanggotaan
DO $$ BEGIN
    CREATE TYPE member_status AS ENUM ('calon', 'aktif', 'alumni', 'nonaktif');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update tabel members
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS status_keanggotaan member_status DEFAULT 'aktif' NOT NULL;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS keahlian TEXT[] DEFAULT '{}';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS minat_bakat TEXT[] DEFAULT '{}';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS foto_kta TEXT;

-- Tabel Prestasi Anggota
CREATE TABLE IF NOT EXISTS public.member_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    nama_prestasi TEXT NOT NULL,
    tahun VARCHAR(4) NOT NULL,
    tingkat TEXT,
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Tabel Riwayat Organisasi
CREATE TABLE IF NOT EXISTS public.member_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    nama_organisasi TEXT NOT NULL,
    jabatan TEXT NOT NULL,
    tahun_mulai VARCHAR(4) NOT NULL,
    tahun_selesai VARCHAR(4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);


-- 2. MODUL ORGANISASI
-- Tabel Profil Organisasi
CREATE TABLE IF NOT EXISTS public.organization_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_organisasi TEXT NOT NULL,
    visi TEXT,
    misi TEXT,
    sejarah TEXT,
    ad_art TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Tabel Periode Kepengurusan
CREATE TABLE IF NOT EXISTS public.organization_periods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tahun_mulai VARCHAR(4) NOT NULL,
    tahun_selesai VARCHAR(4) NOT NULL,
    status TEXT DEFAULT 'aktif', -- aktif / selesai
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Tabel Divisi/Bidang
CREATE TABLE IF NOT EXISTS public.organization_divisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_divisi TEXT NOT NULL UNIQUE,
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Tabel Struktur Organisasi
CREATE TABLE IF NOT EXISTS public.organization_structures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    period_id UUID REFERENCES public.organization_periods(id) ON DELETE CASCADE NOT NULL,
    division_id UUID REFERENCES public.organization_divisions(id) ON DELETE SET NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    jabatan TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Tabel Dewan Pembina
CREATE TABLE IF NOT EXISTS public.organization_advisors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_pembina TEXT NOT NULL,
    jabatan TEXT NOT NULL,
    kontak TEXT,
    foto TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);


-- 3. MODUL ADMINISTRASI
-- Update Tabel Surat (Letters)
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS disposisi_kepada TEXT;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS catatan_disposisi TEXT;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS status_surat TEXT DEFAULT 'diproses';

-- Tabel Jadwal & Notulen Rapat
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    judul_rapat TEXT NOT NULL,
    tanggal TIMESTAMP WITH TIME ZONE NOT NULL,
    lokasi TEXT NOT NULL,
    agenda TEXT NOT NULL,
    notulen_hasil TEXT,
    dokumentasi_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Tabel Dokumen Arsip
DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('proposal', 'lpj', 'sop', 'template', 'lainnya');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipe_dokumen document_type NOT NULL,
    judul TEXT NOT NULL,
    deskripsi TEXT,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);


-- RLS POLICIES (Security)
ALTER TABLE public.member_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Standard Public/Admin Policies (Simplified for Phase 2 Implementation)
CREATE POLICY "Public select achievements" ON public.member_achievements FOR SELECT USING (true);
CREATE POLICY "Admin manage achievements" ON public.member_achievements FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

CREATE POLICY "Public select history" ON public.member_history FOR SELECT USING (true);
CREATE POLICY "Admin manage history" ON public.member_history FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

CREATE POLICY "Public select org_profile" ON public.organization_profiles FOR SELECT USING (true);
CREATE POLICY "Admin manage org_profile" ON public.organization_profiles FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

CREATE POLICY "Public select org_periods" ON public.organization_periods FOR SELECT USING (true);
CREATE POLICY "Admin manage org_periods" ON public.organization_periods FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

CREATE POLICY "Public select org_divisions" ON public.organization_divisions FOR SELECT USING (true);
CREATE POLICY "Admin manage org_divisions" ON public.organization_divisions FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

CREATE POLICY "Public select org_structures" ON public.organization_structures FOR SELECT USING (true);
CREATE POLICY "Admin manage org_structures" ON public.organization_structures FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

CREATE POLICY "Public select org_advisors" ON public.organization_advisors FOR SELECT USING (true);
CREATE POLICY "Admin manage org_advisors" ON public.organization_advisors FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

CREATE POLICY "Public select meetings" ON public.meetings FOR SELECT USING (true);
CREATE POLICY "Admin manage meetings" ON public.meetings FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

CREATE POLICY "Public select documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Admin manage documents" ON public.documents FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));
