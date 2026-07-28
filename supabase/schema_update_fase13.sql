-- ==========================================
-- SCRIPT UPDATE SCHEMA FASE 13: PERBAIKAN SITE SETTINGS & PENGATURAN KETUA (BERANDA)
-- ==========================================

-- 1. Buat tabel site_settings jika sebelumnya belum ada / gagal dibuat
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

-- 2. Pastikan Row Level Security aktif
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Beri akses baca (SELECT) untuk publik dan update (ALL) untuk admin (anonim karena kita belum implementasi auth penuh)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public select settings" ON public.site_settings;
    DROP POLICY IF EXISTS "Allow all for settings" ON public.site_settings;
    CREATE POLICY "Public select settings" ON public.site_settings FOR SELECT USING (true);
    CREATE POLICY "Allow all for settings" ON public.site_settings USING (true);
END $$;

-- 4. Masukkan data default jika tabel kosong
INSERT INTO public.site_settings (alamat_sekretariat)
SELECT 'Jl. Merdeka No. 45, Desa Maju Jaya, Kec. Pembangunan, Jawa Barat 40123'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- 5. Tambahkan kolom-kolom baru (Legalitas dan Profil Ketua)
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS legalitas_sk TEXT,
ADD COLUMN IF NOT EXISTS legalitas_npwp TEXT,
ADD COLUMN IF NOT EXISTS ketua_nama TEXT,
ADD COLUMN IF NOT EXISTS ketua_jabatan TEXT,
ADD COLUMN IF NOT EXISTS ketua_sambutan TEXT,
ADD COLUMN IF NOT EXISTS ketua_foto TEXT;
