-- Script untuk menambahkan Storage Bucket 'patungan' dan memperbarui hak aksesnya
-- Silakan jalankan di SQL Editor Supabase

-- 1. Buat bucket 'patungan'
INSERT INTO storage.buckets (id, name, public) VALUES ('patungan', 'patungan', true) ON CONFLICT DO NOTHING;

-- 2. Hapus policy lama jika ada (opsional, untuk mencegah duplikasi jika di-run berulang)
DROP POLICY IF EXISTS "Public Access Patungan" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Patungan" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update Patungan" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete Patungan" ON storage.objects;

-- 3. Izinkan publik melihat gambar (cover campaign & bukti transfer)
CREATE POLICY "Public Access Patungan" ON storage.objects FOR SELECT USING ( bucket_id = 'patungan' );

-- 4. Izinkan publik mengupload file (karena form kontribusi tidak wajib login)
CREATE POLICY "Public Upload Patungan" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'patungan' );

-- 5. Izinkan Admin/Pengurus (yang login) untuk mengupdate dan menghapus file
CREATE POLICY "Auth Update Patungan" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'patungan' );
CREATE POLICY "Auth Delete Patungan" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'patungan' );
