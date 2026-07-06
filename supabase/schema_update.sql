-- ==========================================
-- SCRIPT UPDATE SCHEMA: 5 FITUR BARU
-- Silakan jalankan script ini di SQL Editor Supabase Anda
-- ==========================================

-- ENUMS BARU
CREATE TYPE letter_type AS ENUM ('masuk', 'keluar');
CREATE TYPE inventory_condition AS ENUM ('baik', 'rusak', 'hilang');
CREATE TYPE loan_status AS ENUM ('dipinjam', 'dikembalikan', 'terlambat');
CREATE TYPE proker_status AS ENUM ('planned', 'ongoing', 'completed', 'cancelled');
CREATE TYPE attendance_status AS ENUM ('hadir', 'izin', 'sakit', 'alpa');
CREATE TYPE poll_status AS ENUM ('active', 'closed');

-- 1. Administrasi & Surat (E-Surat)
CREATE TABLE public.letters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nomor_surat TEXT NOT NULL,
    jenis_surat letter_type NOT NULL,
    tanggal DATE NOT NULL,
    pihak_terkait TEXT NOT NULL, -- Pengirim jika masuk, Tujuan jika keluar
    perihal TEXT NOT NULL,
    file_url TEXT,
    keterangan TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Manajemen Inventaris & Peminjaman
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

-- 3. Proker & Absensi
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

-- 4. E-Voting & Polling
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

-- 5. Etalase BUMKT (Produk)
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


-- ==========================================
-- RLS POLICIES
-- ==========================================
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

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

-- ==========================================
-- STORAGE BUCKETS
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('letters', 'letters', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('inventory', 'inventory', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('bumkt', 'bumkt', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('voting', 'voting', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public Access Letters" ON storage.objects FOR SELECT USING ( bucket_id IN ('letters', 'inventory', 'bumkt', 'voting') );
CREATE POLICY "Auth Upload Extra" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id IN ('letters', 'inventory', 'bumkt', 'voting') );
CREATE POLICY "Auth Update Extra" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id IN ('letters', 'inventory', 'bumkt', 'voting') );
CREATE POLICY "Auth Delete Extra" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id IN ('letters', 'inventory', 'bumkt', 'voting') );
