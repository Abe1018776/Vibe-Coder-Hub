// Public Supabase config.
// The project URL and the publishable (anon) key are PUBLIC by design — they
// ship to the browser, and Row Level Security is what protects the data.
// Env vars take precedence so other environments can point elsewhere; the
// fallbacks let production builds work without dashboard env configuration.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://lqfqkivbxeexmrxuxefi.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_IRao_HfBxPDHR9U9wPXcxw_XHrdlGxW";
