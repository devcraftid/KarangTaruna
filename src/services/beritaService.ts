import { supabase } from '@/lib/supabase'

export const beritaService = {
  async getBerita() {
    const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  async createBerita(data: any) {
    const { data: res, error } = await supabase.from('news').insert(data).select().single()
    if (error) throw error
    return res
  },
  async updateBerita(id: string, data: any) {
    const { data: res, error } = await supabase.from('news').update(data).eq('id', id).select().single()
    if (error) throw error
    return res
  },
  async deleteBerita(id: string) {
    const { error } = await supabase.from('news').delete().eq('id', id)
    if (error) throw error
  }
}
