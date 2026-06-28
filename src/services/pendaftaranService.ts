import { supabase } from '@/lib/supabase'

export const pendaftaranService = {
  async getPendaftaran() {
    const { data, error } = await supabase
      .from('registrations')
      .select('*, members(nama, nik), competitions(nama_lomba)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  async createPendaftaran(data: any) {
    const { data: res, error } = await supabase.from('registrations').insert(data).select().single()
    if (error) throw error
    return res
  },
  async updatePendaftaran(id: string, data: any) {
    const { data: res, error } = await supabase.from('registrations').update(data).eq('id', id).select().single()
    if (error) throw error
    return res
  },
  async deletePendaftaran(id: string) {
    const { error } = await supabase.from('registrations').delete().eq('id', id)
    if (error) throw error
  },

  // --- Pengawas Lomba ---
  async getPengawas() {
    const { data, error } = await supabase
      .from('pengawas_lomba')
      .select('*, competitions(nama_lomba)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  async createPengawas(data: any) {
    const { data: res, error } = await supabase.from('pengawas_lomba').insert(data).select().single()
    if (error) throw error
    return res
  },
  async deletePengawas(id: string) {
    const { error } = await supabase.from('pengawas_lomba').delete().eq('id', id)
    if (error) throw error
  }
}
