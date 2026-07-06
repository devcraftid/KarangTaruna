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
