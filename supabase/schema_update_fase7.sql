-- SCHEMA UPDATE FASE 7
-- Menambahkan kolom kepanitiaan pada tabel members yang sebelumnya belum ada

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS is_panitia BOOLEAN DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS jabatan TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS divisi TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Refresh schema cache dengan perintah ringan agar aplikasi langsung membacanya
NOTIFY pgrst, 'reload schema';
