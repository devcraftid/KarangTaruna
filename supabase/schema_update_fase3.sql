-- ==========================================
-- SCRIPT UPDATE SCHEMA FASE 3: ACARA & KEUANGAN
-- ==========================================

-- 1. MODUL ACARA (EVENTS & KEPANITIAAN)

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('draft', 'published', 'ongoing', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabel Events Utama: Modifikasi tabel events yang sudah ada dari schema_17an
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS lokasi TEXT DEFAULT 'Belum ditentukan';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rundown JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS status event_status DEFAULT 'draft';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Konversi is_active ke status (Optional data migration, tapi kita tambahkan default saja)
-- Pastikan tanggal_mulai dan tanggal_selesai mendukung TIMESTAMP jika sebelumnya DATE
ALTER TABLE public.events ALTER COLUMN tanggal_mulai TYPE TIMESTAMP WITH TIME ZONE USING tanggal_mulai::timestamp with time zone;
ALTER TABLE public.events ALTER COLUMN tanggal_selesai TYPE TIMESTAMP WITH TIME ZONE USING tanggal_selesai::timestamp with time zone;

-- Tabel Kepanitiaan Event
CREATE TABLE IF NOT EXISTS public.event_committees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    divisi TEXT NOT NULL, -- e.g., 'Acara', 'Konsumsi'
    jabatan TEXT NOT NULL, -- e.g., 'Ketua', 'Anggota'
    tugas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(event_id, member_id)
);

-- Tabel Presensi Event
DO $$ BEGIN
    CREATE TYPE event_attendance_status AS ENUM ('hadir', 'izin', 'sakit', 'alpa');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.event_attendances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    waktu_check_in TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    status event_attendance_status DEFAULT 'hadir' NOT NULL,
    metode_check_in TEXT DEFAULT 'manual', -- manual atau qr
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(event_id, member_id)
);

-- 2. MODUL KEUANGAN (SPONSORSHIP & PROPOSALS)
-- Catatan: Tabel proposals sudah ada di schema_17an.sql. Kita tambahkan tabel 'sponsors' 
-- sebagai database mitra/perusahaan (CRM Sponsor).

DO $$ BEGIN
    CREATE TYPE potensi_sponsor AS ENUM ('Rendah', 'Sedang', 'Tinggi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_perusahaan TEXT NOT NULL,
    bidang_industri TEXT NOT NULL,
    kontak_person TEXT,
    nomor_hp TEXT,
    email TEXT,
    alamat TEXT,
    tingkat_potensi potensi_sponsor DEFAULT 'Sedang' NOT NULL,
    penanggung_jawab TEXT,
    dokumen_mou TEXT,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- RLS POLICIES (Security)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Standard Public/Admin Policies untuk Fase 3
CREATE POLICY "Public select events" ON public.events FOR SELECT USING (status IN ('published', 'ongoing', 'completed'));
CREATE POLICY "Admin manage events" ON public.events FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

CREATE POLICY "Public select committees" ON public.event_committees FOR SELECT USING (true);
CREATE POLICY "Admin manage committees" ON public.event_committees FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

CREATE POLICY "Public select event_attendances" ON public.event_attendances FOR SELECT USING (true);
CREATE POLICY "Admin manage event_attendances" ON public.event_attendances FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

CREATE POLICY "Admin manage sponsors" ON public.sponsors FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris', 'bendahara'));

