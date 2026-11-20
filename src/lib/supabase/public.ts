import { createClient } from "@supabase/supabase-js";

/** Anonymous client with no cookies, so public pages can be statically cached. */
export const createPublicClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
