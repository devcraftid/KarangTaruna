import { supabase } from '@/lib/supabase'
import { PatunganCampaign, PatunganContribution } from '../types'

export const patunganService = {
  // --- Campaigns ---
  async getCampaigns() {
    const { data, error } = await supabase
      .from('patungan_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as PatunganCampaign[]
  },

  async getActiveCampaigns() {
    const { data, error } = await supabase
      .from('patungan_campaigns')
      .select('*')
      .in('status', ['active', 'completed'])
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as PatunganCampaign[]
  },

  async getCampaignById(id: string) {
    const { data, error } = await supabase
      .from('patungan_campaigns')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as PatunganCampaign
  },

  async createCampaign(campaign: Partial<PatunganCampaign>) {
    const { data, error } = await supabase
      .from('patungan_campaigns')
      .insert(campaign)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateCampaign(id: string, campaign: Partial<PatunganCampaign>) {
    const { data, error } = await supabase
      .from('patungan_campaigns')
      .update(campaign)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteCampaign(id: string) {
    const { error } = await supabase
      .from('patungan_campaigns')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // --- Contributions ---
  async getContributions() {
    const { data, error } = await supabase
      .from('patungan_contributions')
      .select('*, patungan_campaigns(judul)')
      .order('tanggal', { ascending: false })
    if (error) throw error
    return data as PatunganContribution[]
  },

  async getContributionsByCampaignId(campaignId: string) {
    const { data, error } = await supabase
      .from('patungan_contributions')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'verified')
      .order('tanggal', { ascending: false })
    if (error) throw error
    return data as PatunganContribution[]
  },

  async getContributionsTotalByCampaignId(campaignId: string) {
    const { data, error } = await supabase
      .from('patungan_contributions')
      .select('nominal')
      .eq('campaign_id', campaignId)
      .eq('status', 'verified')
      
    if (error) throw error
    const total = data.reduce((acc, curr) => acc + Number(curr.nominal), 0)
    return total
  },

  async createContribution(contribution: Partial<PatunganContribution>) {
    const { data, error } = await supabase
      .from('patungan_contributions')
      .insert(contribution)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateContributionStatus(id: string, status: 'verified' | 'rejected') {
    const { data, error } = await supabase
      .from('patungan_contributions')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
}
