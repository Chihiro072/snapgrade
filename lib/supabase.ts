import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key)
    throw new Error(
      "Add Supabase credentials to .env before using authentication.",
    );
  return createClient(url, key);
}
