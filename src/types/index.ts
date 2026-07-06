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
