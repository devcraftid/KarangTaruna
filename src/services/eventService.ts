import { supabase } from '../lib/supabase'
import type { Event } from '../types'

export const getEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('tanggal_mulai', { ascending: false })

  if (error) throw error
  return data as Event[]
}

export const getActiveEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .order('tanggal_mulai', { ascending: false })

  if (error) throw error
  return data as Event[]
}

export const createEvent = async (event: Omit<Event, 'id' | 'created_at' | 'created_by'>) => {
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('events')
    .insert([{ ...event, created_by: userData.user?.id }])
    .select()
    .single()

  if (error) throw error
  return data as Event
}

export const updateEvent = async (id: string, updates: Partial<Event>) => {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Event
}

export const deleteEvent = async (id: string) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const getEventStats = async (eventId: string) => {
  // get total income, expenses, and dues for an event
  const [income, expenses, dues] = await Promise.all([
    supabase.from('income').select('nominal').eq('event_id', eventId).eq('status', 'verified'),
    supabase.from('expenses').select('nominal').eq('event_id', eventId),
    supabase.from('household_dues').select('nominal').eq('event_id', eventId).eq('status', 'verified')
  ])

  const totalIncome = income.data?.reduce((acc, curr) => acc + Number(curr.nominal), 0) || 0
  const totalExpenses = expenses.data?.reduce((acc, curr) => acc + Number(curr.nominal), 0) || 0
  const totalDues = dues.data?.reduce((acc, curr) => acc + Number(curr.nominal), 0) || 0

  return {
    total_income: totalIncome + totalDues, // dues is considered part of income
    total_expenses: totalExpenses,
    balance: totalIncome + totalDues - totalExpenses
  }
}
