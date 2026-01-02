import { createBrowserClient } from '@supabase/ssr'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase Client Error] Missing environment variables:',
    {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    }
  );
}

export const supabase = createBrowserClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

// Log client initialization status (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('[Supabase Client] Initialized with URL:', supabaseUrl?.substring(0, 30) + '...');
}
