import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const noSupabase = {
  from: () => ({
    select: async () => ({ data: null, error: new Error("Supabase not configured") }),
    insert: async () => ({ data: null, error: new Error("Supabase not configured") }),
    update: async () => ({ data: null, error: new Error("Supabase not configured") }),
    delete: async () => ({ data: null, error: new Error("Supabase not configured") }),
  }),
};

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : noSupabase;
