-- ==========================================
-- SCRIPT UPDATE SCHEMA FASE 16: PERBAIKAN KOLOM DOCUMENTS
-- ==========================================

-- Menambahkan kolom yang terlewat pada tabel documents (karena fase 4 menggunakan IF NOT EXISTS dan tabel sudah ada dari fase 2)
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS file_size INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS format TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Refresh PostgREST schema cache agar kolom baru segera dikenali
NOTIFY pgrst, 'reload schema';
