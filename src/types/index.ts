export interface PatunganCampaign {
  id: string
  judul: string
  deskripsi: string
  target_dana: number
  batas_waktu: string
  status: 'active' | 'completed' | 'cancelled'
  gambar?: string
  created_by?: string
  created_at?: string
  terkumpul?: number // Computed field if needed later, or handled in UI
}

export interface PatunganContribution {
  id: string
  campaign_id: string
  nama_donatur: string
  nominal: number
  tanggal: string
  metode_pembayaran: string
  status: 'pending' | 'verified' | 'rejected'
  bukti_transfer?: string
  keterangan?: string
  created_at?: string
  patungan_campaigns?: {
    judul: string
  }
}

export interface Letter {
  id: string
  nomor_surat: string
  jenis_surat: 'masuk' | 'keluar'
  tanggal: string
  pihak_terkait: string
  perihal: string
  file_url?: string
  keterangan?: string
  created_by?: string
  created_at?: string
}

export interface InventoryItem {
  id: string
  nama_barang: string
  jumlah: number
  kondisi: 'baik' | 'rusak' | 'hilang'
  lokasi?: string
  keterangan?: string
  gambar?: string
  created_at?: string
}

export interface InventoryLoan {
  id: string
  item_id: string
  peminjam: string
  jumlah: number
  tanggal_pinjam: string
  tanggal_kembali?: string
  status: 'dipinjam' | 'dikembalikan' | 'terlambat'
  keterangan?: string
  created_by?: string
  created_at?: string
  inventory_items?: {
    nama_barang: string
  }
}

export interface WorkProgram {
  id: string
  nama_program: string
  deskripsi?: string
  tanggal_mulai: string
  tanggal_selesai: string
  penanggung_jawab?: string
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled'
  created_at?: string
}

export interface Attendance {
  id: string
  program_id: string
  member_id: string
  status: 'hadir' | 'izin' | 'sakit' | 'alpa'
  waktu_absen: string
  members?: {
    nama: string
  }
  work_programs?: {
    nama_program: string
  }
}

export interface Poll {
  id: string
  judul: string
  deskripsi?: string
  tanggal_mulai: string
  tanggal_selesai: string
  status: 'active' | 'closed'
  created_by?: string
  created_at?: string
}

export interface PollOption {
  id: string
  poll_id: string
  teks_opsi: string
  gambar?: string
  created_at?: string
}

export interface PollVote {
  id: string
  poll_id: string
  option_id: string
  voter_id: string
  created_at?: string
}

export interface Product {
  id: string
  nama_produk: string
  deskripsi?: string
  harga: number
  stok: number
  gambar?: string
  is_active: boolean
  created_by?: string
  created_at?: string
}

export interface Event {
  id: string
  nama_acara: string
  deskripsi?: string
  tanggal_mulai: string
  tanggal_selesai: string
  lokasi: string
  rundown?: any[]
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  banner_url?: string
  created_by?: string
  created_at?: string
}

export interface EventCommittee {
  id: string
  event_id: string
  member_id: string
  divisi: string
  jabatan: string
  tugas?: string
  created_at?: string
  members?: { nama: string }
}

export interface EventAttendance {
  id: string
  event_id: string
  member_id: string
  waktu_check_in: string
  status: 'hadir' | 'izin' | 'sakit' | 'alpa'
  metode_check_in: string
  created_at?: string
  members?: { nama: string }
}

export interface Sponsorship {
  id: string
  event_id?: string
  nama_instansi: string
  kontak_person?: string
  nomor_hp?: string
  target_dana: number
  dana_realisasi: number
  status: 'draft' | 'dikirim' | 'ditolak' | 'disetujui'
  proposal_url?: string
  catatan?: string
  created_by?: string
  created_at?: string
  events?: { nama_acara: string }
}

export interface Household {
  id: string
  kepala_keluarga: string
  nomor_rumah: string
  rt: string
  rw: string
  blok?: string
  keterangan?: string
  created_at?: string
}

export interface HouseholdDue {
  id: string
  household_id: string
  event_id: string
  nominal: number
  status: 'pending' | 'verified' | 'rejected'
  tanggal_bayar?: string
  keterangan?: string
  penerima?: string
  created_at?: string
  households?: Household
  events?: Event
}

export interface Proposal {
  id: string
  event_id: string
  instansi_tujuan: string
  kontak_person?: string
  nomor_hp?: string
  tanggal_kirim: string
  status: 'dikirim' | 'follow_up' | 'diterima' | 'ditolak'
  nominal_cair?: number
  keterangan?: string
  file_proposal?: string
  pic?: string
  created_at?: string
  events?: Event
}

export interface AuditLog {
  id: string
  table_name: string
  record_id: string
  action: string
  old_data?: any
  new_data?: any
  changed_by?: string
  created_at?: string
}

export interface Sponsor {
  id: string
  nama_perusahaan: string
  bidang_industri: string
  kontak_person?: string
  nomor_hp?: string
  email?: string
  alamat?: string
  tingkat_potensi: 'Tinggi' | 'Sedang' | 'Rendah'
  penanggung_jawab?: string
  dokumen_mou?: string
  keterangan?: string
  created_at?: string
}

export interface HallOfFameEntry {
  id: string
  kategori: 'ketua' | 'pengurus_terbaik' | 'anggota_inspiratif' | 'prestasi' | 'juara_lomba' | 'sejarah'
  judul: string
  deskripsi?: string
  tahun: string
  foto_url?: string
  created_at?: string
}

export interface Product {
  id: string
  nama: string
  kategori: string
  harga: number
  deskripsi?: string
  gambar_url?: string
  is_active: boolean
  created_at?: string
}
