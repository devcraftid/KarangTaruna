import { z } from "zod"

export const memberSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK maksimal 16 digit"),
  jenis_kelamin: z.enum(["Laki-laki", "Perempuan"]),
  tanggal_lahir: z.string().min(1, "Tanggal lahir harus diisi"),
  alamat: z.string().min(5, "Alamat terlalu pendek"),
  rt: z.string().min(1, "RT harus diisi"),
  rw: z.string().min(1, "RW harus diisi"),
  nomor_hp: z.string().min(10, "Nomor HP tidak valid").max(15, "Nomor HP tidak valid"),
})

export type MemberFormValues = z.infer<typeof memberSchema>

export const lombaSchema = z.object({
  nama_lomba: z.string().min(1, 'Nama lomba harus diisi'),
  kategori: z.string().min(1, 'Kategori harus diisi'),
  lokasi: z.string().min(1, 'Lokasi harus diisi'),
  tanggal: z.string().min(1, 'Tanggal harus diisi'),
  jam: z.string().min(1, 'Jam harus diisi'),
  maksimal_peserta: z.coerce.number().min(1, 'Minimal 1 peserta'),
  status: z.enum(['draft', 'published', 'completed']),
  deskripsi: z.string().optional(),
  pemenang: z.string().optional(),
})

export type LombaFormValues = z.infer<typeof lombaSchema>

export const kategoriSchema = z.object({
  nama: z.string().min(3, "Nama kategori minimal 3 karakter")
})
export type KategoriFormValues = z.infer<typeof kategoriSchema>

export const kasMasukSchema = z.object({
  category_id: z.string().uuid("Kategori harus dipilih"),
  nama_donatur: z.string().min(3, "Nama donatur minimal 3 karakter"),
  jenis_donatur: z.enum(["Warga", "Perusahaan", "Sponsor", "Lainnya"]),
  nominal: z.coerce.number().min(1000, "Nominal minimal Rp 1.000"),
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  metode_pembayaran: z.string().min(2, "Metode pembayaran harus diisi"),
  status: z.enum(["pending", "verified", "rejected"]).default("verified"),
  bukti_transfer: z.string().optional(),
  keterangan: z.string().optional(),
})
export type KasMasukFormValues = z.infer<typeof kasMasukSchema>

export const kasKeluarSchema = z.object({
  category_id: z.string().uuid("Kategori harus dipilih"),
  nama_pengeluaran: z.string().min(3, "Nama pengeluaran minimal 3 karakter"),
  nominal: z.coerce.number().min(1000, "Nominal minimal Rp 1.000"),
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  bukti_nota: z.string().optional(),
  keterangan: z.string().optional(),
})
export type KasKeluarFormValues = z.infer<typeof kasKeluarSchema>

export const pengumumanSchema = z.object({
  judul: z.string().min(5, "Judul minimal 5 karakter"),
  isi: z.string().min(10, "Isi pengumuman minimal 10 karakter"),
  gambar: z.string().optional()
})
export type PengumumanFormValues = z.infer<typeof pengumumanSchema>

export const pendaftaranSchema = z.object({
  member_id: z.string().uuid("Pilih anggota"),
  competition_id: z.string().uuid("Pilih lomba"),
  status: z.enum(["pending", "approved", "rejected"]).default("pending")
})
export type PendaftaranFormValues = z.infer<typeof pendaftaranSchema>

export const beritaSchema = z.object({
  judul: z.string().min(5, "Judul minimal 5 karakter"),
  isi: z.string().min(20, "Isi berita minimal 20 karakter"),
  thumbnail: z.string().optional()
})
export type BeritaFormValues = z.infer<typeof beritaSchema>

export const galeriSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  foto: z.string().optional()
})
export type GaleriFormValues = z.infer<typeof galeriSchema>
