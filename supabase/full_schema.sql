-- ==========================================
-- SCRIPT FULL SCHEMA: SISTEM INFORMASI KARANG TARUNA
-- Gabungan dari schema utama, update fitur, dan storage
-- Silakan jalankan script ini di SQL Editor Supabase Anda
-- ==========================================

-- Enum Types (Utama)
CREATE TYPE user_role AS ENUM ('admin', 'sekretaris', 'bendahara');
CREATE TYPE competition_status AS ENUM ('draft', 'published', 'completed');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE transaction_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE patungan_status AS ENUM ('active', 'completed', 'cancelled');

-- Enum Types (Tambahan / Update)
CREATE TYPE letter_type AS ENUM ('masuk', 'keluar');
CREATE TYPE inventory_condition AS ENUM ('baik', 'rusak', 'hilang');
CREATE TYPE loan_status AS ENUM ('dipinjam', 'dikembalikan', 'terlambat');
CREATE TYPE proker_status AS ENUM ('planned', 'ongoing', 'completed', 'cancelled');
CREATE TYPE attendance_status AS ENUM ('hadir', 'izin', 'sakit', 'alpa');
CREATE TYPE poll_status AS ENUM ('active', 'closed');

-- 1. Profiles Table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    fullname TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role user_role DEFAULT 'sekretaris' NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Trigger to create profile after sign up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, fullname, email, role)
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'fullname', 'Pengguna Baru'), 
        COALESCE(new.email, 'user_' || new.id || '@example.com'), 
        'sekretaris'::user_role
    );
    RETURN new;
EXCEPTION
    WHEN OTHERS THEN
        RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Members Table
CREATE TABLE public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama TEXT NOT NULL,
    nik TEXT UNIQUE NOT NULL,
    jenis_kelamin TEXT NOT NULL,
    tanggal_lahir DATE NOT NULL,
    alamat TEXT NOT NULL,
    rt TEXT NOT NULL,
    rw TEXT NOT NULL,
    nomor_hp TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Competitions Table
CREATE TABLE public.competitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_lomba TEXT NOT NULL,
    kategori TEXT NOT NULL,
    lokasi TEXT NOT NULL,
    tanggal DATE NOT NULL,
    jam TIME NOT NULL,
    maksimal_peserta INTEGER NOT NULL,
    status competition_status DEFAULT 'draft' NOT NULL,
    deskripsi TEXT,
    pemenang TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. Registrations Table
CREATE TABLE public.registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
    status registration_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(member_id, competition_id)
);

-- 4.b Pengawas Lomba Table
CREATE TABLE public.pengawas_lomba (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_lengkap TEXT NOT NULL,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. Income Categories
CREATE TABLE public.income_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. Expense Categories
CREATE TABLE public.expense_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. Income
CREATE TABLE public.income (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.income_categories(id) ON DELETE SET NULL,
    nama_donatur TEXT NOT NULL,
    jenis_donatur TEXT NOT NULL,
    nominal NUMERIC NOT NULL,
    tanggal DATE NOT NULL,
    metode_pembayaran TEXT NOT NULL,
    status transaction_status DEFAULT 'pending' NOT NULL,
    bukti_transfer TEXT,
    keterangan TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 8. Expenses
CREATE TABLE public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
    nama_pengeluaran TEXT NOT NULL,
    nominal NUMERIC NOT NULL,
    tanggal DATE NOT NULL,
    bukti_nota TEXT,
    keterangan TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 9. Announcements
CREATE TABLE public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    gambar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 10. Gallery
CREATE TABLE public.gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    foto TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 11. News
CREATE TABLE public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 12. Patungan Campaigns
CREATE TABLE public.patungan_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    deskripsi TEXT NOT NULL,
    target_dana NUMERIC NOT NULL,
    batas_waktu DATE NOT NULL,
    status patungan_status DEFAULT 'active' NOT NULL,
    gambar TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 13. Patungan Contributions
CREATE TABLE public.patungan_contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.patungan_campaigns(id) ON DELETE CASCADE NOT NULL,
    nama_donatur TEXT NOT NULL,
    nominal NUMERIC NOT NULL,
    tanggal DATE NOT NULL,
    metode_pembayaran TEXT NOT NULL,
    status transaction_status DEFAULT 'pending' NOT NULL,
    bukti_transfer TEXT,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 14. Administrasi & Surat (E-Surat)
CREATE TABLE public.letters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nomor_surat TEXT NOT NULL,
    jenis_surat letter_type NOT NULL,
    tanggal DATE NOT NULL,
    pihak_terkait TEXT NOT NULL,
    perihal TEXT NOT NULL,
    file_url TEXT,
    keterangan TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 15. Manajemen Inventaris & Peminjaman
CREATE TABLE public.inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_barang TEXT NOT NULL,
    jumlah INTEGER NOT NULL DEFAULT 0,
    kondisi inventory_condition DEFAULT 'baik' NOT NULL,
    lokasi TEXT,
    keterangan TEXT,
    gambar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.inventory_loans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
    peminjam TEXT NOT NULL,
    jumlah INTEGER NOT NULL DEFAULT 1,
    tanggal_pinjam DATE NOT NULL,
    tanggal_kembali DATE,
    status loan_status DEFAULT 'dipinjam' NOT NULL,
    keterangan TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 16. Proker & Absensi
CREATE TABLE public.work_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_program TEXT NOT NULL,
    deskripsi TEXT,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    penanggung_jawab TEXT,
    status proker_status DEFAULT 'planned' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.attendances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    program_id UUID REFERENCES public.work_programs(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    status attendance_status DEFAULT 'hadir' NOT NULL,
    waktu_absen TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(program_id, member_id)
);

-- 17. E-Voting & Polling
CREATE TABLE public.polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    deskripsi TEXT,
    tanggal_mulai TIMESTAMP WITH TIME ZONE NOT NULL,
    tanggal_selesai TIMESTAMP WITH TIME ZONE NOT NULL,
    status poll_status DEFAULT 'active' NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.poll_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    teks_opsi TEXT NOT NULL,
    gambar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
    voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(poll_id, voter_id)
);

-- 18. Etalase BUMKT (Produk)
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_produk TEXT NOT NULL,
    deskripsi TEXT,
    harga NUMERIC NOT NULL,
    stok INTEGER NOT NULL DEFAULT 0,
    gambar TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);


-- RLS POLICIES UTAMA --
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengawas_lomba ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patungan_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patungan_contributions ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FITUR BARU --
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;


-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.get_auth_role() RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Users can read their own profile. Admin can read all.
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR ALL USING (public.get_auth_role() = 'admin');

-- Members: Admin, Sekretaris ALL. Public INSERT and SELECT.
CREATE POLICY "Admin and Sekretaris can manage members" ON public.members FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));
CREATE POLICY "Public can create members" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view members" ON public.members FOR SELECT USING (true);

-- Competitions: Public SELECT (published and completed). Admin, Sekretaris ALL.
CREATE POLICY "Public can view published competitions" ON public.competitions FOR SELECT USING (status IN ('published', 'completed'));
CREATE POLICY "Admin and Sekretaris can manage competitions" ON public.competitions FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

-- Registrations: Public INSERT and SELECT. Admin, Sekretaris ALL.
CREATE POLICY "Public can create registrations" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view registrations" ON public.registrations FOR SELECT USING (true);
CREATE POLICY "Admin and Sekretaris can manage registrations" ON public.registrations FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

-- Pengawas Lomba: Public SELECT. Admin, Sekretaris ALL.
CREATE POLICY "Public can view pengawas" ON public.pengawas_lomba FOR SELECT USING (true);
CREATE POLICY "Admin and Sekretaris can manage pengawas" ON public.pengawas_lomba FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

-- Income & Expense Categories: Bendahara, Admin ALL.
CREATE POLICY "Bendahara and Admin can manage income categories" ON public.income_categories FOR ALL USING (public.get_auth_role() IN ('admin', 'bendahara'));
CREATE POLICY "Bendahara and Admin can manage expense categories" ON public.expense_categories FOR ALL USING (public.get_auth_role() IN ('admin', 'bendahara'));

-- Income & Expenses: Public SELECT (transparency). Bendahara, Admin ALL.
CREATE POLICY "Public can view verified income" ON public.income FOR SELECT USING (status = 'verified');
CREATE POLICY "Bendahara and Admin can manage income" ON public.income FOR ALL USING (public.get_auth_role() IN ('admin', 'bendahara'));

CREATE POLICY "Public can view expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Bendahara and Admin can manage expenses" ON public.expenses FOR ALL USING (public.get_auth_role() IN ('admin', 'bendahara'));

-- Announcements, Gallery, News: Public SELECT. Admin, Sekretaris ALL.
CREATE POLICY "Public can view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admin and Sekretaris can manage announcements" ON public.announcements FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

CREATE POLICY "Public can view gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Admin and Sekretaris can manage gallery" ON public.gallery FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

CREATE POLICY "Public can view news" ON public.news FOR SELECT USING (true);
CREATE POLICY "Admin and Sekretaris can manage news" ON public.news FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

-- Patungan Campaigns: Public SELECT (active/completed). Admin/Bendahara ALL.
CREATE POLICY "Public can view active campaigns" ON public.patungan_campaigns FOR SELECT USING (status IN ('active', 'completed'));
CREATE POLICY "Admin and Bendahara can manage campaigns" ON public.patungan_campaigns FOR ALL USING (public.get_auth_role() IN ('admin', 'bendahara'));

-- Patungan Contributions: Public INSERT, and SELECT verified. Admin/Bendahara ALL.
CREATE POLICY "Public can create contribution" ON public.patungan_contributions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view verified contribution" ON public.patungan_contributions FOR SELECT USING (status = 'verified');
CREATE POLICY "Admin and Bendahara can manage contributions" ON public.patungan_contributions FOR ALL USING (public.get_auth_role() IN ('admin', 'bendahara'));

-- Letters: Admin, Sekretaris ALL
CREATE POLICY "Admin and Sekretaris can manage letters" ON public.letters FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

-- Inventory: Admin, Sekretaris ALL. Public Select
CREATE POLICY "Public can view inventory" ON public.inventory_items FOR SELECT USING (true);
CREATE POLICY "Admin and Sekretaris can manage inventory" ON public.inventory_items FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));
CREATE POLICY "Public can view loans" ON public.inventory_loans FOR SELECT USING (true);
CREATE POLICY "Admin and Sekretaris can manage loans" ON public.inventory_loans FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

-- Proker: Admin, Sekretaris ALL. Public Select
CREATE POLICY "Public can view proker" ON public.work_programs FOR SELECT USING (true);
CREATE POLICY "Admin and Sekretaris can manage proker" ON public.work_programs FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));
CREATE POLICY "Admin and Sekretaris can manage attendance" ON public.attendances FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

-- E-Voting: All logged in users can vote. Admin can manage.
CREATE POLICY "Public can view polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Admin can manage polls" ON public.polls FOR ALL USING (public.get_auth_role() = 'admin');
CREATE POLICY "Public can view options" ON public.poll_options FOR SELECT USING (true);
CREATE POLICY "Admin can manage options" ON public.poll_options FOR ALL USING (public.get_auth_role() = 'admin');
CREATE POLICY "Users can vote" ON public.poll_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = voter_id);
CREATE POLICY "Users can view own vote" ON public.poll_votes FOR SELECT TO authenticated USING (auth.uid() = voter_id);
CREATE POLICY "Admin can view all votes" ON public.poll_votes FOR SELECT USING (public.get_auth_role() = 'admin');

-- BUMKT: Public Select. Admin, Bendahara ALL
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admin and Bendahara can manage products" ON public.products FOR ALL USING (public.get_auth_role() IN ('admin', 'bendahara'));

-- Realtime Config
ALTER PUBLICATION supabase_realtime ADD TABLE public.income;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patungan_contributions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;

-- ==========================================
-- STORAGE BUCKETS SETUP
-- (Must be executed by a superuser or via Supabase dashboard if RLS blocks it)
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('news', 'news', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('transfer', 'transfer', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('nota', 'nota', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('proposal', 'proposal', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('lpj', 'lpj', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('patungan', 'patungan', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('letters', 'letters', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('inventory', 'inventory', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('bumkt', 'bumkt', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('voting', 'voting', true) ON CONFLICT DO NOTHING;

-- Set up Storage Policies (Allow public to view, allow authenticated users to upload/update/delete)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id IN ('avatars', 'gallery', 'news', 'transfer', 'nota', 'proposal', 'lpj', 'patungan', 'letters', 'inventory', 'bumkt', 'voting') );
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id IN ('avatars', 'gallery', 'news', 'transfer', 'nota', 'proposal', 'lpj', 'patungan', 'letters', 'inventory', 'bumkt', 'voting') );
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id IN ('avatars', 'gallery', 'news', 'transfer', 'nota', 'proposal', 'lpj', 'patungan', 'letters', 'inventory', 'bumkt', 'voting') );
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id IN ('avatars', 'gallery', 'news', 'transfer', 'nota', 'proposal', 'lpj', 'patungan', 'letters', 'inventory', 'bumkt', 'voting') );

-- Khusus Bucket Patungan: izinkan publik upload karena tidak wajib login untuk donasi (form kontribusi publik)
-- Hapus policy lama jika ada (untuk mencegah conflict)
DROP POLICY IF EXISTS "Public Upload Patungan" ON storage.objects;
CREATE POLICY "Public Upload Patungan" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'patungan' );
