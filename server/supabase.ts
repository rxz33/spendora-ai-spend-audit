/// <reference types="node" />

/**
 * Server-only Supabase client
 * 
 * This file is only imported by:
 * - Route handlers (app/api/*)
 * - Server components (app/audit/[id]/page.tsx)
 * 
 * These contexts are inherently server-only, so we don't need 'use server'
 */

import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}
