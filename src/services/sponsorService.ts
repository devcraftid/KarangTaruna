import { supabase } from '@/lib/supabase'
import type { Sponsor } from '@/types'

export const getSponsors = async (): Promise<Sponsor[]> => {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Sponsor[]
}

export const getSponsor = async (id: string): Promise<Sponsor> => {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Sponsor
}

export const createSponsor = async (sponsorData: Partial<Sponsor>) => {
  const { data, error } = await supabase
    .from('sponsors')
    .insert([sponsorData])
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateSponsor = async (id: string, sponsorData: Partial<Sponsor>) => {
  const { data, error } = await supabase
    .from('sponsors')
    .update(sponsorData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteSponsor = async (id: string) => {
  const { error } = await supabase
    .from('sponsors')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
