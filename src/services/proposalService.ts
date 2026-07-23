import { supabase } from '../lib/supabase'
import type { Proposal } from '../types'

export const getProposals = async (eventId?: string) => {
  let query = supabase
    .from('proposals')
    .select(`
      *,
      events (nama_acara)
    `)
    .order('tanggal_kirim', { ascending: false })

  if (eventId) {
    query = query.eq('event_id', eventId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Proposal[]
}

export const createProposal = async (proposal: Omit<Proposal, 'id' | 'created_at' | 'events'>) => {
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('proposals')
    .insert([{ ...proposal, pic: userData.user?.id }])
    .select(`
      *,
      events (nama_acara)
    `)
    .single()

  if (error) throw error
  return data as Proposal
}

export const updateProposal = async (id: string, updates: Partial<Proposal>) => {
  const { data, error } = await supabase
    .from('proposals')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      events (nama_acara)
    `)
    .single()

  if (error) throw error
  return data as Proposal
}

export const deleteProposal = async (id: string) => {
  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', id)

  if (error) throw error
}
