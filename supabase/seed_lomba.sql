-- SCRIPT SEED DATA LOMBA 17 AGUSTUS
-- Menambahkan data lomba berdasarkan catatan tulisan tangan

INSERT INTO public.competitions (
  nama_lomba, kategori, lokasi, tanggal, jam, maksimal_peserta, status, deskripsi, event_id
) VALUES 
-- KATEGORI: IBU-IBU
('Mancing Kerupuk', 'Ibu-Ibu', 'Lapangan Utama RT', '2026-08-17', '15:00:00', 30, 'published', 'Lomba mancing kerupuk khusus untuk ibu-ibu.', '17ad18c5-fd73-4de2-95dd-75f9c32426ba'),
('Injek Balon', 'Ibu-Ibu', 'Lapangan Utama RT', '2026-08-17', '15:30:00', 30, 'published', 'Lomba injak balon keseruan ibu-ibu.', '17ad18c5-fd73-4de2-95dd-75f9c32426ba'),
('Bola Tiup', 'Ibu-Ibu', 'Lapangan Utama RT', '2026-08-17', '16:00:00', 30, 'published', 'Lomba memindahkan bola dengan cara ditiup.', '17ad18c5-fd73-4de2-95dd-75f9c32426ba'),
('Estafet Gelas Balon', 'Ibu-Ibu', 'Lapangan Utama RT', '2026-08-17', '16:30:00', 30, 'published', 'Lomba estafet memindahkan gelas menggunakan balon.', '17ad18c5-fd73-4de2-95dd-75f9c32426ba'),

-- KATEGORI: REMAJA
('Mancing Kerupuk', 'Remaja', 'Lapangan Utama RT', '2026-08-17', '13:00:00', 40, 'published', 'Lomba mancing kerupuk untuk remaja.', '17ad18c5-fd73-4de2-95dd-75f9c32426ba'),
('Balap Karung', 'Remaja', 'Lapangan Utama RT', '2026-08-17', '13:30:00', 40, 'published', 'Lomba balap karung tradisional.', '17ad18c5-fd73-4de2-95dd-75f9c32426ba'),
('Tarbol (Tarik Bola)', 'Remaja', 'Lapangan Utama RT', '2026-08-17', '14:00:00', 40, 'published', 'Lomba tarik bola khusus remaja.', '17ad18c5-fd73-4de2-95dd-75f9c32426ba'),
('Koin Dalam Pepaya', 'Remaja', 'Lapangan Utama RT', '2026-08-17', '14:30:00', 40, 'published', 'Lomba mengambil koin dari dalam pepaya yang digantung.', '17ad18c5-fd73-4de2-95dd-75f9c32426ba'),
('Tepuk Air', 'Remaja', 'Lapangan Utama RT', '2026-08-17', '15:00:00', 40, 'published', 'Lomba memecahkan plastik air dengan mata tertutup.', '17ad18c5-fd73-4de2-95dd-75f9c32426ba'),

-- KATEGORI: ANAK-ANAK
('Masukin Bendera', 'Anak-Anak', 'Lapangan Utama RT', '2026-08-17', '08:00:00', 50, 'published', 'Lomba memindahkan bendera ke dalam botol.', '17ad18c5-fd73-4de2-95dd-75f9c32426ba'),
('Mewarnai', 'Anak-Anak', 'Balai Warga', '2026-08-17', '08:30:00', 50, 'published', 'Lomba mewarnai gambar tema kemerdekaan.', '17ad18c5-fd73-4de2-95dd-75f9c32426ba'),
('Makan Kerupuk', 'Anak-Anak', 'Lapangan Utama RT', '2026-08-17', '09:30:00', 50, 'published', 'Lomba makan kerupuk tradisional anak-anak.', '17ad18c5-fd73-4de2-95dd-75f9c32426ba'),
('Pensil Dalam Botol', 'Anak-Anak', 'Lapangan Utama RT', '2026-08-17', '10:00:00', 50, 'published', 'Lomba memasukkan paku/pensil ke dalam botol.', '17ad18c5-fd73-4de2-95dd-75f9c32426ba');
