-- Supabase Schema for Sistem Informasi Karang Taruna

-- Enum Types
CREATE TYPE user_role AS ENUM ('admin', 'sekretaris', 'bendahara');
CREATE TYPE competition_status AS ENUM ('draft', 'published', 'completed');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE transaction_status AS ENUM ('pending', 'verified', 'rejected');

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

-- RLS POLICIES --
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

-- Realtime Config
ALTER PUBLICATION supabase_realtime ADD TABLE public.income;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;

-- Storage Buckets Setup (Must be executed by a superuser or via Supabase dashboard if RLS blocks it)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('news', 'news', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('transfer', 'transfer', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('nota', 'nota', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('proposal', 'proposal', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('lpj', 'lpj', true) ON CONFLICT DO NOTHING;

-- Set up Storage Policies (Allow public to view, allow authenticated users to upload/update/delete)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id IN ('avatars', 'gallery', 'news', 'transfer', 'nota', 'proposal', 'lpj') );
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id IN ('avatars', 'gallery', 'news', 'transfer', 'nota', 'proposal', 'lpj') );
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id IN ('avatars', 'gallery', 'news', 'transfer', 'nota', 'proposal', 'lpj') );
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id IN ('avatars', 'gallery', 'news', 'transfer', 'nota', 'proposal', 'lpj') );
