-- ==========================================
-- UPDATE SCHEMA FASE 4B: KONTEN DINAMIS
-- ==========================================

-- 1. Membuat tabel 'news' (Berita)
CREATE TABLE public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    konten TEXT NOT NULL,
    gambar TEXT,
    penulis TEXT DEFAULT 'Admin Karang Taruna',
    kategori TEXT DEFAULT 'Umum',
    dilihat INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Menambahkan tabel 'event_galleries' untuk Galeri
CREATE TABLE public.event_galleries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    judul TEXT NOT NULL,
    deskripsi TEXT,
    gambar TEXT NOT NULL,
    kategori TEXT DEFAULT 'Umum',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Note: Jika butuh dummy data untuk di test, jalankan baris ini:
INSERT INTO public.news (judul, slug, konten, gambar, penulis, kategori) VALUES
('Rapat Persiapan HUT RI', 'rapat-persiapan-hut-ri', 'Panitia telah melaksanakan rapat perdana untuk persiapan perayaan 17 Agustus.', 'https://images.unsplash.com/photo-1577415124269-fc1140a69e91?w=800&q=80', 'Humas', 'Kegiatan'),
('BUMKT Luncurkan Produk Baru', 'bumkt-luncurkan-produk-baru', 'Badan Usaha Milik Karang Taruna resmi meluncurkan produk kerajinan tangan berbahan daur ulang.', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80', 'Ekonomi', 'UMKM');
