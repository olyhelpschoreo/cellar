// Supabase browser client. Cloud features (accounts + sync) light up only when
// the env vars are present at build time; without them, `supabase` is null and
// the app runs in its original purely-local mode — so nothing breaks if keys
// are missing. The anon key is safe in the browser (protected by RLS).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when a Supabase project is configured — gates all cloud UI. */
export const isCloudConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isCloudConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
