import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** For server actions: returns a Supabase client or redirects to login. */
export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}
