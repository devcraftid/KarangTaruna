import { supabase } from '@/lib/supabase'

export const galeriService = {
  async getGaleri() {
    const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  async createGaleri(data: any) {
    // Hack for now since we don't have real file upload in this turn
    if (!data.foto) data.foto = 'placeholder.jpg'
    const { data: res, error } = await supabase.from('gallery').insert(data).select().single()
    if (error) throw error
    return res
  },
  async updateGaleri(id: string, data: any) {
    if (!data.foto) data.foto = 'placeholder.jpg'
    const { data: res, error } = await supabase.from('gallery').update(data).eq('id', id).select().single()
    if (error) throw error
    return res
  },
  async deleteGaleri(id: string) {
    const { error } = await supabase.from('gallery').delete().eq('id', id)
    if (error) throw error
  }
}
