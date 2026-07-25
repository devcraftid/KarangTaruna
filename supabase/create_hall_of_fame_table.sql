-- Create Hall of Fame Table

CREATE TABLE IF NOT EXISTS public.hall_of_fame (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kategori TEXT NOT NULL, -- 'ketua', 'pengurus_terbaik', 'anggota_inspiratif', 'prestasi', 'juara_lomba', 'sejarah'
    judul TEXT NOT NULL,
    deskripsi TEXT,
    tahun TEXT NOT NULL,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.hall_of_fame ENABLE ROW LEVEL SECURITY;

-- Policies for hall_of_fame
CREATE POLICY "Enable read access for all users" 
ON public.hall_of_fame FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for authenticated users" 
ON public.hall_of_fame FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" 
ON public.hall_of_fame FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" 
ON public.hall_of_fame FOR DELETE 
TO authenticated 
USING (true);
