"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateSiteSettings(settings: {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  email: string;
  socials: Array<{ label: string; href: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get existing settings
  const { data: existing } = await supabase
    .from("site_settings")
    .select("*")
    .single();

  if (existing) {
    const { error } = await supabase
      .from("site_settings")
      .update({
        ...settings,
        socials: settings.socials,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("site_settings").insert({
      ...settings,
      socials: settings.socials,
    });

    if (error) throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function getSiteSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").single();

  if (!data) {
    return {
      name: "Your Name",
      role: "Full-stack developer",
      tagline: "I build fast, accessible web products.",
      bio: "Write a short intro here. It appears on the home page hero.",
      email: "you@example.com",
      socials: [
        { label: "GitHub", href: "https://github.com/your-handle" },
        { label: "LinkedIn", href: "https://linkedin.com/in/your-handle" },
      ],
    };
  }

  return {
    ...data,
    socials: data.socials || [],
  };
}