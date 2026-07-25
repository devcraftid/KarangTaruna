import { supabase } from '@/lib/supabase'
import type { HallOfFameEntry } from '@/types'

export const getHallOfFameEntries = async (): Promise<HallOfFameEntry[]> => {
  const { data, error } = await supabase
    .from('hall_of_fame')
    .select('*')
    .order('tahun', { ascending: false })

  if (error) throw error
  return data as HallOfFameEntry[]
}

export const createHallOfFameEntry = async (entryData: Partial<HallOfFameEntry>) => {
  const { data, error } = await supabase
    .from('hall_of_fame')
    .insert([entryData])
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateHallOfFameEntry = async (id: string, entryData: Partial<HallOfFameEntry>) => {
  const { data, error } = await supabase
    .from('hall_of_fame')
    .update(entryData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteHallOfFameEntry = async (id: string) => {
  const { error } = await supabase
    .from('hall_of_fame')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
