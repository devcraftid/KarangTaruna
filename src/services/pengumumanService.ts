import { supabase } from '@/lib/supabase'

export const pengumumanService = {
  async getPengumuman() {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  async createPengumuman(data: any) {
    const { data: res, error } = await supabase.from('announcements').insert(data).select().single()
    if (error) throw error
    return res
  },
  async updatePengumuman(id: string, data: any) {
    const { data: res, error } = await supabase.from('announcements').update(data).eq('id', id).select().single()
    if (error) throw error
    return res
  },
  async deletePengumuman(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) throw error
  }
}
