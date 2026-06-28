import { supabase } from '@/lib/supabase'

export interface Lomba {
  id: string
  nama_lomba: string
  kategori: string
  lokasi: string
  tanggal: string
  jam: string
  maksimal_peserta: number
  status: 'draft' | 'published' | 'completed'
  deskripsi: string
  pemenang?: string
  created_at?: string
}

export const lombaService = {
  // --- Dashboard Methods ---
  async getCompetitions() {
    const { data, error } = await supabase.from('competitions').select(`
      *,
      registrations (count)
    `).order('tanggal', { ascending: false })
    if (error) throw error
    return data
  },
  async createCompetition(data: any) {
    const { data: res, error } = await supabase.from('competitions').insert(data).select().single()
    if (error) throw error
    return res
  },
  async updateCompetition(id: string, data: any) {
    const { data: res, error } = await supabase.from('competitions').update(data).eq('id', id).select().single()
    if (error) throw error
    return res
  },
  async deleteCompetition(id: string) {
    const { error } = await supabase.from('competitions').delete().eq('id', id)
    if (error) throw error
  },

  // --- Public Methods ---
  async getPublicCompetitions() {
    const { data, error } = await supabase.from('competitions')
      .select('*, registrations (count), pengawas_lomba (nama_lengkap)')
      .in('status', ['published', 'completed'])
      .order('tanggal', { ascending: false })
    if (error) throw error
    return data
  },
  async registerPublic(competition_id: string, payload: any) {
    // payload: { nama, jenis_kelamin, umur, rt, rw, nomor_hp }
    const cleanName = payload.nama.toUpperCase().replace(/[^A-Z]/g, '')
    const pseudoNik = `KID-${cleanName}-${payload.umur}-${payload.rt}-${payload.rw}`
    
    // Check if this pseudo-NIK already exists (to avoid duplicate member creation)
    let memberId = ''
    const { data: existingMember } = await supabase.from('members').select('id, nama').eq('nik', pseudoNik).single()
    
    if (existingMember) {
      memberId = existingMember.id
    } else {
      // Create member if not exists
      const birthYear = new Date().getFullYear() - parseInt(payload.umur || '10')
      const tanggal_lahir = `${birthYear}-01-01`
      
      const { data: newMember, error: memberErr } = await supabase.from('members').insert({
        nama: `${payload.nama} (Ortu: ${payload.nama_ortu})`,
        nik: pseudoNik,
        jenis_kelamin: payload.jenis_kelamin,
        tanggal_lahir,
        alamat: `Warga RT ${payload.rt} RW ${payload.rw}`,
        rt: payload.rt,
        rw: payload.rw
      }).select('id').single()

      if (memberErr || !newMember) throw new Error('Gagal mendaftarkan data peserta. Coba lagi.')
      memberId = newMember.id
    }

    // Daftarkan ke lomba
    const { data, error } = await supabase.from('registrations').insert({
      competition_id,
      member_id: memberId,
      status: 'pending'
    }).select().single()

    if (error) {
      if (error.code === '23505') throw new Error('Peserta ini sudah terdaftar di lomba tersebut.')
      throw error
    }
    
    return { ...data, member: { nama: payload.nama } }
  }
}
