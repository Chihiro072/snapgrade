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

/**
 * Server-side client that acts as the signed-in user making the request.
 * Pass the bearer token from the `Authorization` header of an API route so
 * RLS policies (which key off `auth.uid()`) apply exactly as they would for
 * a request made directly from the browser.
 */
export function getSupabaseServerClient(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key)
    throw new Error(
      "Add Supabase credentials to .env before using the server client.",
    );
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
