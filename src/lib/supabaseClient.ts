import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("your-project")
);

// Fallback dummy URL and key to prevent createClient crashing during development or before configuration
const resolvedUrl = isSupabaseConfigured
  ? (supabaseUrl as string)
  : "https://sense-calm-placeholder.supabase.co";

const resolvedKey = isSupabaseConfigured
  ? (supabaseAnonKey as string)
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key";

export const supabase: SupabaseClient = createClient(resolvedUrl, resolvedKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "sense-calm-auth-session",
  },
});
