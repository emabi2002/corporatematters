import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Server-only Supabase client using the SERVICE ROLE key.
 *
 * SECURITY: This bypasses Row-Level Security and must ONLY be used inside
 * server code (route handlers / server actions). Never import this from a
 * client component. The service-role key is read from a server env var that
 * is never exposed to the browser (it is NOT prefixed with NEXT_PUBLIC_).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured on the server. ' +
        'Add it to your server environment (e.g. Netlify > Site settings > Environment variables) to enable user administration.'
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
