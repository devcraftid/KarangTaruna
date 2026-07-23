-- ==========================================
-- SCRIPT UPDATE SCHEMA: SISTEM MANAJEMEN TERPADU 17-AN
-- Silakan jalankan script ini di SQL Editor Supabase Anda
-- ==========================================

-- ENUMS BARU
CREATE TYPE proposal_status AS ENUM ('dikirim', 'follow_up', 'diterima', 'ditolak');

-- 1. Events (Acara / Proyek)
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_acara TEXT NOT NULL,
    deskripsi TEXT,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Modifikasi tabel income & expenses untuk support event_id
ALTER TABLE public.income ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;
ALTER TABLE public.expenses ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;

-- 2. Households (Data Rumah / KK)
CREATE TABLE public.households (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kepala_keluarga TEXT NOT NULL,
    nomor_rumah TEXT NOT NULL,
    rt TEXT NOT NULL,
    rw TEXT NOT NULL,
    blok TEXT,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Modifikasi tabel members untuk terhubung ke households
ALTER TABLE public.members ADD COLUMN household_id UUID REFERENCES public.households(id) ON DELETE SET NULL;

-- 3. Household Dues (Iuran Rumah per Acara)
CREATE TABLE public.household_dues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    nominal NUMERIC NOT NULL DEFAULT 0,
    status transaction_status DEFAULT 'pending' NOT NULL,
    tanggal_bayar DATE,
    keterangan TEXT,
    penerima UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(household_id, event_id)
);

-- 4. Modifikasi Registrations (Bukti Bayar Lomba)
ALTER TABLE public.registrations ADD COLUMN bukti_bayar TEXT;
ALTER TABLE public.registrations ADD COLUMN is_paid BOOLEAN DEFAULT false NOT NULL;

-- 5. Proposals (Tracker Sponsor)
CREATE TABLE public.proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    instansi_tujuan TEXT NOT NULL,
    kontak_person TEXT,
    nomor_hp TEXT,
    tanggal_kirim DATE NOT NULL,
    status proposal_status DEFAULT 'dikirim' NOT NULL,
    nominal_cair NUMERIC DEFAULT 0,
    keterangan TEXT,
    file_proposal TEXT,
    pic UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. Audit Logs (Log Perubahan Keuangan)
CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Triggers for Audit Logs
CREATE OR REPLACE FUNCTION public.log_finance_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD)::jsonb, auth.uid());
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, auth.uid());
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW)::jsonb, auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_income_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.income
    FOR EACH ROW EXECUTE PROCEDURE public.log_finance_changes();

CREATE TRIGGER log_expenses_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.expenses
    FOR EACH ROW EXECUTE PROCEDURE public.log_finance_changes();

CREATE TRIGGER log_household_dues_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.household_dues
    FOR EACH ROW EXECUTE PROCEDURE public.log_finance_changes();

-- RLS POLICIES
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Events: Public SELECT. Admin, Sekretaris ALL
CREATE POLICY "Public can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admin and Sekretaris can manage events" ON public.events FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

-- Households: Public SELECT. Admin, Sekretaris ALL
CREATE POLICY "Public can view households" ON public.households FOR SELECT USING (true);
CREATE POLICY "Admin and Sekretaris can manage households" ON public.households FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris'));

-- Household Dues: Public SELECT. Admin, Sekretaris, Bendahara ALL
CREATE POLICY "Public can view dues" ON public.household_dues FOR SELECT USING (status = 'verified');
CREATE POLICY "Admin, Sekretaris, Bendahara can manage dues" ON public.household_dues FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris', 'bendahara'));

-- Proposals: Admin, Sekretaris, Bendahara ALL
CREATE POLICY "Admin, Sekretaris, Bendahara can manage proposals" ON public.proposals FOR ALL USING (public.get_auth_role() IN ('admin', 'sekretaris', 'bendahara'));

-- Audit Logs: Admin SELECT
CREATE POLICY "Admin can view audit logs" ON public.audit_logs FOR SELECT USING (public.get_auth_role() = 'admin');

-- Realtime Config
ALTER PUBLICATION supabase_realtime ADD TABLE public.household_dues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proposals;

-- Storage Bucket for Bukti Bayar Lomba & Proposals
INSERT INTO storage.buckets (id, name, public) VALUES ('pendaftaran', 'pendaftaran', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('proposals', 'proposals', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public Access Pendaftaran" ON storage.objects FOR SELECT USING ( bucket_id IN ('pendaftaran', 'proposals') );
CREATE POLICY "Public Upload Pendaftaran" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'pendaftaran' );
CREATE POLICY "Auth Upload Proposals" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'proposals' );
CREATE POLICY "Auth Update Extra Buckets" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id IN ('pendaftaran', 'proposals') );
CREATE POLICY "Auth Delete Extra Buckets" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id IN ('pendaftaran', 'proposals') );
