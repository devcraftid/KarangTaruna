-- Create Sponsors Table for CRM

CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_perusahaan TEXT NOT NULL,
    bidang_industri TEXT NOT NULL,
    kontak_person TEXT,
    nomor_hp TEXT,
    email TEXT,
    alamat TEXT,
    tingkat_potensi TEXT DEFAULT 'Sedang', -- Tinggi, Sedang, Rendah
    penanggung_jawab TEXT,
    dokumen_mou TEXT,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Policies for sponsors
CREATE POLICY "Enable read access for authenticated users" 
ON public.sponsors FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert access for authenticated users" 
ON public.sponsors FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" 
ON public.sponsors FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" 
ON public.sponsors FOR DELETE 
TO authenticated 
USING (true);
