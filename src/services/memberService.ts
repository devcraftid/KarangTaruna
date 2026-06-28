import { supabase } from '@/lib/supabase'

export interface Member {
  id: string
  nama: string
  nik: string
  jenis_kelamin: string
  tanggal_lahir: string
  alamat: string
  rt: string
  rw: string
  nomor_hp: string
  created_at?: string
}

export const memberService = {
  async getMembers() {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Member[]
  },
  
  async createMember(member: Partial<Omit<Member, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('members')
      .insert(member)
      .select()
      .single()
      
    if (error) throw error
    return data as Member
  },

  async updateMember(id: string, member: Partial<Omit<Member, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('members')
      .update(member)
      .eq('id', id)
      .select()
      .single()
      
    if (error) throw error
    return data as Member
  },
  
  async deleteMember(id: string) {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id)
      
    if (error) throw error
  }
}
