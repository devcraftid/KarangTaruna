-- ==========================================
-- SCRIPT UPDATE SCHEMA FASE 15: AUDIT LOGS (LOGIN ACTIVITY)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    ip_address TEXT,
    device_info TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Turn on Realtime for audit_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Izinkan anon/public untuk menambahkan log (berguna untuk mencatat failed logins sebelum terautentikasi)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public insert audit logs" ON public.audit_logs;
    DROP POLICY IF EXISTS "Allow authenticated read audit logs" ON public.audit_logs;
    
    CREATE POLICY "Allow public insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow authenticated read audit logs" ON public.audit_logs FOR SELECT USING (auth.role() = 'authenticated');
END $$;
