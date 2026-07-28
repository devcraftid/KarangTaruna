-- ==========================================
-- UPDATE SCHEMA FASE 4C: UMKM, DONASI, ASPIRASI
-- ==========================================

-- 1. Membuat tabel 'aspirations' (Ruang Aspirasi Warga)
CREATE TABLE IF NOT EXISTS public.aspirations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama TEXT NOT NULL,
    topik TEXT NOT NULL,
    pesan TEXT NOT NULL,
    bukti_foto TEXT,
    status TEXT DEFAULT 'pending', -- pending, diproses, selesai
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Note: Tabel dokumen ('documents') sudah dibuat pada Sub-Fase 2 (Administrasi).
-- Note: Tabel produk UMKM ('products') dan donasi ('crowdfunding' atau 'patungan')
-- asumsikan sudah ada dari modul sebelumnya. Jika belum, admin dapat membuatnya.
