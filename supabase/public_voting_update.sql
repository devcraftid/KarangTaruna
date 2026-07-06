-- 1. Hapus SEMUA Policy lama terlebih dahulu agar tidak mengunci kolom
DROP POLICY IF EXISTS "Users can vote" ON public.poll_votes;
DROP POLICY IF EXISTS "Users can view own vote" ON public.poll_votes;
DROP POLICY IF EXISTS "Admin can view all votes" ON public.poll_votes;
DROP POLICY IF EXISTS "Public can view votes" ON public.poll_votes;
DROP POLICY IF EXISTS "Public can insert votes" ON public.poll_votes;
DROP POLICY IF EXISTS "Admin can manage votes" ON public.poll_votes;

-- 2. Hapus foreign key lama yang mengikat voter_id ke auth.users
ALTER TABLE public.poll_votes DROP CONSTRAINT IF EXISTS poll_votes_voter_id_fkey;

-- 3. Ubah tipe data voter_id dari UUID ke TEXT agar bisa menampung NIK
ALTER TABLE public.poll_votes ALTER COLUMN voter_id TYPE TEXT;

-- 4. Tambahkan kolom voter_name untuk menyimpan Nama Pemilih
ALTER TABLE public.poll_votes ADD COLUMN IF NOT EXISTS voter_name TEXT;

-- 5. Buat Policy baru untuk mengizinkan publik
CREATE POLICY "Public can view votes" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Public can insert votes" ON public.poll_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can manage votes" ON public.poll_votes FOR ALL USING (public.get_auth_role() = 'admin');

-- 6. Refresh Cache API
NOTIFY pgrst, 'reload schema';
