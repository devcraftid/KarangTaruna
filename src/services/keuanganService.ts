import { supabase } from '@/lib/supabase'

export const keuanganService = {
  // --- Kategori Pemasukan ---
  async getKategoriPemasukan() {
    const { data, error } = await supabase.from('income_categories').select('*').order('nama')
    if (error) throw error
    return data
  },
  async createKategoriPemasukan(data: { nama: string }) {
    const { data: res, error } = await supabase.from('income_categories').insert(data).select().single()
    if (error) throw error
    return res
  },
  async updateKategoriPemasukan(id: string, data: { nama: string }) {
    const { data: res, error } = await supabase.from('income_categories').update(data).eq('id', id).select().single()
    if (error) throw error
    return res
  },
  async deleteKategoriPemasukan(id: string) {
    const { error } = await supabase.from('income_categories').delete().eq('id', id)
    if (error) throw error
  },

  // --- Kas Masuk (Income) ---
  async getIncome(eventId?: string) {
    let query = supabase
      .from('income')
      .select('*, income_categories(nama), events(nama_acara)')
      .order('tanggal', { ascending: false })
      
    if (eventId) {
      query = query.eq('event_id', eventId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },
  async createIncome(data: any) {
    const { data: res, error } = await supabase.from('income').insert(data).select().single()
    if (error) throw error
    return res
  },
  async updateIncome(id: string, data: any) {
    const { data: res, error } = await supabase.from('income').update(data).eq('id', id).select().single()
    if (error) throw error
    return res
  },
  async deleteIncome(id: string) {
    const { error } = await supabase.from('income').delete().eq('id', id)
    if (error) throw error
  },

  // --- Kategori Pengeluaran ---
  async getKategoriPengeluaran() {
    const { data, error } = await supabase.from('expense_categories').select('*').order('nama')
    if (error) throw error
    return data
  },
  async createKategoriPengeluaran(data: { nama: string }) {
    const { data: res, error } = await supabase.from('expense_categories').insert(data).select().single()
    if (error) throw error
    return res
  },
  async updateKategoriPengeluaran(id: string, data: { nama: string }) {
    const { data: res, error } = await supabase.from('expense_categories').update(data).eq('id', id).select().single()
    if (error) throw error
    return res
  },
  async deleteKategoriPengeluaran(id: string) {
    const { error } = await supabase.from('expense_categories').delete().eq('id', id)
    if (error) throw error
  },

  // --- Kas Keluar (Expenses) ---
  async getExpenses(eventId?: string) {
    let query = supabase
      .from('expenses')
      .select('*, expense_categories(nama), events(nama_acara)')
      .order('tanggal', { ascending: false })
      
    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },
  async createExpense(data: any) {
    const { data: res, error } = await supabase.from('expenses').insert(data).select().single()
    if (error) throw error
    return res
  },
  async updateExpense(id: string, data: any) {
    const { data: res, error } = await supabase.from('expenses').update(data).eq('id', id).select().single()
    if (error) throw error
    return res
  },
  async deleteExpense(id: string) {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) throw error
  },
}
