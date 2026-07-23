import { supabase } from '../lib/supabase'
import type { Household, HouseholdDue } from '../types'

export const getHouseholds = async () => {
  const { data, error } = await supabase
    .from('households')
    .select('*')
    .order('rt', { ascending: true })
    .order('nomor_rumah', { ascending: true })

  if (error) throw error
  return data as Household[]
}

export const createHousehold = async (household: Omit<Household, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('households')
    .insert([household])
    .select()
    .single()

  if (error) throw error
  return data as Household
}

export const updateHousehold = async (id: string, updates: Partial<Household>) => {
  const { data, error } = await supabase
    .from('households')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Household
}

export const deleteHousehold = async (id: string) => {
  const { error } = await supabase
    .from('households')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const getHouseholdDues = async (eventId: string) => {
  const { data, error } = await supabase
    .from('household_dues')
    .select(`
      *,
      households (*),
      events (nama_acara)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as HouseholdDue[]
}

export const updateHouseholdDue = async (id: string, updates: Partial<HouseholdDue>) => {
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('household_dues')
    .update({
      ...updates,
      penerima: updates.status === 'verified' ? userData.user?.id : undefined
    })
    .eq('id', id)
    .select(`
      *,
      households (*),
      events (nama_acara)
    `)
    .single()

  if (error) throw error
  return data as HouseholdDue
}

export const createHouseholdDue = async (due: Omit<HouseholdDue, 'id' | 'created_at' | 'households' | 'events'>) => {
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('household_dues')
    .insert([{
      ...due,
      penerima: due.status === 'verified' ? userData.user?.id : undefined
    }])
    .select(`
      *,
      households (*),
      events (nama_acara)
    `)
    .single()

  if (error) throw error
  return data as HouseholdDue
}
