-- ==========================================
-- SCRIPT UPDATE SCHEMA FASE 4: PELAYANAN PUBLIK & INFORMASI
-- ==========================================

-- 1. Pendaftaran Anggota Baru (Member Registrations)
DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.member_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_lengkap TEXT NOT NULL,
    email TEXT,
    nomor_whatsapp TEXT NOT NULL,
    tempat_tanggal_lahir TEXT,
    alamat_lengkap TEXT,
    bidang_minat JSONB DEFAULT '[]'::jsonb,
    foto_ktp TEXT,
    pas_foto TEXT,
    status registration_status DEFAULT 'pending' NOT NULL,
    catatan_admin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Pusat Dokumen / Unduhan
DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('template', 'sop', 'proposal', 'lpj', 'lainnya');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    deskripsi TEXT,
    tipe_dokumen document_type DEFAULT 'lainnya' NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER DEFAULT 0, -- dalam bytes
    format TEXT, -- e.g., 'pdf', 'docx'
    is_public BOOLEAN DEFAULT true NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Suara Warga (Aspirasi)
DO $$ BEGIN
    CREATE TYPE aspiration_status AS ENUM ('masuk', 'dibaca', 'diproses', 'selesai');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.aspirations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_pengirim TEXT NOT NULL,
    nomor_whatsapp TEXT,
    pesan TEXT NOT NULL,
    status aspiration_status DEFAULT 'masuk' NOT NULL,
    tanggapan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. Pertanyaan Umum (FAQ)
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pertanyaan TEXT NOT NULL,
    jawaban TEXT NOT NULL,
    urutan INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. Pengaturan Web / Kontak
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alamat_sekretariat TEXT DEFAULT 'Jl. Pemuda Harapan No. 123, Kelurahan Maju Jaya, Jakarta Selatan, 12345',
    nomor_telepon TEXT DEFAULT '(021) 555-0123',
    email TEXT DEFAULT 'kontak@karangtaruna.org',
    jam_operasional TEXT DEFAULT 'Sen - Sab: 09:00 - 17:00',
    link_instagram TEXT,
    link_youtube TEXT,
    link_twitter TEXT,
    link_facebook TEXT,
    link_maps TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Insert Default Settings
INSERT INTO public.site_settings (alamat_sekretariat)
SELECT 'Jl. Merdeka No. 45, Desa Maju Jaya, Kec. Pembangunan, Jawa Barat 40123'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- RLS POLICIES (Security)
ALTER TABLE public.member_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 1. Member Registrations (Public can insert, Admin can all)
CREATE POLICY "Public insert registrations" ON public.member_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage registrations" ON public.member_registrations FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

-- 2. Documents (Public can select if is_public, Admin can all)
CREATE POLICY "Public select public docs" ON public.documents FOR SELECT USING (is_public = true);
CREATE POLICY "Admin manage docs" ON public.documents FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

-- 3. Aspirations (Public can insert, Admin can all)
CREATE POLICY "Public insert aspirations" ON public.aspirations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage aspirations" ON public.aspirations FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris', 'ketua'));

-- 4. FAQs (Public can select active, Admin can all)
CREATE POLICY "Public select active faqs" ON public.faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage faqs" ON public.faqs FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

-- 5. Site Settings (Public can select, Admin can manage)
CREATE POLICY "Public select settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage settings" ON public.site_settings FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));
