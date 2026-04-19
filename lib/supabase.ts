import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const sb = createClient(url, key);

export async function saveLead(data: {
  name: string; phone: string; email?: string | null;
  loan_type: string; amount?: string | null; source: string;
  notes?: string | null; status?: string;
}) {
  const { error } = await sb.from('leads').insert({
    ...data, country: 'India', currency: 'INR', status: data.status || 'new',
  });
  if (error) console.error('Lead:', error.message);
}

export async function saveNRI(data: { name: string; email: string; phone: string; country: string; product?: string; }) {
  await sb.from('nri_waitlist').insert({ ...data, source: 'nri-waitlist', status: 'registered' });
}

export async function logCIBIL(pan: string, score: number, rating: string, source: string) {
  await sb.from('cibil_checks').insert({ pan_number: pan, score, rating, source });
}

export async function getLiveRates() {
  const { data } = await sb.from('bank_rates').select('*').eq('is_active', true).order('min_rate');
  return data || [];
}
