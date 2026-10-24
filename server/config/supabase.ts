import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  secretKey: string;
  publishableKey?: string;
}

let cachedAdminClient: SupabaseClient | null = null;

/**
 * Normalizes Supabase URLs to prevent PGRST125 ("Invalid path specified in request URL").
 * If the user inputs the PostgREST REST endpoint (e.g. https://xxx.supabase.co/rest/v1/),
 * this strips the endpoint suffix to ensure @supabase/supabase-js receives the root project URL.
 */
export function normalizeSupabaseUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/(auth|storage|graphql)\/v1\/?$/i, '');
  return url;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const rawUrl = process.env.SUPABASE_URL?.trim();
  const secretKey = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  const publishableKey = (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();

  if (!rawUrl || !secretKey) {
    return null;
  }

  const url = normalizeSupabaseUrl(rawUrl);

  return {
    url,
    secretKey,
    publishableKey
  };
}

export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return !!(config && config.url && config.secretKey);
}

/**
 * Returns a server-side Supabase client initialized with the Secret Key (Service Role Key).
 * This client is strictly server-only and NEVER sent to the client browser.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  try {
    cachedAdminClient = createClient(config.url, config.secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    return cachedAdminClient;
  } catch (error) {
    console.error('[Supabase Config] Failed to initialize Supabase client:', error);
    return null;
  }
}

/**
 * Health check to test connectivity to Supabase
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase is not configured (SUPABASE_URL and SUPABASE_SECRET_KEY are required in environment variables).'
    };
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return {
      success: false,
      message: 'Failed to create Supabase client instance.'
    };
  }

  try {
    // Attempt a lightweight read from published_versions or schema check
    const { data, error } = await client.from('published_versions').select('id').limit(1);

    if (error) {
      // If table does not exist yet (PostgreSQL 42P01 or PostgREST PGRST205), but network connection succeeded
      if (error.code === '42P01' || error.code === 'PGRST205') {
        return {
          success: true,
          message: 'Supabase connection verified successfully (tables not yet created; run 001_create_supabase_tables.sql in Supabase SQL Editor).',
          details: { code: error.code }
        };
      }
      return {
        success: false,
        message: `Supabase query error: ${error.message} (${error.code || 'unknown'})`,
        details: error
      };
    }

    return {
      success: true,
      message: 'Supabase connected and tables verified successfully.',
      details: { recordsFound: data?.length || 0 }
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Supabase connection exception: ${err.message || String(err)}`
    };
  }
}
