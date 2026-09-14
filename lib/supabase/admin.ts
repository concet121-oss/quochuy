import { createClient } from '@supabase/supabase-js'

/**
 * Service-role client. NEVER import this into client components or expose the
 * key to the browser. Use only inside server actions / route handlers after
 * verifying the caller is an authenticated admin.
 */
export function createAdminClient() {
  return createClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  )
}
