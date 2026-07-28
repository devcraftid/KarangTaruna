-- ==========================================
-- SCRIPT UPDATE SCHEMA FASE 17: AUTH LOGS (LOGIN ACTIVITY)
-- ==========================================
-- Mengganti nama tabel karena audit_logs sudah dipakai untuk sistem lain

CREATE TABLE IF NOT EXISTS public.auth_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    ip_address TEXT,
    device_info TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Turn on Realtime for auth_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.auth_logs;

ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public insert auth logs" ON public.auth_logs;
    DROP POLICY IF EXISTS "Allow authenticated read auth logs" ON public.auth_logs;
    
    CREATE POLICY "Allow public insert auth logs" ON public.auth_logs FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow authenticated read auth logs" ON public.auth_logs FOR SELECT USING (auth.role() = 'authenticated');
END $$;

-- Refresh PostgREST schema cache agar kolom baru segera dikenali
NOTIFY pgrst, 'reload schema';
