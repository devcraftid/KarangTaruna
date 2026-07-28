-- SCHEMA UPDATE FASE 9
-- Penambahan Struktur Role Lengkap Organisasi

-- 1. Tambahkan seluruh role yang didefinisikan ke enum user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ketua';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'wakil_ketua';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sekretaris';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'bendahara';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'koordinator';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin_media';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin_umkm';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'pembina';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'anggota';
-- Note: 'panitia' and 'warga' already added in fase 8, keeping them as valid roles.

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
