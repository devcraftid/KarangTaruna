-- Update schema for Smart Member Management

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS nomor_anggota TEXT UNIQUE;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS pendidikan TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS pekerjaan TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS keahlian TEXT[] DEFAULT '{}';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS minat TEXT[] DEFAULT '{}';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS sertifikat JSONB DEFAULT '[]';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS prestasi JSONB DEFAULT '[]';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS riwayat_kepanitiaan JSONB DEFAULT '[]';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS riwayat_pelatihan JSONB DEFAULT '[]';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS jam_relawan INTEGER DEFAULT 0;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS poin_keaktifan INTEGER DEFAULT 0;
