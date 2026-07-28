-- ==========================================
-- SCRIPT UPDATE SCHEMA FASE 14: PENGATURAN TENTANG KAMI
-- ==========================================

-- Tambahkan kolom pengaturan Tentang Kami ke site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS tentang_judul TEXT,
ADD COLUMN IF NOT EXISTS tentang_deskripsi TEXT,
ADD COLUMN IF NOT EXISTS tentang_gambar TEXT,
ADD COLUMN IF NOT EXISTS visi_teks TEXT,
ADD COLUMN IF NOT EXISTS misi_teks TEXT;

-- Refresh PostgREST schema cache (Supabase API) agar kolom baru dikenali
NOTIFY pgrst, 'reload schema';
