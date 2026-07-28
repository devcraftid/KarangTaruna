-- SCHEMA UPDATE FASE 8 (DIPERBARUI)
-- Menambahkan Role Lengkap & Sinkronisasi Hak Akses (Role) dengan Data Anggota

-- 1. Tambahkan nilai 'ketua', 'panitia', dan 'warga' ke enum user_role jika belum ada
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ketua';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'panitia';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'warga';

-- 2. Tambahkan kolom user_id pada tabel members untuk menautkannya ke auth.users (profil aplikasi)
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Fungsi untuk menyinkronkan status panitia dengan role profil
CREATE OR REPLACE FUNCTION public.sync_panitia_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika user_id ditautkan atau status panitia berubah
    IF NEW.user_id IS NOT NULL THEN
        IF NEW.is_panitia = true THEN
            -- Jadikan 'panitia' HANYA JIKA saat ini rolenya adalah 'warga'
            -- (Kita tidak ingin menurunkan derajat 'admin', 'ketua', dsb menjadi 'panitia')
            UPDATE public.profiles 
            SET role = 'panitia'::user_role 
            WHERE id = NEW.user_id 
              AND role = 'warga'::user_role;
        ELSE
            -- Turunkan kembali ke 'warga' jika tadinya 'panitia'
            UPDATE public.profiles 
            SET role = 'warga'::user_role 
            WHERE id = NEW.user_id 
              AND role = 'panitia'::user_role;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Pasang trigger di tabel members
DROP TRIGGER IF EXISTS on_member_panitia_updated ON public.members;
CREATE TRIGGER on_member_panitia_updated
    AFTER UPDATE OF is_panitia, user_id ON public.members
    FOR EACH ROW EXECUTE PROCEDURE public.sync_panitia_role();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
