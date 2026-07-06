-- Script untuk Mengizinkan Public E-Voting berdasarkan NIK
-- Silakan jalankan script ini di SQL Editor Supabase Anda

-- 1. Hapus foreign key lama yang mengikat voter_id ke auth.users
ALTER TABLE public.poll_votes DROP CONSTRAINT IF EXISTS poll_votes_voter_id_fkey;

-- 2. Ubah tipe data voter_id dari UUID ke TEXT agar bisa menampung NIK
ALTER TABLE public.poll_votes ALTER COLUMN voter_id TYPE TEXT;

-- 3. Tambahkan kolom voter_name untuk menyimpan Nama Pemilih
ALTER TABLE public.poll_votes ADD COLUMN IF NOT EXISTS voter_name TEXT;

-- 4. Hapus Policy (Aturan Keamanan) lama yang mewajibkan login
DROP POLICY IF EXISTS "Users can vote" ON public.poll_votes;
DROP POLICY IF EXISTS "Users can view own vote" ON public.poll_votes;
DROP POLICY IF EXISTS "Admin can view all votes" ON public.poll_votes;
DROP POLICY IF EXISTS "Public can view votes" ON public.poll_votes;
DROP POLICY IF EXISTS "Public can insert votes" ON public.poll_votes;

-- 5. Buat Policy baru untuk mengizinkan publik melihat dan melakukan vote
-- (Karena bersifat publik dan kita mengandalkan NIK untuk mencegah ganda,
-- kita izinkan insert ke publik. NIK ganda akan dicegat oleh UNIQUE constraint di database)
CREATE POLICY "Public can view votes" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Public can insert votes" ON public.poll_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can manage votes" ON public.poll_votes FOR ALL USING (public.get_auth_role() = 'admin');
