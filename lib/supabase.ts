import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 클라이언트용 (anon key) - lazy initialization
let _supabase: SupabaseClient | null = null;
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) throw new Error("Supabase env vars not set");
      _supabase = createClient(url, key);
    }
    return (_supabase as any)[prop];
  },
});

// 서버용 (service role - admin API에서만 사용) - lazy initialization
let _supabaseAdmin: SupabaseClient | null = null;
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabaseAdmin) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) throw new Error("Supabase service role env vars not set");
      _supabaseAdmin = createClient(url, key);
    }
    return (_supabaseAdmin as any)[prop];
  },
});
