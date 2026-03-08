import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Singleton instance
let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export const createClient = () => {
  // Return existing instance if it exists
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Create new instance only if it doesn't exist
  supabaseInstance = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: 'dlpp-cms-auth',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );

  return supabaseInstance;
};
