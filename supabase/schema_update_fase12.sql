-- ==========================================
-- SCRIPT UPDATE SCHEMA FASE 12: ASPEK LEGALITAS
-- ==========================================

-- Tambahkan kolom legalitas_sk dan legalitas_npwp ke site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS legalitas_sk TEXT,
ADD COLUMN IF NOT EXISTS legalitas_npwp TEXT;

-- (Pusat Unduhan Publik akan menggunakan tabel public.documents yang sudah ada)
