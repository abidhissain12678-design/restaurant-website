import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseError = new Error("Supabase not configured");

const noSupabase = {
  from: () => {
    const chain = {
      select: () => chain,
      insert: async () => ({ data: null, error: supabaseError }),
      update: async () => ({ data: null, error: supabaseError }),
      delete: async () => ({ data: null, error: supabaseError }),
      order: () => chain,
      eq: () => chain,
      single: async () => ({ data: null, error: supabaseError }),
    };

    return chain;
  },
};

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : noSupabase;
