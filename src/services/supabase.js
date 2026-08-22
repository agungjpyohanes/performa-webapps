import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchAllRows(tableName) {
  if (!supabaseUrl || !supabaseAnonKey) return [];
  try {
    let allRecords = [];
    let from = 0;
    const step = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .range(from, from + step - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        allRecords = allRecords.concat(data);
        if (data.length < step) {
          hasMore = false;
        } else {
          from += step;
        }
      } else {
        hasMore = false;
      }
    }

    return allRecords;
  } catch (err) {
    console.error(`Error fetching ${tableName}:`, err);
    return [];
  }
}
