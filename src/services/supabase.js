import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://saqkbolpvteusjbkkfur.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2FF2H_NEjFkQH865UAIYKA_01V6_Ut1';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchAllRows(tableName) {
  let allRows = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, from + step - 1);

    if (error) {
      console.error(`Fetch error on table ${tableName}:`, error);
      throw error;
    }

    if (data && data.length > 0) {
      allRows = allRows.concat(data);
      if (data.length < step) hasMore = false;
      else from += step;
    } else {
      hasMore = false;
    }
  }
  return allRows;
}