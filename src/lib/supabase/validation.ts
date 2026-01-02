/**
 * Validation utilities for Supabase client configuration
 */

/**
 * Check if Supabase environment variables are configured
 */
export function checkSupabaseConfig(): { isValid: boolean; error?: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url === 'https://your-project-id.supabase.co') {
    return {
      isValid: false,
      error: 'Supabase URL is not configured. Please set NEXT_PUBLIC_SUPABASE_URL in your environment variables.',
    };
  }

  if (!anonKey || anonKey === 'your-supabase-anon-key-here') {
    return {
      isValid: false,
      error: 'Supabase Anon Key is not configured. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.',
    };
  }

  return { isValid: true };
}

/**
 * Validate Supabase client and throw detailed error if not configured
 */
export function validateSupabaseClient(): void {
  const config = checkSupabaseConfig();
  if (!config.isValid) {
    console.error('[Supabase Validation Error]', config.error);
    throw new Error(config.error);
  }
}

/**
 * Create a promise with timeout to prevent infinite waiting
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 15000,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}
